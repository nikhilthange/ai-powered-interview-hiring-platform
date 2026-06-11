const Subscription = require('../models/Subscription');
const User = require('../models/User');
const paymentService = require('../services/paymentService');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const crypto = require('crypto');

/**
 * PLAN PRICING REFERENCE
 */
const PLANS = {
  Pro: { amount: 1500, currency: 'INR', name: 'Pro Plan' },        // ₹1500/month
  Premium: { amount: 3900, currency: 'INR', name: 'Premium Plan' }  // ₹3900/month
};

/**
 * CREATE PAYMENT ORDER (Client calls this before showing checkout)
 */
exports.createOrder = asyncHandler(async (req, res, next) => {
  const { planId } = req.body;
  if (!planId || !PLANS[planId]) {
    return next(new AppError('Invalid plan. Choose Pro or Premium.', 400));
  }

  const plan = PLANS[planId];
  const order = await paymentService.createBillingOrder(plan.amount, plan.currency);

  res.status(200).json({
    status: 'success',
    data: {
      orderId: order.id,
      amount: plan.amount,
      currency: plan.currency,
      planName: plan.name,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock'
    }
  });
});

/**
 * VERIFY PAYMENT (Client sends back Razorpay response after checkout)
 */
exports.verifyPayment = asyncHandler(async (req, res, next) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, planId } = req.body;

  const isValid = paymentService.verifyPaymentSignature(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  );

  if (!isValid) {
    return next(new AppError('Payment verification failed. Invalid signature.', 400));
  }

  // Upgrade subscription
  await Subscription.findOneAndUpdate(
    { userId: req.user._id },
    {
      planId,
      status: 'Active',
      razorpaySubscriptionId: razorpayPaymentId,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    },
    { new: true, upsert: true }
  );

  res.status(200).json({
    status: 'success',
    message: `You have been upgraded to the ${planId} plan!`
  });
});

/**
 * RAZORPAY WEBHOOK HANDLER (Server-to-Server)
 */
exports.razorpayWebhook = asyncHandler(async (req, res, next) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (webhookSecret) {
    const signature = req.headers['x-razorpay-signature'];
    const shasum = crypto.createHmac('sha256', webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest !== signature) {
      return res.status(400).json({ status: 'fail', message: 'Invalid webhook signature.' });
    }
  }

  const event = req.body.event;
  const payload = req.body.payload;

  try {
    if (event === 'payment.captured') {
    const paymentEntity = payload?.payment?.entity;
    if (paymentEntity) {
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      const notes = paymentEntity.notes || {};

      // Determine plan from payment notes or use order metadata
      const planId = notes.planId || 'Pro';

      // Find user by email from payment entity if available
      const email = paymentEntity.email;
      let userId = null;
      if (email) {
        const user = await User.findOne({ email });
        if (user) userId = user._id;
      }

      if (userId) {
        await Subscription.findOneAndUpdate(
          { userId },
          {
            planId,
            status: 'Active',
            razorpaySubscriptionId: paymentId,
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          },
          { new: true, upsert: true }
        );
        console.log(`[Webhook] Subscription updated for user ${userId} to ${planId}`);
      }
    }
  }

  if (event === 'subscription.charged') {
    const subscriptionEntity = payload?.subscription?.entity;
    if (subscriptionEntity) {
      const razorpaySubscriptionId = subscriptionEntity.id;
      const status = subscriptionEntity.status === 'active' ? 'Active' : 'Past-Due';

      await Subscription.findOneAndUpdate(
        { razorpaySubscriptionId },
        {
          status,
          currentPeriodEnd: new Date(subscriptionEntity.current_end * 1000)
        }
      );
      console.log(`[Webhook] Subscription ${razorpaySubscriptionId} renewed, status: ${status}`);
    }
  }

  if (event === 'subscription.cancelled') {
    const subscriptionEntity = payload?.subscription?.entity;
    if (subscriptionEntity) {
      await Subscription.findOneAndUpdate(
        { razorpaySubscriptionId: subscriptionEntity.id },
        { status: 'Cancelled', planId: 'Free' }
      );
      console.log(`[Webhook] Subscription ${subscriptionEntity.id} cancelled`);
    }
  }

  } catch (err) {
    console.error('[Webhook] Error processing event:', err.message);
  }

  res.status(200).json({ status: 'success' });
});

/**
 * GET MY SUBSCRIPTION
 */
exports.getMySubscription = asyncHandler(async (req, res, next) => {
  let subscription = await Subscription.findOne({ userId: req.user._id });
  if (!subscription) {
    subscription = await Subscription.create({ userId: req.user._id, planId: 'Free' });
  }

  res.status(200).json({
    status: 'success',
    data: { subscription }
  });
});

/**
 * CANCEL SUBSCRIPTION (Switch back to Free)
 */
exports.cancelSubscription = asyncHandler(async (req, res, next) => {
  const subscription = await Subscription.findOne({ userId: req.user._id });
  if (!subscription || subscription.planId === 'Free') {
    return next(new AppError('You do not have an active paid subscription.', 400));
  }

  // Cancel on Razorpay if this was a real subscription
  if (subscription.razorpaySubscriptionId) {
    try {
      await paymentService.cancelRazorpaySubscription(subscription.razorpaySubscriptionId);
    } catch (err) {
      console.warn('Razorpay cancel failed (may already be cancelled):', err.message);
    }
  }

  subscription.planId = 'Free';
  subscription.status = 'Cancelled';
  subscription.razorpaySubscriptionId = '';
  await subscription.save();

  res.status(200).json({
    status: 'success',
    message: 'Your subscription has been cancelled and reverted to Free plan.'
  });
});

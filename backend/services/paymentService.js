const crypto = require('crypto');

let razorpayInstance = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  try {
    const Razorpay = require('razorpay');
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  } catch (err) {
    console.warn('Razorpay SDK load error. Running Payments service in Mock mode.');
  }
}

/**
 * 1. CREATE BILLING ORDER
 */
exports.createBillingOrder = async (amount, currency = 'INR') => {
  const options = {
    amount: amount * 100, // Razorpay works in subunits (paise)
    currency,
    receipt: `receipt_${Date.now()}`
  };

  if (!razorpayInstance) {
    // Return mock order details
    return {
      id: `order_mock_${crypto.randomBytes(8).toString('hex')}`,
      entity: 'order',
      amount: options.amount,
      currency: options.currency,
      receipt: options.receipt,
      status: 'created',
      mock: true
    };
  }

  return await razorpayInstance.orders.create(options);
};

/**
 * 2. VERIFY PAYMENT SIGNATURE
 */
exports.verifyPaymentSignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  if (!razorpayInstance) {
    // Mock validation success
    console.log('Payment Signature verified (Mock Mode)');
    return true;
  }

  const sign = razorpayOrderId + "|" + razorpayPaymentId;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign.toString())
    .digest("hex");

  return expectedSign === razorpaySignature;
};

/**
 * 3. CANCEL RAZORPAY SUBSCRIPTION
 */
exports.cancelRazorpaySubscription = async (subscriptionId) => {
  if (!razorpayInstance || subscriptionId.startsWith('sub_mock_')) {
    console.log('Subscription cancellation skipped (Mock Mode).');
    return { cancelled: true, mock: true };
  }
  return await razorpayInstance.subscriptions.cancel(subscriptionId);
};

/**
 * 4. MOCK SUBSCRIPTION ID CREATION
 */
exports.createSubscriptionOrder = async (planId) => {
  if (!razorpayInstance) {
    return {
      id: `sub_mock_${crypto.randomBytes(8).toString('hex')}`,
      plan_id: planId,
      status: 'created',
      mock: true
    };
  }

  // Assuming plan structures are created inside Razorpay Dashboard:
  // e.g. plan_pro_id or plan_premium_id mapping
  const planMap = {
    Pro: process.env.RAZORPAY_PLAN_PRO_ID,
    Premium: process.env.RAZORPAY_PLAN_PREMIUM_ID
  };

  const razorpayPlanId = planMap[planId];
  if (!razorpayPlanId) {
    throw new Error(`Invalid plan layout: ${planId}`);
  }

  return await razorpayInstance.subscriptions.create({
    plan_id: razorpayPlanId,
    customer_notify: 1,
    total_count: 12 // 1 year duration billing cycles
  });
};

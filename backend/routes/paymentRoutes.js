const express = require('express');
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const {
  validateBody,
  createOrderSchema,
  verifyPaymentSchema
} = require('../validators/paymentValidator');

const router = express.Router();

router.post('/webhook', paymentController.razorpayWebhook);

router.use(protect);

router.get('/subscription', paymentController.getMySubscription);
router.post('/create-order', validateBody(createOrderSchema), paymentController.createOrder);
router.post('/verify', validateBody(verifyPaymentSchema), paymentController.verifyPayment);
router.patch('/cancel', paymentController.cancelSubscription);

module.exports = router;

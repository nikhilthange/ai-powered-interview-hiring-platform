const { z } = require('zod');

const createOrderSchema = z.object({
  planId: z.enum(['Pro', 'Premium'], {
    required_error: 'Plan ID is required',
    invalid_type_error: 'Plan must be Pro or Premium'
  })
});

const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string({ required_error: 'Razorpay order ID is required' }),
  razorpayPaymentId: z.string({ required_error: 'Razorpay payment ID is required' }),
  razorpaySignature: z.string({ required_error: 'Razorpay signature is required' }),
  planId: z.enum(['Pro', 'Premium'], { required_error: 'Plan ID is required' })
});

const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: 'fail',
      message: 'Validation failed',
      errors: result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }
  req.body = result.data;
  next();
};

module.exports = {
  validateBody,
  createOrderSchema,
  verifyPaymentSchema
};

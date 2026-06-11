const { z } = require('zod');

// Schema for registration requests
const registerSchema = z.object({
  name: z.string({ required_error: 'Full name is required' })
    .trim().min(2, 'Name must be at least 2 characters long'),
  email: z.string({ required_error: 'Email is required' })
    .email('Please enter a valid email address'),
  password: z.string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must include an uppercase letter, a lowercase letter, and a number'),
  role: z.enum(['candidate', 'recruiter'], {
    invalid_type_error: 'Role must be either candidate or recruiter'
  }).optional()
});

// Schema for login requests
const loginSchema = z.object({
  email: z.string({ required_error: 'Email is required' })
    .email('Please enter a valid email address'),
  password: z.string({ required_error: 'Password is required' })
});

// Schema for forgot password requests
const forgotPasswordSchema = z.object({
  email: z.string({ required_error: 'Email is required' })
    .email('Please enter a valid email address')
});

// Schema for password reset requests
const resetPasswordSchema = z.object({
  password: z.string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must include an uppercase letter, a lowercase letter, and a number')
});

/**
 * Higher-order middleware to validate req.body against a Zod schema.
 */
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

  // Replace request body with parsed data to strip unneeded values
  req.body = result.data;
  next();
};

module.exports = {
  validateBody,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
};

const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const {
  validateBody,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} = require('../validators/authValidator');

const router = express.Router();

// Route-specific rate limiters (applied only to sensitive endpoints)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many login attempts. Please try again in 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many registration attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many password reset attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Public Routes
router.get('/health', (req, res) => res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() }));
router.post('/register', registerLimiter, validateBody(registerSchema), authController.register);
router.get('/verify-email', authController.verifyEmail);
router.post('/login', loginLimiter, validateBody(loginSchema), authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', passwordLimiter, validateBody(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validateBody(resetPasswordSchema), authController.resetPassword);

// Logout does NOT require protect — allows clearing cookies even with expired tokens
router.post('/logout', authController.logout);

// Protected Routes (Required Access Token authorization header)
router.get('/me', protect, authController.getMe);

module.exports = router;
 
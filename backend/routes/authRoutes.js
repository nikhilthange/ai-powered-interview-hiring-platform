const express = require('express');
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

// Public Routes
router.get('/health', (req, res) => res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() }));
router.post('/register', validateBody(registerSchema), authController.register);
router.get('/verify-email', authController.verifyEmail);
router.post('/login', validateBody(loginSchema), authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', validateBody(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validateBody(resetPasswordSchema), authController.resetPassword);

// Protected Routes (Required Access Token authorization header)
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);

module.exports = router;

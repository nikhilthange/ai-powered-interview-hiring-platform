const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Route protection middleware.
 * Verifies the JWT authorization header access token.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Get access token from request header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to get access.', 401));
  }

  // 2. Validate token signature and expiration
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      const error = new AppError('Access token has expired. Please refresh your session.', 401);
      error.code = 'TOKEN_EXPIRED';
      return next(error);
    }
    return next(new AppError('Invalid token signature. Please log in again.', 401));
  }

  // 3. Verify user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  // 4. Grant access to protected route and store user context
  req.user = currentUser;
  next();
});

/**
 * Verifies email verification status.
 */
const verifiedOnly = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return next(new AppError('Please verify your email address to access this resource.', 403));
  }
  next();
};

/**
 * Enforces Role-Based Access Control (RBAC).
 * Restricts endpoint to authorized role strings.
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
};

module.exports = {
  protect,
  verifiedOnly,
  restrictTo
};

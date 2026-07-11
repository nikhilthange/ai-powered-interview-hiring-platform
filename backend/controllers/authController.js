const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } = require('../services/emailService');
const { createAndSend } = require('../utils/notificationHelper');

/**
 * Helper to sign Access Tokens.
 */
const signAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN
  });
};

/**
 * Helper to sign Refresh Tokens.
 */
const signRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN
  });
};

/**
 * Helper to set Refresh Token cookie.
 */
const sendRefreshTokenCookie = (res, token) => {
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days matching token duration
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  };
  res.cookie('refreshToken', token, cookieOptions);
};

/**
 * REGISTER CONTROLLER
 */
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // 1. Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('An account with this email address already exists.', 400));
  }

  // 2. Create unverified User instance
  const newUser = new User({
    name: name || email.split('@')[0],
    email,
    password,
    role,
    isEmailVerified: true
  });

  // const verificationToken = newUser.createEmailVerificationToken();
  await newUser.save();

  await Profile.create({
    userId: newUser._id,
    fullName: name || email.split('@')[0],
    skills: []
  });

  // try {
  //   await sendVerificationEmail(newUser.email, verificationToken, newUser.name);
  // } catch (err) {
  //   console.error(`Mail sending failed for registration: ${err.message}`);
  // }

  if (newUser.role === 'recruiter') {
    try {
      const admins = await User.find({ role: 'admin' }).select('_id');
      if (admins.length > 0) {
        await Promise.all(admins.map(admin =>
          createAndSend({
            recipientId: admin._id,
            type: 'system_alert',
            title: 'New Recruiter Registration',
            message: `A new recruiter "${newUser.name || newUser.email}" has registered and is awaiting company verification.`
          })
        ));
      }
    } catch (err) {
      console.error(`Admin notification failed: ${err.message}`);
    }
  }

  res.status(201).json({
    status: 'success',
    message: 'Registration successful! You can now log in.'
  });
});

/**
 * EMAIL VERIFICATION CONTROLLER
 */
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.query;
  if (!token) {
    return next(new AppError('Verification token is missing.', 400));
  }

  // 1. Hash the incoming token to match DB
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // 2. Find user matching token & check expiry
  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Verification token is invalid or has expired.', 400));
  }

  // 3. Mark user as verified and clear tokens
  user.isEmailVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  // 4. Send welcome email
  try {
    await sendWelcomeEmail(user.email, user.name);
  } catch (err) {
    console.error(`Welcome email failed: ${err.message}`);
  }

  res.status(200).json({
    status: 'success',
    message: 'Your email has been verified successfully! You can now log in.'
  });
});

/**
 * LOGIN CONTROLLER
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Fetch user by email and explicitly select password field
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError('Incorrect email or password.', 401));
  }

  // 2. Generate Access and Refresh tokens
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  // 3. Save hashed Refresh Token inside DB
  const hashedRefreshToken = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  user.refreshToken = hashedRefreshToken;
  await user.save({ validateBeforeSave: false });

  // 4. Send Refresh Token cookie and return Access Token
  sendRefreshTokenCookie(res, refreshToken);

  // Strip password before returning user profile
  user.password = undefined;
  user.refreshToken = undefined;

  res.status(200).json({
    status: 'success',
    accessToken,
    data: { user }
  });
});

/**
 * REFRESH TOKEN ROTATION CONTROLLER
 */
exports.refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return next(new AppError('No refresh token provided.', 401));
  }

  // 1. Verify token signature
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    return next(new AppError('Invalid or expired refresh token. Please login again.', 401));
  }

  // 2. Hash refresh token to compare with DB
  const hashedRefreshToken = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  // 3. Find user matching token
  const user = await User.findOne({
    _id: decoded.id,
    refreshToken: hashedRefreshToken
  });

  if (!user) {
    return next(new AppError('Token reuse detected or session invalid. Please login again.', 401));
  }

  // 4. Rotate tokens (Generate new tokens)
  const newAccessToken = signAccessToken(user._id);
  const newRefreshToken = signRefreshToken(user._id);

  // Save new hashed Refresh Token
  const newHashedRefreshToken = crypto
    .createHash('sha256')
    .update(newRefreshToken)
    .digest('hex');

  user.refreshToken = newHashedRefreshToken;
  await user.save({ validateBeforeSave: false });

  // 5. Send cookie and return new access token
  sendRefreshTokenCookie(res, newRefreshToken);

  res.status(200).json({
    status: 'success',
    accessToken: newAccessToken
  });
});

/**
 * FORGOT PASSWORD CONTROLLER
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  // 1. Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    // Return standard success to prevent user email enumeration attacks
    return res.status(200).json({
      status: 'success',
      message: 'If an account exists with that email, a password reset link has been sent.'
    });
  }

  // 2. Generate password reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3. Send reset link
  try {
    await sendPasswordResetEmail(user.email, resetToken, user.name);
  } catch (err) {
    // Rollback DB token state if mail fails
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('There was an error sending the reset email. Try again later.', 500));
  }

  res.status(200).json({
    status: 'success',
    message: 'If an account exists with that email, a password reset link has been sent.'
  });
});

/**
 * RESET PASSWORD CONTROLLER
 */
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.query;
  const { password } = req.body;

  if (!token) {
    return next(new AppError('Password reset token is missing.', 400));
  }

  // 1. Hash incoming token to match DB
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // 2. Find user matching token & check expiry
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Reset token is invalid or has expired.', 400));
  }

  // 3. Update password and invalidate other fields
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  
  // Force session logout across other browsers on password change
  user.refreshToken = undefined;
  
  await user.save(); // Password will be hashed in the pre-save hook

  res.status(200).json({
    status: 'success',
    message: 'Your password has been reset successfully! You can now log in.'
  });
});

/**
 * LOGOUT CONTROLLER (no protect middleware needed — resilient to expired tokens)
 */
exports.logout = asyncHandler(async (req, res, next) => {
  // 1. Best effort: try to invalidate refresh token in DB from cookie
  const { refreshToken } = req.cookies;
  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const hashedRefreshToken = crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex');
      await User.findOneAndUpdate(
        { _id: decoded.id, refreshToken: hashedRefreshToken },
        { $unset: { refreshToken: 1 } }
      );
    } catch {
      // Token invalid/expired — cookie will be cleared below
    }
  }

  // 2. Invalidate refresh token cookie on the client
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully.'
  });
});

/**
 * GET ME (GET CURRENT USER SESSION CONTEXT)
 */
exports.getMe = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: { user: req.user }
  });
});

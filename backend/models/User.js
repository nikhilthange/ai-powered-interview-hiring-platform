const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide your email address.'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password.'],
    minlength: [8, 'Password must be at least 8 characters.'],
    select: false // Keep hidden by default
  },
  role: {
    type: String,
    enum: ['candidate', 'recruiter', 'admin'],
    default: 'candidate'
  },
  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active'
  },
  isEmailVerified: {
    type: Boolean,
    default: true
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  refreshToken: {
    type: String,
    select: false // Do not return in standard user queries
  },
  followingCompanies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  }]
}, {
  timestamps: true
});

UserSchema.index({ role: 1 });
UserSchema.index({ verificationToken: 1 });
UserSchema.index({ passwordResetToken: 1 });

/**
 * Pre-save middleware to automatically hash passwords when modified.
 */
UserSchema.pre('save', async function (next) {
  // Only hash password if it is new or updated
  if (!this.isModified('password')) return next();

  // Hash the password with a cost work factor of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

/**
 * Compares plain-text passwords with the stored database hash.
 */
UserSchema.methods.comparePassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

/**
 * Generates an unhashed hex email verification token, hashes it, and stores the hash.
 * Returns the unhashed token to be mailed to the user.
 */
UserSchema.methods.createEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString('hex');

  this.verificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Token valid for 10 minutes
  this.verificationTokenExpires = Date.now() + 10 * 60 * 1000;

  return token;
};

/**
 * Generates an unhashed hex password reset token, hashes it, and stores the hash.
 * Returns the unhashed token to be mailed to the user.
 */
UserSchema.methods.createPasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Token valid for 10 minutes
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return token;
};

module.exports = mongoose.model('User', UserSchema);

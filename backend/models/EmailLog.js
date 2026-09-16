const mongoose = require('mongoose');

const EmailLogSchema = new mongoose.Schema({
  to: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  template: {
    type: String,
    default: 'custom'
  },
  html: {
    type: String,
    default: ''
  },
  text: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  },
  errorMessage: {
    type: String,
    default: ''
  },
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  lastAttemptedAt: Date,
  sentAt: Date,
  metadata: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    referenceType: {
      type: String
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId
    }
  }
}, {
  timestamps: true
});

EmailLogSchema.index({ status: 1, retryCount: 1, lastAttemptedAt: 1 });
EmailLogSchema.index({ 'metadata.userId': 1 });
EmailLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('EmailLog', EmailLogSchema);

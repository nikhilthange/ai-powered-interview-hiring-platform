const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  planId: {
    type: String,
    enum: ['Free', 'Pro', 'Premium'],
    default: 'Free'
  },
  status: {
    type: String,
    enum: ['Active', 'Past-Due', 'Cancelled', 'Expired'],
    default: 'Active'
  },
  razorpaySubscriptionId: {
    type: String,
    default: ''
  },
  currentPeriodEnd: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default 30 days trial
  }
}, {
  timestamps: true
});

// Active subscriber filtering and expiring soon cron jobs
SubscriptionSchema.index({ status: 1, currentPeriodEnd: 1 });

// Payment gateway webhook lookups
SubscriptionSchema.index({ razorpaySubscriptionId: 1 });

module.exports = mongoose.model('Subscription', SubscriptionSchema);

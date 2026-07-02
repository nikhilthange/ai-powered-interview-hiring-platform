const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scheduledAt: {
    type: Date,
    required: [true, 'Interview must have a scheduled time.']
  },
  meetLink: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  aiInterviewFeedback: {
    type: String, // Dynamic comments returned from AI panel
    default: ''
  }
}, {
  timestamps: true
});

InterviewSchema.index({ candidateId: 1, scheduledAt: 1 });
InterviewSchema.index({ recruiterId: 1, scheduledAt: 1 });

// Interview lookup by application
InterviewSchema.index({ applicationId: 1 });

// Filter upcoming/completed/cancelled
InterviewSchema.index({ status: 1 });

module.exports = mongoose.model('Interview', InterviewSchema);

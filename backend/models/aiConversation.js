const mongoose = require('mongoose');

const aiConversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    default: 'New conversation'
  },
  context: {
    type: {
      type: String,
      enum: ['general', 'resume', 'job', 'recruiter', 'admin'],
      default: 'general'
    },
    resumeText: String,
    resumeFileName: String,
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },
    jobTitle: String,
    jobDescription: String
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

aiConversationSchema.index({ userId: 1, lastMessageAt: -1 });
aiConversationSchema.index({ userId: 1, title: 'text' });

module.exports = mongoose.model('AIConversation', aiConversationSchema);

const mongoose = require('mongoose');

const aiMessageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AIConversation',
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  metadata: {
    model: String,
    tokens: Number,
    duration: Number
  }
}, {
  timestamps: true
});

aiMessageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model('AIMessage', aiMessageSchema);

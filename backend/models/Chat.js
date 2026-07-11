const mongoose = require('mongoose');

const ChatRoomSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastMessageText: {
    type: String
  },
  lastMessageAt: {
    type: Date
  },
  unreadCountCandidate: {
    type: Number,
    default: 0
  },
  unreadCountRecruiter: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Ensure a single chat room exists between a candidate and recruiter pair
ChatRoomSchema.index({ candidateId: 1, recruiterId: 1 }, { unique: true });

const ChatMessageSchema = new mongoose.Schema({
  chatRoomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: true,
    index: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messageText: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  attachments: [{
    url: String,
    resourceType: String,
    name: String
  }]
}, {
  timestamps: true
});

// Index to retrieve chat history rapidly sorted by creation date
ChatMessageSchema.index({ chatRoomId: 1, createdAt: -1 });

module.exports = {
  ChatRoom: mongoose.model('ChatRoom', ChatRoomSchema),
  ChatMessage: mongoose.model('ChatMessage', ChatMessageSchema)
};

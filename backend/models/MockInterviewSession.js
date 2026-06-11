const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  category: { type: String, default: 'General' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  answer: { type: String, default: '' },
  score: { type: Number, default: null },
  maxScore: { type: Number, default: 10 },
  feedback: { type: String, default: '' },
  strengths: [{ type: String }],
  improvements: [{ type: String }],
  answeredAt: Date,
});

const MockInterviewSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resumeText: {
    type: String,
    required: true,
  },
  resumeFileName: {
    type: String,
    default: '',
  },
  targetRole: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  },
  questions: [QuestionSchema],
  overallScore: {
    type: Number,
    default: null,
  },
  totalScore: {
    type: Number,
    default: 0,
  },
  maxTotalScore: {
    type: Number,
    default: 0,
  },
  feedback: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending',
  },
  startedAt: Date,
  completedAt: Date,
}, {
  timestamps: true,
});

MockInterviewSessionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('MockInterviewSession', MockInterviewSessionSchema);

const mongoose = require('mongoose');

const stageHistorySchema = new mongoose.Schema({
  status: String,
  changedAt: { type: Date, default: Date.now },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { _id: false });

const ApplicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resumeUrl: {
    type: String,
    required: [true, 'Application requires a resume file.']
  },
  coverLetter: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Applied', 'Reviewing', 'Shortlisted', 'Interview Scheduled', 'Technical Round', 'HR Round', 'Offered', 'Rejected', 'Hired'],
    default: 'Applied'
  },
  atsScore: {
    type: Number,
    default: 0
  },
  aiAnalysis: {
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    interviewTips: [{ type: String }]
  },
  matchPercent: {
    type: Number,
    default: 0
  },
  stageHistory: [stageHistorySchema]
}, {
  timestamps: true
});

ApplicationSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.stageHistory.push({
      status: this.status,
      changedAt: new Date(),
      changedBy: this._changedBy
    });
  }
  next();
});

ApplicationSchema.index({ candidateId: 1 });
ApplicationSchema.index({ jobId: 1 });
ApplicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });
ApplicationSchema.index({ status: 1 });
ApplicationSchema.index({ candidateId: 1, createdAt: -1 });
ApplicationSchema.index({ jobId: 1, status: 1 });

module.exports = mongoose.model('Application', ApplicationSchema);
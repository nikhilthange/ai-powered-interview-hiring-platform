const mongoose = require('mongoose');

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
    enum: ['Applied', 'Reviewing', 'Shortlisted', 'Interview Scheduled', 'Rejected', 'Hired'],
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
  }
}, {
  timestamps: true
});

// Compound index to guarantee a candidate cannot submit duplicate applications for a single job post
ApplicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });
ApplicationSchema.index({ status: 1 });

// Candidate's application history
ApplicationSchema.index({ candidateId: 1, createdAt: -1 });

// Recruiter filtering by status per job
ApplicationSchema.index({ jobId: 1, status: 1 });

module.exports = mongoose.model('Application', ApplicationSchema);

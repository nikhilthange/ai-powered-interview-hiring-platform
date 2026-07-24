const mongoose = require('mongoose');

const interviewReportSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MockInterview',
      index: true
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    overallScore: {
      type: Number,
      required: true
    },
    metrics: [
      {
        name: String,
        value: Number,
        fullMark: { type: Number, default: 100 }
      }
    ],
    strengths: [String],
    weaknesses: [String],
    suggestions: [String],
    practiceQuestions: [String],
    resources: [
      {
        title: String,
        link: String
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('InterviewReport', interviewReportSchema);

const mongoose = require('mongoose');

const resumeTailorSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    jobDescription: {
      type: String,
      required: true
    },
    summaryBefore: String,
    summaryAfter: String,
    atsScoreBefore: {
      type: Number,
      default: 65
    },
    atsScoreAfter: {
      type: Number,
      default: 95
    },
    addedKeywords: [String],
    missingKeywords: [String],
    bulletImprovements: [
      {
        before: String,
        after: String
      }
    ],
    suggestions: [String]
  },
  { timestamps: true }
);

module.exports = mongoose.model('ResumeTailor', resumeTailorSchema);

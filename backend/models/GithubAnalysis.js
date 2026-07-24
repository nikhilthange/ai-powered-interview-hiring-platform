const mongoose = require('mongoose');

const githubAnalysisSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    username: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    codingScore: {
      type: Number,
      default: 85
    },
    totalRepos: Number,
    totalStars: Number,
    contributionsThisYear: Number,
    languages: [
      {
        name: String,
        value: Number
      }
    ],
    topProjects: [
      {
        name: String,
        desc: String,
        stars: Number,
        language: String
      }
    ],
    strengths: [String],
    suggestions: [String]
  },
  { timestamps: true }
);

module.exports = mongoose.model('GithubAnalysis', githubAnalysisSchema);

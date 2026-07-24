const mongoose = require('mongoose');

const coverLetterSchema = new mongoose.Schema(
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
    tone: {
      type: String,
      enum: ['Professional', 'Friendly', 'Formal'],
      default: 'Professional'
    },
    content: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CoverLetter', coverLetterSchema);

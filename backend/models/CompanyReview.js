const mongoose = require('mongoose');

const companyReviewSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      index: true
    },
    companyName: {
      type: String,
      required: true
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isAnonymous: {
      type: Boolean,
      default: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    title: {
      type: String,
      required: true
    },
    comment: {
      type: String,
      required: true
    },
    metrics: {
      culture: { type: Number, default: 5 },
      salary: { type: Number, default: 5 },
      growth: { type: Number, default: 5 },
      management: { type: Number, default: 5 },
      workLife: { type: Number, default: 5 }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CompanyReview', companyReviewSchema);

const CompanyReview = require('../models/CompanyReview');
const catchAsync = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

exports.createReview = catchAsync(async (req, res, next) => {
  const { companyId, companyName, title, comment, rating, isAnonymous, metrics } = req.body;
  if (!title || !comment || !rating) {
    return next(new AppError('Title, comment, and rating are required', 400));
  }

  const review = await CompanyReview.create({
    companyId,
    companyName: companyName || 'Company',
    authorId: req.user._id,
    isAnonymous: isAnonymous !== undefined ? isAnonymous : true,
    rating,
    title,
    comment,
    metrics
  });

  res.status(201).json({
    status: 'success',
    data: review
  });
});

exports.getCompanyReviews = catchAsync(async (req, res, next) => {
  const { companyId } = req.params;
  const reviews = await CompanyReview.find({ companyId }).sort('-createdAt');

  const total = reviews.length;
  const avgRating = total > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1) : 0;

  res.status(200).json({
    status: 'success',
    results: total,
    avgRating: Number(avgRating),
    data: reviews
  });
});

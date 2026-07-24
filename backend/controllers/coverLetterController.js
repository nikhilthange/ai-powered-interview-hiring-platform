const CoverLetter = require('../models/CoverLetter');
const aiProvider = require('../services/aiProvider');
const catchAsync = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const { extractText, cleanup } = require('../services/resumeService');

exports.generateCoverLetter = catchAsync(async (req, res, next) => {
  const { jobDescription, tone } = req.body;
  let resumeText = req.body.resumeText;

  if (!jobDescription) {
    if (req.file) cleanup(req.file.path);
    return next(new AppError('Job description is required', 400));
  }

  if (req.file) {
    try {
      resumeText = await extractText(req.file.path, req.file.originalname);
    } catch (err) {
      cleanup(req.file.path);
      return next(err);
    }
  }

  const content = await aiProvider.generateCoverLetter({
    resumeText: resumeText || 'Experienced Software Engineer',
    jobDescription,
    tone: tone || 'Professional'
  });

  if (req.file) {
    cleanup(req.file.path);
  }

  const record = await CoverLetter.create({
    candidateId: req.user._id,
    jobDescription,
    tone: tone || 'Professional',
    content
  });

  res.status(201).json({
    status: 'success',
    data: record
  });
});

exports.getMyCoverLetters = catchAsync(async (req, res, next) => {
  const records = await CoverLetter.find({ candidateId: req.user._id }).sort('-createdAt');
  res.status(200).json({
    status: 'success',
    results: records.length,
    data: records
  });
});

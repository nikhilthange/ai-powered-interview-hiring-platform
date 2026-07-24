const ResumeTailor = require('../models/ResumeTailor');
const aiProvider = require('../services/aiProvider');
const catchAsync = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const { extractText, cleanup } = require('../services/resumeService');

exports.tailorResume = catchAsync(async (req, res, next) => {
  const { jobDescription } = req.body;
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

  const aiResult = await aiProvider.tailorResume({
    resumeText: resumeText || 'Experienced Software Engineer skilled in web development and React.',
    jobDescription
  });

  if (req.file) {
    cleanup(req.file.path);
  }

  const record = await ResumeTailor.create({
    candidateId: req.user._id,
    jobDescription,
    summaryBefore: aiResult.summaryBefore,
    summaryAfter: aiResult.summaryAfter,
    atsScoreBefore: aiResult.atsScoreBefore,
    atsScoreAfter: aiResult.atsScoreAfter,
    addedKeywords: aiResult.addedKeywords,
    missingKeywords: aiResult.missingKeywords,
    bulletImprovements: aiResult.bulletImprovements,
    suggestions: aiResult.suggestions
  });

  res.status(201).json({
    status: 'success',
    data: record
  });
});

exports.getMyTailoredResumes = catchAsync(async (req, res, next) => {
  const records = await ResumeTailor.find({ candidateId: req.user._id }).sort('-createdAt');
  res.status(200).json({
    status: 'success',
    results: records.length,
    data: records
  });
});

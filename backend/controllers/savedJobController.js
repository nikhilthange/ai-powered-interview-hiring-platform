const SavedJob = require('../models/SavedJob');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');

exports.getSavedJobs = asyncHandler(async (req, res, next) => {
  const savedJobs = await SavedJob.find({ userId: req.user._id })
    .populate({
      path: 'jobId',
      populate: { path: 'recruiterId', select: 'email' }
    })
    .sort({ createdAt: -1 });

  const jobs = savedJobs.map(s => s.jobId).filter(Boolean);

  res.status(200).json({
    status: 'success',
    results: jobs.length,
    data: { jobs }
  });
});

exports.saveJob = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;

  const existing = await SavedJob.findOne({ userId: req.user._id, jobId });
  if (existing) {
    return res.status(200).json({
      status: 'success',
      message: 'Job already saved.'
    });
  }

  await SavedJob.create({ userId: req.user._id, jobId });

  res.status(201).json({
    status: 'success',
    message: 'Job saved successfully.'
  });
});

exports.unsaveJob = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;

  await SavedJob.findOneAndDelete({ userId: req.user._id, jobId });

  res.status(200).json({
    status: 'success',
    message: 'Job removed from saved.'
  });
});

exports.isJobSaved = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;

  const saved = await SavedJob.findOne({ userId: req.user._id, jobId });

  res.status(200).json({
    status: 'success',
    data: { isSaved: !!saved }
  });
});

const Job = require('../models/Job');
const Profile = require('../models/Profile');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * CREATE JOB (Recruiter)
 */
exports.createJob = asyncHandler(async (req, res, next) => {
  const job = await Job.create({
    ...req.body,
    recruiterId: req.user._id
  });

  res.status(201).json({
    status: 'success',
    data: { job }
  });
});

/**
 * GET ALL JOBS (Public, Paginated, Filterable, Text-Searchable)
 */
exports.getJobs = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, search, location, jobType, experienceLevel, status = 'Active' } = req.query;

  const filter = { status };
  if (location) filter.location = { $regex: location, $options: 'i' };
  if (jobType) filter.jobType = jobType;
  if (experienceLevel) filter.experienceLevel = experienceLevel;
  if (search) filter.$text = { $search: search };

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('recruiterId', 'email'),
    Job.countDocuments(filter)
  ]);

  res.status(200).json({
    status: 'success',
    results: jobs.length,
    totalPages: Math.ceil(total / parseInt(limit)),
    currentPage: parseInt(page),
    data: { jobs }
  });
});

/**
 * GET SINGLE JOB BY ID
 */
exports.getJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id).populate('recruiterId', 'email');
  if (!job) {
    return next(new AppError('No job found with that ID.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { job }
  });
});

/**
 * GET RECOMMENDED JOBS (Authenticated)
 * Matches user's profile skills against job requirements & description
 */
exports.getRecommendedJobs = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findOne({ userId: req.user._id });

  const userSkills = profile?.skills?.filter(Boolean) || [];
  if (userSkills.length === 0) {
    const jobs = await Job.find({ status: 'Active' })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('recruiterId', 'email');
    return res.status(200).json({
      status: 'success',
      results: jobs.length,
      data: { jobs }
    });
  }

  const skillsLower = userSkills.map((s) => s.toLowerCase());
  const jobs = await Job.find({ status: 'Active' }).populate('recruiterId', 'email');

  const scored = jobs.map((job) => {
    const text = [
      job.title,
      job.description,
      ...(job.requirements || [])
    ].join(' ').toLowerCase();

    let matchCount = 0;
    for (const skill of skillsLower) {
      if (text.includes(skill)) matchCount++;
    }

    const score = skillsLower.length > 0 ? (matchCount / skillsLower.length) * 100 : 0;
    return { job, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 6).map((s) => s.job);

  res.status(200).json({
    status: 'success',
    results: top.length,
    data: { jobs: top }
  });
});

/**
 * UPDATE JOB (Recruiter - Owner Only)
 */
exports.updateJob = asyncHandler(async (req, res, next) => {
  let job = await Job.findById(req.params.id);
  if (!job) {
    return next(new AppError('No job found with that ID.', 404));
  }

  if (job.recruiterId.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only edit your own job listings.', 403));
  }

  job = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: { job }
  });
});

/**
 * DELETE JOB (Recruiter - Owner Only)
 */
exports.deleteJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    return next(new AppError('No job found with that ID.', 404));
  }

  if (job.recruiterId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('You can only delete your own job listings.', 403));
  }

  await Job.findByIdAndDelete(req.params.id);

  res.status(204).send();
});

/**
 * GET RECRUITER'S OWN JOBS
 */
exports.getMyJobs = asyncHandler(async (req, res, next) => {
  const jobs = await Job.find({ recruiterId: req.user._id }).sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: jobs.length,
    data: { jobs }
  });
});

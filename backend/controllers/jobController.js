const Job = require('../models/Job');
const Profile = require('../models/Profile');
const Company = require('../models/Company');
const Notification = require('../models/Notification');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const aiService = require('../services/aiService');
const { extractTextFromUrl } = require('../services/resumeService');

/**
 * CREATE JOB (Recruiter)
 */
exports.createJob = asyncHandler(async (req, res, next) => {
  const company = await Company.findOne({ recruiterId: req.user._id });

  const job = await Job.create({
    ...req.body,
    recruiterId: req.user._id,
    companyId: company ? company._id : req.body.companyId
  });

  if (company && company.followers && company.followers.length > 0) {
    const notifications = company.followers.map(followerId => ({
      recipientId: followerId,
      type: 'new_job_posted',
      title: 'New Job Posting',
      message: `${company.name} posted a new ${job.title} position.`
    }));
    await Notification.insertMany(notifications);
  }

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
      .populate('recruiterId', 'email')
      .populate('companyId', 'name logo isVerified industry'),
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
      .populate('recruiterId', 'email')
      .populate('companyId', 'name logo isVerified industry');
    return res.status(200).json({
      status: 'success',
      results: jobs.length,
      data: { jobs }
    });
  }

  const skillsLower = userSkills.map((s) => s.toLowerCase());
  const jobs = await Job.find({ status: 'Active' })
    .populate('recruiterId', 'email')
    .populate('companyId', 'name logo isVerified industry');

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

function keywordScoreJob(skillsLower, job) {
  const text = [job.title, job.description, ...(job.requirements || [])].join(' ').toLowerCase();
  let matchCount = 0;
  for (const skill of skillsLower) {
    if (text.includes(skill)) matchCount++;
  }
  return skillsLower.length > 0 ? (matchCount / skillsLower.length) * 100 : 0;
}

exports.getAiRecommendedJobs = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findOne({ userId: req.user._id });
  if (!profile) {
    return next(new AppError('Please complete your profile first.', 400));
  }

  const userSkills = profile?.skills?.filter(Boolean) || [];
  if (userSkills.length === 0) {
    const jobs = await Job.find({ status: 'Active' })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('recruiterId', 'email');
    return res.status(200).json({
      status: 'success',
      results: jobs.length,
      data: { jobs: jobs.map(j => ({ job: j, matchPercentage: 0, matchingSkills: [], missingSkills: [], experienceMatch: { score: 0, feedback: 'Add skills to your profile for AI matching' }, educationMatch: { score: 0, feedback: '' }, whyRecommended: 'Complete your profile to get personalized recommendations' })) }
    });
  }

  const skillsLower = userSkills.map((s) => s.toLowerCase());
  const allJobs = await Job.find({ status: 'Active' }).populate('recruiterId', 'email');

  const withKeywordScores = allJobs.map(j => ({
    job: j,
    kwScore: keywordScoreJob(skillsLower, j)
  }));
  withKeywordScores.sort((a, b) => b.kwScore - a.kwScore);
  const topKeywordJobs = withKeywordScores.slice(0, 15).map(item => item.job);

  let resumeText = '';
  if (profile.resumeUrl) {
    try {
      resumeText = await extractTextFromUrl(profile.resumeUrl);
    } catch {
      resumeText = '';
    }
  }

  const candidateData = {
    skills: userSkills,
    experienceYears: profile.experienceYears || 0,
    education: profile.education || [],
    resumeText
  };

  const aiResults = await aiService.analyzeJobMatchBatch(candidateData, topKeywordJobs);

  const enriched = aiResults.map((r, idx) => ({
    ...r,
    job: topKeywordJobs[idx]
  }));

  enriched.sort((a, b) => b.matchPercentage - a.matchPercentage);
  const top10 = enriched.slice(0, 10);

  res.status(200).json({
    status: 'success',
    results: top10.length,
    data: { jobs: top10 }
  });
});

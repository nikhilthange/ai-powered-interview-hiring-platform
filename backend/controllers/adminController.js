const mongoose = require('mongoose');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Subscription = require('../models/Subscription');
const Notification = require('../models/Notification');
const AiConfig = require('../models/AiConfig');
const aiService = require('../services/aiService');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const { createAndSend } = require('../utils/notificationHelper');

/**
 * GET ALL USERS (Admin)
 */
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20, role, search } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    User.countDocuments(filter)
  ]);

  res.status(200).json({
    status: 'success',
    results: users.length,
    totalPages: Math.ceil(total / parseInt(limit)),
    data: { users }
  });
});

/**
 * DELETE USER (Admin)
 */
exports.deleteUser = asyncHandler(async (req, res, next) => {
  if (req.params.id === req.user._id.toString()) {
    return next(new AppError('You cannot delete your own account.', 400));
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('No user found with that ID.', 404));
  }

  await User.findByIdAndDelete(req.params.id);
  await Profile.findOneAndDelete({ userId: req.params.id });

  res.status(200).json({ status: 'success', message: 'User deleted successfully.' });
});

/**
 * VERIFY RECRUITER COMPANY (Admin)
 */
exports.verifyRecruiter = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findOne({ userId: req.params.id });
  if (!profile) {
    return next(new AppError('Profile not found for this user.', 404));
  }

  if (!profile.company) profile.company = {};
  profile.company.isVerified = true;
  await profile.save();

  await createAndSend({
    recipientId: req.params.id,
    type: 'system_alert',
    title: 'Company Verified',
    message: 'Your company profile has been verified by an administrator.',
    sendEmail: true
  });

  res.status(200).json({
    status: 'success',
    message: 'Recruiter company has been verified.'
  });
});

/**
 * REJECT RECRUITER COMPANY VERIFICATION (Admin)
 */
exports.rejectRecruiter = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findOne({ userId: req.params.id });
  if (!profile) {
    return next(new AppError('Profile not found for this user.', 404));
  }

  if (!profile.company) profile.company = {};
  profile.company.isVerified = false;
  await profile.save();

  await createAndSend({
    recipientId: req.params.id,
    type: 'system_alert',
    title: 'Verification Rejected',
    message: 'Your company verification request has been declined. Please update your company details and try again.',
    sendEmail: true
  });

  res.status(200).json({
    status: 'success',
    message: 'Recruiter verification has been rejected.'
  });
});

/**
 * GET UNVERIFIED RECRUITERS (Admin)
 */
exports.getUnverifiedRecruiters = asyncHandler(async (req, res, next) => {
  const recruiterUsers = await User.find({ role: 'recruiter' }).select('_id name email createdAt').lean();
  const recruiterIds = recruiterUsers.map(r => r._id);

  const profiles = await Profile.find({
    userId: { $in: recruiterIds },
    'company.isVerified': { $ne: true }
  }).select('userId company.name').lean();

  const profileMap = new Map(profiles.map(p => [p.userId.toString(), p]));

  const unverified = recruiterUsers
    .filter(r => profileMap.has(r._id.toString()))
    .map(r => {
      const profile = profileMap.get(r._id.toString());
      return {
        _id: r._id,
        name: r.name,
        email: r.email,
        createdAt: r.createdAt,
        companyName: profile?.company?.name || 'N/A'
      };
    });

  res.status(200).json({
    status: 'success',
    results: unverified.length,
    data: { recruiters: unverified }
  });
});

/**
 * DASHBOARD ANALYTICS (Admin) — Aggregation Pipeline
 */
exports.getDashboardAnalytics = asyncHandler(async (req, res, next) => {
  const [userStats, jobStats, applicationStats, revenueStats] = await Promise.all([
    // User counts by role
    User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $project: { role: '$_id', count: 1, _id: 0 } }
    ]),

    // Job counts by status
    Job.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } }
    ]),

    // Application counts by status + average ATS score
    Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          averageAtsScore: { $avg: '$atsScore' }
        }
      },
      {
        $project: {
          stage: '$_id',
          count: 1,
          averageAtsScore: { $round: ['$averageAtsScore', 1] },
          _id: 0
        }
      }
    ]),

    // Revenue by subscription plan
    Subscription.aggregate([
      { $match: { status: 'Active' } },
      {
        $group: {
          _id: '$planId',
          activeSubscribers: { $sum: 1 }
        }
      },
      { $project: { plan: '$_id', activeSubscribers: 1, _id: 0 } }
    ])
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      users: userStats,
      jobs: jobStats,
      applications: applicationStats,
      revenue: revenueStats
    }
  });
});

/**
 * GET AI CONFIG + METRICS (Admin)
 */
exports.getAiConfig = asyncHandler(async (req, res) => {
  const config = await AiConfig.getConfig();
  res.status(200).json({
    status: 'success',
    data: {
      provider: config.provider,
      totalRequests: config.totalRequests,
      totalErrors: config.totalErrors,
      averageResponseTime: config.averageResponseTime,
      lastApiCall: config.lastApiCall,
      lastError: config.lastError,
      hasNvidiaKey: !!process.env.NVIDIA_API_KEY
    }
  });
});

/**
 * UPDATE AI PROVIDER (Admin)
 */
exports.updateAiConfig = asyncHandler(async (req, res) => {
  const { provider } = req.body;
  if (!provider || !['mock', 'nvidia'].includes(provider)) {
    throw new AppError('Provider must be one of: mock, nvidia', 400);
  }

  await aiService.setProvider(provider);

  res.status(200).json({
    status: 'success',
    message: `AI provider switched to ${provider}.`,
    data: { provider }
  });
});

/**
 * RESET AI METRICS (Admin)
 */
exports.resetAiMetrics = asyncHandler(async (req, res) => {
  await AiConfig.findOneAndUpdate({}, {
    $set: {
      totalRequests: 0,
      totalErrors: 0,
      averageResponseTime: 0,
      lastApiCall: null,
      lastError: ''
    }
  });

  res.status(200).json({
    status: 'success',
    message: 'AI metrics reset successfully.'
  });
});

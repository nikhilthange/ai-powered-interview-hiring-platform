const mongoose = require('mongoose');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const AiConfig = require('../models/AiConfig');
const AuditLog = require('../models/AuditLog');
const SystemSettings = require('../models/SystemSettings');
const aiService = require('../services/aiService');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const { createAndSend } = require('../utils/notificationHelper');

async function logAdminAction(req, action, targetId = null, targetType = '', details = {}) {
  try {
    await AuditLog.create({ action, actor: req.user._id, targetId, targetType, details, ip: req.ip });
  } catch (e) { console.error('Audit log error:', e.message); }
}

exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.status === 'verified') filter.isEmailVerified = true;
  else if (req.query.status === 'unverified') filter.isEmailVerified = false;
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);
  const userIds = users.map(u => u._id);
  const profiles = await Profile.find({ userId: { $in: userIds } }).select('userId fullName avatarUrl resumeUrl skills education company').lean();
  const profileMap = new Map(profiles.map(p => [p.userId.toString(), p]));
  const enriched = users.map(u => {
    const p = profileMap.get(u._id.toString());
    return { ...u, profile: p || null, password: undefined };
  });
  res.json({
    status: 'success', results: enriched.length, totalPages: Math.ceil(total / limit), total,
    data: { users: enriched, pagination: { page, limit, totalPages: Math.ceil(total / limit), totalItems: total, hasNextPage: page < Math.ceil(total / limit), hasPrevPage: page > 1 } }
  });
});

exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).lean();
  if (!user) return next(new AppError('User not found', 404));
  const profile = await Profile.findOne({ userId: user._id }).lean();
  const apps = await Application.countDocuments({ candidateId: user._id });
  user.password = undefined;
  res.json({ status: 'success', data: { user: { ...user, profile, applicationCount: apps } } });
});

exports.updateUser = asyncHandler(async (req, res, next) => {
  const allowed = ['name', 'email', 'role', 'isEmailVerified'];
  const updates = {};
  allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  const user = await User.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true }).lean();
  if (!user) return next(new AppError('User not found', 404));
  user.password = undefined;
  await logAdminAction(req, 'user_updated', user._id, 'user', updates);
  res.json({ status: 'success', data: { user } });
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  if (req.params.id === req.user._id.toString()) return next(new AppError('You cannot delete your own account.', 400));
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('No user found with that ID.', 404));
  await User.findByIdAndDelete(req.params.id);
  await Profile.findOneAndDelete({ userId: req.params.id });
  await logAdminAction(req, 'user_deleted', user._id, 'user', { email: user.email });
  res.json({ status: 'success', message: 'User deleted successfully.' });
});

exports.suspendUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, { $set: { isSuspended: true } }, { new: true });
  if (!user) return next(new AppError('User not found', 404));
  await logAdminAction(req, 'user_suspended', user._id, 'user');
  res.json({ status: 'success', message: 'User suspended.' });
});

exports.activateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, { $set: { isSuspended: false } }, { new: true });
  if (!user) return next(new AppError('User not found', 404));
  await logAdminAction(req, 'user_activated', user._id, 'user');
  res.json({ status: 'success', message: 'User activated.' });
});

exports.resetUserPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('User not found', 404));
  user.password = 'TempPass123!';
  await user.save();
  await createAndSend({ recipientId: user._id, type: 'system_alert', title: 'Password Reset', message: 'Your password has been reset by an administrator. Temporary password: TempPass123!', sendEmail: true });
  await logAdminAction(req, 'password_reset', user._id, 'user');
  res.json({ status: 'success', message: 'Password reset. User will receive email with temp password.' });
});

exports.changeUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;
  if (!['candidate', 'recruiter', 'admin'].includes(role)) return next(new AppError('Invalid role', 400));
  const user = await User.findByIdAndUpdate(req.params.id, { $set: { role } }, { new: true }).lean();
  if (!user) return next(new AppError('User not found', 404));
  user.password = undefined;
  await logAdminAction(req, 'role_changed', user._id, 'user', { newRole: role });
  res.json({ status: 'success', data: { user } });
});

exports.bulkDeleteUsers = asyncHandler(async (req, res, next) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) return next(new AppError('Provide an array of user IDs', 400));
  const filtered = ids.filter(id => id !== req.user._id.toString());
  await User.deleteMany({ _id: { $in: filtered } });
  await Profile.deleteMany({ userId: { $in: filtered } });
  await logAdminAction(req, 'bulk_user_delete', null, 'user', { count: filtered.length });
  res.json({ status: 'success', message: `${filtered.length} users deleted.` });
});

exports.bulkSuspendUsers = asyncHandler(async (req, res, next) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) return next(new AppError('Provide an array of user IDs', 400));
  const filtered = ids.filter(id => id !== req.user._id.toString());
  await User.updateMany({ _id: { $in: filtered } }, { $set: { isSuspended: true } });
  await logAdminAction(req, 'bulk_user_suspend', null, 'user', { count: filtered.length });
  res.json({ status: 'success', message: `${filtered.length} users suspended.` });
});

exports.getAllJobs = asyncHandler(async (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) filter.title = { $regex: req.query.search, $options: 'i' };
  if (req.query.recruiterId) filter.recruiterId = req.query.recruiterId;
  const [jobs, total] = await Promise.all([
    Job.find(filter).populate('recruiterId', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Job.countDocuments(filter),
  ]);
  const jobIds = jobs.map(j => j._id);
  const appCounts = await Application.aggregate([{ $match: { jobId: { $in: jobIds } } }, { $group: { _id: '$jobId', count: { $sum: 1 } } }]);
  const countMap = new Map(appCounts.map(a => [a._id.toString(), a.count]));
  const enriched = jobs.map(j => {
    const profiles = j.recruiterId;
    return { ...j, applicantCount: countMap.get(j._id.toString()) || 0, recruiter: profiles ? { _id: profiles._id, name: profiles.name, email: profiles.email } : null, recruiterId: undefined };
  });
  res.json({ status: 'success', results: enriched.length, totalPages: Math.ceil(total / limit), total, data: { jobs: enriched, pagination: { page, limit, totalPages: Math.ceil(total / limit), totalItems: total, hasNextPage: page < Math.ceil(total / limit), hasPrevPage: page > 1 } } });
});

exports.approveJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findByIdAndUpdate(req.params.id, { $set: { status: 'Active' } }, { new: true });
  if (!job) return next(new AppError('Job not found', 404));
  await logAdminAction(req, 'job_approved', job._id, 'job', { title: job.title });
  res.json({ status: 'success', data: { job } });
});

exports.rejectJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findByIdAndUpdate(req.params.id, { $set: { status: 'Closed' } }, { new: true });
  if (!job) return next(new AppError('Job not found', 404));
  await logAdminAction(req, 'job_rejected', job._id, 'job', { title: job.title });
  res.json({ status: 'success', data: { job } });
});

exports.deleteJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findByIdAndDelete(req.params.id);
  if (!job) return next(new AppError('Job not found', 404));
  await Application.deleteMany({ jobId: job._id });
  await logAdminAction(req, 'job_deleted', job._id, 'job', { title: job.title });
  res.json({ status: 'success', message: 'Job deleted.' });
});

exports.featureJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findByIdAndUpdate(req.params.id, [{ $set: { isFeatured: { $eq: [false, '$isFeatured'] } } }], { new: true });
  if (!job) return next(new AppError('Job not found', 404));
  await logAdminAction(req, job.isFeatured ? 'job_featured' : 'job_unfeatured', job._id, 'job');
  res.json({ status: 'success', data: { job } });
});

exports.getAllApplications = asyncHandler(async (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.jobId) filter.jobId = req.query.jobId;
  const [apps, total] = await Promise.all([
    Application.find(filter).populate('candidateId', 'name email').populate('jobId', 'title recruiterId').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Application.countDocuments(filter),
  ]);
  res.json({ status: 'success', results: apps.length, totalPages: Math.ceil(total / limit), total, data: { applications: apps, pagination: { page, limit, totalPages: Math.ceil(total / limit), totalItems: total, hasNextPage: page < Math.ceil(total / limit), hasPrevPage: page > 1 } } });
});

exports.deleteApplication = asyncHandler(async (req, res, next) => {
  const app = await Application.findByIdAndDelete(req.params.id);
  if (!app) return next(new AppError('Application not found', 404));
  await logAdminAction(req, 'application_deleted', app._id, 'application');
  res.json({ status: 'success', message: 'Application deleted.' });
});

exports.getRecruiters = asyncHandler(async (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;
  const filter = { role: 'recruiter' };
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);
  const userIds = users.map(u => u._id);
  const profiles = await Profile.find({ userId: { $in: userIds } }).lean();
  const profileMap = new Map(profiles.map(p => [p.userId.toString(), p]));
  const jobsCounts = await Job.aggregate([{ $match: { recruiterId: { $in: userIds } } }, { $group: { _id: '$recruiterId', count: { $sum: 1 } } }]);
  const jobCountMap = new Map(jobsCounts.map(j => [j._id.toString(), j.count]));
  const appCounts = await Application.aggregate([{ $match: { jobId: { $in: (await Job.find({ recruiterId: { $in: userIds } }).select('_id').lean()).map(j => j._id) } } }, { $group: { _id: '$jobId', count: { $sum: 1 } } }]);
  const enriched = users.map(u => {
    const p = profileMap.get(u._id.toString());
    const totalApps = appCounts.filter(a => { return true; }).reduce((s, a) => s + a.count, 0);
    return { _id: u._id, name: u.name, email: u.email, createdAt: u.createdAt, isEmailVerified: u.isEmailVerified, companyName: p?.company?.name || '', isVerified: p?.company?.isVerified || false, avatarUrl: p?.avatarUrl || '', jobsPosted: jobCountMap.get(u._id.toString()) || 0, totalApplications: totalApps };
  });
  res.json({ status: 'success', results: enriched.length, totalPages: Math.ceil(total / limit), total, data: { recruiters: enriched, pagination: { page, limit, totalPages: Math.ceil(total / limit), totalItems: total, hasNextPage: page < Math.ceil(total / limit), hasPrevPage: page > 1 } } });
});

exports.verifyRecruiter = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findOne({ userId: req.params.id });
  if (!profile) return next(new AppError('Profile not found.', 404));
  if (!profile.company) profile.company = {};
  profile.company.isVerified = true;
  await profile.save();
  await createAndSend({ recipientId: req.params.id, type: 'system_alert', title: 'Company Verified', message: 'Your company profile has been verified by an administrator.', sendEmail: true });
  await logAdminAction(req, 'recruiter_verified', req.params.id, 'user');
  res.json({ status: 'success', message: 'Recruiter company verified.' });
});

exports.rejectRecruiter = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findOne({ userId: req.params.id });
  if (!profile) return next(new AppError('Profile not found.', 404));
  if (!profile.company) profile.company = {};
  profile.company.isVerified = false;
  await profile.save();
  await createAndSend({ recipientId: req.params.id, type: 'system_alert', title: 'Verification Rejected', message: 'Your company verification request has been declined.', sendEmail: true });
  await logAdminAction(req, 'recruiter_rejected', req.params.id, 'user');
  res.json({ status: 'success', message: 'Recruiter verification rejected.' });
});

exports.getUnverifiedRecruiters = asyncHandler(async (req, res, next) => {
  const recruiterUsers = await User.find({ role: 'recruiter' }).select('_id name email createdAt').lean();
  const recruiterIds = recruiterUsers.map(r => r._id);
  const profiles = await Profile.find({ userId: { $in: recruiterIds }, 'company.isVerified': { $ne: true } }).select('userId company.name').lean();
  const profileMap = new Map(profiles.map(p => [p.userId.toString(), p]));
  const unverified = recruiterUsers.filter(r => profileMap.has(r._id.toString())).map(r => { const p = profileMap.get(r._id.toString()); return { _id: r._id, name: r.name, email: r.email, createdAt: r.createdAt, companyName: p?.company?.name || 'N/A' }; });
  res.json({ status: 'success', results: unverified.length, data: { recruiters: unverified } });
});

exports.broadcastNotification = asyncHandler(async (req, res, next) => {
  const { target, title, message } = req.body;
  if (!title || !message) return next(new AppError('Title and message are required.', 400));
  let filter = {};
  if (target === 'candidates') filter.role = 'candidate';
  else if (target === 'recruiters') filter.role = 'recruiter';
  else if (target === 'admins') filter.role = 'admin';
  const users = await User.find(filter).select('_id').lean();
  const notifications = users.map(u => ({ recipientId: u._id, type: 'system_alert', title, message, isRead: false }));
  if (notifications.length) await Notification.insertMany(notifications);
  await logAdminAction(req, 'broadcast_sent', null, 'notification', { target, title, count: notifications.length });
  res.json({ status: 'success', message: `Notification sent to ${notifications.length} users.` });
});

exports.getDashboardAnalytics = asyncHandler(async (req, res, next) => {
  const [userStats, jobStats, applicationStats, interviewCount, aiConfigData] = await Promise.all([
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }, { $project: { role: '$_id', count: 1, _id: 0 } }]),
    Job.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }, { $project: { status: '$_id', count: 1, _id: 0 } }]),
    Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, averageAtsScore: { $avg: '$atsScore' } } }, { $project: { stage: '$_id', count: 1, averageAtsScore: { $round: ['$averageAtsScore', 1] }, _id: 0 } }]),
    Application.countDocuments({ status: 'Interview Scheduled' }),
    AiConfig.getConfig(),
  ]);
  const aiRequestsToday = aiConfigData.totalRequests || 0;
  const totalUsers = userStats.reduce((s, u) => s + u.count, 0);
  const totalCandidates = userStats.find(u => u.role === 'candidate')?.count || 0;
  const totalRecruiters = userStats.find(u => u.role === 'recruiter')?.count || 0;
  const activeJobs = jobStats.find(j => j.status === 'Active')?.count || 0;
  const totalApps = applicationStats.reduce((s, a) => s + a.count, 0);
  res.json({ status: 'success', data: { stats: { totalUsers, totalCandidates, totalRecruiters, activeJobs, totalApplications: totalApps, interviewsConducted: interviewCount, aiRequestsToday }, userStats, jobStats, applicationStats } });
});

exports.getChartData = asyncHandler(async (req, res, next) => {
  const days = parseInt(req.query.days, 10) || 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const [registrations, appsPerDay, jobsPerMonth] = await Promise.all([
    User.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    Application.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    Job.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
  ]);
  res.json({ status: 'success', data: { registrations, applicationsPerDay: appsPerDay, jobsPerMonth } });
});

exports.getAiConfig = asyncHandler(async (req, res) => {
  const config = await AiConfig.getConfig();
  res.json({ status: 'success', data: { provider: config.provider, totalRequests: config.totalRequests, totalErrors: config.totalErrors, averageResponseTime: config.averageResponseTime, lastApiCall: config.lastApiCall, lastError: config.lastError, hasNvidiaKey: !!process.env.NVIDIA_API_KEY, circuitBreakerOpen: config.circuitBreakerOpen || false } });
});

exports.updateAiConfig = asyncHandler(async (req, res) => {
  const { provider } = req.body;
  if (!provider || !['mock', 'nvidia'].includes(provider)) throw new AppError('Provider must be one of: mock, nvidia', 400);
  await aiService.setProvider(provider);
  await logAdminAction(req, 'ai_provider_changed', null, 'config', { provider });
  res.json({ status: 'success', message: `AI provider switched to ${provider}.`, data: { provider } });
});

exports.resetAiMetrics = asyncHandler(async (req, res) => {
  await AiConfig.findOneAndUpdate({}, { $set: { totalRequests: 0, totalErrors: 0, averageResponseTime: 0, lastApiCall: null, lastError: '' } });
  await logAdminAction(req, 'ai_metrics_reset', null, 'config');
  res.json({ status: 'success', message: 'AI metrics reset successfully.' });
});

exports.getSystemSettings = asyncHandler(async (req, res) => {
  const settings = await SystemSettings.getSettings();
  res.json({ status: 'success', data: { settings } });
});

exports.updateSystemSettings = asyncHandler(async (req, res) => {
  const allowed = ['appName', 'logo', 'maintenanceMode', 'smtp', 'jwtExpiry', 'uploadLimit', 'aiProvider'];
  const updates = {};
  allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  const settings = await SystemSettings.getSettings();
  Object.assign(settings, updates);
  await settings.save();
  await logAdminAction(req, 'settings_updated', null, 'config', Object.keys(updates));
  res.json({ status: 'success', data: { settings } });
});

exports.getAuditLogs = asyncHandler(async (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
  const skip = (page - 1) * limit;
  const filter = {};
  if (req.query.action) filter.action = req.query.action;
  const [logs, total] = await Promise.all([
    AuditLog.find(filter).populate('actor', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    AuditLog.countDocuments(filter),
  ]);
  res.json({ status: 'success', results: logs.length, totalPages: Math.ceil(total / limit), total, data: { logs, pagination: { page, limit, totalPages: Math.ceil(total / limit), totalItems: total, hasNextPage: page < Math.ceil(total / limit), hasPrevPage: page > 1 } } });
});

exports.getNotifications = asyncHandler(async (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;
  const [notifications, total] = await Promise.all([
    Notification.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments(),
  ]);
  res.json({ status: 'success', results: notifications.length, totalPages: Math.ceil(total / limit), total, data: { notifications, pagination: { page, limit, totalPages: Math.ceil(total / limit), totalItems: total, hasNextPage: page < Math.ceil(total / limit), hasPrevPage: page > 1 } } });
});

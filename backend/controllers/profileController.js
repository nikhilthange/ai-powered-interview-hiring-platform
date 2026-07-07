const Profile = require('../models/Profile');
const aiService = require('../services/aiService');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const { calculateProfileCompletion } = require('../utils/profileCompletion');
const fs = require('fs');
const path = require('path');

exports.getProfile = asyncHandler(async (req, res, next) => {
  const query = req.params.userId
    ? { userId: req.params.userId }
    : { userId: req.user._id };

  const profile = await Profile.findOne(query);
  if (!profile) {
    return next(new AppError('Profile not found.', 404));
  }

  const completion = calculateProfileCompletion(profile, req.user);

  res.status(200).json({
    status: 'success',
    data: { profile, completion }
  });
});

exports.createOrUpdateProfile = asyncHandler(async (req, res, next) => {
  const allowedFields = [
    'fullName', 'bio', 'phone', 'location', 'headline', 'title',
    'website', 'linkedin', 'github', 'portfolio',
    'skills', 'experienceYears', 'education', 'projects',
  ];

  const fields = { userId: req.user._id };
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      fields[field] = req.body[field];
    }
  });

  if (req.user.role === 'recruiter' && req.body.company) {
    const existing = await Profile.findOne({ userId: req.user._id }).select('company');
    const companyData = typeof req.body.company === 'string'
      ? { name: req.body.company }
      : req.body.company;
    fields.company = {
      name: companyData.name || '',
      website: companyData.website || '',
      logoUrl: companyData.logoUrl || '',
      isVerified: existing?.company?.isVerified || false
    };
  }

  const profile = await Profile.findOneAndUpdate(
    { userId: req.user._id },
    { $set: fields },
    { new: true, upsert: true, runValidators: true }
  );

  const completion = calculateProfileCompletion(profile, req.user);

  res.status(200).json({
    status: 'success',
    data: { profile, completion }
  });
});

exports.uploadAvatar = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload an image file.', 400));
  }

  const existing = await Profile.findOne({ userId: req.user._id }).select('avatarUrl');

  if (existing?.avatarUrl) {
    const oldPath = path.join(__dirname, '..', existing.avatarUrl);
    fs.unlink(oldPath, () => {});
  }

  const profile = await Profile.findOneAndUpdate(
    { userId: req.user._id },
    { $set: { avatarUrl: `/uploads/${req.file.filename}` } },
    { new: true, upsert: true }
  );

  if (!profile) {
    return next(new AppError('Profile could not be updated.', 500));
  }

  const completion = calculateProfileCompletion(profile, req.user);

  res.status(200).json({
    status: 'success',
    data: { profile, completion }
  });
});

exports.uploadResume = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload a resume file.', 400));
  }

  const profile = await Profile.findOneAndUpdate(
    { userId: req.user._id },
    { $set: { resumeUrl: `/uploads/${req.file.filename}` } },
    { new: true }
  );

  const completion = calculateProfileCompletion(profile, req.user);

  res.status(200).json({
    status: 'success',
    data: { profile, completion }
  });
});

exports.generateRoadmap = asyncHandler(async (req, res, next) => {
  const { targetRole } = req.body;

  const profile = await Profile.findOne({ userId: req.user._id });
  if (!profile || !profile.skills || profile.skills.length === 0) {
    return next(new AppError('Please add skills to your profile before generating a career roadmap.', 400));
  }

  const roadmap = await aiService.generateCareerRoadmap(profile.skills, targetRole);

  profile.careerRoadmap = roadmap;
  await profile.save();

  res.status(200).json({
    status: 'success',
    data: { roadmap }
  });
});

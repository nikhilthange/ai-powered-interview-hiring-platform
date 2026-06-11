const Profile = require('../models/Profile');
const aiService = require('../services/aiService');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
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

  res.status(200).json({
    status: 'success',
    data: { profile }
  });
});

exports.createOrUpdateProfile = asyncHandler(async (req, res, next) => {
  const { fullName, bio, skills, experienceYears, company } = req.body;

  const fields = {
    userId: req.user._id,
    fullName
  };

  if (bio !== undefined) fields.bio = bio;
  if (skills !== undefined) fields.skills = skills;
  if (experienceYears !== undefined) fields.experienceYears = experienceYears;

  if (req.user.role === 'recruiter' && company) {
    fields.company = {
      name: company.name || '',
      website: company.website || '',
      logoUrl: company.logoUrl || ''
    };
  }

  const profile = await Profile.findOneAndUpdate(
    { userId: req.user._id },
    { $set: fields },
    { new: true, upsert: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    data: { profile }
  });
});

exports.uploadAvatar = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload an image file.', 400));
  }

  const profile = await Profile.findOneAndUpdate(
    { userId: req.user._id },
    { $set: { avatarUrl: `/uploads/${req.file.filename}` } },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    data: { profile }
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

  res.status(200).json({
    status: 'success',
    data: { profile }
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

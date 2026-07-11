const Company = require('../models/Company');
const User = require('../models/User');
const catchAsync = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const upload = require('../middleware/uploadImageMiddleware');

// Handle multiple file uploads for company
exports.uploadCompanyImages = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 },
  { name: 'officePhotos', maxCount: 5 }
]);

/**
 * @desc    Create or update recruiter's company profile
 * @route   POST /api/v1/companies
 * @access  Private (Recruiter)
 */
exports.createOrUpdateCompany = catchAsync(async (req, res, next) => {
  const recruiterId = req.user._id;
  
  // Parse fields that might come as JSON strings in form-data
  let benefits = req.body.benefits;
  if (typeof benefits === 'string') {
    try { benefits = JSON.parse(benefits); } catch (e) { benefits = benefits.split(',').map(s => s.trim()); }
  }
  
  let socialLinks = req.body.socialLinks;
  if (typeof socialLinks === 'string') {
    try { socialLinks = JSON.parse(socialLinks); } catch (e) {}
  }

  const companyData = {
    recruiterId,
    name: req.body.name,
    about: req.body.about,
    website: req.body.website,
    industry: req.body.industry,
    employeeCount: req.body.employeeCount,
    culture: req.body.culture,
    benefits: benefits || [],
    socialLinks: socialLinks || {}
  };

  // Add uploaded file paths to companyData
  if (req.files) {
    if (req.files.logo && req.files.logo.length > 0) {
      companyData.logo = req.files.logo[0].filename;
    }
    if (req.files.coverImage && req.files.coverImage.length > 0) {
      companyData.coverImage = req.files.coverImage[0].filename;
    }
    if (req.files.officePhotos && req.files.officePhotos.length > 0) {
      companyData.officePhotos = req.files.officePhotos.map(file => file.filename);
    }
  }

  let company = await Company.findOne({ recruiterId });

  if (company) {
    // If updating, merge office photos if new ones are uploaded
    if (companyData.officePhotos) {
        companyData.officePhotos = [...(company.officePhotos || []), ...companyData.officePhotos];
    }
    company = await Company.findOneAndUpdate(
      { recruiterId },
      companyData,
      { new: true, runValidators: true }
    );
  } else {
    company = await Company.create(companyData);
  }

  res.status(200).json({
    status: 'success',
    data: { company }
  });
});

/**
 * @desc    Get current recruiter's company profile
 * @route   GET /api/v1/companies/my-company
 * @access  Private (Recruiter)
 */
exports.getMyCompany = catchAsync(async (req, res, next) => {
  const company = await Company.findOne({ recruiterId: req.user._id });

  if (!company) {
    return res.status(200).json({
      status: 'success',
      data: { company: null }
    });
  }

  res.status(200).json({
    status: 'success',
    data: { company }
  });
});

/**
 * @desc    Get all companies (with pagination and optional search)
 * @route   GET /api/v1/companies
 * @access  Public
 */
exports.getAllCompanies = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let query = {};
  
  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }

  if (req.query.recruiterId) {
    query.recruiterId = req.query.recruiterId;
  }

  if (req.query.industry) {
    query.industry = { $in: req.query.industry.split(',') };
  }

  if (req.query.location) {
    query.location = { $regex: req.query.location, $options: 'i' };
  }

  if (req.query.size) {
    query.employeeCount = { $in: req.query.size.split(',') };
  }

  if (req.query.isVerified === 'true') {
    query.isVerified = true;
  }

  const companies = await Company.find(query)
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Company.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: companies.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: { companies }
  });
});

/**
 * @desc    Get single company profile
 * @route   GET /api/v1/companies/:id
 * @access  Public
 */
exports.getCompanyById = catchAsync(async (req, res, next) => {
  const company = await Company.findById(req.params.id).populate({
    path: 'jobs',
    match: { status: 'Active' },
    select: 'title location jobType experienceLevel salaryRange createdAt'
  });

  if (!company) {
    return next(new AppError('No company found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { company }
  });
});

/**
 * @desc    Follow a company
 * @route   POST /api/v1/companies/:id/follow
 * @access  Private (Candidate)
 */
exports.followCompany = catchAsync(async (req, res, next) => {
  const companyId = req.params.id;
  const userId = req.user._id;

  const company = await Company.findById(companyId);
  if (!company) {
    return next(new AppError('No company found with that ID', 404));
  }

  // Add to user's following list if not already there
  const user = await User.findById(userId);
  if (!user.followingCompanies.includes(companyId)) {
    user.followingCompanies.push(companyId);
    await user.save({ validateBeforeSave: false });

    // Increment company followers count
    company.followersCount += 1;
    await company.save();
  }

  res.status(200).json({
    status: 'success',
    message: 'Successfully followed company'
  });
});

/**
 * @desc    Unfollow a company
 * @route   POST /api/v1/companies/:id/unfollow
 * @access  Private (Candidate)
 */
exports.unfollowCompany = catchAsync(async (req, res, next) => {
  const companyId = req.params.id;
  const userId = req.user._id;

  const company = await Company.findById(companyId);
  if (!company) {
    return next(new AppError('No company found with that ID', 404));
  }

  const user = await User.findById(userId);
  
  if (user.followingCompanies.includes(companyId)) {
    // Remove from user's following list
    user.followingCompanies = user.followingCompanies.filter(
      id => id.toString() !== companyId.toString()
    );
    await user.save({ validateBeforeSave: false });

    // Decrement company followers count
    company.followersCount = Math.max(0, company.followersCount - 1);
    await company.save();
  }

  res.status(200).json({
    status: 'success',
    message: 'Successfully unfollowed company'
  });
});

/**
 * @desc    Get recommended companies based on rating and followers
 * @route   GET /api/v1/companies/recommended
 * @access  Public
 */
exports.getRecommendedCompanies = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 5;
  
  // Recommend verified companies with highest ratings and followers
  const companies = await Company.find({ isVerified: true })
    .sort('-rating -followersCount')
    .limit(limit);

  res.status(200).json({
    status: 'success',
    results: companies.length,
    data: { companies }
  });
});

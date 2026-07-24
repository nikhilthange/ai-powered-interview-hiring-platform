const { analyzeResumeInteractive, analyzeSkillGap, analyzeResumeFromFile, analyzeSkillGapFromFile } = require('../services/aiService');
const aiProvider = require('../services/aiProvider');
const { extractText, cleanup } = require('../services/resumeService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

exports.analyzeResume = asyncHandler(async (req, res) => {
  const { resumeText, jobDescription } = req.body;

  if (!resumeText || !jobDescription) {
    throw new AppError('Please provide both resumeText and jobDescription', 400);
  }
  if (resumeText.length < 50) {
    throw new AppError('Resume text must be at least 50 characters', 400);
  }
  if (jobDescription.length < 50) {
    throw new AppError('Job description must be at least 50 characters', 400);
  }

  const result = await analyzeResumeInteractive(resumeText, jobDescription);

  res.status(200).json({
    status: 'success',
    data: result
  });
});

exports.analyzeResumeUpload = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('Please upload a resume file (PDF or DOCX).', 400);
  }

  const { jobDescription } = req.body;
  if (!jobDescription || jobDescription.length < 50) {
    throw new AppError('Job description must be at least 50 characters.', 400);
  }

  console.log(`[analysisController] Processing resume upload: ${req.file.originalname}`);

  let resumeText;
  try {
    resumeText = await extractText(req.file.path, req.file.originalname);
    console.log(`[analysisController] Extracted ${resumeText.trim().length} chars of text`);
  } catch (err) {
    cleanup(req.file.path);
    throw err;
  }

  let result;
  try {
    result = await analyzeResumeFromFile(resumeText, jobDescription);
    console.log('[analysisController] AI analysis completed successfully');
  } catch (err) {
    cleanup(req.file.path);
    throw err;
  }

  cleanup(req.file.path);

  res.status(200).json({
    status: 'success',
    data: result
  });
});

exports.skillGapUpload = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('Please upload a resume file (PDF or DOCX).', 400);
  }

  const { targetRole } = req.body;
  if (!targetRole || targetRole.trim().length < 3) {
    throw new AppError('Please provide a target role (at least 3 characters).', 400);
  }

  console.log(`[analysisController] Processing skill-gap upload: ${req.file.originalname}`);

  let resumeText;
  try {
    resumeText = await extractText(req.file.path, req.file.originalname);
    console.log(`[analysisController] Extracted ${resumeText.trim().length} chars of text`);
  } catch (err) {
    cleanup(req.file.path);
    throw err;
  }

  let result;
  try {
    result = await analyzeSkillGapFromFile(resumeText, targetRole.trim());
    console.log('[analysisController] Skill gap analysis completed successfully');
  } catch (err) {
    cleanup(req.file.path);
    throw err;
  }

  cleanup(req.file.path);

  res.status(200).json({
    status: 'success',
    data: result
  });
});

exports.skillGap = asyncHandler(async (req, res) => {
  const { resumeText, targetRole } = req.body;

  if (!resumeText || !targetRole) {
    throw new AppError('Please provide both resumeText and targetRole', 400);
  }
  if (resumeText.length < 50) {
    throw new AppError('Resume text must be at least 50 characters', 400);
  }

  const result = await analyzeSkillGap(resumeText, targetRole);

  res.status(200).json({
    status: 'success',
    data: result
  });
});

exports.matchJob = asyncHandler(async (req, res) => {
  const Profile = require('../models/Profile');
  const Job = require('../models/Job');
  const { jobId, jobRequirements = [], resumeText: inputResumeText } = req.body;

  const job = jobId ? await Job.findById(jobId) : null;
  const jobDescription = job?.description || '';
  const jobTitle = job?.title || '';

  const profile = await Profile.findOne({ userId: req.user._id });
  const resumeText = inputResumeText || profile?.resumeUrl || '';

  const result = await aiProvider.matchJob({
    resumeText,
    jobDescription,
    jobTitle,
    candidateProfile: profile || {}
  });

  res.status(200).json({
    status: 'success',
    data: {
      matchScore: result.matchPercent || 0,
      matchedSkills: result.matchedSkills || [],
      missingSkills: result.missingSkills || [],
      matchPercent: result.matchPercent || 0,
      preparationSuggestions: result.preparationSuggestions || []
    }
  });
});

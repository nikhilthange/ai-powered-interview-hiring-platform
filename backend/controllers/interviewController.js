const Interview = require('../models/Interview');
const Application = require('../models/Application');
const Profile = require('../models/Profile');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const { createAndSend } = require('../utils/notificationHelper');
const { extractText, cleanup } = require('../services/resumeService');
const {
  generateMockInterviewQuestions,
  analyzeInterviewFeedback,
  generateCareerRoadmap
} = require('../services/aiService');

/**
 * SCHEDULE INTERVIEW (Recruiter)
 */
exports.scheduleInterview = asyncHandler(async (req, res, next) => {
  const { applicationId, scheduledAt, meetLink } = req.body;

  const application = await Application.findById(applicationId).populate('jobId');
  if (!application) {
    return next(new AppError('No application found with that ID.', 404));
  }

  const interview = await Interview.create({
    applicationId,
    recruiterId: req.user._id,
    candidateId: application.candidateId,
    scheduledAt,
    meetLink: meetLink || ''
  });

  // Move application status to Interview Scheduled
  application.status = 'Interview Scheduled';
  await application.save();

  // Notify candidate
  await createAndSend({
    recipientId: application.candidateId,
    type: 'interview_scheduled',
    title: 'Interview Scheduled',
    message: `An interview has been scheduled for ${new Date(scheduledAt).toLocaleString()}.`,
    sendEmail: true
  });

  res.status(201).json({
    status: 'success',
    data: { interview }
  });
});

/**
 * GET MY INTERVIEWS (Candidate or Recruiter)
 */
exports.getMyInterviews = asyncHandler(async (req, res, next) => {
  const query = req.user.role === 'recruiter'
    ? { recruiterId: req.user._id }
    : { candidateId: req.user._id };

  const interviews = await Interview.find(query)
    .populate('applicationId', 'status jobId')
    .populate('candidateId', 'email')
    .populate('recruiterId', 'email')
    .sort({ scheduledAt: 1 });

  res.status(200).json({
    status: 'success',
    results: interviews.length,
    data: { interviews }
  });
});

/**
 * UPDATE INTERVIEW STATUS (Recruiter)
 */
exports.updateInterview = asyncHandler(async (req, res, next) => {
  const { status, gptInterviewFeedback } = req.body;

  const interview = await Interview.findById(req.params.id);
  if (!interview) {
    return next(new AppError('No interview found with that ID.', 404));
  }

  if (interview.recruiterId.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only update your own interviews.', 403));
  }

  if (status) interview.status = status;
  if (gptInterviewFeedback) interview.gptInterviewFeedback = gptInterviewFeedback;
  await interview.save();

  res.status(200).json({
    status: 'success',
    data: { interview }
  });
});

/**
 * GENERATE MOCK INTERVIEW QUESTIONS (Authenticated)
 */
exports.generateQuestions = asyncHandler(async (req, res) => {
  const { jobDescription, resumeText } = req.body;

  if (!jobDescription || !resumeText) {
    throw new AppError('Please provide jobDescription and resumeText', 400);
  }

  const questions = await generateMockInterviewQuestions(jobDescription, resumeText);

  res.status(200).json({
    status: 'success',
    data: { questions }
  });
});

/**
 * ANALYZE MOCK INTERVIEW FEEDBACK (Authenticated)
 */
exports.analyzeFeedback = asyncHandler(async (req, res) => {
  const { qaPairs } = req.body;

  if (!qaPairs || !Array.isArray(qaPairs) || qaPairs.length === 0) {
    throw new AppError('Please provide qaPairs as a non-empty array', 400);
  }

  const feedback = await analyzeInterviewFeedback(qaPairs);

  res.status(200).json({
    status: 'success',
    data: { feedback }
  });
});

/**
 * GENERATE CAREER ROADMAP (Authenticated)
 */
exports.careerRoadmap = asyncHandler(async (req, res) => {
  const { skills, targetRole } = req.body;

  if (!skills || !Array.isArray(skills) || skills.length === 0 || !targetRole) {
    throw new AppError('Please provide skills (non-empty array) and targetRole', 400);
  }

  const roadmap = await generateCareerRoadmap(skills, targetRole);

  res.status(200).json({
    status: 'success',
    data: { roadmap }
  });
});

exports.careerRoadmapUpload = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('Please upload a resume file (PDF or DOCX).', 400);
  }

  const { targetRole } = req.body;
  if (!targetRole || targetRole.trim().length < 3) {
    cleanup(req.file?.path);
    throw new AppError('Please provide a target role (at least 3 characters).', 400);
  }

  let resumeText;
  try {
    resumeText = await extractText(req.file.path, req.file.originalname);
  } catch (err) {
    cleanup(req.file.path);
    throw new AppError('Failed to extract text from resume.', 400);
  }

  const profile = await Profile.findOne({ userId: req.user._id });
  let skills = profile?.skills?.filter(Boolean) || [];
  if (skills.length === 0) {
    const response = await generateCareerRoadmap(
      ['extract from resume', 'general development'],
      targetRole.trim()
    );
    cleanup(req.file.path);
    return res.status(200).json({ status: 'success', data: { roadmap: response } });
  }
  const roadmap = await generateCareerRoadmap(skills, targetRole.trim());

  cleanup(req.file.path);

  res.status(200).json({
    status: 'success',
    data: { roadmap }
  });
});

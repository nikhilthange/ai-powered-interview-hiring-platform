const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const Profile = require('../models/Profile');
const aiService = require('../services/aiService');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const { createAndSend } = require('../utils/notificationHelper');
const { extractText, cleanup, extractTextFromUrl } = require('../services/resumeService');
const {
  sendApplicationSubmittedEmail,
  sendApplicationAcceptedEmail,
  sendApplicationRejectedEmail
} = require('../services/emailService');

/**
 * SUBMIT APPLICATION (Candidate)
 */
exports.submitApplication = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;

  const job = await Job.findById(jobId);
  if (!job || job.status !== 'Active') {
    return next(new AppError('This job listing is closed or does not exist.', 400));
  }

  const existing = await Application.findOne({ jobId, candidateId: req.user._id });
  if (existing) {
    return next(new AppError('You have already applied to this position. Duplicate applications are not allowed.', 400));
  }

  const resumeUrl = req.file ? `/uploads/${req.file.filename}` : (req.body.existingResumeUrl || null);
  if (!resumeUrl) {
    return next(new AppError('Please upload a resume or select an existing one.', 400));
  }

  const application = await Application.create({
    jobId,
    candidateId: req.user._id,
    resumeUrl,
    coverLetter: req.body.coverLetter || ''
  });

  await createAndSend({
    recipientId: job.recruiterId,
    type: 'application_update',
    title: 'New Application Received',
    message: `A new candidate has applied to "${job.title}".`,
    sendEmail: true
  });

  // Send confirmation email to candidate
  try {
    const [candidate, candidateProfile, recruiterProfile] = await Promise.all([
      User.findById(req.user._id).select('email name'),
      Profile.findOne({ userId: req.user._id }).select('fullName'),
      Profile.findOne({ userId: job.recruiterId }).select('company')
    ]);
    const candidateName = candidateProfile?.fullName || candidate?.name;
    const companyName = recruiterProfile?.company?.name || '';
    if (candidate?.email) {
      await sendApplicationSubmittedEmail(
        candidate.email, candidateName, job.title, companyName || 'the company', req.user._id
      );
    }
  } catch (err) {
    console.error(`Application confirmation email failed: ${err.message}`);
  }

  let resumeText = '';
  if (req.file) {
    try {
      resumeText = await extractText(req.file.path, req.file.originalname);
    } catch (err) {
      console.error('[applicationController] Resume text extraction failed:', err.message);
      cleanup(req.file.path);
    }
  } else if (resumeUrl) {
    resumeText = await extractTextFromUrl(resumeUrl);
  }
  if (resumeText) {
    aiService.analyzeResumeBackground(application._id, resumeText, job.description)
      .catch(err => console.error('[applicationController] Background analysis error (safety catch):', err));
  }

  res.status(201).json({
    status: 'success',
    data: { application }
  });
});

exports.checkDuplicateApplication = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;
  const existing = await Application.findOne({ jobId, candidateId: req.user._id });
  res.status(200).json({
    status: 'success',
    data: { hasApplied: !!existing }
  });
});

/**
 * GET MY APPLICATIONS (Candidate) — Paginated
 */
exports.getMyApplications = asyncHandler(async (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const filter = { candidateId: req.user._id };
  if (req.query.status && req.query.status !== 'All') {
    filter.status = req.query.status;
  }

  const [applications, totalItems] = await Promise.all([
    Application.find(filter)
      .populate('jobId', 'title location jobType status recruiterId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Application.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalItems / limit) || 1;

  res.status(200).json({
    status: 'success',
    results: applications.length,
    data: {
      applications,
      pagination: {
        page,
        limit,
        totalPages,
        totalItems,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  });
});

/**
 * GET APPLICATIONS FOR A JOB (Recruiter)
 */
exports.getJobApplications = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) {
    return next(new AppError('No job found with that ID.', 404));
  }

  if (job.recruiterId.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only view applications for your own jobs.', 403));
  }

  const applications = await Application.find({ jobId: req.params.jobId })
    .populate('candidateId', 'email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: applications.length,
    data: { applications }
  });
});

/**
 * UPDATE APPLICATION STATUS (Recruiter)
 */
exports.updateApplicationStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const validStatuses = ['Applied', 'Reviewing', 'Shortlisted', 'Interview Scheduled', 'Rejected', 'Hired'];
  if (!validStatuses.includes(status)) {
    return next(new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400));
  }

  const application = await Application.findById(req.params.id).populate({
    path: 'jobId',
    select: 'title recruiterId'
  });
  if (!application) {
    return next(new AppError('No application found with that ID.', 404));
  }

  application.status = status;
  application._changedBy = req.user._id;
  await application.save();

  // Notify candidate of status change
  await createAndSend({
    recipientId: application.candidateId,
    type: 'application_update',
    title: 'Application Status Updated',
    message: `Your application status has been updated to: ${status}.`,
    sendEmail: false
  });

  // Send status-specific email to candidate
  try {
    const [candidate, candidateProfile, recruiterProfile] = await Promise.all([
      User.findById(application.candidateId).select('email name'),
      Profile.findOne({ userId: application.candidateId }).select('fullName'),
      Profile.findOne({ userId: application.jobId?.recruiterId }).select('company')
    ]);
    const candidateName = candidateProfile?.fullName || candidate?.name;
    const jobData = application.jobId || {};
    const companyName = recruiterProfile?.company?.name || '';
    if (candidate?.email) {
      if (status === 'Shortlisted' || status === 'Hired') {
        await sendApplicationAcceptedEmail(
          candidate.email, candidateName, jobData.title, companyName || 'the company', application.candidateId
        );
      } else if (status === 'Rejected') {
        await sendApplicationRejectedEmail(
          candidate.email, candidateName, jobData.title, companyName || 'the company', application.candidateId
        );
      }
    }
  } catch (err) {
    console.error(`Application status email failed: ${err.message}`);
  }

  res.status(200).json({
    status: 'success',
    data: { application }
  });
});

/**
 * GET AI ANALYSIS FOR AN APPLICATION
 */
exports.getApplicationAnalysis = asyncHandler(async (req, res, next) => {
  const application = await Application.findById(req.params.id);
  if (!application) {
    return next(new AppError('No application found with that ID.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      atsScore: application.atsScore,
      matchPercent: application.matchPercent,
      aiAnalysis: application.aiAnalysis
    }
  });
});

/**
 * AI MOCK INTERVIEW (Candidate)
 */
exports.getMockInterview = asyncHandler(async (req, res, next) => {
  const { jobDescription, resumeText } = req.body;
  if (!jobDescription) {
    return next(new AppError('Please provide a job description for mock interview generation.', 400));
  }

  const questions = await aiService.generateMockInterviewQuestions(
    jobDescription,
    resumeText || ''
  );

  res.status(200).json({
    status: 'success',
    data: { questions }
  });
});

/**
 * AI MOCK INTERVIEW FEEDBACK (Candidate)
 */
exports.submitMockInterviewAnswers = asyncHandler(async (req, res, next) => {
  const { qaPairs } = req.body;
  if (!qaPairs || !Array.isArray(qaPairs) || qaPairs.length === 0) {
    return next(new AppError('Please provide question-answer pairs for feedback.', 400));
  }

  const feedback = await aiService.analyzeInterviewFeedback(qaPairs);

  res.status(200).json({
    status: 'success',
    data: { feedback }
  });
});

exports.withdrawApplication = asyncHandler(async (req, res, next) => {
  const application = await Application.findById(req.params.id);
  if (!application) {
    return next(new AppError('No application found with that ID.', 404));
  }

  if (application.candidateId.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only withdraw your own applications.', 403));
  }

  if (application.status === 'Rejected' || application.status === 'Hired') {
    return next(new AppError('Cannot withdraw an application that has been hired or rejected.', 400));
  }

  await Application.findByIdAndDelete(req.params.id);

  await createAndSend({
    recipientId: application.candidateId,
    type: 'application_update',
    title: 'Application Withdrawn',
    message: 'Your application has been withdrawn successfully.',
    sendEmail: false
  });

  res.status(200).json({
    status: 'success',
    message: 'Application withdrawn successfully.'
  });
});

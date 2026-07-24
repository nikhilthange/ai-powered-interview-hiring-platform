const recruiterAiService = require('../services/recruiterAiService');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Profile = require('../models/Profile');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const { extractText, extractTextFromUrl } = require('../services/resumeService');

exports.generateJobDescription = asyncHandler(async (req, res, next) => {
  const { prompt, title } = req.body;
  if (!prompt) return next(new AppError('Prompt is required for generating a job description.', 400));

  const result = await recruiterAiService.generateJobDescription(prompt, title);

  res.status(200).json({ status: 'success', data: result });
});

exports.generateInterviewQuestions = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;
  const job = await Job.findById(jobId);
  if (!job) return next(new AppError('Job not found.', 404));
  if (job.recruiterId.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only generate questions for your own jobs.', 403));
  }

  const result = await recruiterAiService.generateInterviewQuestions(
    job.title, job.description, job.requirements || [], job.experienceLevel
  );

  res.status(200).json({ status: 'success', data: result });
});

exports.summarizeResume = asyncHandler(async (req, res, next) => {
  const { applicationId } = req.params;
  const application = await Application.findById(applicationId).populate('candidateId', 'name email');
  if (!application) return next(new AppError('Application not found.', 404));

  const job = await Job.findById(application.jobId);
  if (!job || (job.recruiterId.toString() !== req.user._id.toString() && req.user.role !== 'admin')) {
    return next(new AppError('You can only view applications for your own jobs.', 403));
  }

  let resumeText = '';
  if (application.resumeUrl) {
    try {
      resumeText = await extractTextFromUrl(application.resumeUrl);
    } catch {
      resumeText = '';
    }
  }

  const result = await recruiterAiService.summarizeResume(
    resumeText, application.candidateId?.name || 'Candidate'
  );

  res.status(200).json({ status: 'success', data: result });
});

exports.compareCandidates = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;
  const { candidateIds } = req.body;

  const job = await Job.findById(jobId);
  if (!job) return next(new AppError('Job not found.', 404));
  if (job.recruiterId.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only compare candidates for your own jobs.', 403));
  }

  const applications = await Application.find({
    _id: { $in: candidateIds },
    jobId
  }).populate('candidateId', 'name email');

  if (applications.length === 0) {
    return next(new AppError('No valid candidates found to compare.', 400));
  }

  const candidates = [];
  for (const app of applications) {
    let resumeText = '';
    if (app.resumeUrl) {
      try { resumeText = await extractTextFromUrl(app.resumeUrl); } catch {}
    }
    candidates.push({
      name: app.candidateId?.name || 'Unknown',
      skills: [],
      experience: `${app.atsScore || 0} ATS Score`,
      education: '',
      resumeText
    });
  }

  const result = await recruiterAiService.compareCandidates(candidates);

  res.status(200).json({ status: 'success', data: { comparison: result } });
});

exports.rankApplicants = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;

  const job = await Job.findById(jobId);
  if (!job) return next(new AppError('Job not found.', 404));
  if (job.recruiterId.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only rank applicants for your own jobs.', 403));
  }

  const applications = await Application.find({ jobId })
    .populate('candidateId', 'name email')
    .sort({ createdAt: -1 });

  if (applications.length === 0) {
    return next(new AppError('No applicants found for this job.', 400));
  }

  const appData = [];
  for (const app of applications) {
    let resumeText = '';
    if (app.resumeUrl) {
      try { resumeText = await extractTextFromUrl(app.resumeUrl); } catch {}
    }
    appData.push({
      candidateId: app.candidateId || { name: 'Unknown', skills: [] },
      atsScore: app.atsScore,
      resumeText
    });
  }

  const result = await recruiterAiService.rankApplicants(appData, job.description);

  res.status(200).json({ status: 'success', data: { rankings: result } });
});

exports.suggestSalaryRange = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;

  const job = await Job.findById(jobId);
  if (!job) return next(new AppError('Job not found.', 404));
  if (job.recruiterId.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only view salary suggestions for your own jobs.', 403));
  }

  const result = await recruiterAiService.suggestSalaryRange(
    job.title, job.description, job.requirements || [], job.location, job.experienceLevel
  );

  res.status(200).json({ status: 'success', data: result });
});

exports.generateEmailInvitation = asyncHandler(async (req, res, next) => {
  const { candidateName, jobTitle, companyName, customMessage } = req.body;
  if (!candidateName || !jobTitle || !companyName) {
    return next(new AppError('Candidate name, job title, and company name are required.', 400));
  }

  const result = await recruiterAiService.generateEmailInvitation(
    candidateName, jobTitle, companyName, customMessage || ''
  );

  res.status(200).json({ status: 'success', data: result });
});

exports.generateRejectionEmail = asyncHandler(async (req, res, next) => {
  const { candidateName, jobTitle, companyName, rejectionReason } = req.body;
  if (!candidateName || !jobTitle || !companyName) {
    return next(new AppError('Candidate name, job title, and company name are required.', 400));
  }

  const result = await recruiterAiService.generateRejectionEmail(
    candidateName, jobTitle, companyName, rejectionReason || ''
  );

  res.status(200).json({ status: 'success', data: result });
});

exports.generateTechnicalAssignment = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;

  const job = await Job.findById(jobId);
  if (!job) return next(new AppError('Job not found.', 404));
  if (job.recruiterId.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only generate assignments for your own jobs.', 403));
  }

  const result = await recruiterAiService.generateTechnicalAssignment(
    job.title, job.description, job.requirements || [], job.experienceLevel
  );

  res.status(200).json({ status: 'success', data: result });
});

exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  const recruiterId = req.user._id;
  const Interview = require('../models/Interview');

  const jobs = await Job.find({ recruiterId }).sort('-createdAt');
  const jobIds = jobs.map(j => j._id);

  const applications = await Application.find({ jobId: { $in: jobIds } })
    .populate('candidateId', 'name email')
    .populate('jobId', 'title location')
    .sort('-createdAt');

  const interviews = await Interview.find({ recruiterId }).sort('-createdAt');

  const activeJobs = jobs.filter(j => j.status === 'Active').length;
  const hiredApps = applications.filter(a => a.status === 'Hired').length;
  const shortlistedApps = applications.filter(a => a.status === 'Shortlisted' || a.status === 'Reviewing').length;

  const totalApps = applications.length;
  const hiringRate = totalApps > 0 ? Math.round((hiredApps / totalApps) * 100) : 0;
  const interviewConversion = totalApps > 0 ? Math.round((interviews.length / totalApps) * 100) : 0;

  let totalAtsSum = 0;
  let atsCount = 0;
  applications.forEach(a => {
    if (typeof a.atsScore === 'number' && a.atsScore > 0) {
      totalAtsSum += a.atsScore;
      atsCount++;
    }
  });
  const avgAtsScore = atsCount > 0 ? Math.round(totalAtsSum / atsCount) : 0;

  res.status(200).json({
    status: 'success',
    data: {
      jobs,
      activeJobs,
      totalJobs: jobs.length,
      applications,
      totalApplications: totalApps,
      interviews,
      totalInterviews: interviews.length,
      hiredCount: hiredApps,
      shortlistedCount: shortlistedApps,
      hiringRate,
      interviewConversion,
      avgAtsScore
    }
  });
});

exports.sendEmail = asyncHandler(async (req, res, next) => {
  const { candidateEmail, subject, body } = req.body;
  if (!candidateEmail || !subject || !body) {
    return next(new AppError('Recipient email, subject, and body are required.', 400));
  }

  const emailService = require('../services/emailService');
  await emailService.sendEmail({
    to: candidateEmail,
    subject,
    text: body,
    html: `<div style="font-family: sans-serif; line-height: 1.6;">${body.replace(/\n/g, '<br>')}</div>`
  });

  res.status(200).json({
    status: 'success',
    message: `Email sent to ${candidateEmail} successfully.`
  });
});

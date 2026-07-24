const express = require('express');
const recruiterAIController = require('../controllers/recruiterAIController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(restrictTo('recruiter', 'admin'));

router.get('/dashboard-stats', recruiterAIController.getDashboardStats);
router.post('/generate-job-description', recruiterAIController.generateJobDescription);
router.get('/jobs/:jobId/interview-questions', recruiterAIController.generateInterviewQuestions);
router.get('/applications/:applicationId/summarize-resume', recruiterAIController.summarizeResume);
router.post('/jobs/:jobId/compare-candidates', recruiterAIController.compareCandidates);
router.get('/jobs/:jobId/rank-applicants', recruiterAIController.rankApplicants);
router.get('/jobs/:jobId/suggest-salary', recruiterAIController.suggestSalaryRange);
router.post('/generate-email-invitation', recruiterAIController.generateEmailInvitation);
router.post('/generate-rejection-email', recruiterAIController.generateRejectionEmail);
router.post('/send-email', recruiterAIController.sendEmail);
router.get('/jobs/:jobId/generate-assignment', recruiterAIController.generateTechnicalAssignment);

module.exports = router;

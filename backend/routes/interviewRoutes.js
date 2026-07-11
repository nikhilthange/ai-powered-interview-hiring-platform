const express = require('express');
const interviewController = require('../controllers/interviewController');
const mockInterviewController = require('../controllers/mockInterviewController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  validateBody,
  scheduleInterviewSchema,
  updateInterviewSchema
} = require('../validators/interviewValidator');

const router = express.Router();

router.use(protect);

router.get('/', interviewController.getMyInterviews);
router.post('/', restrictTo('recruiter', 'admin'), validateBody(scheduleInterviewSchema), interviewController.scheduleInterview);
router.patch('/:id', restrictTo('recruiter', 'admin'), validateBody(updateInterviewSchema), interviewController.updateInterview);

// AI-powered interview endpoints
router.post('/generate-questions', interviewController.generateQuestions);
router.post('/analyze-feedback', interviewController.analyzeFeedback);
router.post('/career-roadmap', interviewController.careerRoadmap);
router.get('/career-roadmap/my', interviewController.getMyRoadmap);
router.post('/career-roadmap-upload', upload.single('resume'), interviewController.careerRoadmapUpload);

// Mock interview session endpoints
router.post('/session/create', upload.single('resume'), mockInterviewController.createSession);
router.post('/session/generate-questions', mockInterviewController.generateQuestions);
router.post('/session/submit-answer', mockInterviewController.submitAnswer);
router.post('/session/complete', mockInterviewController.completeSession);
router.get('/session/list/mine', mockInterviewController.getMySessions);
router.get('/session/:id', mockInterviewController.getSession);

module.exports = router;

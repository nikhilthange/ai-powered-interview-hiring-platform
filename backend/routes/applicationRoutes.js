const express = require('express');
const applicationController = require('../controllers/applicationController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  validateBody,
  submitApplicationSchema,
  updateApplicationStatusSchema,
  mockInterviewSchema,
  mockInterviewFeedbackSchema
} = require('../validators/applicationValidator');

const router = express.Router();

router.use(protect);

router.get('/my-applications', applicationController.getMyApplications);
router.get('/check/:jobId', applicationController.checkDuplicateApplication);
router.delete('/:id', applicationController.withdrawApplication);
router.get('/analysis/:id', applicationController.getApplicationAnalysis);
router.post('/mock-interview', validateBody(mockInterviewSchema), applicationController.getMockInterview);
router.post('/mock-interview/feedback', validateBody(mockInterviewFeedbackSchema), applicationController.submitMockInterviewAnswers);

router.post('/:jobId', restrictTo('candidate'), upload.single('resume'), validateBody(submitApplicationSchema), applicationController.submitApplication);

router.get('/job/:jobId', restrictTo('recruiter', 'admin'), applicationController.getJobApplications);
router.patch('/:id/status', restrictTo('recruiter', 'admin'), validateBody(updateApplicationStatusSchema), applicationController.updateApplicationStatus);

module.exports = router;

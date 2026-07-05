const express = require('express');
const jobController = require('../controllers/jobController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  validateBody,
  createJobSchema,
  updateJobSchema
} = require('../validators/jobValidator');

const router = express.Router();

// Public routes
router.get('/', jobController.getJobs);

// Protected routes
router.use(protect);
router.get('/recommended', jobController.getRecommendedJobs);
router.get('/recruiter/my-jobs', jobController.getMyJobs);
router.get('/:id', jobController.getJob);
router.post('/', restrictTo('recruiter', 'admin'), validateBody(createJobSchema), jobController.createJob);
router.patch('/:id', restrictTo('recruiter', 'admin'), validateBody(updateJobSchema), jobController.updateJob);
router.delete('/:id', restrictTo('recruiter', 'admin'), jobController.deleteJob);

module.exports = router;

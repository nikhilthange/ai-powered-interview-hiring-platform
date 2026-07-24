const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const interviewSchedulerController = require('../controllers/interviewSchedulerController');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(interviewSchedulerController.scheduleInterview)
  .get(interviewSchedulerController.getMyScheduledInterviews);

module.exports = router;

const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin'));

router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);
router.patch('/users/:id/verify-recruiter', adminController.verifyRecruiter);
router.patch('/users/:id/reject-recruiter', adminController.rejectRecruiter);
router.get('/unverified-recruiters', adminController.getUnverifiedRecruiters);
router.get('/analytics', adminController.getDashboardAnalytics);

// AI Configuration
router.get('/ai-config', adminController.getAiConfig);
router.patch('/ai-config', adminController.updateAiConfig);
router.post('/ai-config/reset-metrics', adminController.resetAiMetrics);

module.exports = router;

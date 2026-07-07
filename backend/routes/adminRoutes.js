const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin'));

// Users
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUser);
router.patch('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.post('/users/:id/suspend', adminController.suspendUser);
router.post('/users/:id/activate', adminController.activateUser);
router.post('/users/:id/reset-password', adminController.resetUserPassword);
router.patch('/users/:id/change-role', adminController.changeUserRole);
router.patch('/users/:id/verify-recruiter', adminController.verifyRecruiter);
router.patch('/users/:id/reject-recruiter', adminController.rejectRecruiter);
router.post('/bulk/delete-users', adminController.bulkDeleteUsers);
router.post('/bulk/suspend-users', adminController.bulkSuspendUsers);

// Jobs
router.get('/jobs', adminController.getAllJobs);
router.patch('/jobs/:id/approve', adminController.approveJob);
router.patch('/jobs/:id/reject', adminController.rejectJob);
router.delete('/jobs/:id', adminController.deleteJob);
router.post('/jobs/:id/feature', adminController.featureJob);

// Applications
router.get('/applications', adminController.getAllApplications);
router.delete('/applications/:id', adminController.deleteApplication);

// Recruiters
router.get('/recruiters', adminController.getRecruiters);
router.get('/unverified-recruiters', adminController.getUnverifiedRecruiters);

// Notifications (broadcast)
router.post('/notifications/broadcast', adminController.broadcastNotification);
router.get('/notifications', adminController.getNotifications);

// System Settings
router.get('/settings', adminController.getSystemSettings);
router.patch('/settings', adminController.updateSystemSettings);

// AI Config
router.get('/ai-config', adminController.getAiConfig);
router.patch('/ai-config', adminController.updateAiConfig);
router.post('/ai-config/reset-metrics', adminController.resetAiMetrics);

// Analytics & Charts
router.get('/analytics', adminController.getDashboardAnalytics);
router.get('/charts', adminController.getChartData);

// Audit Logs
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;

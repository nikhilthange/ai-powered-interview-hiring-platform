import api from './axios'

export const adminApi = {
  // Dashboard
  getAnalytics: () => api.get('/admin/analytics').then((r) => r.data),
  getChartData: (days = 30) => api.get('/admin/charts', { params: { days } }).then((r) => r.data),

  // Users
  getUsers: (params) => api.get('/admin/users', { params }).then((r) => r.data),
  getUser: (id) => api.get(`/admin/users/${id}`).then((r) => r.data),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data).then((r) => r.data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  suspendUser: (id) => api.post(`/admin/users/${id}/suspend`),
  activateUser: (id) => api.post(`/admin/users/${id}/activate`),
  resetUserPassword: (id) => api.post(`/admin/users/${id}/reset-password`),
  changeUserRole: (id, role) => api.patch(`/admin/users/${id}/change-role`, { role }).then((r) => r.data),
  verifyRecruiter: (id) => api.patch(`/admin/users/${id}/verify-recruiter`),
  rejectRecruiter: (id) => api.patch(`/admin/users/${id}/reject-recruiter`),
  bulkDeleteUsers: (ids) => api.post('/admin/bulk/delete-users', { ids }),
  bulkSuspendUsers: (ids) => api.post('/admin/bulk/suspend-users', { ids }),

  // Jobs
  getJobs: (params) => api.get('/admin/jobs', { params }).then((r) => r.data),
  approveJob: (id) => api.patch(`/admin/jobs/${id}/approve`),
  rejectJob: (id) => api.patch(`/admin/jobs/${id}/reject`),
  deleteJob: (id) => api.delete(`/admin/jobs/${id}`),
  featureJob: (id) => api.post(`/admin/jobs/${id}/feature`).then((r) => r.data),

  // Applications
  getApplications: (params) => api.get('/admin/applications', { params }).then((r) => r.data),
  deleteApplication: (id) => api.delete(`/admin/applications/${id}`),

  // Recruiters
  getRecruiters: (params) => api.get('/admin/recruiters', { params }).then((r) => r.data),
  getUnverifiedRecruiters: () => api.get('/admin/unverified-recruiters').then((r) => r.data),

  // Notifications
  broadcastNotification: (data) => api.post('/admin/notifications/broadcast', data),
  getNotifications: (params) => api.get('/admin/notifications', { params }).then((r) => r.data),

  // Settings
  getSettings: () => api.get('/admin/settings').then((r) => r.data),
  updateSettings: (data) => api.patch('/admin/settings', data).then((r) => r.data),

  // AI Config
  getAiConfig: () => api.get('/admin/ai-config').then((r) => r.data),
  updateAiConfig: (provider) => api.patch('/admin/ai-config', { provider }).then((r) => r.data),
  resetAiMetrics: () => api.post('/admin/ai-config/reset-metrics').then((r) => r.data),

  // Audit Logs
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }).then((r) => r.data),
}

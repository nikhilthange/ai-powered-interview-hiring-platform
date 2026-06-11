import api from './axios'

export const adminApi = {
  getAnalytics: () => api.get('/admin/analytics').then((r) => r.data),
  getUsers: (params) => api.get('/admin/users', { params }).then((r) => r.data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  verifyRecruiter: (id) => api.patch(`/admin/users/${id}/verify-recruiter`),
  rejectRecruiter: (id) => api.patch(`/admin/users/${id}/reject-recruiter`),
  getUnverifiedRecruiters: () => api.get('/admin/unverified-recruiters').then((r) => r.data),
}

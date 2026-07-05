import api from './axios'

export const jobApi = {
  getJobs: (params) => api.get('/jobs', { params }),

  getJob: (id) => api.get(`/jobs/${id}`),

  getRecommendedJobs: () => api.get('/jobs/recommended'),

  getMyJobs: () => api.get('/jobs/recruiter/my-jobs'),

  createJob: (data) => api.post('/jobs', data),

  updateJob: (id, data) => api.patch(`/jobs/${id}`, data),

  deleteJob: (id) => api.delete(`/jobs/${id}`),

  getJobsPaginated: ({ page = 1, limit = 10, search, ...filters } = {}) =>
    api.get('/jobs', { params: { page, limit, search, ...filters } }),
}

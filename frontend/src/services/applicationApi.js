import api from './axios'

export const applicationApi = {
  submitApplication: (jobId, formData) =>
    api.post(`/applications/${jobId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getMyApplications: () => api.get('/applications/my-applications'),

  getJobApplications: (jobId) => api.get(`/applications/job/${jobId}`),

  updateApplicationStatus: (id, status) =>
    api.patch(`/applications/${id}/status`, { status }),

  getApplicationAnalysis: (id) => api.get(`/applications/analysis/${id}`),

  checkDuplicate: (jobId) => api.get(`/applications/check/${jobId}`),

  withdrawApplication: (id) => api.delete(`/applications/${id}`),
}

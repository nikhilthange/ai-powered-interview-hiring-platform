import api from './axios'

export const savedJobApi = {
  getSavedJobs: () => api.get('/saved-jobs'),

  saveJob: (jobId) => api.post(`/saved-jobs/${jobId}`),

  unsaveJob: (jobId) => api.delete(`/saved-jobs/${jobId}`),

  isJobSaved: (jobId) => api.get(`/saved-jobs/${jobId}/check`),
}

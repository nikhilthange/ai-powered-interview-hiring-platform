import api from './axios'

export const profileApi = {
  getMyProfile: () => api.get('/profiles'),

  getProfileByUserId: (userId) => api.get(`/profiles/${userId}`),

  updateProfile: (data) => api.put('/profiles', data),

  uploadAvatar: (file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return api.post('/profiles/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  uploadResume: (file) => {
    const formData = new FormData()
    formData.append('resume', file)
    return api.post('/profiles/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  generateRoadmap: (targetRole) => api.post('/profiles/roadmap', { targetRole }),
}

import api from './axios'

export const aiTailorApi = {
  tailorResume: (data) => api.post('/resume-tailor', data),
  getMyTailoredResumes: () => api.get('/resume-tailor'),
}

import api from './axios'

export const interviewApi = {
  generateQuestions: (data) => api.post('/interviews/generate-questions', data),
  analyzeFeedback: (data) => api.post('/interviews/analyze-feedback', data),
  careerRoadmap: (data) => api.post('/interviews/career-roadmap', data),
  careerRoadmapUpload: (formData, onProgress) =>
    api.post('/interviews/career-roadmap-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    }).then((r) => r.data),
  getMyRoadmap: () => api.get('/interviews/career-roadmap/my').then(r => r.data),

  // Real interview scheduling
  scheduleInterview: (data) => api.post('/interviews', data).then((r) => r.data),
  getMyInterviews: () => api.get('/interviews').then((r) => r.data),
  updateInterview: (id, data) => api.patch(`/interviews/${id}`, data).then((r) => r.data),

  // Mock interview sessions
  createSession: (formData, onProgress) =>
    api.post('/interviews/session/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    }).then((r) => r.data),

  generateSessionQuestions: (sessionId) =>
    api.post('/interviews/session/generate-questions', { sessionId }).then((r) => r.data),

  submitAnswer: (data) =>
    api.post('/interviews/session/submit-answer', data).then((r) => r.data),

  completeSession: (sessionId) =>
    api.post('/interviews/session/complete', { sessionId }).then((r) => r.data),

  getSession: (id) =>
    api.get(`/interviews/session/${id}`).then((r) => r.data),

  getMySessions: () =>
    api.get('/interviews/session/list/mine').then((r) => r.data),
}

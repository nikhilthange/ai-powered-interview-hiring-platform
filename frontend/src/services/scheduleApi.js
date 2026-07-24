import api from './axios'

export const scheduleApi = {
  scheduleInterview: (data) => api.post('/interview-scheduler', data),
  getMyScheduledInterviews: () => api.get('/interview-scheduler'),
}

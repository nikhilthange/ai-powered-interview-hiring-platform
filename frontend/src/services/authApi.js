import api from './axios'

export const authApi = {
  register: (data) => api.post('/auth/register', data),

  login: (data) => api.post('/auth/login', data),

  logout: () => api.post('/auth/logout'),

  refreshToken: () => api.post('/auth/refresh'),

  verifyEmail: (token) => api.get('/auth/verify-email', { params: { token } }),

  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),

  resetPassword: (token, password) =>
    api.post('/auth/reset-password', { password }, { params: { token } }),

  getMe: () => api.get('/auth/me'),
}

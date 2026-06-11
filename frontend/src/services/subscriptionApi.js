import api from './axios'

export const subscriptionApi = {
  getMySubscription: () => api.get('/payments/subscription'),
  createOrder: (planId) => api.post('/payments/create-order', { planId }),
  verifyPayment: (data) => api.post('/payments/verify', data),
  cancelSubscription: () => api.patch('/payments/cancel'),
}

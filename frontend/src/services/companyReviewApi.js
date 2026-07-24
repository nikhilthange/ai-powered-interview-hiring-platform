import api from './axios'

export const companyReviewApi = {
  createReview: (data) => api.post('/company-reviews', data),
  getCompanyReviews: (companyId) => api.get(`/company-reviews/${companyId}`),
}

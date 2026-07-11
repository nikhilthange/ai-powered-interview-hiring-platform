import api from './axios'

export const userApi = {
  searchUsers: (query) => api.get(`/users/search`, { params: { q: query } }),
}

import api from './axios';

export const searchApi = {
  globalSearch: (query) => api.get(`/search?q=${encodeURIComponent(query)}`),
};

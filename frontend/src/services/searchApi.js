import api from './api';

export const searchApi = {
  globalSearch: (query) => api.get(`/search?q=${encodeURIComponent(query)}`),
};

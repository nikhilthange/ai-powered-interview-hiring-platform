import api from './axios';

const API_URL = '/resume-builder';

export const resumeBuilderApi = {
  createResume: async (data) => {
    const res = await api.post(API_URL, data);
    return res.data;
  },
  
  getResumes: async () => {
    const res = await api.get(API_URL);
    return res.data;
  },
  
  getResume: async (id) => {
    const res = await api.get(`${API_URL}/${id}`);
    return res.data;
  },
  
  updateResume: async (id, data) => {
    const res = await api.put(`${API_URL}/${id}`, data);
    return res.data;
  },
  
  deleteResume: async (id) => {
    const res = await api.delete(`${API_URL}/${id}`);
    return res.data;
  },
  
  importResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`${API_URL}/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  
  aiAssist: async (text, action) => {
    const res = await api.post(`${API_URL}/ai-assist`, { text, action });
    return res.data;
  }
};

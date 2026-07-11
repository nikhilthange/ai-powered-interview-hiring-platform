import axios from 'axios';

const API_URL = '/api/v1/resume-builder';

export const resumeBuilderApi = {
  createResume: async (data) => {
    const res = await axios.post(API_URL, data, { withCredentials: true });
    return res.data;
  },
  
  getResumes: async () => {
    const res = await axios.get(API_URL, { withCredentials: true });
    return res.data;
  },
  
  getResume: async (id) => {
    const res = await axios.get(`${API_URL}/${id}`, { withCredentials: true });
    return res.data;
  },
  
  updateResume: async (id, data) => {
    const res = await axios.put(`${API_URL}/${id}`, data, { withCredentials: true });
    return res.data;
  },
  
  deleteResume: async (id) => {
    const res = await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
    return res.data;
  },
  
  importResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(`${API_URL}/import`, formData, {
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  
  aiAssist: async (text, action) => {
    const res = await axios.post(`${API_URL}/ai-assist`, { text, action }, { withCredentials: true });
    return res.data;
  }
};

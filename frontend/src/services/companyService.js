import api from './axios';

const companyService = {
  // Candidate & Public
  getAllCompanies: async (params) => {
    const response = await api.get('/companies', { params });
    return response.data;
  },
  
  getCompanyById: async (id) => {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  },

  getRecommendedCompanies: async (params) => {
    const response = await api.get('/companies/recommended/top', { params });
    return response.data;
  },

  followCompany: async (id) => {
    const response = await api.post(`/companies/${id}/follow`);
    return response.data;
  },

  unfollowCompany: async (id) => {
    const response = await api.post(`/companies/${id}/unfollow`);
    return response.data;
  },

  // Recruiter
  getMyCompany: async () => {
    const response = await api.get('/companies/my/company');
    return response.data;
  },

  createOrUpdateCompany: async (formData) => {
    const response = await api.post('/companies', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

export default companyService;

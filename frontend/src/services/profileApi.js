import api from './axios'

export const profileApi = {
  getMyProfile: () => api.get('/profiles'),

  getProfileByUserId: (userId) => api.get(`/profiles/${userId}`),

  updateProfile: (data, avatarFile) => {
    console.log('=== updateProfile ===');
    console.log('avatarFile:', avatarFile ? { name: avatarFile.name, size: avatarFile.size, type: avatarFile.type } : 'none');
    console.log('data:', JSON.stringify(data, null, 2));
    if (avatarFile) {
      const formData = new FormData()
      formData.append('fullName', data.fullName ?? '')
      formData.append('headline', data.headline ?? '')
      formData.append('bio', data.bio ?? '')
      formData.append('phone', data.phone ?? '')
      formData.append('location', data.location ?? '')
      formData.append('website', data.website ?? '')
      formData.append('linkedin', data.linkedin ?? '')
      formData.append('github', data.github ?? '')
      formData.append('portfolio', data.portfolio ?? '')
      formData.append('title', data.title ?? '')
      formData.append('experienceYears', String(data.experienceYears ?? 0))
      if (Array.isArray(data.skills)) {
        data.skills.forEach((s) => formData.append('skills', s))
      }
      if (data.education !== undefined) {
        formData.append('education', JSON.stringify(data.education))
      }
      if (data.projects !== undefined) {
        formData.append('projects', JSON.stringify(data.projects))
      }
      if (data.company !== undefined) {
        formData.append('company', JSON.stringify(data.company))
      }
      formData.append('avatar', avatarFile)
      console.log('Sending multipart FormData');
      return api.put('/profiles', formData, {
        headers: { 'Content-Type': null },
      })
    }
    console.log('Sending JSON');
    return api.put('/profiles', data)
  },

  uploadAvatar: (file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return api.post('/profiles/avatar', formData, {
      headers: { 'Content-Type': null },
    })
  },

  uploadResume: (file) => {
    const formData = new FormData()
    formData.append('resume', file)
    return api.post('/profiles/resume', formData, {
      headers: { 'Content-Type': null },
    })
  },

  generateRoadmap: (targetRole) => api.post('/profiles/roadmap', { targetRole }),
}

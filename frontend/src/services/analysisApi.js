import api from './axios'

export const analysisApi = {
  analyzeResume: (data) => api.post('/analysis/analyze-resume', data),

  analyzeResumeUpload: (formData, onProgress) =>
    api.post('/analysis/analyze-resume-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    }),

  skillGap: (data) => api.post('/analysis/skill-gap', data),

  skillGapUpload: (formData, onProgress) =>
    api.post('/analysis/skill-gap-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    }),
}

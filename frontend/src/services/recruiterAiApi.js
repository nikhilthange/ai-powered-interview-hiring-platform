import api from './axios'

export const recruiterAiApi = {
  generateJobDescription: (data) =>
    api.post('/recruiter-ai/generate-job-description', data).then((r) => r.data),

  generateInterviewQuestions: (jobId) =>
    api.get(`/recruiter-ai/jobs/${jobId}/interview-questions`).then((r) => r.data),

  summarizeResume: (applicationId) =>
    api.get(`/recruiter-ai/applications/${applicationId}/summarize-resume`).then((r) => r.data),

  compareCandidates: (jobId, candidateIds) =>
    api.post(`/recruiter-ai/jobs/${jobId}/compare-candidates`, { candidateIds }).then((r) => r.data),

  rankApplicants: (jobId) =>
    api.get(`/recruiter-ai/jobs/${jobId}/rank-applicants`).then((r) => r.data),

  suggestSalaryRange: (jobId) =>
    api.get(`/recruiter-ai/jobs/${jobId}/suggest-salary`).then((r) => r.data),

  generateEmailInvitation: (data) =>
    api.post('/recruiter-ai/generate-email-invitation', data).then((r) => r.data),

  generateRejectionEmail: (data) =>
    api.post('/recruiter-ai/generate-rejection-email', data).then((r) => r.data),

  generateTechnicalAssignment: (jobId) =>
    api.get(`/recruiter-ai/jobs/${jobId}/generate-assignment`).then((r) => r.data),
}

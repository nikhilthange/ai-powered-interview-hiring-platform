import api from './axios'

export const coverLetterApi = {
  generateCoverLetter: (data) => api.post('/cover-letters', data),
  getMyCoverLetters: () => api.get('/cover-letters'),
}

import api from './axios'

export const githubApi = {
  analyzeGithubUser: (username) => api.post('/github-analyzer/analyze', { username }),
}

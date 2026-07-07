import api from './axios'

export const aiChatApi = {
  getConversations: () => api.get('/ai-chat/conversations').then(r => r.data?.data?.conversations || []),

  createConversation: (data) => api.post('/ai-chat/conversations', data).then(r => r.data?.data?.conversation),

  getConversation: (id) => api.get(`/ai-chat/conversations/${id}`).then(r => r.data?.data?.conversation),

  updateConversation: (id, data) => api.patch(`/ai-chat/conversations/${id}`, data).then(r => r.data?.data?.conversation),

  deleteConversation: (id) => api.delete(`/ai-chat/conversations/${id}`),

  searchConversations: (q) => api.get('/ai-chat/conversations/search', { params: { q } }).then(r => r.data?.data?.conversations || []),

  getMessages: (id) => api.get(`/ai-chat/conversations/${id}/messages`).then(r => r.data?.data?.messages || []),

  sendMessageStream: (id, content, { onChunk, onDone, onError, signal } = {}) => {
    const token = localStorage.getItem('accessToken')
    const API_URL = import.meta.env.VITE_API_URL || '/api/v1'

    return fetch(`${API_URL}/ai-chat/conversations/${id}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content }),
      signal
    }).then(async (response) => {
      if (!response.ok) {
        const err = await response.text()
        throw new Error(err || 'Failed to send message')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith('data: ')) continue
          try {
            const data = JSON.parse(trimmed.slice(6))
            if (data.type === 'chunk' && onChunk) {
              onChunk(data.content)
            } else if (data.type === 'done' && onDone) {
              onDone(data.content, data.messageId)
            } else if (data.type === 'error' && onError) {
              onError(data.message || 'An error occurred')
            }
          } catch (e) {
            console.error('SSE parse error:', e)
          }
        }
      }
    })
  }
}

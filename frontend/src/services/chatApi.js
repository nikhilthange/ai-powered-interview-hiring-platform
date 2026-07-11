import api from './axios'

export const chatApi = {
  getOrCreateRoom: (recipientId) => api.post('/chats/rooms', { recipientId }),

  getMyRooms: () => api.get('/chats/rooms'),

  getRoomMessages: (roomId, page = 1, limit = 50) =>
    api.get(`/chats/rooms/${roomId}/messages`, { params: { page, limit } }),

  getUnreadCount: () => api.get('/chats/rooms/unread-count'),

  deleteMessage: (messageId) => api.delete(`/chats/messages/${messageId}`),

  uploadAttachment: (formData, onProgress) =>
    api.post('/chats/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    }).then((r) => r.data),
}

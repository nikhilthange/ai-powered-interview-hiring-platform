import api from './axios'

export const chatApi = {
  getOrCreateRoom: (recipientId) => api.post('/chats/rooms', { recipientId }),

  getMyRooms: () => api.get('/chats/rooms'),

  getRoomMessages: (roomId, page = 1, limit = 50) =>
    api.get(`/chats/rooms/${roomId}/messages`, { params: { page, limit } }),

  getUnreadCount: () => api.get('/chats/rooms/unread-count'),
}

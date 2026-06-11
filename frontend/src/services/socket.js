import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '')

let socket = null

export function getSocket() {
  return socket
}

async function refreshTokenAndReconnect() {
  try {
    const { default: api } = await import('./axios')
    const response = await api.post('/auth/refresh', {}, { withCredentials: true })
    const newToken = response.data.accessToken
    localStorage.setItem('accessToken', newToken)
    return newToken
  } catch {
    localStorage.removeItem('accessToken')
    window.location.href = '/login'
    return null
  }
}

export function connectSocket() {
  if (socket) return socket

  socket = io(SOCKET_URL, {
    auth: { token: localStorage.getItem('accessToken') },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  })

  socket.on('connect_error', async (err) => {
    if (err.message === 'TOKEN_EXPIRED') {
      const newToken = await refreshTokenAndReconnect()
      if (newToken) {
        socket.auth = { token: newToken }
        socket.connect()
      }
    }
  })

  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

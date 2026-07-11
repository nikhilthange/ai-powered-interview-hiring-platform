import { io } from 'socket.io-client'

// Ensure we never fallback to window.location.origin (which causes the Vercel wss:// error)
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.VITE_API_URL ? new URL(import.meta.env.VITE_API_URL).origin : '');

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
  if (socket?.connected) return socket

  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }

  socket = io(SOCKET_URL, {
    auth: { token: localStorage.getItem('accessToken') },
    transports: ['websocket', 'polling'],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 30000,
    randomizationFactor: 0.5,
    timeout: 20000,
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
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }
}

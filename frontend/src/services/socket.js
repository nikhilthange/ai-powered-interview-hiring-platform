import { getAccessToken } from './axios';

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
  if (import.meta.env.VITE_API_URL) {
    try {
      return new URL(import.meta.env.VITE_API_URL).origin;
    } catch {
      return 'http://localhost:5000';
    }
  }
  return 'http://localhost:5000';
};

const SOCKET_URL = getSocketUrl();

let socket = null
let ioModule = null

export function getSocket() {
  return socket
}

async function refreshTokenAndReconnect() {
  try {
    const { default: api, setAccessToken } = await import('./axios')
    const response = await api.post('/auth/refresh', {}, { withCredentials: true })
    const newToken = response.data?.accessToken || response.data?.data?.accessToken
    if (newToken) {
      setAccessToken(newToken)
      return newToken
    }
    return null
  } catch {
    const { setAccessToken } = await import('./axios')
    setAccessToken(null)
    window.location.href = '/login'
    return null
  }
}

export async function connectSocket() {
  if (socket?.connected) return socket

  if (!ioModule) {
    const { io } = await import('socket.io-client')
    ioModule = io
  }

  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }

  const token = getAccessToken() || localStorage.getItem('accessToken')

  socket = ioModule(SOCKET_URL, {
    auth: { token },
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

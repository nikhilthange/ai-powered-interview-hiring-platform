import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { connectSocket, disconnectSocket, getSocket } from '../services/socket'
import { useAuth } from '../hooks/useAuth'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [onlineUsers, setOnlineUsers] = useState([])
  const [typingUsers, setTypingUsers] = useState({})
  const listenersRef = useRef({})

  useEffect(() => {
    if (!isAuthenticated) return

    const socket = connectSocket()

    const onOnline = (users) => setOnlineUsers(users)
    const onTyping = ({ userId, isTyping }) => {
      setTypingUsers((prev) => {
        if (isTyping) return { ...prev, [userId]: true }
        const rest = { ...prev }
        delete rest[userId]
        return rest
      })
    }

    socket.on('online_users', onOnline)
    socket.on('typing_status', onTyping)

    return () => {
      socket.off('online_users', onOnline)
      socket.off('typing_status', onTyping)
      disconnectSocket()
    }
  }, [isAuthenticated])

  const joinRoom = useCallback((roomId) => {
    getSocket()?.emit('join_room', { roomId })
  }, [])

  const sendMessage = useCallback((roomId, messageText) => {
    getSocket()?.emit('send_message', { roomId, messageText })
  }, [])

  const emitTyping = useCallback((roomId, isTyping) => {
    getSocket()?.emit('typing', { roomId, isTyping })
  }, [])

  const markRead = useCallback((roomId) => {
    getSocket()?.emit('mark_read', { roomId })
  }, [])

  const onMessage = useCallback((handler) => {
    listenersRef.current.message = handler
    getSocket()?.on('receive_message', handler)
    return () => getSocket()?.off('receive_message', handler)
  }, [])

  const onMessagesRead = useCallback((handler) => {
    listenersRef.current.read = handler
    getSocket()?.on('messages_read', handler)
    return () => getSocket()?.off('messages_read', handler)
  }, [])

  return (
    <SocketContext.Provider value={{
      onlineUsers, typingUsers,
      isUserOnline: (userId) => onlineUsers.includes(userId),
      joinRoom, sendMessage, emitTyping, markRead, onMessage, onMessagesRead,
    }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocketContext() {
  const ctx = useContext(SocketContext)
  if (!ctx) throw new Error('useSocketContext must be used within SocketProvider')
  return ctx
}

import { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react'
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

    let mounted = true
    let currentSocket = null

    const initSocket = async () => {
      currentSocket = await connectSocket()
      if (!mounted || !currentSocket) return

      const onOnline = (users) => setOnlineUsers(users)
      const onTyping = ({ userId, isTyping }) => {
        setTypingUsers((prev) => {
          if (isTyping) return { ...prev, [userId]: true }
          const rest = { ...prev }
          delete rest[userId]
          return rest
        })
      }

      currentSocket.on('online_users', onOnline)
      currentSocket.on('typing_status', onTyping)
    }

    initSocket()

    return () => {
      mounted = false
      if (currentSocket) {
        currentSocket.off('online_users')
        currentSocket.off('typing_status')
      }
      disconnectSocket()
    }
  }, [isAuthenticated])

  const joinRoom = useCallback((roomId) => {
    getSocket()?.emit('join_room', { roomId })
  }, [])

  const sendMessage = useCallback((roomId, messageText, attachments = []) => {
    getSocket()?.emit('send_message', { roomId, messageText, attachments })
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

  const isUserOnline = useCallback((userId) => onlineUsers.includes(userId), [onlineUsers])

  const value = useMemo(() => ({
    onlineUsers,
    typingUsers,
    isUserOnline,
    joinRoom,
    sendMessage,
    emitTyping,
    markRead,
    onMessage,
    onMessagesRead,
  }), [onlineUsers, typingUsers, isUserOnline, joinRoom, sendMessage, emitTyping, markRead, onMessage, onMessagesRead])

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocketContext() {
  const ctx = useContext(SocketContext)
  if (!ctx) throw new Error('useSocketContext must be used within SocketProvider')
  return ctx
}

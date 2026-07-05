import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { chatApi } from '../../services/chatApi'
import { useSocket } from '../../hooks/useSocket'
import { useAuth } from '../../hooks/useAuth'
import ChatMessage from './ChatMessage'
import { Loader2, MessageCircle } from 'lucide-react'

export default function ChatMessages({ roomId }) {
  const bottomRef = useRef(null)
  const socket = useSocket()
  const { user } = useAuth()
  const [liveMessages, setLiveMessages] = useState([])

  const { data, isLoading } = useQuery({
    queryKey: ['chat-messages', roomId],
    queryFn: () => chatApi.getRoomMessages(roomId).then((r) => r.data?.data?.messages || r.data?.messages || []),
    enabled: !!roomId,
  })

  useEffect(() => {
    setLiveMessages([])
  }, [roomId])

  useEffect(() => {
    if (!roomId) return
    socket.joinRoom(roomId)
    const unsub = socket.onMessage((msg) => {
      if (msg.chatRoomId === roomId) {
        setLiveMessages((prev) => [...prev, msg])
      }
    })
    return () => unsub && unsub()
  }, [roomId, socket])

  const messages = [...(Array.isArray(data) ? data : []), ...liveMessages]

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-tertiary)] mb-3">
          <MessageCircle className="h-6 w-6 text-[var(--text-tertiary)]" />
        </div>
        <p className="text-sm text-[var(--text-secondary)]">No messages yet</p>
        <p className="text-xs text-[var(--text-tertiary)] mt-1">Start the conversation</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {messages.map((msg) => (
        <ChatMessage key={msg._id || msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}

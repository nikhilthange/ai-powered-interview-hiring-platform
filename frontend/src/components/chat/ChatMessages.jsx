import { useQuery } from '@tanstack/react-query'
import { chatApi } from '../../services/chatApi'
import ChatMessage from './ChatMessage'
import { Loader2 } from 'lucide-react'
import { useEffect, useRef } from 'react'

export default function ChatMessages({ roomId }) {
  const bottomRef = useRef(null)

  const { data, isLoading } = useQuery({
    queryKey: ['chat-messages', roomId],
    queryFn: () => chatApi.getMessages(roomId).then((r) => r.data?.data?.messages || r.data?.messages || []),
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [data])

  const messages = Array.isArray(data) ? data : []

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

import { MessageCircle } from 'lucide-react'

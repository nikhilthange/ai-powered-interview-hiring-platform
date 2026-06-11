import { useEffect, useRef } from 'react'
import ChatMessage from './ChatMessage'
import { Loader2 } from 'lucide-react'

export default function ChatMessages({ messages, loading, typingUsers, onScrollTop }) {
  const bottomRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
    >
      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      )}
      {messages?.map((msg) => (
        <ChatMessage key={msg._id} message={msg} />
      ))}
      {Object.keys(typingUsers).length > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-500 italic">
          <span className="flex gap-0.5">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:0.1s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:0.2s]" />
          </span>
          Typing...
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}

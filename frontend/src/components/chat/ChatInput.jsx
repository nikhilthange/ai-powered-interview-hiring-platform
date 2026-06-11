import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'

export default function ChatInput({ onSend, onTyping, roomId }) {
  const [text, setText] = useState('')
  const typingTimeoutRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [roomId])

  const handleChange = (e) => {
    setText(e.target.value)
    onTyping(true)
    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => onTyping(false), 1000)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    onSend(text.trim())
    setText('')
    onTyping(false)
    clearTimeout(typingTimeoutRef.current)
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={handleChange}
          placeholder="Type a message..."
          className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </form>
  )
}

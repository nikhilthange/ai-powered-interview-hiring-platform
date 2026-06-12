import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'

export default function ChatInput({ onSend, onTyping, roomId }) {
  const [text, setText] = useState('')
  const typingTimeoutRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [roomId])

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
    <form onSubmit={handleSubmit} className="border-t border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3">
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={handleChange}
          placeholder="Type a message..."
          className="flex-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)] transition-all"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-500)] text-white transition-all hover:bg-[var(--color-primary-600)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </form>
  )
}

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { chatApi } from '../../services/chatApi'
import { Send, Paperclip } from 'lucide-react'

export default function ChatInput({ roomId }) {
  const [text, setText] = useState('')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => chatApi.sendMessage(roomId, { content: text.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', roomId] })
      queryClient.invalidateQueries({ queryKey: ['chat-rooms'] })
      setText('')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    mutation.mutate()
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <button type="button" className="rounded-xl p-2 text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] transition-colors">
        <Paperclip className="h-5 w-5" />
      </button>
      <div className="flex-1 relative">
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
      </div>
      <button
        type="submit"
        disabled={!text.trim() || mutation.isPending}
        className="rounded-xl bg-indigo-500 p-2.5 text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  )
}

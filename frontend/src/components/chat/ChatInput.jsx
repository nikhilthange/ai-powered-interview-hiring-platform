import { memo, useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react'
import { useSocket } from '../../hooks/useSocket'
import { chatApi } from '../../services/chatApi'
import { Send, Paperclip, Smile, Loader2, X } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const LazyEmojiPicker = lazy(() => import('./EmojiPicker'))

const ChatInput = memo(function ChatInput({ roomId }) {
  const [text, setText] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [attachment, setAttachment] = useState(null)
  
  const fileInputRef = useRef(null)
  const emojiRef = useRef(null)
  const socket = useSocket()
  const { isDarkMode } = useTheme()

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmoji(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleTyping = useCallback(() => {
    socket?.emit('typing', { roomId })
  }, [socket, roomId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim() && !attachment) return

    const messageData = {
      roomId,
      content: text.trim(),
      attachmentUrl: attachment?.url,
      attachmentName: attachment?.name,
    }

    try {
      socket?.emit('send-message', messageData)
      setText('')
      setAttachment(null)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const res = await chatApi.uploadAttachment(file)
      setAttachment({
        url: res.data.url,
        name: file.name,
      })
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="relative">
      {attachment && (
        <div className="mb-2 flex items-center gap-2 bg-[var(--bg-tertiary)] p-2 rounded-lg max-w-sm">
          <span className="text-sm truncate flex-1">{attachment.name}</span>
          <button onClick={() => setAttachment(null)} className="text-[var(--text-tertiary)] hover:text-red-500">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      
      {showEmoji && (
        <div ref={emojiRef} className="absolute bottom-full right-0 mb-2 z-50">
          <Suspense fallback={<div className="p-4 bg-[var(--bg-secondary)] rounded-xl border text-sm">Loading picker...</div>}>
            <LazyEmojiPicker onSelect={(emoji) => setText(t => t + emoji)} isDarkMode={isDarkMode} />
          </Suspense>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange} 
          accept="image/*,.pdf,.doc,.docx" 
        />
        <button 
          type="button" 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="rounded-xl p-2 text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] transition-colors"
        >
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
        </button>
        
        <div className="flex-1 relative flex items-center bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl pr-2 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">
          <input
            type="text"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              socket.emitTyping(roomId, e.target.value.length > 0)
            }}
            className="w-full bg-transparent px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none"
          />
          <button 
            type="button" 
            onClick={() => setShowEmoji(!showEmoji)}
            className="p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] rounded-lg"
          >
            <Smile className="h-5 w-5" />
          </button>
        </div>

        <button
          type="submit"
          disabled={(!text.trim() && !attachment) || uploading}
          className="rounded-xl bg-indigo-500 p-2.5 text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
})

export default ChatInput

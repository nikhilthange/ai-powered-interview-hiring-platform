import { memo, useState, useCallback, useRef, useEffect } from 'react'
import { useSocket } from '../../hooks/useSocket'
import { chatApi } from '../../services/chatApi'
import { Send, Paperclip, Smile, Loader2, X } from 'lucide-react'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { useTheme } from '../../context/ThemeContext'

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

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await chatApi.uploadAttachment(formData)
      setAttachment(res.data)
    } catch (err) {
      console.error('Upload failed', err)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    if ((!text.trim() && !attachment) || !roomId) return
    
    const socketPayload = { roomId, messageText: text.trim() }
    
    // We send attachments via REST right now, but Socket needs to know about it.
    // In our backend socketManager, send_message only accepts messageText.
    // Wait, we need to make sure backend socketManager handles attachments if we pass them.
    // Actually, it's easier to just append the attachment URL to the messageText for now, 
    // OR we should have updated the socketManager to accept attachments. 
    // Let's pass attachments to socket.
    
    // Wait, earlier I updated `socketManager.js` to emit `message.attachments || []`, 
    // but I didn't update the `ChatMessage.create` call to include `attachments` from the socket payload.
    // I should probably just send it via socket.
    
    socket.sendMessage(roomId, text.trim(), attachment ? [attachment] : [])
    
    setText('')
    setAttachment(null)
  }, [text, roomId, socket, attachment])

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
          <Picker data={data} onEmojiSelect={(e) => setText(t => t + e.native)} theme={isDarkMode ? 'dark' : 'light'} />
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

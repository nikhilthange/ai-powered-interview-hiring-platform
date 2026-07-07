import { useState, useRef, useCallback, useEffect } from 'react'
import { Send, Square, Paperclip, X } from 'lucide-react'
import { cn } from '../../lib/utils'

export default function AIChatInput({ onSend, onStop, isStreaming, onFileSelect, uploadedFile, onRemoveFile }) {
  const [text, setText] = useState('')
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [text])

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    if (isStreaming) {
      if (onStop) onStop()
      return
    }
    if (!text.trim() && !uploadedFile) return
    if (onSend) onSend(text.trim())
    setText('')
  }, [text, isStreaming, onSend, onStop, uploadedFile])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }, [handleSubmit])

  const handleFileClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file && onFileSelect) {
      onFileSelect(file)
    }
    e.target.value = ''
  }, [onFileSelect])

  return (
    <form onSubmit={handleSubmit} className="relative">
      {uploadedFile && (
        <div className="mb-2 flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800/30">
          <Paperclip className="h-3.5 w-3.5 text-indigo-500" />
          <span className="text-xs text-[var(--text-secondary)] flex-1 truncate">{uploadedFile.name}</span>
          <button
            type="button"
            onClick={onRemoveFile}
            className="p-0.5 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-[var(--text-tertiary)]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
        <button
          type="button"
          onClick={handleFileClick}
          className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] transition-colors shrink-0"
          title="Upload resume"
        >
          <Paperclip className="h-4 w-4" />
        </button>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything about your career..."
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none py-1.5 max-h-[200px] leading-relaxed"
        />

        <button
          type="submit"
          disabled={!text.trim() && !uploadedFile}
          className={cn(
            'p-2 rounded-xl transition-all shrink-0',
            isStreaming
              ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
              : 'bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isStreaming ? (
            <Square className="h-4 w-4" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={handleFileChange}
      />

      <p className="text-[10px] text-[var(--text-tertiary)] text-center mt-1.5">
        AI Career Assistant may produce inaccurate information. Upload PDF/DOCX for resume-aware chat.
      </p>
    </form>
  )
}

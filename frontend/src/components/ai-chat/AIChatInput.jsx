import { useState, useRef, useCallback, useEffect } from 'react'
import { Send, Square, Paperclip, X, Sparkles } from 'lucide-react'
import { cn } from '../../lib/utils'

export default function AIChatInput({
  onSend,
  onStop,
  isStreaming,
  onFileSelect,
  uploadedFile,
  onRemoveFile
}) {
  const [text, setText] = useState('')
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`
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
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
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
    <form onSubmit={handleSubmit} className="relative w-full">
      {uploadedFile && (
        <div className="mb-2 flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800/40 animate-fadeIn">
          <Paperclip className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="text-xs text-[var(--text-primary)] font-medium flex-1 truncate">{uploadedFile.name}</span>
          <button
            type="button"
            onClick={onRemoveFile}
            className="p-1 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-[var(--text-tertiary)] hover:text-red-500 transition-colors"
            title="Remove attachment"
            aria-label="Remove attachment"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl p-2 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 shadow-sm transition-all">
        <button
          type="button"
          onClick={handleFileClick}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--text-tertiary)] hover:text-indigo-600 hover:bg-[var(--bg-tertiary)] transition-colors shrink-0"
          title="Upload resume context (PDF/DOCX)"
          aria-label="Upload resume context"
        >
          <Paperclip className="h-4 w-4" />
        </button>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask AI Career Assistant..."
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none py-1.5 max-h-[160px] leading-relaxed"
          aria-label="Type your message"
        />

        <button
          type="submit"
          disabled={!text.trim() && !uploadedFile && !isStreaming}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-xl transition-all shrink-0 font-medium text-white shadow-sm',
            isStreaming
              ? 'bg-rose-500 hover:bg-rose-600 animate-pulse'
              : text.trim() || uploadedFile
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/20'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
          )}
          title={isStreaming ? "Stop generating" : "Send message"}
          aria-label={isStreaming ? "Stop generating" : "Send message"}
        >
          {isStreaming ? (
            <Square className="h-4 w-4 fill-current" />
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

      <div className="flex items-center justify-center gap-1 mt-2 text-[10px] text-[var(--text-tertiary)]">
        <Sparkles className="h-3 w-3 text-indigo-500" />
        <span>Powered by HireMate AI • Shift+Enter for new line</span>
      </div>
    </form>
  )
}

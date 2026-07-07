import { useState, memo, useCallback } from 'react'
import { cn } from '../../lib/utils'
import {
  MessageSquarePlus, MessageCircle, Search, Trash2, Pencil, Check, X,
  ChevronLeft, Loader2
} from 'lucide-react'

function ConversationItem({ conversation, isActive, onSelect, onRename, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(conversation.title)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleRename = useCallback(() => {
    if (editTitle.trim() && editTitle !== conversation.title) {
      onRename(conversation._id, editTitle.trim())
    }
    setIsEditing(false)
  }, [conversation._id, conversation.title, editTitle, onRename])

  return (
    <div
      className={cn(
        'group relative flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors text-sm',
        isActive
          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
      )}
      onClick={() => !isEditing && onSelect(conversation)}
    >
      <MessageCircle className="h-4 w-4 shrink-0" />
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
            <input
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              className="flex-1 text-xs bg-white dark:bg-gray-800 border border-[var(--border-color)] rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setIsEditing(false) }}
            />
            <button onClick={handleRename} className="p-0.5 hover:text-green-600"><Check className="h-3.5 w-3.5" /></button>
            <button onClick={() => setIsEditing(false)} className="p-0.5 hover:text-red-600"><X className="h-3.5 w-3.5" /></button>
          </div>
        ) : (
          <p className="truncate text-sm">{conversation.title}</p>
        )}
      </div>
      {!isEditing && (
        <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
          <button
            onClick={e => { e.stopPropagation(); setIsEditing(true); setEditTitle(conversation.title) }}
            className="p-1 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); setShowConfirm(true) }}
            className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-[var(--text-tertiary)] hover:text-red-500"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      {showConfirm && (
        <div className="absolute inset-0 flex items-center gap-1.5 bg-[var(--bg-primary)]/95 backdrop-blur-sm rounded-xl px-3 z-10" onClick={e => e.stopPropagation()}>
          <span className="text-xs text-[var(--text-secondary)] flex-1">Delete?</span>
          <button onClick={() => { onDelete(conversation._id); setShowConfirm(false) }} className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-red-500"><Check className="h-3.5 w-3.5" /></button>
          <button onClick={() => setShowConfirm(false)} className="p-1 rounded-lg hover:bg-[var(--bg-tertiary)]"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}
    </div>
  )
}

const MemoizedConversationItem = memo(ConversationItem)

export default function AIChatSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onRename,
  onDelete,
  onSearch,
  isOpen,
  onToggle,
  isLoading
}) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = useCallback((e) => {
    const val = e.target.value
    setSearchQuery(val)
    if (onSearch) onSearch(val)
  }, [onSearch])

  return (
    <div className={cn(
      'h-full flex flex-col bg-[var(--bg-secondary)] border-r border-[var(--border-color)] transition-all duration-300',
      isOpen ? 'w-72' : 'w-0 overflow-hidden'
    )}>
      <div className="flex items-center justify-between p-3 border-b border-[var(--border-color)]">
        <h2 className="font-semibold text-sm text-[var(--text-primary)]">AI Career Assistant</h2>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      <div className="p-3">
        <button
          onClick={onNew}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-colors text-sm font-medium"
        >
          <MessageSquarePlus className="h-4 w-4" />
          New Chat
        </button>
      </div>

      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--text-tertiary)]" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8 px-4">
            <MessageCircle className="h-8 w-8 mx-auto text-[var(--text-tertiary)] mb-2" />
            <p className="text-xs text-[var(--text-tertiary)]">No conversations yet</p>
            <p className="text-[10px] text-[var(--text-tertiary)] mt-1">Start a new chat</p>
          </div>
        ) : (
          conversations.map(conv => (
            <MemoizedConversationItem
              key={conv._id}
              conversation={conv}
              isActive={activeId === conv._id}
              onSelect={onSelect}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  )
}

import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { aiChatApi } from '../../services/aiChatApi'
import { useAuth } from '../../hooks/useAuth'
import AIChatSidebar from './AIChatSidebar'
import AIChatMessage from './AIChatMessage'
import AIChatInput from './AIChatInput'
import SuggestedPrompts from './SuggestedPrompts'
import { useToast } from '../ui/Toast'
import { Bot, AlertCircle, X, History, Maximize2, Minimize2, ChevronLeft } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 ml-1">
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
    </span>
  )
}

function ChatSkeleton() {
  return (
    <div className="space-y-4 px-4 py-4">
      <div className="flex gap-2 flex-row-reverse">
        <div className="h-6 w-6 rounded-lg bg-indigo-200 dark:bg-indigo-800 skeleton-shimmer" />
        <div className="flex-1 max-w-[85%]">
          <div className="h-12 rounded-2xl bg-[var(--bg-tertiary)] skeleton-shimmer" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-6 rounded-lg bg-indigo-100 dark:bg-indigo-900 skeleton-shimmer" />
        <div className="flex-1 max-w-[85%]">
          <div className="h-20 rounded-2xl bg-[var(--bg-tertiary)] skeleton-shimmer" />
        </div>
      </div>
    </div>
  )
}

export default function FloatingAIChatWidget() {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Widget specific state
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false) // For mobile full screen or desktop expand
  const [showHistory, setShowHistory] = useState(false)
  const [hasUnread] = useState(false) // Optional badging

  const messagesEndRef = useRef(null)
  const abortControllerRef = useRef(null)
  const chatContainerRef = useRef(null)

  const [activeId, setActiveId] = useState(searchParams.get('ai_conversation') || null)
  const [messages, setMessages] = useState([])
  const [streamingContent, setStreamingContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamError, setStreamError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [hasLoadedMessages, setHasLoadedMessages] = useState(false)

  const jobContext = searchParams.get('jobContext')
  const jobTitle = searchParams.get('jobTitle')
  const jobDescription = searchParams.get('jobDescription')

  // Listen for search param changes in case we want to trigger chat from anywhere
  useEffect(() => {
    const convId = searchParams.get('ai_conversation')
    if (convId && convId !== activeId) {
      setActiveId(convId)
      setIsOpen(true)
    }
  }, [searchParams, activeId])

  const { data: conversations = [], isLoading: convsLoading } = useQuery({
    queryKey: ['ai-conversations', searchQuery],
    queryFn: () => searchQuery
      ? aiChatApi.searchConversations(searchQuery)
      : aiChatApi.getConversations(),
    enabled: isOpen || hasUnread // Only fetch if open
  })

  const { data: existingMessages = [], isLoading: msgsLoadingInitial } = useQuery({
    queryKey: ['ai-messages', activeId],
    queryFn: () => aiChatApi.getMessages(activeId),
    enabled: !!activeId && isOpen,
  })

  useEffect(() => {
    if (existingMessages.length > 0) {
      setMessages(existingMessages)
      setHasLoadedMessages(true)
    } else if (activeId && !msgsLoadingInitial) {
      setMessages([])
      setHasLoadedMessages(true)
    }
  }, [existingMessages, activeId, msgsLoadingInitial])

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages, streamingContent, isOpen, showHistory])

  const createMutation = useMutation({
    mutationFn: (data) => aiChatApi.createConversation(data),
    onSuccess: (conv) => {
      setActiveId(conv._id)
      setMessages([])
      setHasLoadedMessages(true)
      setSearchQuery('')
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] })
      setShowHistory(false)
    },
    onError: () => toast.error('Failed to create conversation'),
  })

  const handleNewChat = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setIsStreaming(false)
    setStreamingContent('')
    setStreamError(null)
    setMessages([])
    setHasLoadedMessages(false)
    setActiveId(null)
    setShowHistory(false)
    setSearchParams(prev => { prev.delete('ai_conversation'); return prev }, { replace: true })
  }, [setSearchParams])

  useEffect(() => {
    if (jobContext && conversations.length > 0 && !activeId && isOpen) {
      const context = { type: 'job', jobTitle, jobDescription }
      createMutation.mutate({ context })
    }
  }, [jobContext, isOpen, activeId, conversations.length, createMutation, jobTitle, jobDescription])

  const handleSend = useCallback(async (content) => {
    if (!isOpen) setIsOpen(true)
    
    let convId = activeId
    if (!convId) {
      const context = {}
      if (uploadedFile) {
        context.type = 'resume'
      } else if (jobContext) {
        context.type = 'job'
        context.jobTitle = jobTitle
        context.jobDescription = jobDescription
      }

      const conv = await aiChatApi.createConversation({ context })
      convId = conv._id
      setActiveId(convId)
      setHasLoadedMessages(true)
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] })
      setSearchParams(prev => { prev.set('ai_conversation', convId); return prev }, { replace: true })
    }

    const userMsg = { _id: `temp-${Date.now()}`, role: 'user', content, createdAt: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setStreamError(null)

    setIsStreaming(true)
    setStreamingContent('')

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      await aiChatApi.sendMessageStream(convId, content, {
        onChunk: (chunk) => {
          setStreamingContent(prev => prev + chunk)
        },
        onDone: (fullContent, messageId) => {
          setIsStreaming(false)
          setStreamingContent('')
          setMessages(prev => [...prev, { _id: messageId, role: 'assistant', content: fullContent, createdAt: new Date().toISOString() }])
          queryClient.invalidateQueries({ queryKey: ['ai-conversations'] })
          queryClient.invalidateQueries({ queryKey: ['ai-messages', convId] })
        },
        onError: (error) => {
          setIsStreaming(false)
          setStreamingContent('')
          setStreamError(error)
        },
        signal: controller.signal
      })
    } catch (err) {
      if (err.name === 'AbortError') return
      setIsStreaming(false)
      setStreamingContent('')
      setStreamError(err.message || 'Failed to get response')
    }
  }, [activeId, uploadedFile, jobContext, jobTitle, jobDescription, queryClient, isOpen, setSearchParams])

  const handleRegenerate = useCallback(() => {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
    if (lastUserMsg && activeId) {
      setMessages(prev => prev.slice(0, -1))
      handleSend(lastUserMsg.content)
    }
  }, [messages, activeId, handleSend])

  const handleSelectConversation = useCallback((conv) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setIsStreaming(false)
    setStreamingContent('')
    setStreamError(null)
    setActiveId(conv._id)
    setHasLoadedMessages(false)
    setUploadedFile(null)
    setShowHistory(false)
    setSearchParams(prev => { prev.set('ai_conversation', conv._id); return prev }, { replace: true })
  }, [setSearchParams])

  const handleRename = useCallback((id, title) => {
    aiChatApi.updateConversation(id, { title })
      .then(() => queryClient.invalidateQueries({ queryKey: ['ai-conversations'] }))
      .catch(() => toast.error('Failed to rename'))
  }, [queryClient, toast])

  const handleDelete = useCallback((id) => {
    aiChatApi.deleteConversation(id)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['ai-conversations'] })
        if (activeId === id) {
          setActiveId(null)
          setMessages([])
          setHasLoadedMessages(false)
          setSearchParams(prev => { prev.delete('ai_conversation'); return prev }, { replace: true })
        }
      })
      .catch(() => toast.error('Failed to delete'))
  }, [activeId, queryClient, toast, setSearchParams])

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsStreaming(false)
    }
  }, [])

  const handlePromptSelect = useCallback((text) => {
    handleSend(text)
  }, [handleSend])

  const handleFileSelect = useCallback(async (file) => {
    setUploadedFile(file)
    toast.info('Resume uploaded! Start a new chat to use it as context.', { duration: 3000 })
  }, [toast])

  const handleRemoveFile = useCallback(() => {
    setUploadedFile(null)
  }, [])

  const handleSearch = useCallback((q) => {
    setSearchQuery(q)
  }, [])

  const showPrompts = !activeId && messages.length === 0 && !isStreaming
  const allMessages = [
    ...messages,
    ...(isStreaming && streamingContent ? [{ _id: 'streaming', role: 'assistant', content: streamingContent, isStreaming: true }] : []),
  ]
  const isLoadingMessages = msgsLoadingInitial && activeId && !hasLoadedMessages

  if (!user) return null;

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[60] p-4 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 hover:scale-105 hover:shadow-indigo-500/30 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            aria-label="Open AI Career Assistant"
          >
            <Bot className="h-6 w-6" />
            {hasUnread && (
              <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500 border-2 border-white dark:border-slate-900" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Popover Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } }}
            className={`
              fixed z-[70] flex flex-col overflow-hidden bg-[var(--bg-primary)] shadow-2xl border border-[var(--border-color)]
              ${isExpanded 
                ? 'inset-0 sm:inset-4 sm:rounded-2xl' 
                : 'bottom-[10px] right-[10px] w-[calc(100vw-20px)] h-[calc(100dvh-20px)] rounded-2xl md:bottom-24 md:right-6 md:w-[340px] md:h-[600px] lg:w-[380px]'}
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-sm shrink-0">
              <div className="flex items-center gap-2">
                {showHistory ? (
                  <button onClick={() => setShowHistory(false)} className="p-1.5 -ml-1.5 rounded-lg hover:bg-white/20 transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                ) : (
                  <Bot className="h-6 w-6 text-indigo-200" />
                )}
                <h2 className="font-semibold">{showHistory ? 'Conversation History' : 'AI Assistant'}</h2>
              </div>
              <div className="flex items-center gap-1">
                {!showHistory && (
                  <button
                    onClick={() => setShowHistory(true)}
                    className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                    title="History"
                  >
                    <History className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="hidden sm:block p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  title={isExpanded ? "Collapse" : "Expand"}
                >
                  {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  title="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden bg-[var(--bg-secondary)]">
              {showHistory ? (
                <div className="flex-1 overflow-y-auto w-full [&_>_div]:w-full">
                   <AIChatSidebar
                    conversations={conversations}
                    activeId={activeId}
                    onSelect={handleSelectConversation}
                    onNew={handleNewChat}
                    onRename={handleRename}
                    onDelete={handleDelete}
                    onSearch={handleSearch}
                    isOpen={true}
                    onToggle={() => {}}
                    isLoading={convsLoading || createMutation.isPending}
                    isWidgetMode={true}
                  />
                </div>
              ) : (
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto bg-[var(--bg-primary)]">
                  {isLoadingMessages && <ChatSkeleton />}

                  {!isLoadingMessages && showPrompts && (
                    <div className="flex flex-col items-center justify-center min-h-full px-4 py-8">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/30 mb-4">
                        <Bot className="h-6 w-6 text-indigo-500" />
                      </div>
                      <h3 className="font-medium text-[var(--text-primary)] mb-1">How can I help?</h3>
                      <p className="text-xs text-[var(--text-secondary)] text-center mb-6 max-w-[240px]">
                        Get help with resumes, interviews, or career advice.
                      </p>
                      <div className="w-full">
                        <SuggestedPrompts onSelect={handlePromptSelect} isWidgetMode={true} />
                      </div>
                    </div>
                  )}

                  {!isLoadingMessages && !showPrompts && activeId && allMessages.length === 0 && (
                    <div className="flex flex-col items-center justify-center min-h-full px-4">
                      <Bot className="h-8 w-8 text-[var(--text-tertiary)] mb-2" />
                      <p className="text-sm text-[var(--text-secondary)]">Say hello!</p>
                    </div>
                  )}

                  {allMessages.length > 0 && (
                    <div className="px-3 py-4 space-y-4">
                      {allMessages.map((msg) => (
                        <AIChatMessage
                          key={msg._id}
                          message={msg}
                          isStreaming={msg.isStreaming}
                          onRegenerate={!isStreaming ? handleRegenerate : undefined}
                          isWidgetMode={true}
                        />
                      ))}
                      {isStreaming && !streamingContent && (
                        <div className="flex gap-2">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                            <Bot className="h-3.5 w-3.5" />
                          </div>
                          <div className="rounded-xl px-3 py-2 bg-[var(--bg-tertiary)]">
                            <TypingDots />
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}

                  {streamError && (
                    <div className="px-3 pb-2">
                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30">
                        <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                        <p className="text-xs text-red-600 dark:text-red-400 flex-1">{streamError}</p>
                        <button
                          onClick={() => {
                            setStreamError(null)
                            const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
                            if (lastUserMsg) handleSend(lastUserMsg.content)
                          }}
                          className="text-xs font-medium text-red-600 dark:text-red-400 hover:underline shrink-0"
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Input */}
            {!showHistory && (
              <div className="p-3 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] shrink-0">
                <AIChatInput
                  onSend={handleSend}
                  onStop={handleStop}
                  isStreaming={isStreaming}
                  onFileSelect={handleFileSelect}
                  uploadedFile={uploadedFile}
                  onRemoveFile={handleRemoveFile}
                  isWidgetMode={true}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

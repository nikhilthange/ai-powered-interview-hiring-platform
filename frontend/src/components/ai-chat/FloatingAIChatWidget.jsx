import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { aiChatApi } from '../../services/aiChatApi'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../lib/utils'
import AIChatSidebar from './AIChatSidebar'
import AIChatMessage from './AIChatMessage'
import AIChatInput from './AIChatInput'
import SuggestedPrompts from './SuggestedPrompts'
import { useToast } from '../ui/Toast'
import { AnimatedDots } from '../ui/Spinner'
import { modalContainerVariants, buttonMotion } from '../../lib/motion'
import { Bot, AlertCircle, X, History, Maximize2, Minimize2, ChevronLeft } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

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
  const shouldReduceMotion = useReducedMotion()

  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [hasUnread] = useState(false)

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
    enabled: isOpen || hasUnread
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

  return createPortal(
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={shouldReduceMotion ? false : { scale: 0, opacity: 0 }}
            animate={shouldReduceMotion ? false : { scale: 1, opacity: 1 }}
            exit={shouldReduceMotion ? false : { scale: 0, opacity: 0 }}
            whileHover={shouldReduceMotion ? undefined : buttonMotion.whileHover}
            whileTap={shouldReduceMotion ? undefined : buttonMotion.whileTap}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[99998] h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-2xl transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            aria-label="Open AI Career Assistant"
          >
            <Bot className="h-6 w-6 sm:h-7 sm:w-7" />
            {hasUnread && (
              <span className="absolute top-0 right-0 h-3.5 w-3.5 rounded-full bg-red-500 border-2 border-white dark:border-slate-900" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Popover Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={shouldReduceMotion ? undefined : modalContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'fixed z-[99999] flex flex-col overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl border border-[var(--border-color)] transition-all duration-200',
              isExpanded
                ? 'inset-3 md:inset-6 rounded-2xl md:rounded-3xl'
                : 'bottom-6 right-6 w-[calc(100vw-32px)] md:w-[360px] lg:w-[390px] 2xl:w-[420px] max-w-[calc(100vw-32px)] h-[min(700px,calc(100vh-100px))] max-h-[calc(100vh-100px)] rounded-2xl max-md:fixed max-md:inset-0 max-md:w-full max-md:h-[100dvh] max-md:max-h-[100dvh] max-md:rounded-none max-md:bottom-0 max-md:right-0'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 text-white shadow-sm shrink-0 h-14">
              <div className="flex items-center gap-2">
                {showHistory ? (
                  <button onClick={() => setShowHistory(false)} className="p-1.5 -ml-1.5 rounded-lg hover:bg-white/20 transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                ) : (
                  <Bot className="h-6 w-6 text-indigo-200" />
                )}
                <h2 className="font-semibold text-base">{showHistory ? 'Conversation History' : 'AI Assistant'}</h2>
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
            <div className="flex-1 min-h-0 relative overflow-hidden flex flex-col bg-[var(--bg-secondary)]">
              {showHistory ? (
                <div className="flex-1 min-h-0 overflow-y-auto w-full [&_>_div]:w-full scrollbar-thin">
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
                <div ref={chatContainerRef} className="flex-1 min-h-0 overflow-y-auto bg-[var(--bg-primary)] p-4 space-y-4 scrollbar-thin">
                  {isLoadingMessages && <ChatSkeleton />}

                  {!isLoadingMessages && showPrompts && (
                    <div className="flex flex-col items-center justify-center min-h-full px-2 py-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/30 mb-3">
                        <Bot className="h-6 w-6 text-indigo-500" />
                      </div>
                      <h3 className="font-semibold text-[var(--text-primary)] mb-1 text-base">How can I help?</h3>
                      <p className="text-xs text-[var(--text-secondary)] text-center mb-5 max-w-[240px]">
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
                    <div className="space-y-4">
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
                          <div className="rounded-xl px-3 py-2 bg-[var(--bg-tertiary)] flex items-center">
                            <AnimatedDots className="text-indigo-500" />
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}

                  {streamError && (
                    <div className="pb-2">
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
              <div className="p-3 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] shrink-0 pb-[calc(12px+env(safe-area-inset-bottom))]">
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
    </>,
    document.body
  )
}

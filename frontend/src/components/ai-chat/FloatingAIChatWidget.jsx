import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { aiChatApi } from '../../services/aiChatApi'
import { useAuth } from '../../hooks/useAuth'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { cn } from '../../lib/utils'
import AIChatSidebar from './AIChatSidebar'
import AIChatMessage from './AIChatMessage'
import AIChatInput from './AIChatInput'
import SuggestedPrompts from './SuggestedPrompts'
import { useToast } from '../ui/Toast'
import { AnimatedDots } from '../ui/Spinner'
import { modalContainerVariants, modalOverlayVariants, buttonMotion } from '../../lib/motion'
import {
  Bot, AlertCircle, X, History, Maximize2, Minimize2, ChevronLeft,
  Sparkles, RefreshCw, MessageSquarePlus
} from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

function ChatSkeleton() {
  return (
    <div className="space-y-4 px-4 py-4">
      <div className="flex gap-2 flex-row-reverse">
        <div className="h-8 w-8 rounded-xl bg-indigo-200 dark:bg-indigo-800/50 skeleton-shimmer" />
        <div className="flex-1 max-w-[80%]">
          <div className="h-12 rounded-2xl bg-[var(--bg-tertiary)] skeleton-shimmer" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-8 w-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 skeleton-shimmer" />
        <div className="flex-1 max-w-[80%]">
          <div className="h-24 rounded-2xl bg-[var(--bg-tertiary)] skeleton-shimmer" />
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

  const isMobile = useMediaQuery('(max-width: 767px)')
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)')

  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

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

  // Lock background scroll on mobile fullscreen or tablet modal
  useEffect(() => {
    if (isOpen && (isMobile || isTablet || isExpanded)) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, isMobile, isTablet, isExpanded])

  const { data: conversations = [], isLoading: convsLoading } = useQuery({
    queryKey: ['ai-conversations', searchQuery],
    queryFn: () => searchQuery
      ? aiChatApi.searchConversations(searchQuery)
      : aiChatApi.getConversations(),
    enabled: isOpen
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
    toast.info('Resume attached! Send your message to analyze it.', { duration: 3000 })
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

  const chatUI = (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 text-white shadow-md shrink-0 h-14 pt-[calc(0.75rem+env(safe-area-inset-top))] sm:pt-3">
        <div className="flex items-center gap-2.5">
          {showHistory ? (
            <button
              onClick={() => setShowHistory(false)}
              className="p-1.5 -ml-1 rounded-xl hover:bg-white/20 transition-colors"
              aria-label="Back to chat"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
              <Bot className="h-5 w-5 text-white" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-sm sm:text-base leading-tight">
                {showHistory ? 'History' : 'AI Assistant'}
              </h2>
              {!showHistory && (
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" title="Online" />
              )}
            </div>
            <p className="text-[10px] text-indigo-100 opacity-90">Career & Interview Copilot</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {!showHistory && (
            <button
              onClick={handleNewChat}
              className="p-1.5 rounded-xl hover:bg-white/20 transition-colors"
              title="New Chat"
              aria-label="New Chat"
            >
              <MessageSquarePlus className="h-4.5 w-4.5" />
            </button>
          )}
          {!showHistory && (
            <button
              onClick={() => setShowHistory(true)}
              className="p-1.5 rounded-xl hover:bg-white/20 transition-colors"
              title="Conversation History"
              aria-label="Conversation History"
            >
              <History className="h-4.5 w-4.5" />
            </button>
          )}
          {!isMobile && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-xl hover:bg-white/20 transition-colors"
              title={isExpanded ? "Collapse view" : "Expand view"}
              aria-label={isExpanded ? "Collapse view" : "Expand view"}
            >
              {isExpanded ? <Minimize2 className="h-4.5 w-4.5" /> : <Maximize2 className="h-4.5 w-4.5" />}
            </button>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-xl hover:bg-white/20 transition-colors"
            title="Close Assistant"
            aria-label="Close Assistant"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 relative overflow-hidden flex flex-col bg-[var(--bg-secondary)]">
        {showHistory ? (
          <div className="flex-1 min-h-0 overflow-y-auto w-full scrollbar-thin">
            <AIChatSidebar
              conversations={conversations}
              activeId={activeId}
              onSelect={handleSelectConversation}
              onNew={handleNewChat}
              onRename={handleRename}
              onDelete={handleDelete}
              onSearch={handleSearch}
              isOpen={true}
              onToggle={() => setShowHistory(false)}
              isLoading={convsLoading || createMutation.isPending}
              isWidgetMode={true}
            />
          </div>
        ) : (
          <div ref={chatContainerRef} className="flex-1 min-h-0 overflow-y-auto bg-[var(--bg-primary)] p-4 space-y-4 scrollbar-thin">
            {isLoadingMessages && <ChatSkeleton />}

            {!isLoadingMessages && showPrompts && (
              <div className="flex flex-col items-center justify-center min-h-full px-2 py-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-200 dark:border-indigo-800/40 mb-3 shadow-xs">
                  <Sparkles className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="font-bold text-[var(--text-primary)] text-base mb-1">Hi, {user.name?.split(' ')[0] || 'there'}! 👋</h3>
                <p className="text-xs text-[var(--text-secondary)] text-center mb-5 max-w-[260px] leading-relaxed">
                  I can review your resume, generate mock interview questions, or tailor your career path.
                </p>
                <div className="w-full max-w-sm">
                  <SuggestedPrompts onSelect={handlePromptSelect} isWidgetMode={true} />
                </div>
              </div>
            )}

            {!isLoadingMessages && !showPrompts && activeId && allMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-full px-4 text-center">
                <Bot className="h-8 w-8 text-[var(--text-tertiary)] mb-2" />
                <p className="text-sm font-medium text-[var(--text-secondary)]">New conversation started</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">Ask a question to get started.</p>
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
                  <div className="flex gap-2 py-1">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="rounded-2xl px-4 py-3 bg-[var(--bg-tertiary)] flex items-center shadow-xs">
                      <AnimatedDots className="text-indigo-500" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            {streamError && (
              <div className="pb-2">
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 shadow-xs">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-xs text-red-600 dark:text-red-400 flex-1">{streamError}</p>
                  <button
                    onClick={() => {
                      setStreamError(null)
                      const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
                      if (lastUserMsg) handleSend(lastUserMsg.content)
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400 hover:underline shrink-0"
                  >
                    <RefreshCw className="h-3 w-3" />
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
        <div className="p-3 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] shrink-0 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
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
    </div>
  )

  return createPortal(
    <>
      {/* 56px Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={shouldReduceMotion ? false : { scale: 0, opacity: 0 }}
            animate={shouldReduceMotion ? false : { scale: 1, opacity: 1 }}
            exit={shouldReduceMotion ? false : { scale: 0, opacity: 0 }}
            whileHover={shouldReduceMotion ? undefined : buttonMotion.whileHover}
            whileTap={shouldReduceMotion ? undefined : buttonMotion.whileTap}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-6 z-[99998] h-14 w-14 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-2xl transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            aria-label="Open AI Career Assistant"
          >
            <Bot className="h-7 w-7 text-white" />
            <span className="absolute top-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900 shadow-xs" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Responsive Container */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* MOBILE: Full-Viewport WhatsApp / ChatGPT style */}
            {isMobile && (
              <motion.div
                initial={shouldReduceMotion ? false : { y: '100%', opacity: 0 }}
                animate={shouldReduceMotion ? false : { y: 0, opacity: 1 }}
                exit={shouldReduceMotion ? false : { y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                className="fixed inset-0 z-[99999] h-[100dvh] w-full bg-[var(--bg-primary)] flex flex-col overflow-hidden"
                role="dialog"
                aria-label="AI Career Assistant Fullscreen"
              >
                {chatUI}
              </motion.div>
            )}

            {/* TABLET: Centered Modal */}
            {isTablet && (
              <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                <motion.div
                  variants={shouldReduceMotion ? undefined : modalOverlayVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onClick={() => setIsOpen(false)}
                  className="fixed inset-0 bg-black/50 backdrop-blur-md"
                />
                <motion.div
                  variants={shouldReduceMotion ? undefined : modalContainerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="relative z-10 w-[540px] max-w-[90vw] h-[680px] max-h-[85vh] rounded-3xl bg-[var(--bg-primary)] shadow-2xl border border-[var(--border-color)] overflow-hidden flex flex-col"
                  role="dialog"
                  aria-label="AI Career Assistant Modal"
                >
                  {chatUI}
                </motion.div>
              </div>
            )}

            {/* DESKTOP: Floating Assistant */}
            {!isMobile && !isTablet && (
              <motion.div
                variants={shouldReduceMotion ? undefined : modalContainerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={cn(
                  'fixed z-[99999] flex flex-col overflow-hidden bg-[var(--bg-primary)]/95 backdrop-blur-2xl shadow-2xl border border-[var(--border-color)] transition-all duration-300',
                  isExpanded
                    ? 'inset-6 rounded-3xl'
                    : 'bottom-6 right-6 w-[420px] h-[720px] max-h-[calc(100vh-100px)] rounded-3xl'
                )}
                role="dialog"
                aria-label="AI Career Assistant"
              >
                {chatUI}
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </>,
    document.body
  )
}

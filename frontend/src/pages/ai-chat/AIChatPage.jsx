import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { aiChatApi } from '../../services/aiChatApi'
import { useAuth } from '../../hooks/useAuth'
import AIChatSidebar from '../../components/ai-chat/AIChatSidebar'
import AIChatMessage from '../../components/ai-chat/AIChatMessage'
import AIChatInput from '../../components/ai-chat/AIChatInput'
import SuggestedPrompts from '../../components/ai-chat/SuggestedPrompts'
import { useToast } from '../../components/ui/Toast'
import { Bot, Loader2, AlertCircle, Menu, X, PanelRightOpen } from 'lucide-react'

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
    <div className="max-w-3xl mx-auto space-y-4 px-4 py-8">
      <div className="flex gap-3 flex-row-reverse">
        <div className="h-8 w-8 rounded-xl bg-indigo-200 dark:bg-indigo-800 skeleton-shimmer" />
        <div className="flex-1">
          <div className="h-16 rounded-2xl bg-[var(--bg-tertiary)] skeleton-shimmer" />
        </div>
      </div>
      <div className="flex gap-3">
        <div className="h-8 w-8 rounded-xl bg-indigo-100 dark:bg-indigo-900 skeleton-shimmer" />
        <div className="flex-1">
          <div className="h-24 rounded-2xl bg-[var(--bg-tertiary)] skeleton-shimmer" />
        </div>
      </div>
      <div className="flex gap-3 flex-row-reverse">
        <div className="h-8 w-8 rounded-xl bg-indigo-200 dark:bg-indigo-800 skeleton-shimmer" />
        <div className="flex-1">
          <div className="h-12 rounded-2xl bg-[var(--bg-tertiary)] skeleton-shimmer" />
        </div>
      </div>
      <div className="flex gap-3">
        <div className="h-8 w-8 rounded-xl bg-indigo-100 dark:bg-indigo-900 skeleton-shimmer" />
        <div className="flex-1">
          <div className="h-32 rounded-2xl bg-[var(--bg-tertiary)] skeleton-shimmer" />
        </div>
      </div>
    </div>
  )
}

export default function AIChatPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const messagesEndRef = useRef(null)
  const abortControllerRef = useRef(null)
  const chatContainerRef = useRef(null)

  const [activeId, setActiveId] = useState(searchParams.get('conversation') || null)
  const [messages, setMessages] = useState([])
  const [streamingContent, setStreamingContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamError, setStreamError] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [hasLoadedMessages, setHasLoadedMessages] = useState(false)

  const jobContext = searchParams.get('jobContext')
  const jobTitle = searchParams.get('jobTitle')
  const jobDescription = searchParams.get('jobDescription')

  const { data: conversations = [], isLoading: convsLoading } = useQuery({
    queryKey: ['ai-conversations', searchQuery],
    queryFn: () => searchQuery
      ? aiChatApi.searchConversations(searchQuery)
      : aiChatApi.getConversations(),
  })

  const { data: existingMessages = [], isLoading: msgsLoadingInitial } = useQuery({
    queryKey: ['ai-messages', activeId],
    queryFn: () => aiChatApi.getMessages(activeId),
    enabled: !!activeId,
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, streamingContent])

  const createMutation = useMutation({
    mutationFn: (data) => aiChatApi.createConversation(data),
    onSuccess: (conv) => {
      setActiveId(conv._id)
      setMessages([])
      setHasLoadedMessages(true)
      setSearchQuery('')
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] })
      navigate(`/ai-chat?conversation=${conv._id}`, { replace: true })
      setMobileSidebarOpen(false)
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
    navigate('/ai-chat', { replace: true })
    setMobileSidebarOpen(false)
  }, [navigate])

  useEffect(() => {
    if (jobContext && conversations.length > 0 && !activeId) {
      const context = { type: 'job', jobTitle, jobDescription }
      createMutation.mutate({ context })
    }
  }, [jobContext])

  const handleSend = useCallback(async (content) => {
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
      navigate(`/ai-chat?conversation=${convId}`, { replace: true })
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
  }, [activeId, uploadedFile, jobContext, jobTitle, jobDescription, navigate, queryClient])

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
    navigate(`/ai-chat?conversation=${conv._id}`, { replace: true })
    setMobileSidebarOpen(false)
  }, [navigate])

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
          navigate('/ai-chat', { replace: true })
        }
      })
      .catch(() => toast.error('Failed to delete'))
  }, [activeId, navigate, queryClient, toast])

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

  return (
    <div className="flex h-[calc(100dvh-4rem)] -m-4 sm:-m-6 lg:-m-8 relative">
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed lg:static inset-y-0 left-0 z-40 w-72
        transform transition-transform duration-300
        lg:transform-none
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${sidebarOpen ? 'lg:w-72' : 'lg:w-0 lg:overflow-hidden'}
      `}>
        <AIChatSidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={handleSelectConversation}
          onNew={handleNewChat}
          onRename={handleRename}
          onDelete={handleDelete}
          onSearch={handleSearch}
          isOpen={true}
          onToggle={() => { setSidebarOpen(false); setMobileSidebarOpen(false) }}
          isLoading={convsLoading || createMutation.isPending}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-primary)]">
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-[var(--border-color)] min-h-[49px]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setMobileSidebarOpen(true)
                } else {
                  setSidebarOpen(!sidebarOpen)
                }
              }}
              className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
            >
              {mobileSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-indigo-500 shrink-0" />
              <h1 className="text-sm font-semibold text-[var(--text-primary)] truncate">AI Career Assistant</h1>
            </div>
          </div>
          {jobTitle && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/30 shrink-0 ml-2">
              <BriefcaseIcon className="h-3.5 w-3.5 text-indigo-500" />
              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 truncate max-w-[120px]">{jobTitle}</span>
            </div>
          )}
        </div>

        <div ref={chatContainerRef} className="flex-1 overflow-y-auto">
          {isLoadingMessages && (
            <ChatSkeleton />
          )}

          {!isLoadingMessages && showPrompts && (
            <div className="flex flex-col items-center justify-center min-h-full px-4 py-8 sm:py-12">
              <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border border-indigo-200 dark:border-indigo-800/30 mb-4">
                <Bot className="h-7 w-7 sm:h-8 sm:w-8 text-indigo-500" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)]">AI Career Assistant</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1.5 mb-6 sm:mb-8 text-center max-w-md px-4">
                Your personal career coach. Get help with resumes, job analysis, interviews, DSA, salary negotiation, and career growth.
              </p>
              <div className="w-full px-2 sm:px-0">
                <SuggestedPrompts onSelect={handlePromptSelect} />
              </div>
            </div>
          )}

          {!isLoadingMessages && !showPrompts && activeId && allMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-full px-4">
              <Bot className="h-10 w-10 text-[var(--text-tertiary)] mb-3" />
              <p className="text-sm text-[var(--text-secondary)]">Start a conversation</p>
            </div>
          )}

          {allMessages.length > 0 && (
            <div className="max-w-3xl mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-5">
              {allMessages.map((msg) => (
                <AIChatMessage
                  key={msg._id}
                  message={msg}
                  isStreaming={msg.isStreaming}
                  onRegenerate={!isStreaming ? handleRegenerate : undefined}
                />
              ))}
              {isStreaming && !streamingContent && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/50 dark:to-purple-900/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700/50">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl px-4 py-3 bg-[var(--bg-tertiary)]">
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {streamError && (
            <div className="max-w-3xl mx-auto px-4 pb-2">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400 flex-1">{streamError}</p>
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

        <div className="px-3 sm:px-4 py-3 border-t border-[var(--border-color)]">
          <div className="max-w-3xl mx-auto">
            <AIChatInput
              onSend={handleSend}
              onStop={handleStop}
              isStreaming={isStreaming}
              onFileSelect={handleFileSelect}
              uploadedFile={uploadedFile}
              onRemoveFile={handleRemoveFile}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function BriefcaseIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  )
}

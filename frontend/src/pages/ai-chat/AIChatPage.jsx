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
import { Bot, Loader2, AlertCircle, PanelRightOpen } from 'lucide-react'

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
  const [showPrompts, setShowPrompts] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)

  const jobContext = searchParams.get('jobContext')
  const jobTitle = searchParams.get('jobTitle')
  const jobDescription = searchParams.get('jobDescription')

  const { data: conversations = [], isLoading: convsLoading } = useQuery({
    queryKey: ['ai-conversations', searchQuery],
    queryFn: () => searchQuery
      ? aiChatApi.searchConversations(searchQuery)
      : aiChatApi.getConversations(),
  })

  const { data: existingMessages = [], isLoading: msgsLoading } = useQuery({
    queryKey: ['ai-messages', activeId],
    queryFn: () => aiChatApi.getMessages(activeId),
    enabled: !!activeId,
  })

  useEffect(() => {
    if (existingMessages.length > 0) {
      setMessages(existingMessages)
      setShowPrompts(false)
    }
  }, [existingMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const createMutation = useMutation({
    mutationFn: (data) => aiChatApi.createConversation(data),
    onSuccess: (conv) => {
      setActiveId(conv._id)
      setMessages([])
      setShowPrompts(false)
      setSearchQuery('')
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] })
      navigate(`/ai-chat?conversation=${conv._id}`, { replace: true })
    },
    onError: () => toast.error('Failed to create conversation'),
  })

  const handleNewChat = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const context = {}
    if (uploadedFile) {
      context.type = 'resume'
    } else if (jobContext) {
      context.type = 'job'
      context.jobTitle = jobTitle
      context.jobDescription = jobDescription
    } else if (user?.role === 'recruiter') {
      context.type = 'recruiter'
    } else if (user?.role === 'admin') {
      context.type = 'admin'
    }
    createMutation.mutate({ context })
  }, [uploadedFile, jobContext, jobTitle, jobDescription, user?.role, createMutation])

  useEffect(() => {
    if (jobContext && conversations.length > 0 && !activeId) {
      handleNewChat()
    }
  }, [jobContext, conversations.length, activeId, handleNewChat])

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
      } else if (user?.role === 'recruiter') {
        context.type = 'recruiter'
      } else if (user?.role === 'admin') {
        context.type = 'admin'
      }

      const conv = await aiChatApi.createConversation({ context })
      convId = conv._id
      setActiveId(convId)
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] })
      navigate(`/ai-chat?conversation=${convId}`, { replace: true })
      setShowPrompts(false)
    }

    const userMsg = { _id: `temp-${Date.now()}`, role: 'user', content, createdAt: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setShowPrompts(false)
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
  }, [activeId, uploadedFile, jobContext, jobTitle, jobDescription, user?.role, navigate, queryClient])

  const handleRegenerate = useCallback(() => {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
    if (lastUserMsg && activeId) {
      const msgsWithoutLast = messages.slice(0, -1)
      setMessages(msgsWithoutLast)
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
    setShowPrompts(false)
    setUploadedFile(null)
    navigate(`/ai-chat?conversation=${conv._id}`, { replace: true })
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
          setShowPrompts(true)
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
    toast.info('File selected. Start a new chat to use it as context.', { duration: 3000 })
  }, [toast])

  const handleRemoveFile = useCallback(() => {
    setUploadedFile(null)
  }, [])

  const handleSearch = useCallback((q) => {
    setSearchQuery(q)
  }, [])

  const allMessages = [
    ...messages,
    ...(isStreaming && streamingContent ? [{ _id: 'streaming', role: 'assistant', content: streamingContent, isStreaming: true }] : []),
  ]

  return (
    <div className="flex h-[calc(100dvh-4rem)] -m-4 sm:-m-6 lg:-m-8">
      <AIChatSidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelectConversation}
        onNew={handleNewChat}
        onRename={handleRename}
        onDelete={handleDelete}
        onSearch={handleSearch}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        isLoading={convsLoading || createMutation.isPending}
      />

      <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-primary)]">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
              >
                <PanelRightOpen className="h-4 w-4" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-indigo-500" />
              <h1 className="text-sm font-semibold text-[var(--text-primary)]">AI Career Assistant</h1>
            </div>
          </div>
          {jobTitle && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/30">
              <Briefcase className="h-3.5 w-3.5 text-indigo-500" />
              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">{jobTitle}</span>
            </div>
          )}
        </div>

        <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {!activeId && !showPrompts && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border border-indigo-200 dark:border-indigo-800/30 mb-4">
                <Bot className="h-8 w-8 text-indigo-500" />
              </div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">AI Career Assistant</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-md">
                Your personal career coach. Ask about resumes, jobs, interviews, or career growth.
              </p>
            </div>
          )}

          {msgsLoading && activeId && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
            </div>
          )}

          {(showPrompts && !activeId) && (
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border border-indigo-200 dark:border-indigo-800/30 mb-4">
                <Bot className="h-8 w-8 text-indigo-500" />
              </div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">AI Career Assistant</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1 mb-6 text-center max-w-md">
                Your personal career coach. Ask about resumes, jobs, interviews, or career growth.
              </p>
              <SuggestedPrompts onSelect={handlePromptSelect} role={user?.role} />
            </div>
          )}

          {allMessages.length > 0 && (
            <div className="max-w-3xl mx-auto space-y-4">
              {allMessages.map((msg) => (
                <AIChatMessage
                  key={msg._id}
                  message={msg}
                  isStreaming={msg.isStreaming}
                  onRegenerate={!isStreaming ? handleRegenerate : undefined}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          {streamError && (
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">{streamError}</p>
                <button
                  onClick={() => {
                    setStreamError(null)
                    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
                    if (lastUserMsg) handleSend(lastUserMsg.content)
                  }}
                  className="ml-auto text-xs font-medium text-red-600 dark:text-red-400 hover:underline"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-[var(--border-color)]">
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

function Briefcase(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  )
}

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { interviewApi } from '../../services/interviewApi'
import { Card, CardContent } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { cn } from '../../lib/utils'
import {
  Mic, MicOff, Send, CheckCircle,
  ArrowLeft, Loader2, Sparkles, Brain,
  BarChart3, Star, Target, MessageCircle, StopCircle,
  Award,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function MockInterview() {
  const [sessionId, setSessionId] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState([])
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [sessionEnded, setSessionEnded] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [isThinking, setIsThinking] = useState(false)

  const startMutation = useMutation({
    mutationFn: interviewApi.createSession,
    onSuccess: (res) => {
      const data = res.data?.data || res.data
      setSessionId(data._id || data.sessionId)
      setQuestions(data.questions || data.questions || [])
    },
  })

  const submitMutation = useMutation({
    mutationFn: interviewApi.submitAnswer,
    onSuccess: (res) => {
      const data = res.data?.data || res.data
      if (data.feedback) {
        setFeedback((prev) => [...(prev || []), data.feedback])
      }
      setIsThinking(false)
    },
  })

  const endMutation = useMutation({
    mutationFn: interviewApi.completeSession,
    onSuccess: (res) => {
      const data = res.data?.data || res.data
      setFeedback(data.feedback || data.analysis)
      setSessionEnded(true)
    },
  })

  useEffect(() => {
    if (!sessionId && questions.length === 0 && !startMutation.isPending) {
      startMutation.mutate({ jobRole: 'general', experience: 'mid' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmitAnswer = useCallback(() => {
    if (!input.trim() || !sessionId) return
    const answer = input.trim()
    setAnswers((prev) => [...prev, { question: currentQ, answer }])
    setIsThinking(true)
    setInput('')
    submitMutation.mutate({
      sessionId,
      questionId: questions[currentQ]?._id || currentQ,
      answer,
    })
    if (currentQ < questions.length - 1) {
      setTimeout(() => setCurrentQ((prev) => prev + 1), 500)
    }
  }, [input, sessionId, currentQ, questions, submitMutation])

  const handleEndSession = useCallback(() => {
    if (sessionId) {
      endMutation.mutate({ sessionId })
    }
  }, [sessionId, endMutation])

  if (startMutation.isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="mb-6"
        >
          <Brain className="h-12 w-12 text-indigo-500" />
        </motion.div>
        <p className="text-lg font-medium text-[var(--text-primary)]">Preparing your interview...</p>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Generating AI-powered questions</p>
      </div>
    )
  }

  if (sessionEnded && endMutation.isSuccess) {
    const fb = feedback || endMutation.data?.data?.feedback || endMutation.data?.feedback
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-3xl mx-auto space-y-6"
      >
        <motion.div variants={itemVariants} className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
            <Award className="h-8 w-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Interview Complete</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Great effort! Here's your performance summary.</p>
        </motion.div>

        <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-5 text-center">
              <BarChart3 className="mx-auto h-6 w-6 text-indigo-500 mb-2" />
              <p className="text-2xl font-bold text-[var(--text-primary)]">{fb?.overallScore || fb?.score || 0}%</p>
              <p className="text-xs text-[var(--text-tertiary)]">Overall Score</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 text-center">
              <MessageCircle className="mx-auto h-6 w-6 text-purple-500 mb-2" />
              <p className="text-2xl font-bold text-[var(--text-primary)]">{answers.length}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Questions Answered</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 text-center">
              <Star className="mx-auto h-6 w-6 text-amber-500 mb-2" />
              <p className="text-2xl font-bold text-[var(--text-primary)]">{fb?.strengths?.length || 0}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Strengths Found</p>
            </CardContent>
          </Card>
        </motion.div>

        {fb?.strengths?.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <h3 className="font-semibold text-[var(--text-primary)]">Strengths</h3>
                </div>
                <ul className="space-y-2">
                  {fb.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {fb?.areasForImprovement?.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-5 w-5 text-amber-500" />
                  <h3 className="font-semibold text-[var(--text-primary)]">Areas for Improvement</h3>
                </div>
                <ul className="space-y-2">
                  {fb.areasForImprovement.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      {a}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {fb?.detailedFeedback?.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="h-5 w-5 text-indigo-500" />
                  <h3 className="font-semibold text-[var(--text-primary)]">Detailed Feedback</h3>
                </div>
                <div className="space-y-3">
                  {fb.detailedFeedback.map((f, i) => (
                    <div key={i} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                      <p className="text-sm font-medium text-[var(--text-primary)]">Q{i + 1}</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">{f}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="flex justify-center gap-3 pb-4">
          <Link to="/my-interviews">
            <Button variant="outline">View All Sessions</Button>
          </Link>
          <Button onClick={() => window.location.reload()}>Start New Interview</Button>
        </motion.div>
      </motion.div>
    )
  }

  const question = questions[currentQ]
  const progress = questions.length > 0 ? ((currentQ + 1) / questions.length) * 100 : 0

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-3xl mx-auto space-y-6"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
          <ArrowLeft className="h-4 w-4" /> Exit
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="sm">
            Q {currentQ + 1}/{questions.length}
          </Badge>

        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-indigo-200 dark:border-indigo-800/50">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <Brain className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Question {currentQ + 1}
                </span>
              </div>
              <p className="text-xl font-semibold text-[var(--text-primary)] leading-relaxed">
                {question?.text || question?.question || 'Loading question...'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-5">
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
              Your Answer
            </label>
            <div className="relative">
              <textarea
                rows={4}
                placeholder="Type your answer here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmitAnswer()
                  }
                }}
                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                disabled={isThinking}
              />
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={cn(
                    'rounded-xl p-2.5 transition-all',
                    isRecording
                      ? 'bg-red-50 text-red-500 dark:bg-red-950 dark:text-red-400 animate-pulse'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                  )}
                  aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                >
                  {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEndSession}
                  disabled={endMutation.isPending}
                >
                  <StopCircle className="h-4 w-4" />
                  End
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmitAnswer}
                  disabled={!input.trim() || isThinking}
                >
                  {isThinking ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {isThinking ? 'Analyzing...' : currentQ < questions.length - 1 ? 'Next' : 'Submit'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence>
        {isThinking && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center gap-3 py-4 px-5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Sparkles className="h-5 w-5 text-indigo-500" />
            </motion.div>
            <div>
              <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">AI is analyzing your answer...</p>
              <p className="text-xs text-indigo-500 dark:text-indigo-400">Evaluating response quality</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useCallback, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { interviewApi } from '../../services/interviewApi'
import { Card, CardContent } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import FileDropzone from '../../components/FileUpload/FileDropzone'
import AIStepLoader from '../../components/ui/AIStepLoader'
import InterviewFeedbackReport from '../../components/interview/InterviewFeedbackReport'
import { cn } from '../../lib/utils'
import { TARGET_ROLES, EXPERIENCE_LEVELS } from '../../lib/constants'
import {
  Mic, MicOff, Send,
  ArrowLeft, Loader2, Sparkles, Brain,
  StopCircle, Briefcase, AlertTriangle,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from '../../components/seo/SEO'
import SEOPageContent from '../../components/seo/SEOPageContent'
import { buildWebPageSchema, buildBreadcrumbSchema, buildHowToSchema, buildFAQSchema } from '../../utils/schemaGenerator'

const MOCK_INTERVIEW_FAQS = [
  {
    question: 'How do AI Mock Interviews work on HireMate?',
    answer: 'HireMate generates tailored technical and behavioral questions based on your resume and target role. You answer via audio or text input, and the AI evaluates your response clarity, technical accuracy, and structural presentation.',
  },
  {
    question: 'What types of engineering roles can I practice for?',
    answer: 'Practices are available for Frontend Engineers, Backend Engineers, Full-Stack Developers, DevOps/Cloud Engineers, Mobile Developers, Data Engineers, and AI/ML Specialists across Junior, Mid, and Senior difficulty levels.',
  },
  {
    question: 'Can I review my past mock interview feedback?',
    answer: 'Yes! All completed interview sessions, question-by-question scoring, audio transcripts, and AI suggestions are saved in your My Interviews dashboard.',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const DIFFICULTY_MAP = { Junior: 'easy', Mid: 'medium', Senior: 'hard' }

export default function MockInterview() {
  const [sessionId, setSessionId] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQ, setCurrentQ] = useState(0)
  const [_answers, setAnswers] = useState([])
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [sessionEnded, setSessionEnded] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [isThinking, setIsThinking] = useState(false)
  const [file, setFile] = useState(null)
  const [targetRole, setTargetRole] = useState('')
  const [difficulty, setDifficulty] = useState('Mid')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [genError, setGenError] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const autoCompletingRef = useRef(false)

  const startMutation = useMutation({
    mutationFn: (formData) =>
      interviewApi.createSession(formData, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        setUploadProgress(progress)
      }),
    onSuccess: async (res) => {
      const session = res.data?.session || res.data
      const sid = session._id || session.sessionId
      setSessionId(sid)
      setGenError(null)
      try {
        const qRes = await interviewApi.generateSessionQuestions(sid)
        const qData = qRes.data || qRes
        setQuestions(qData.questions || [])
      } catch {
        setQuestions([])
        setGenError('Failed to generate questions. Please try again.')
      }
    },
  })

  const submitMutation = useMutation({
    mutationFn: interviewApi.submitAnswer,
    onSuccess: (res, variables) => {
      const data = res.data?.data || res.data
      if (data.feedback) {
        setFeedback((prev) => [...(prev || []), data.feedback])
      }
      setIsThinking(false)
      setSubmitError(null)
      setQuestions((prev) => prev.map((q) =>
        q._id === variables.questionId
          ? { ...q, score: data.score, feedback: data.feedback, strengths: data.strengths || [], improvements: data.improvements || [] }
          : q
      ))
      if (currentQ === questions.length - 1 && sessionId && !autoCompletingRef.current) {
        autoCompletingRef.current = true
        endMutation.mutate(sessionId)
      }
    },
    onError: (err) => {
      setIsThinking(false)
      setSubmitError(err?.response?.data?.message || err?.message || 'Failed to submit answer. Please try again.')
    },
  })

  const endMutation = useMutation({
    mutationFn: interviewApi.completeSession,
    onSuccess: (res) => {
      const data = res.data?.data || res.data || res
      setFeedback({
        overallScore: data.overallScore,
        score: data.percentage,
        strengths: data.topStrengths || [],
        areasForImprovement: data.areasToImprove || [],
        detailedFeedback: data.overallFeedback ? [data.overallFeedback] : [],
      })
      setSessionEnded(true)
    },
    onError: (err) => {
      autoCompletingRef.current = false
      setSubmitError(err?.response?.data?.message || err?.message || 'Failed to complete interview. Please try again.')
    },
  })

  const handleFileChange = useCallback((f) => setFile(f), [])

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
      endMutation.mutate(sessionId)
    }
  }, [sessionId, endMutation])

  const handleStartInterview = (e) => {
    e.preventDefault()
    if (!file || !targetRole) return
    const formData = new FormData()
    formData.append('resume', file)
    formData.append('targetRole', targetRole.trim())
    formData.append('difficulty', DIFFICULTY_MAP[difficulty] || difficulty.toLowerCase())
    startMutation.mutate(formData)
  }

  const mockInterviewSchemas = [
    buildWebPageSchema({
      title: 'AI Mock Interview Simulator & Real-Time Feedback | HireMate',
      description: 'Practice technical and behavioral interview questions with AI feedback, audio analysis, and instant scoring on HireMate.',
      path: '/mock-interview',
    }),
    buildBreadcrumbSchema([{ name: 'Mock Interview', path: '/mock-interview' }]),
    buildFAQSchema(MOCK_INTERVIEW_FAQS),
    buildHowToSchema({
      name: 'How to Practice AI Mock Interviews for Engineering Roles',
      description: 'Step-by-step procedure to practice technical interviews and improve answer scoring.',
      steps: [
        { name: 'Upload Resume & Pick Role', text: 'Select target engineering role and experience level.', url: '/mock-interview' },
        { name: 'Answer Questions', text: 'Respond using speech-to-text audio or text typing.' },
        { name: 'Receive Instant Feedback', text: 'Review live AI analysis on technical clarity and response structure.' },
        { name: 'Review Report', text: 'Inspect question-by-question scoring and areas of improvement.' },
      ],
    }),
  ]

  if (!sessionId) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-3xl mx-auto space-y-6"
      >
        <SEO
          title="AI Mock Interview Simulator & Real-Time Feedback | HireMate"
          description="Practice technical and behavioral interview questions with AI feedback, audio analysis, and instant scoring on HireMate."
          path="/mock-interview"
          schema={mockInterviewSchemas}
        />
        <motion.div variants={itemVariants}>
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-6">
            <Sparkles className="h-4 w-4" /> Back to dashboard
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] break-words">Mock Interview</h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Upload your resume, choose a role, and practice with AI-powered interview questions.
            </p>
          </div>
        </motion.div>

        <motion.form variants={itemVariants} onSubmit={handleStartInterview} className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Upload Resume</h2>
              <FileDropzone onFile={handleFileChange} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Target Role</h2>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  list="roles"
                  placeholder="Search or type a target role..."
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] pl-10 pr-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <datalist id="roles">
                  {TARGET_ROLES.map((role) => <option key={role} value={role} />)}
                </datalist>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {TARGET_ROLES.slice(0, 6).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setTargetRole(role)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-medium border transition-all',
                      targetRole === role
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-400 dark:border-indigo-800'
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-transparent hover:bg-indigo-50 dark:hover:bg-indigo-950'
                    )}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Difficulty Level</h2>
              <div className="flex flex-wrap gap-2">
                {EXPERIENCE_LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={cn(
                      'rounded-lg px-4 py-2 text-sm font-medium border transition-all',
                      difficulty === level
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-400 dark:border-indigo-800'
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-transparent hover:bg-indigo-50 dark:hover:bg-indigo-950'
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
              <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={!file || !targetRole || startMutation.isPending} size="lg">
              {startMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Starting Interview...</>
              ) : (
                <><Brain className="h-4 w-4" /> Start Interview</>
              )}
            </Button>
          </div>

          {startMutation.isError && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">Failed to Start Interview</p>
                <p className="mt-0.5 opacity-90">{startMutation.error?.response?.data?.message || 'Unable to create session. Please try again.'}</p>
              </div>
            </motion.div>
          )}
        </motion.form>

        <SEOPageContent
          summary="Simulate real technical and behavioral engineering interviews with instant AI scoring, speech evaluation, and personalized feedback reports."
          definition="The HireMate AI Mock Interview Simulator conducts interactive technical Q&A sessions using LLMs and speech processing to prepare software developers for hiring rounds."
          questions={[
            {
              question: 'Why practice with AI mock interviews before company interviews?',
              answer: 'AI mock interviews build articulation confidence, help structure answers using the STAR method (Situation, Task, Action, Result), and highlight technical gaps without high-stakes pressure.',
            },
            {
              question: 'How are mock interview responses evaluated?',
              answer: 'HireMate rates responses based on technical accuracy, clarity of speech, relevance to the question, problem-solving structure, and depth of domain knowledge.',
            },
          ]}
          steps={[
            { title: 'Upload Resume', desc: 'Provide your latest CV for question context customization.' },
            { title: 'Select Target Role', desc: 'Choose from Frontend, Backend, Fullstack, DevOps, Data, or AI/ML.' },
            { title: 'Answer Live Questions', desc: 'Respond via audio speech or text typing in real time.' },
            { title: 'Get Feedback Report', desc: 'Receive question-by-question scoring and improvement tips.' },
          ]}
          takeaways={[
            'Real-time audio speech-to-text interview processing',
            'Tailored question generation matching target engineering stack',
            'Detailed scoring breakdown across technical and communication dimensions',
          ]}
          faqs={MOCK_INTERVIEW_FAQS}
        />
      </motion.div>
    )
  }

  if (startMutation.isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <Card className="w-full max-w-xl">
          <AIStepLoader title="HireMate AI is preparing your mock interview" />
        </Card>
      </div>
    )
  }

  if (sessionEnded) {
    const fbRaw = endMutation.data?.data || endMutation.data || feedback
    return (
      <InterviewFeedbackReport
        sessionData={fbRaw}
        onRetake={() => {
          setSessionEnded(false)
          setSessionId(null)
          setQuestions([])
          setCurrentQ(0)
          setAnswers([])
        }}
      />
    )
  }

  const question = questions[currentQ]
  const progress = questions.length > 0 ? ((currentQ + 1) / questions.length) * 100 : 0

  if (questions.length === 0 && genError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle className="h-12 w-12 text-red-400" />
        <p className="text-lg font-medium text-[var(--text-primary)]">Failed to generate questions</p>
        <p className="text-sm text-[var(--text-secondary)]">{genError}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-3xl mx-auto space-y-6"
    >
      {submitError && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Error</p>
            <p className="mt-0.5 opacity-90">{submitError}</p>
          </div>
          <Button size="xs" variant="outline" onClick={() => setSubmitError(null)}>Dismiss</Button>
        </motion.div>
      )}

      {endMutation.isPending && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 py-4 px-5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
            <Loader2 className="h-5 w-5 text-indigo-500" />
          </motion.div>
          <div>
            <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Completing your interview...</p>
            <p className="text-xs text-indigo-500 dark:text-indigo-400">Generating AI feedback and score</p>
          </div>
        </motion.div>
      )}

      {endMutation.isError && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Failed to complete session</p>
            <p className="mt-0.5 opacity-90">{endMutation.error?.response?.data?.message || 'Unable to end session. Please try again.'}</p>
          </div>
          <Button size="xs" variant="outline" onClick={() => { endMutation.reset(); setSubmitError(null); }}>Dismiss</Button>
        </motion.div>
      )}

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
              <p className="text-base sm:text-xl font-semibold text-[var(--text-primary)] leading-relaxed break-words">
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
                  disabled={endMutation.isPending || isThinking}
                >
                  {endMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <StopCircle className="h-4 w-4" />}
                  {endMutation.isPending ? 'Completing...' : 'End'}
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

import { useState, useRef, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { interviewApi } from '../../services/interviewApi'
import { Card, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { InlineSpinner } from '../../components/ui/Spinner'
import { SkeletonPage } from '../../components/ui/Skeleton'
import { cn } from '../../lib/utils'
import {
  Upload, FileText, X, Loader2, ArrowLeft, Send, MessageSquare,
  Sparkles, CheckCircle, AlertCircle, Target, ChevronRight, ArrowUpRight
} from 'lucide-react'
import { Link } from 'react-router-dom'

const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']

const ROLES = [
  { value: 'Frontend Developer', label: 'Frontend Developer' },
  { value: 'Backend Developer', label: 'Backend Developer' },
  { value: 'Full Stack Developer', label: 'Full Stack Developer' },
  { value: 'DevOps Engineer', label: 'DevOps Engineer' },
  { value: 'Data Analyst', label: 'Data Analyst' },
  { value: 'custom', label: 'Custom Role' },
]

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy', desc: 'Basic concepts and fundamentals' },
  { value: 'medium', label: 'Medium', desc: 'Intermediate problem solving' },
  { value: 'hard', label: 'Hard', desc: 'Advanced system design & architecture' },
]

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function StepIndicator({ phases, currentPhase }) {
  return (
    <div className="flex items-center gap-0">
      {phases.map((p, i) => (
        <div key={p.num} className="flex items-center flex-1">
          <div className="flex items-center gap-2">
            <div className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all',
              currentPhase >= p.num ? 'bg-[var(--color-primary-500)] text-white shadow-sm' : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
            )}>
              {currentPhase > p.num ? <CheckCircle className="h-4 w-4" /> : p.num}
            </div>
            <span className={cn('text-xs font-medium hidden sm:block', currentPhase >= p.num ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]')}>
              {p.label}
            </span>
          </div>
          {i < phases.length - 1 && (
            <div className={cn('mx-2 flex-1 h-px', currentPhase > p.num ? 'bg-[var(--color-primary-500)]' : 'bg-[var(--border-color)]')} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function MockInterview() {
  const [step, setStep] = useState('upload')
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [targetRole, setTargetRole] = useState('')
  const [customRole, setCustomRole] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [sessionId, setSessionId] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQ, setCurrentQ] = useState(0)
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [answers, setAnswers] = useState([])
  const [results, setResults] = useState(null)
  const fileInputRef = useRef(null)

  const createMutation = useMutation({
    mutationFn: (formData) => interviewApi.createSession(formData, (e) => {
      if (e.total) setUploadProgress(Math.round((e.loaded * 100) / e.total))
    }),
    onSuccess: (res) => {
      setUploadProgress(0); setSessionId(res.data.session._id); generateMutation.mutate(res.data.session._id)
    },
    onError: () => setUploadProgress(0),
  })

  const generateMutation = useMutation({
    mutationFn: (sid) => interviewApi.generateSessionQuestions(sid),
    onSuccess: (res) => {
      setQuestions(res.data.questions); setStep('interview'); setAnswers([]); setCurrentQ(0)
    },
  })

  const submitMutation = useMutation({
    mutationFn: ({ qId, ans }) => interviewApi.submitAnswer(sessionId, qId, ans),
    onSuccess: (res) => {
      const newAnswers = [...answers, {
        question: questions[currentQ], answer: currentAnswer,
        score: res.data.score, feedback: res.data.feedback,
        strengths: res.data.strengths, improvements: res.data.improvements,
      }]
      setAnswers(newAnswers); setCurrentAnswer('')
      if (currentQ + 1 < questions.length) setCurrentQ(currentQ + 1)
      else completeMutation.mutate(sessionId)
    },
  })

  const completeMutation = useMutation({
    mutationFn: (sid) => interviewApi.completeSession(sid),
    onSuccess: (res) => { setResults(res.data); setStep('results') },
  })

  const handleFileDrop = useCallback((e) => { e.preventDefault(); setDragOver(false); const df = e.dataTransfer?.files?.[0]; if (df && ALLOWED_TYPES.includes(df.type)) setFile(df) }, [])
  const handleDragOver = useCallback((e) => { e.preventDefault(); setDragOver(true) }, [])
  const handleDragLeave = useCallback((e) => { e.preventDefault(); setDragOver(false) }, [])
  const handleFileSelect = useCallback((e) => { const f = e.target.files?.[0]; if (f && ALLOWED_TYPES.includes(f.type)) setFile(f) }, [])
  const removeFile = useCallback(() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }, [])

  const role = targetRole === 'custom' ? customRole.trim() : targetRole

  const handleStartInterview = (e) => {
    e.preventDefault()
    if (!file || !role) return
    setUploadProgress(0)
    const formData = new FormData()
    formData.append('resume', file); formData.append('targetRole', role); formData.append('difficulty', difficulty)
    createMutation.mutate(formData)
  }

  const handleSubmitAnswer = () => {
    if (!currentAnswer.trim() || !questions[currentQ]) return
    submitMutation.mutate({ qId: questions[currentQ]._id, ans: currentAnswer })
  }

  const handleReset = () => {
    setStep('upload'); setFile(null); setTargetRole(''); setCustomRole('')
    setDifficulty('medium'); setSessionId(null); setQuestions([])
    setCurrentQ(0); setCurrentAnswer(''); setAnswers([]); setResults(null)
    createMutation.reset(); generateMutation.reset(); submitMutation.reset(); completeMutation.reset()
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const isPending = createMutation.isPending || generateMutation.isPending
  const currentPhase = createMutation.isPending ? 2 : generateMutation.isPending ? 3 : step === 'interview' ? 4 : step === 'results' ? 5 : 0

  const phases = [{ num: 1, label: 'Upload' }, { num: 2, label: 'Role' }, { num: 3, label: 'Difficulty' }, { num: 4, label: 'Interview' }]

  return (
    <div className="page-section">
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-6">
        <ArrowUpRight className="h-4 w-4" /> Back to dashboard
      </Link>

      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Mock Interview</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Practice with AI-generated interview questions tailored to your resume and target role.
          </p>
        </div>

        {step !== 'results' && (
          <StepIndicator phases={phases} currentPhase={currentPhase} />
        )}

        {step === 'upload' && (
          <form onSubmit={handleStartInterview}>
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Step 1: Upload Resume</h2>
                  {!file ? (
                    <div
                      onDrop={handleFileDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        'cursor-pointer flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors',
                        dragOver ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-950)]' : 'border-[var(--border-color)] hover:border-[var(--color-primary-300)] hover:bg-[var(--bg-tertiary)]'
                      )}
                    >
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-tertiary)]">
                        <Upload className="h-7 w-7 text-[var(--text-tertiary)]" />
                      </div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        Drop your resume here, or <span className="text-[var(--color-primary-600)]">browse files</span>
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-tertiary)]">PDF, DOC, or DOCX (max 5 MB)</p>
                      <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc" onChange={handleFileSelect} className="hidden" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 rounded-xl border border-[var(--border-color)] p-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-50)] text-[var(--color-primary-600)] dark:bg-[var(--color-primary-950)] dark:text-[var(--color-primary-400)]">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[var(--text-primary)]">{file.name}</p>
                        <p className="text-xs text-[var(--text-tertiary)]">{formatFileSize(file.size)}</p>
                      </div>
                      <button type="button" onClick={removeFile} className="rounded-lg p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] transition-colors"><X className="h-5 w-5" /></button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Step 2: Select Target Role</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {ROLES.map((r) => (
                      <button
                        key={r.value} type="button" onClick={() => setTargetRole(r.value)}
                        className={cn(
                          'rounded-xl border px-4 py-3 text-sm font-medium transition-all text-left',
                          targetRole === r.value
                            ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] text-[var(--color-primary-700)] dark:bg-[var(--color-primary-950)] dark:text-[var(--color-primary-300)]'
                            : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--color-primary-300)] hover:text-[var(--text-primary)]'
                        )}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                  {targetRole === 'custom' && (
                    <input
                      type="text" value={customRole} onChange={(e) => setCustomRole(e.target.value)}
                      placeholder="Enter your target role..."
                      className="mt-3 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)] transition-all"
                    />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Step 3: Select Difficulty</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {DIFFICULTIES.map((d) => (
                      <button
                        key={d.value} type="button" onClick={() => setDifficulty(d.value)}
                        className={cn(
                          'rounded-xl border px-4 py-4 text-left transition-all',
                          difficulty === d.value
                            ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-950)]'
                            : 'border-[var(--border-color)] hover:border-[var(--color-primary-300)]'
                        )}
                      >
                        <p className={cn('text-sm font-semibold', difficulty === d.value ? 'text-[var(--color-primary-700)] dark:text-[var(--color-primary-300)]' : 'text-[var(--text-primary)]')}>{d.label}</p>
                        <p className={cn('text-xs mt-0.5', difficulty === d.value ? 'text-[var(--color-primary-600)]' : 'text-[var(--text-tertiary)]')}>{d.desc}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {isPending && uploadProgress > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Uploading resume...</span>
                    <span className="font-medium text-[var(--text-primary)]">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
                    <div className="h-full rounded-full bg-[var(--color-primary-500)] transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              {generateMutation.isPending && (
                <div className="flex items-center justify-center gap-3 py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-[var(--color-primary-500)]" />
                  <span className="text-sm text-[var(--text-secondary)]">Analyzing resume and generating questions...</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={!file || !role || isPending} size="lg">
                  <Sparkles className="h-4 w-4" /> {isPending ? 'Processing...' : 'Generate Interview'}
                </Button>
              </div>

              {(createMutation.isError || generateMutation.isError) && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-medium">Error</p>
                    <p className="mt-0.5 opacity-90">
                      {createMutation.error?.response?.data?.message || generateMutation.error?.response?.data?.message || 'Something went wrong. Please try again.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </form>
        )}

        {step === 'interview' && questions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--text-secondary)]">Question {currentQ + 1} of {questions.length}</p>
              <div className="flex gap-1.5">
                {questions.map((_, i) => (
                  <div key={i} className={cn('h-2 w-7 rounded-full transition-colors', i <= currentQ ? 'bg-[var(--color-primary-500)]' : 'bg-[var(--bg-tertiary)]')} />
                ))}
              </div>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-50)] text-[var(--color-primary-600)] dark:bg-[var(--color-primary-950)] dark:text-[var(--color-primary-400)]">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[var(--text-primary)] font-medium">{questions[currentQ].question}</p>
                    {questions[currentQ].category && (
                      <Badge variant="primary" size="xs" className="mt-1.5">{questions[currentQ].category}</Badge>
                    )}
                  </div>
                </div>

                <textarea
                  rows={5}
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)] transition-all resize-y"
                  placeholder="Type your answer..."
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                />

                <div className="flex items-center justify-between">
                  {submitMutation.isPending && (
                    <span className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><InlineSpinner className="h-4 w-4" /> Scoring your answer...</span>
                  )}
                  <div className="flex-1" />
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={!currentAnswer.trim() || submitMutation.isPending}
                  >
                    {currentQ + 1 < questions.length ? <><ChevronRight className="h-4 w-4" /> Next</> : <><Send className="h-4 w-4" /> Submit</>}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {answers.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Previous Answers</p>
                {answers.map((a, i) => (
                  <div key={i} className="rounded-xl border border-[var(--border-color)] p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-[var(--text-primary)] line-clamp-2">Q{i + 1}: {a.question.question}</p>
                      <Badge variant={a.score >= 7 ? 'success' : a.score >= 5 ? 'warning' : 'danger'} size="xs">{a.score}/10</Badge>
                    </div>
                    {a.feedback && <p className="mt-1 text-xs text-[var(--text-tertiary)]">{a.feedback}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'results' && (
          <>
            {completeMutation.isPending && <SkeletonPage />}
            {completeMutation.isError && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-medium">Failed to complete interview</p>
                  <p className="mt-0.5 opacity-90">{completeMutation.error?.response?.data?.message || 'Please try again.'}</p>
                </div>
              </div>
            )}

            {results && (
              <div className="space-y-6 animate-fadeIn">
                <Card>
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex flex-col items-center text-center">
                      <div className={cn(
                        'flex h-24 w-24 items-center justify-center rounded-full',
                        results.percentage >= 70 ? 'bg-green-50 dark:bg-green-950' :
                        results.percentage >= 50 ? 'bg-amber-50 dark:bg-amber-950' :
                        'bg-red-50 dark:bg-red-950'
                      )}>
                        <span className={cn(
                          'text-3xl font-bold',
                          results.percentage >= 70 ? 'text-green-600 dark:text-green-400' :
                          results.percentage >= 50 ? 'text-amber-600 dark:text-amber-400' :
                          'text-red-600 dark:text-red-400'
                        )}>{results.percentage}%</span>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <h2 className="text-xl font-bold text-[var(--text-primary)]">Interview Complete</h2>
                        <Badge variant={results.grade === 'A' || results.grade === 'B' ? 'success' : results.grade === 'C' ? 'warning' : 'danger'} size="md">Grade {results.grade}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">Score: {results.totalScore} / {results.maxTotalScore}</p>
                    </div>
                  </CardContent>
                </Card>

                {results.overallFeedback && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="h-5 w-5 text-[var(--color-primary-500)]" />
                        <h3 className="font-semibold text-[var(--text-primary)]">Overall Feedback</h3>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{results.overallFeedback}</p>
                    </CardContent>
                  </Card>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  {results.topStrengths?.length > 0 && (
                    <Card>
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <h3 className="font-semibold text-[var(--text-primary)]">Strengths</h3>
                        </div>
                        <ul className="space-y-2">
                          {results.topStrengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />{s}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                  {results.areasToImprove?.length > 0 && (
                    <Card>
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <Target className="h-5 w-5 text-amber-500" />
                          <h3 className="font-semibold text-[var(--text-primary)]">Areas to Improve</h3>
                        </div>
                        <ul className="space-y-2">
                          {results.areasToImprove.map((a, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />{a}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-[var(--text-primary)] mb-4">Answer Breakdown</h3>
                    <div className="space-y-3">
                      {answers.map((a, i) => (
                        <div key={i} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-sm font-medium text-[var(--text-primary)]">Q{i + 1}: {a.question.question}</p>
                            <Badge variant={a.score >= 7 ? 'success' : a.score >= 5 ? 'warning' : 'danger'} size="xs">{a.score}/10</Badge>
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] mb-2 line-clamp-2">Your answer: {a.answer}</p>
                          {a.feedback && <p className="text-xs text-[var(--text-tertiary)]">{a.feedback}</p>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex flex-wrap gap-3 pb-4">
                  <Button onClick={handleReset}><Sparkles className="h-4 w-4" /> Start New Interview</Button>
                  <Button variant="outline" onClick={() => { setStep('upload'); setSessionId(null); setQuestions([]); setAnswers([]); setResults(null) }}>Back to Setup</Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

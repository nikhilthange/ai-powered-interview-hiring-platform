import { useState, useRef, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { interviewApi } from '../../services/interviewApi'
import { Card, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { PageSpinner } from '../../components/ui/Spinner'
import {
  Upload, FileText, X, Loader2, ArrowLeft, Send, MessageSquare,
  Sparkles, CheckCircle, AlertCircle, Target, ChevronRight
} from 'lucide-react'
import { Link } from 'react-router-dom'

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
]

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
    mutationFn: (formData) =>
      interviewApi.createSession(formData, (e) => {
        if (e.total) setUploadProgress(Math.round((e.loaded * 100) / e.total))
      }),
    onSuccess: (res) => {
      setUploadProgress(0)
      setSessionId(res.data.session._id)
      generateMutation.mutate(res.data.session._id)
    },
    onError: () => setUploadProgress(0),
  })

  const generateMutation = useMutation({
    mutationFn: (sid) => interviewApi.generateSessionQuestions(sid),
    onSuccess: (res) => {
      setQuestions(res.data.questions)
      setStep('interview')
      setAnswers([])
      setCurrentQ(0)
    },
  })

  const submitMutation = useMutation({
    mutationFn: ({ qId, ans }) => interviewApi.submitAnswer(sessionId, qId, ans),
    onSuccess: (res) => {
      const newAnswers = [...answers, {
        question: questions[currentQ],
        answer: currentAnswer,
        score: res.data.score,
        feedback: res.data.feedback,
        strengths: res.data.strengths,
        improvements: res.data.improvements,
      }]
      setAnswers(newAnswers)
      setCurrentAnswer('')

      if (currentQ + 1 < questions.length) {
        setCurrentQ(currentQ + 1)
      } else {
        completeMutation.mutate(sessionId)
      }
    },
  })

  const completeMutation = useMutation({
    mutationFn: (sid) => interviewApi.completeSession(sid),
    onSuccess: (res) => {
      setResults(res.data)
      setStep('results')
    },
  })

  const handleFileDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer?.files?.[0]
    if (droppedFile && ALLOWED_TYPES.includes(droppedFile.type)) setFile(droppedFile)
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleFileSelect = useCallback((e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && ALLOWED_TYPES.includes(selectedFile.type)) setFile(selectedFile)
  }, [])

  const removeFile = useCallback(() => {
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const role = targetRole === 'custom' ? customRole.trim() : targetRole

  const handleStartInterview = (e) => {
    e.preventDefault()
    if (!file || !role) return
    setUploadProgress(0)
    const formData = new FormData()
    formData.append('resume', file)
    formData.append('targetRole', role)
    formData.append('difficulty', difficulty)
    createMutation.mutate(formData)
  }

  const handleSubmitAnswer = () => {
    if (!currentAnswer.trim() || !questions[currentQ]) return
    submitMutation.mutate({ qId: questions[currentQ]._id, ans: currentAnswer })
  }

  const handleReset = () => {
    setStep('upload')
    setFile(null)
    setTargetRole('')
    setCustomRole('')
    setDifficulty('medium')
    setSessionId(null)
    setQuestions([])
    setCurrentQ(0)
    setCurrentAnswer('')
    setAnswers([])
    setResults(null)
    createMutation.reset()
    generateMutation.reset()
    submitMutation.reset()
    completeMutation.reset()
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const isPending = createMutation.isPending || generateMutation.isPending
  const currentPhase = createMutation.isPending ? 2 : generateMutation.isPending ? 3 : step === 'interview' ? 4 : step === 'results' ? 5 : 0

  const phases = [
    { num: 1, label: 'Upload Resume' },
    { num: 2, label: 'Select Role' },
    { num: 3, label: 'Difficulty' },
    { num: 4, label: 'Interview' },
  ]

  return (
    <div className="space-y-6 page-section">
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Mock Interview</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Upload your resume, choose a role and difficulty level, then practice with AI-generated interview questions.
        </p>
      </div>

      {/* Progress Steps */}
      {step !== 'results' && (
        <div className="flex items-center gap-0">
          {phases.map((p, i) => (
            <div key={p.num} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 ${currentPhase >= p.num ? 'text-[var(--color-primary-600)]' : 'text-[var(--text-tertiary)]'}`}>
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  currentPhase >= p.num
                    ? 'bg-[var(--color-primary-500)] text-white'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
                }`}>
                  {p.num}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${currentPhase >= p.num ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>
                  {p.label}
                </span>
              </div>
              {i < phases.length - 1 && (
                <div className={`mx-2 flex-1 h-px ${currentPhase > p.num ? 'bg-[var(--color-primary-500)]' : 'bg-[var(--border-color)]'}`} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Step 1 & 2: Upload Resume + Select Role */}
      {step === 'upload' && (
        <form onSubmit={handleStartInterview}>
          <div className="space-y-6">
            {/* File Upload */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Step 1: Upload Resume</h2>
                {!file ? (
                  <div
                    onDrop={handleFileDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`cursor-pointer flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
                      dragOver
                        ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]'
                        : 'border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[var(--color-primary-300)]'
                    }`}
                  >
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-tertiary)]">
                      <Upload className="h-7 w-7 text-[var(--text-tertiary)]" />
                    </div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      Drop your resume here, or <span className="text-[var(--color-primary-600)]">browse</span>
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-tertiary)]">Supports PDF and DOCX files (max 5 MB)</p>
                    <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc" onChange={handleFileSelect} className="hidden" />
                  </div>
                ) : (
                  <div className="flex items-center gap-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-50)] text-[var(--color-primary-600)] dark:bg-[var(--color-primary-900)] dark:text-[var(--color-primary-400)]">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[var(--text-primary)]">{file.name}</p>
                      <p className="text-xs text-[var(--text-tertiary)]">{formatFileSize(file.size)}</p>
                    </div>
                    <button type="button" onClick={removeFile} className="rounded-lg p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] transition-colors">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Target Role */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Step 2: Select Target Role</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setTargetRole(r.value)}
                      className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all text-left ${
                        targetRole === r.value
                          ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] text-[var(--color-primary-700)] dark:bg-[var(--color-primary-900)] dark:text-[var(--color-primary-300)]'
                          : 'border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:border-[var(--color-primary-300)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
                {targetRole === 'custom' && (
                  <input
                    type="text"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    placeholder="Enter your target role..."
                    className="mt-3 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] transition-colors"
                  />
                )}
              </CardContent>
            </Card>

            {/* Difficulty */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Step 3: Select Difficulty</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setDifficulty(d.value)}
                      className={`rounded-xl border px-4 py-4 text-left transition-all ${
                        difficulty === d.value
                          ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]'
                          : 'border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[var(--color-primary-300)]'
                      }`}
                    >
                      <p className={`text-sm font-semibold ${difficulty === d.value ? 'text-[var(--color-primary-700)] dark:text-[var(--color-primary-300)]' : 'text-[var(--text-primary)]'}`}>
                        {d.label}
                      </p>
                      <p className={`text-xs mt-0.5 ${difficulty === d.value ? 'text-[var(--color-primary-600)]' : 'text-[var(--text-tertiary)]'}`}>
                        {d.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upload Progress */}
            {isPending && uploadProgress > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Uploading resume...</span>
                  <span className="font-medium text-[var(--text-primary)]">{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
                  <div className="h-full rounded-full bg-[var(--color-primary-500)] transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            {/* Processing */}
            {generateMutation.isPending && (
              <div className="flex items-center justify-center gap-3 py-4">
                <Loader2 className="h-5 w-5 animate-spin text-[var(--color-primary-500)]" />
                <span className="text-sm text-[var(--text-secondary)]">Analyzing your resume and generating questions...</span>
              </div>
            )}

            {/* Submit */}
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={!file || !role || isPending} size="lg" icon={Sparkles}>
                {isPending ? 'Processing...' : 'Generate Interview'}
              </Button>
              {!file && <span className="text-xs text-[var(--text-tertiary)]">Upload a resume to get started</span>}
            </div>

            {/* Error */}
            {(createMutation.isError || generateMutation.isError) && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-medium">Error</p>
                  <p className="mt-0.5 opacity-90">
                    {createMutation.error?.response?.data?.message ||
                     generateMutation.error?.response?.data?.message ||
                     'Something went wrong. Please try again.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </form>
      )}

      {/* Step 4: Interview */}
      {step === 'interview' && questions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--text-secondary)]">
              Question {currentQ + 1} of {questions.length}
            </p>
            <div className="flex gap-1.5">
              {questions.map((_, i) => (
                <div key={i} className={`h-2 w-7 rounded-full transition-colors ${
                  i <= currentQ ? 'bg-[var(--color-primary-500)]' : 'bg-[var(--bg-tertiary)]'
                }`} />
              ))}
            </div>
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-50)] text-[var(--color-primary-600)] dark:bg-[var(--color-primary-900)] dark:text-[var(--color-primary-400)]">
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
                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] transition-colors resize-y"
                placeholder="Type your answer..."
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
              />

              <div className="flex items-center justify-between">
                {submitMutation.isPending && (
                  <span className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Loader2 className="h-4 w-4 animate-spin" /> Scoring your answer...
                  </span>
                )}
                <div className="flex-1" />
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!currentAnswer.trim() || submitMutation.isPending}
                  icon={currentQ + 1 < questions.length ? ChevronRight : Send}
                >
                  {currentQ + 1 < questions.length ? 'Next' : 'Submit'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Previous answer feedback */}
          {answers.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Previous Answers</p>
              {answers.map((a, i) => (
                <div key={i} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-[var(--text-primary)] line-clamp-2">Q{i + 1}: {a.question.question}</p>
                    <Badge variant="primary" size="xs">{a.score}/10</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 5: Results */}
      {step === 'results' && (
        <>
          {completeMutation.isPending && <PageSpinner />}

          {completeMutation.isError && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">Failed to complete interview</p>
                <p className="mt-0.5 opacity-90">{completeMutation.error?.response?.data?.message || 'Please try again.'}</p>
              </div>
            </div>
          )}

          {results && (
            <div className="space-y-6 animate-fadeIn">
              {/* Score */}
              <Card>
                <CardContent className="p-6 sm:p-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]">
                      <span className="text-3xl font-bold text-[var(--color-primary-600)]">{results.percentage}%</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <h2 className="text-xl font-bold text-[var(--text-primary)]">Interview Complete</h2>
                      <Badge variant={results.grade === 'A' || results.grade === 'B' ? 'success' : results.grade === 'C' ? 'warning' : 'danger'} size="md">
                        Grade {results.grade}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      Score: {results.totalScore} / {results.maxTotalScore}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Overall Feedback */}
              {results.overallFeedback && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-5 w-5 text-[var(--color-primary-600)]" />
                      <h3 className="font-semibold text-[var(--text-primary)]">Overall Feedback</h3>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{results.overallFeedback}</p>
                  </CardContent>
                </Card>
              )}

              {/* Strengths & Areas to Improve */}
              <div className="grid gap-4 sm:grid-cols-2">
                {results.topStrengths?.length > 0 && (
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <h3 className="font-semibold text-[var(--text-primary)]">Strengths</h3>
                      </div>
                      <ul className="space-y-2">
                        {results.topStrengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                            {s}
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
                        <Target className="h-5 w-5 text-amber-600" />
                        <h3 className="font-semibold text-[var(--text-primary)]">Areas to Improve</h3>
                      </div>
                      <ul className="space-y-2">
                        {results.areasToImprove.map((a, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                            {a}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Per-question breakdown */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-[var(--text-primary)] mb-4">Answer Breakdown</h3>
                  <div className="space-y-3">
                    {answers.map((a, i) => (
                      <div key={i} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-sm font-medium text-[var(--text-primary)]">Q{i + 1}: {a.question.question}</p>
                          <Badge variant="primary" size="xs">{a.score}/10</Badge>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] mb-2">Your answer: {a.answer}</p>
                        {a.feedback && (
                          <p className="text-xs text-[var(--text-tertiary)]">{a.feedback}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pb-4">
                <Button onClick={handleReset} icon={Sparkles}>Start New Interview</Button>
                <Button variant="outline" onClick={() => { setStep('upload'); setSessionId(null); setQuestions([]); setAnswers([]); setResults(null); }}>
                  Back to Setup
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

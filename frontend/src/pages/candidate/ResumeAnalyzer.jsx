import { motion } from 'framer-motion'
import { useState, useRef, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { analysisApi } from '../../services/analysisApi'
import { Card, CardContent } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { cn } from '../../lib/utils'
import { Upload, FileText, AlertCircle, CheckCircle, Star, Award, X, Loader2, Sparkles, ArrowUpRight, Download, Zap, Target } from 'lucide-react'
import { Link } from 'react-router-dom'

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
]

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [jobDescription, setJobDescription] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef(null)

  const { mutate, data, isPending, isError, error, reset } = useMutation({
    mutationFn: (formData) =>
      analysisApi.analyzeResumeUpload(formData, (e) => {
        if (e.total) setUploadProgress(Math.round((e.loaded * 100) / e.total))
      }).then((r) => r.data),
    onSuccess: () => setUploadProgress(0),
    onError: () => setUploadProgress(0),
  })

  const handleFileDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer?.files?.[0]
    if (droppedFile && ALLOWED_TYPES.includes(droppedFile.type)) setFile(droppedFile)
  }, [])

  const handleDragOver = useCallback((e) => { e.preventDefault(); setDragOver(true) }, [])
  const handleDragLeave = useCallback((e) => { e.preventDefault(); setDragOver(false) }, [])
  const handleFileSelect = useCallback((e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && ALLOWED_TYPES.includes(selectedFile.type)) setFile(selectedFile)
  }, [])
  const removeFile = useCallback(() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!file || !jobDescription.trim()) return
    setUploadProgress(0)
    const formData = new FormData()
    formData.append('resume', file)
    formData.append('jobDescription', jobDescription.trim())
    mutate(formData)
  }

  const result = data?.data

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-6"
    >
      <motion.div variants={itemVariants}>
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-6">
          <ArrowUpRight className="h-4 w-4" /> Back to dashboard
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Resume Analyzer</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Upload your resume and paste a job description to get an instant ATS score and detailed AI-powered feedback.
          </p>
        </div>
      </motion.div>

      {!result && (
        <motion.form
          variants={itemVariants}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <Card>
            <CardContent className="p-6">
              <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Upload Resume</h2>
              {!file ? (
                <div
                  onDrop={handleFileDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'cursor-pointer flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-200',
                    dragOver
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 scale-[1.01]'
                      : 'border-[var(--border-color)] hover:border-indigo-300 hover:bg-[var(--bg-tertiary)]'
                  )}
                >
                  <motion.div
                    animate={dragOver ? { y: -5, scale: 1.1 } : {}}
                    className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900"
                  >
                    <Upload className="h-8 w-8 text-indigo-500" />
                  </motion.div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Drop your resume here, or <span className="text-indigo-600">browse files</span>
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-tertiary)]">PDF, DOC, or DOCX (max 5 MB)</p>
                  <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc" onChange={handleFileSelect} className="hidden" />
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 rounded-xl border border-[var(--border-color)] p-4"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--text-primary)]">{file.name}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{formatFileSize(file.size)}</p>
                  </div>
                  <button type="button" onClick={removeFile} className="rounded-lg p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </motion.div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <label htmlFor="jobDescription" className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                Job Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="jobDescription"
                rows={6}
                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)] transition-all resize-y"
                placeholder="Paste the full job description here for accurate ATS matching..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <p className="mt-1 text-xs text-[var(--text-tertiary)]">{jobDescription.length} characters</p>
            </CardContent>
          </Card>

          {isPending && uploadProgress > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Uploading...</span>
                <span className="font-medium text-[var(--text-primary)]">{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          {isPending && uploadProgress === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center gap-4 py-10"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 className="h-8 w-8 text-indigo-500" />
              </motion.div>
              <div className="text-center">
                <p className="text-sm font-medium text-[var(--text-primary)]">Analyzing your resume with AI</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">Checking ATS compatibility, skills, and more...</p>
              </div>
            </motion.div>
          )}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={!file || !jobDescription.trim() || isPending} size="lg">
              <Sparkles className="h-4 w-4" /> {isPending ? 'Analyzing...' : 'Analyze Resume'}
            </Button>
          </div>

          {isError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">Analysis Failed</p>
                <p className="mt-0.5 opacity-90">{error?.response?.data?.message || 'Unable to analyze resume. Please try again.'}</p>
              </div>
            </motion.div>
          )}
        </motion.form>
      )}

      {result && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="relative mx-auto mb-4">
                    <svg className="w-24 h-24 mx-auto" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="var(--bg-tertiary)" strokeWidth="8" />
                      <circle
                        cx="50" cy="50" r="42"
                        fill="none"
                        stroke={result.atsScore >= 80 ? '#22c55e' : result.atsScore >= 60 ? '#f59e0b' : '#ef4444'}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 42 * result.atsScore / 100} ${2 * Math.PI * 42 * (100 - result.atsScore) / 100}`}
                        transform="rotate(-90 50 50)"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={cn(
                        'text-2xl font-bold',
                        result.atsScore >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                        result.atsScore >= 60 ? 'text-amber-600 dark:text-amber-400' :
                        'text-red-600 dark:text-red-400'
                      )}>
                        {result.atsScore}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">ATS Score</p>
                  <p className="text-xs text-[var(--text-tertiary)]">out of 100</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 mb-4">
                    <CheckCircle className={cn(
                      'h-10 w-10',
                      result.matchPercent >= 80 ? 'text-emerald-500' :
                      result.matchPercent >= 60 ? 'text-amber-500' :
                      'text-red-500'
                    )} />
                  </div>
                  <p className={cn(
                    'text-4xl font-bold',
                    result.matchPercent >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                    result.matchPercent >= 60 ? 'text-amber-600 dark:text-amber-400' :
                    'text-red-600 dark:text-red-400'
                  )}>{result.matchPercent}%</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">Match Percent</p>
                  <p className="text-xs text-[var(--text-tertiary)]">job requirement match</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {result.aiAnalysis?.strengths?.length > 0 && (
              <motion.div variants={itemVariants}>
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <h3 className="font-semibold text-[var(--text-primary)]">Strengths</h3>
                    </div>
                    <ul className="space-y-2">
                      {result.aiAnalysis.strengths.map((s, i) => (
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
            {result.aiAnalysis?.weaknesses?.length > 0 && (
              <motion.div variants={itemVariants}>
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400">
                        <AlertCircle className="h-4 w-4" />
                      </div>
                      <h3 className="font-semibold text-[var(--text-primary)]">Weaknesses</h3>
                    </div>
                    <ul className="space-y-2">
                      {result.aiAnalysis.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {result.missingSkills?.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                      <Target className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold text-[var(--text-primary)]">Missing Skills</h3>
                    <Badge variant="warning" size="xs">{result.missingSkills.length}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.missingSkills.map((skill, i) => (
                      <Badge key={i} variant="warning" size="md">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {result.improvements?.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                      <FileText className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold text-[var(--text-primary)]">Resume Improvements</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.improvements.map((imp, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                        {imp}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {result.suggestedProjects?.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                      <Zap className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold text-[var(--text-primary)]">Suggested Projects</h3>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {result.suggestedProjects.map((project, i) => (
                      <div key={i} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 hover:bg-[var(--bg-tertiary)] transition-colors">
                        <p className="font-medium text-sm text-[var(--text-primary)]">{project.title}</p>
                        <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">{project.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {result.suggestedCertifications?.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                      <Award className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold text-[var(--text-primary)]">Suggested Certifications</h3>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {result.suggestedCertifications.map((cert, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 hover:bg-[var(--bg-tertiary)] transition-colors">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                          <Award className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--text-primary)]">{cert.name}</p>
                          {cert.provider && <p className="text-xs text-[var(--text-tertiary)]">{cert.provider}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {result.aiAnalysis?.interviewTips?.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                      <Star className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold text-[var(--text-primary)]">Interview Tips</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.aiAnalysis.interviewTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div variants={itemVariants} className="flex justify-center gap-3 pb-4">
            <Button variant="outline" onClick={reset}>
              Analyze Another Resume
            </Button>
            <Button variant="primary">
              <Download className="h-4 w-4" />
              Export PDF Report
            </Button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}

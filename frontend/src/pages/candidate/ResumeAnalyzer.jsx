import { useState, useRef, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { analysisApi } from '../../services/analysisApi'
import { Card, CardContent } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { cn } from '../../lib/utils'
import { Upload, FileText, AlertCircle, CheckCircle, Briefcase, Star, Award, X, Loader2, Sparkles, ArrowUpRight } from 'lucide-react'
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
    <div className="page-section">
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-6">
        <ArrowUpRight className="h-4 w-4" /> Back to dashboard
      </Link>

      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Resume Analyzer</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Upload your resume and a job description to get an instant ATS score and detailed AI feedback.
          </p>
        </div>

        {!result && (
          <form onSubmit={handleSubmit} className="space-y-6">
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
                      'cursor-pointer flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors',
                      dragOver
                        ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-950)]'
                        : 'border-[var(--border-color)] hover:border-[var(--color-primary-300)] hover:bg-[var(--bg-tertiary)]'
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
                    <button type="button" onClick={removeFile} className="rounded-lg p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] transition-colors">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
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
                <p className="mt-1 text-xs text-[var(--text-tertiary)]">{jobDescription.length} characters — longer descriptions yield better analysis</p>
              </CardContent>
            </Card>

            {isPending && uploadProgress > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Uploading...</span>
                  <span className="font-medium text-[var(--text-primary)]">{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
                  <div className="h-full rounded-full bg-[var(--color-primary-500)] transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            {isPending && uploadProgress === 0 && (
              <div className="flex items-center justify-center gap-3 py-6">
                <Loader2 className="h-5 w-5 animate-spin text-[var(--color-primary-500)]" />
                <span className="text-sm text-[var(--text-secondary)]">Analyzing your resume with AI...</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={!file || !jobDescription.trim() || isPending} size="lg">
                <Sparkles className="h-4 w-4" /> {isPending ? 'Analyzing...' : 'Analyze Resume'}
              </Button>
            </div>

            {isError && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-medium">Analysis Failed</p>
                  <p className="mt-0.5 opacity-90">{error?.response?.data?.message || 'Unable to analyze resume. Please try again.'}</p>
                </div>
              </div>
            )}
          </form>
        )}

        {result && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className={cn(
                    'mx-auto flex h-16 w-16 items-center justify-center rounded-2xl',
                    result.atsScore >= 80 ? 'bg-green-50 dark:bg-green-950' :
                    result.atsScore >= 60 ? 'bg-amber-50 dark:bg-amber-950' :
                    'bg-red-50 dark:bg-red-950'
                  )}>
                    <Star className={cn(
                      'h-8 w-8',
                      result.atsScore >= 80 ? 'text-green-500' :
                      result.atsScore >= 60 ? 'text-amber-500' :
                      'text-red-500'
                    )} />
                  </div>
                  <p className="mt-3 text-sm text-[var(--text-secondary)]">ATS Score</p>
                  <p className={cn(
                    'text-4xl font-bold',
                    result.atsScore >= 80 ? 'text-green-600 dark:text-green-400' :
                    result.atsScore >= 60 ? 'text-amber-600 dark:text-amber-400' :
                    'text-red-600 dark:text-red-400'
                  )}>{result.atsScore}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">/100</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className={cn(
                    'mx-auto flex h-16 w-16 items-center justify-center rounded-2xl',
                    result.matchPercent >= 80 ? 'bg-green-50 dark:bg-green-950' :
                    result.matchPercent >= 60 ? 'bg-amber-50 dark:bg-amber-950' :
                    'bg-red-50 dark:bg-red-950'
                  )}>
                    <CheckCircle className={cn(
                      'h-8 w-8',
                      result.matchPercent >= 80 ? 'text-green-500' :
                      result.matchPercent >= 60 ? 'text-amber-500' :
                      'text-red-500'
                    )} />
                  </div>
                  <p className="mt-3 text-sm text-[var(--text-secondary)]">Match Percent</p>
                  <p className={cn(
                    'text-4xl font-bold',
                    result.matchPercent >= 80 ? 'text-green-600 dark:text-green-400' :
                    result.matchPercent >= 60 ? 'text-amber-600 dark:text-amber-400' :
                    'text-red-600 dark:text-red-400'
                  )}>{result.matchPercent}%</p>
                  <p className="text-xs text-[var(--text-tertiary)]">job requirement match</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {result.aiAnalysis?.strengths?.length > 0 && (
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <h3 className="font-semibold text-[var(--text-primary)]">Strengths</h3>
                    </div>
                    <ul className="space-y-2">
                      {result.aiAnalysis.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              {result.aiAnalysis?.weaknesses?.length > 0 && (
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="h-5 w-5 text-red-500" />
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
              )}
            </div>

            {result.missingSkills?.length > 0 && (
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Briefcase className="h-5 w-5 text-amber-500" />
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
            )}

            {result.improvements?.length > 0 && (
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-5 w-5 text-blue-500" />
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
            )}

            {result.suggestedProjects?.length > 0 && (
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="h-5 w-5 text-purple-500" />
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
            )}

            {result.suggestedCertifications?.length > 0 && (
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="h-5 w-5 text-[var(--color-primary-500)]" />
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
            )}

            {result.aiAnalysis?.interviewTips?.length > 0 && (
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="h-5 w-5 text-[var(--color-primary-500)]" />
                    <h3 className="font-semibold text-[var(--text-primary)]">Interview Tips</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.aiAnalysis.interviewTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary-500)]" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-center pb-4">
              <Button variant="outline" onClick={reset}>Analyze Another Resume</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

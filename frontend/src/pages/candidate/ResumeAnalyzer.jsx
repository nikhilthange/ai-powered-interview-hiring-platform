import { useState, useRef, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { analysisApi } from '../../services/analysisApi'
import { Card, CardContent } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { Upload, FileText, AlertCircle, CheckCircle, Briefcase, Star, ArrowUpRight, Award, X, Loader2 } from 'lucide-react'
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
    if (droppedFile && ALLOWED_TYPES.includes(droppedFile.type)) {
      setFile(droppedFile)
    }
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
    if (selectedFile && ALLOWED_TYPES.includes(selectedFile.type)) {
      setFile(selectedFile)
    }
  }, [])

  const removeFile = useCallback(() => {
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

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
    <div className="space-y-6 page-section">
      <div>
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-4">
          <ArrowUpRight className="h-4 w-4" /> Back to dashboard
        </Link>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Resume Analyzer</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Upload your resume (PDF or DOCX) and a job description to get an instant ATS score and detailed feedback.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload Zone */}
        <Card>
          <CardContent className="p-6">
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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileSelect}
                  className="hidden"
                />
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
                <button
                  type="button"
                  onClick={removeFile}
                  className="rounded-lg p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Job Description */}
        <Card>
          <CardContent className="p-6">
            <label htmlFor="jobDescription" className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
              Job Description
            </label>
            <textarea
              id="jobDescription"
              rows={6}
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] transition-colors resize-y"
              placeholder="Paste the job description here for ATS matching..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--text-tertiary)]">
              For best results, provide a complete job description (at least 50 characters).
            </p>
          </CardContent>
        </Card>

        {/* Upload Progress */}
        {isPending && uploadProgress > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Uploading...</span>
              <span className="font-medium text-[var(--text-primary)]">{uploadProgress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
              <div
                className="h-full rounded-full bg-[var(--color-primary-500)] transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Processing Indicator */}
        {isPending && uploadProgress === 0 && (
          <div className="flex items-center justify-center gap-3 py-4">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--color-primary-500)]" />
            <span className="text-sm text-[var(--text-secondary)]">Analyzing your resume...</span>
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={!file || !jobDescription.trim() || isPending} size="lg">
            {isPending ? 'Analyzing...' : 'Analyze Resume'}
          </Button>
          {!file && <span className="text-xs text-[var(--text-tertiary)]">Upload a resume to get started</span>}
        </div>
      </form>

      {/* Error */}
      {isError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">Analysis Failed</p>
            <p className="mt-0.5 opacity-90">{error?.response?.data?.message || 'Unable to analyze resume. Please try again.'}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Score Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary-50)] text-[var(--color-primary-600)] dark:bg-[var(--color-primary-900)] dark:text-[var(--color-primary-400)]">
                  <Star className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm text-[var(--text-secondary)]">ATS Score</p>
                <p className="text-4xl font-bold text-[var(--color-primary-600)]">{result.atsScore}</p>
                <p className="text-xs text-[var(--text-tertiary)]">/100</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm text-[var(--text-secondary)]">Match Percent</p>
                <p className="text-4xl font-bold text-green-600">{result.matchPercent}%</p>
                <p className="text-xs text-[var(--text-tertiary)]">job requirement match</p>
              </CardContent>
            </Card>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid gap-4 sm:grid-cols-2">
            {result.aiAnalysis?.strengths?.length > 0 && (
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
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
                    <AlertCircle className="h-5 w-5 text-red-600" />
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

          {/* Missing Skills */}
          {result.missingSkills?.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="h-5 w-5 text-amber-600" />
                  <h3 className="font-semibold text-[var(--text-primary)]">Missing Skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.missingSkills.map((skill, i) => (
                    <Badge key={i} variant="warning" size="md">{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resume Improvements */}
          {result.improvements?.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-blue-600" />
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

          {/* Suggested Projects */}
          {result.suggestedProjects?.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-[var(--text-primary)]">Suggested Projects</h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {result.suggestedProjects.map((project, i) => (
                    <div key={i} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                      <p className="font-medium text-sm text-[var(--text-primary)]">{project.title}</p>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">{project.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Suggested Certifications */}
          {result.suggestedCertifications?.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-5 w-5 text-[var(--color-primary-600)]" />
                  <h3 className="font-semibold text-[var(--text-primary)]">Suggested Certifications</h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {result.suggestedCertifications.map((cert, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                        <Award className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)]">{cert.name}</p>
                        <p className="text-xs text-[var(--text-tertiary)]">{cert.provider}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Interview Tips */}
          {result.aiAnalysis?.interviewTips?.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-[var(--color-primary-600)]" />
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

          {/* Try Again */}
          <div className="flex justify-center pb-4">
            <Button variant="outline" onClick={reset}>
              Analyze Another Resume
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

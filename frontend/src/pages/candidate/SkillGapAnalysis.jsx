import { useState, useRef, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { analysisApi } from '../../services/analysisApi'
import { Card, CardContent } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { ArrowLeft, Upload, FileText, X, Loader2, CheckCircle, XCircle, Target, GraduationCap, BookOpen, Zap, Clock, Bookmark } from 'lucide-react'
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

export default function SkillGapAnalysis() {
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [targetRole, setTargetRole] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef(null)

  const { mutate, data, isPending, isError, error, reset } = useMutation({
    mutationFn: (formData) =>
      analysisApi.skillGapUpload(formData, (e) => {
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
    if (!file || !targetRole.trim()) return
    setUploadProgress(0)
    const formData = new FormData()
    formData.append('resume', file)
    formData.append('targetRole', targetRole.trim())
    mutate(formData)
  }

  const result = data?.data

  return (
    <div className="space-y-6 page-section">
      <div>
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Skill Gap Analysis</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Upload your resume and select a target role to identify skill gaps and get a personalized learning roadmap.
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
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
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

        {/* Target Role */}
        <Card>
          <CardContent className="p-6">
            <label htmlFor="targetRole" className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
              Target Role
            </label>
            <input
              id="targetRole"
              type="text"
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] transition-colors"
              placeholder="e.g. Senior Full Stack Developer"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--text-tertiary)]">
              Enter the role you want to transition into for accurate gap analysis.
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

        {/* Processing */}
        {isPending && uploadProgress === 0 && (
          <div className="flex items-center justify-center gap-3 py-4">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--color-primary-500)]" />
            <span className="text-sm text-[var(--text-secondary)]">Analyzing skill gap...</span>
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={!file || !targetRole.trim() || isPending} size="lg">
            {isPending ? 'Analyzing...' : 'Analyze Skill Gap'}
          </Button>
          {!file && <span className="text-xs text-[var(--text-tertiary)]">Upload a resume to get started</span>}
        </div>
      </form>

      {/* Error */}
      {isError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">Analysis Failed</p>
            <p className="mt-0.5 opacity-90">{error?.response?.data?.message || 'Unable to analyze skill gap. Please try again.'}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Gap Analysis */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="h-5 w-5 text-[var(--color-primary-600)]" />
                <h2 className="font-semibold text-[var(--text-primary)]">Gap Analysis</h2>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{result.gapAnalysis}</p>
            </CardContent>
          </Card>

          {/* Current Skills & Missing Skills */}
          <div className="grid gap-4 sm:grid-cols-2">
            {result.currentSkills?.length > 0 && (
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-[var(--text-primary)]">Current Skills</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.currentSkills.map((skill, i) => (
                      <Badge key={i} variant="success" size="md">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {result.missingSkills?.length > 0 && (
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <h3 className="font-semibold text-[var(--text-primary)]">Missing Skills</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.missingSkills.map((skill, i) => (
                      <Badge key={i} variant="danger" size="md">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recommendations */}
          {result.recommendations?.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-5 w-5 text-amber-600" />
                  <h3 className="font-semibold text-[var(--text-primary)]">Recommendations</h3>
                </div>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Learning Roadmap */}
          {result.learningRoadmap && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="h-5 w-5 text-[var(--color-primary-600)]" />
                  <h2 className="font-semibold text-[var(--text-primary)]">Learning Roadmap</h2>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-6">{result.learningRoadmap.overview}</p>

                <div className="space-y-4">
                  {result.learningRoadmap.phases.map((phase, i) => (
                    <div key={i} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-700)] text-xs font-bold dark:bg-[var(--color-primary-900)] dark:text-[var(--color-primary-300)]">
                              {i + 1}
                            </div>
                            <h3 className="font-semibold text-[var(--text-primary)]">{phase.title}</h3>
                          </div>
                          <p className="mt-1 text-xs text-[var(--text-tertiary)]">{phase.focus}</p>
                        </div>
                        <Badge variant="primary" size="sm" icon={Clock}>{phase.duration}</Badge>
                      </div>

                      {/* Skills to learn */}
                      <div className="mb-3">
                        <p className="text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wide">Skills to Learn</p>
                        <div className="flex flex-wrap gap-1.5">
                          {phase.skillsToLearn.map((skill, j) => (
                            <Badge key={j} variant="default" size="sm">{skill}</Badge>
                          ))}
                        </div>
                      </div>

                      {/* Resources */}
                      {phase.resources?.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wide">Resources</p>
                          <div className="space-y-1.5">
                            {phase.resources.map((res, j) => (
                              <a
                                key={j}
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-colors"
                              >
                                <Bookmark className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{res.name}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Milestones */}
                      {phase.milestones?.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wide">Milestones</p>
                          <ul className="space-y-1">
                            {phase.milestones.map((m, j) => (
                              <li key={j} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                                <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                                {m}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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

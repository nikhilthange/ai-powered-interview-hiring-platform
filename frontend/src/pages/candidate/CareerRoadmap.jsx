import { useState, useRef, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { interviewApi } from '../../services/interviewApi'
import Button from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { SkeletonPage } from '../../components/ui/Skeleton'
import { cn } from '../../lib/utils'
import { ArrowLeft, Target, Clock, Upload, FileText, X, AlertCircle, Sparkles, BookOpen, Zap, Bookmark } from 'lucide-react'
import { Link } from 'react-router-dom'

const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function CareerRoadmap() {
  const [mode, setMode] = useState('manual')
  const [skills, setSkills] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef(null)

  const manualMutation = useMutation({
    mutationFn: (payload) => interviewApi.careerRoadmap(payload).then((r) => r.data),
  })

  const uploadMutation = useMutation({
    mutationFn: (formData) =>
      interviewApi.careerRoadmapUpload(formData, (e) => {
        if (e.total) setUploadProgress(Math.round((e.loaded * 100) / e.total))
      }),
    onSuccess: () => setUploadProgress(0),
    onError: () => setUploadProgress(0),
  })

  const isPending = manualMutation.isPending || uploadMutation.isPending
  const isError = manualMutation.isError || uploadMutation.isError
  const error = manualMutation.error || uploadMutation.error
  const roadmap = manualMutation.data?.data?.roadmap || uploadMutation.data?.data?.roadmap

  const handleFileDrop = useCallback((e) => { e.preventDefault(); setDragOver(false); const df = e.dataTransfer?.files?.[0]; if (df && ALLOWED_TYPES.includes(df.type)) setFile(df) }, [])
  const handleFileSelect = useCallback((e) => { const f = e.target.files?.[0]; if (f && ALLOWED_TYPES.includes(f.type)) setFile(f) }, [])
  const removeFile = useCallback(() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (mode === 'manual') {
      const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean)
      if (skillsArray.length === 0 || !targetRole.trim()) return
      manualMutation.mutate({ skills: skillsArray, targetRole: targetRole.trim() })
    } else {
      if (!file || !targetRole.trim()) return
      setUploadProgress(0)
      const formData = new FormData()
      formData.append('resume', file); formData.append('targetRole', targetRole.trim())
      uploadMutation.mutate(formData)
    }
  }

  const handleReset = () => {
    manualMutation.reset(); uploadMutation.reset(); setSkills(''); setTargetRole(''); setFile(null); setUploadProgress(0)
  }

  return (
    <div className="page-section">
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Career Roadmap</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Get a personalized phased learning plan to reach your career goals.
          </p>
        </div>

        {!roadmap && (
          <>
            <div className="flex gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-1">
              <button
                onClick={() => setMode('manual')}
                className={cn('flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all', mode === 'manual' ? 'bg-[var(--color-primary-500)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]')}
              >
                Manual Entry
              </button>
              <button
                onClick={() => setMode('upload')}
                className={cn('flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all', mode === 'upload' ? 'bg-[var(--color-primary-500)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]')}
              >
                Upload Resume
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <label htmlFor="targetRole" className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Target Role <span className="text-red-500">*</span></label>
                    <input
                      id="targetRole" type="text"
                      className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)] transition-all"
                      placeholder="e.g. Senior Full Stack Developer"
                      value={targetRole} onChange={(e) => setTargetRole(e.target.value)}
                    />
                  </div>

                  {mode === 'manual' ? (
                    <div>
                      <label htmlFor="skills" className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Current Skills <span className="text-red-500">*</span></label>
                      <input
                        id="skills" type="text"
                        className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)] transition-all"
                        placeholder="e.g. JavaScript, Node.js, React, MongoDB"
                        value={skills} onChange={(e) => setSkills(e.target.value)}
                      />
                      <p className="mt-1 text-xs text-[var(--text-tertiary)]">Separate skills with commas</p>
                    </div>
                  ) : (
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Upload Resume <span className="text-red-500">*</span></label>
                      {!file ? (
                        <div
                          onDrop={handleFileDrop}
                          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                          onDragLeave={(e) => { e.preventDefault(); setDragOver(false) }}
                          onClick={() => fileInputRef.current?.click()}
                          className={cn(
                            'cursor-pointer flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors',
                            dragOver ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-950)]' : 'border-[var(--border-color)] hover:border-[var(--color-primary-300)]'
                          )}
                        >
                          <Upload className="mx-auto h-8 w-8 text-[var(--text-tertiary)]" />
                          <p className="mt-2 text-sm text-[var(--text-secondary)]">Drop your resume here, or <span className="text-[var(--color-primary-600)]">browse</span></p>
                          <p className="mt-1 text-xs text-[var(--text-tertiary)]">PDF or DOCX (max 5 MB)</p>
                          <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc" onChange={handleFileSelect} className="hidden" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4">
                          <FileText className="h-8 w-8 text-[var(--color-primary-500)]" />
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium text-[var(--text-primary)]">{file.name}</p>
                            <p className="text-xs text-[var(--text-tertiary)]">{formatFileSize(file.size)}</p>
                          </div>
                          <button type="button" onClick={removeFile} className="rounded p-1 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"><X className="h-5 w-5" /></button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {uploadMutation.isPending && uploadProgress > 0 && (
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

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={isPending} size="lg">
                  <Sparkles className="h-4 w-4" /> {isPending ? 'Generating...' : 'Generate Roadmap'}
                </Button>
              </div>

              {isPending && !uploadMutation.isPending && <SkeletonPage />}

              {isError && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-medium">Generation Failed</p>
                    <p className="mt-0.5 opacity-90">{error?.response?.data?.message || 'Failed to generate roadmap.'}</p>
                  </div>
                </div>
              )}
            </form>
          </>
        )}

        {roadmap && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary-50)] text-[var(--color-primary-600)] dark:bg-[var(--color-primary-950)] dark:text-[var(--color-primary-400)]">
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-[var(--text-primary)]">Target: {roadmap.role}</h2>
                    <div className="flex items-center gap-2 mt-0.5 text-sm text-[var(--text-secondary)]">
                      <Clock className="h-4 w-4" />
                      Estimated time: {roadmap.estimatedMonths} months
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {roadmap.phases?.map((phase, i) => (
              <Card key={i}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-700)] text-xs font-bold dark:bg-[var(--color-primary-900)] dark:text-[var(--color-primary-300)]">{i + 1}</div>
                      <h3 className="font-semibold text-[var(--text-primary)]">{phase.title}</h3>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary-700)] dark:bg-[var(--color-primary-950)] dark:text-[var(--color-primary-300)] px-2.5 py-1 text-xs font-medium"><Clock className="h-3 w-3" />{phase.duration}</span>
                  </div>

                  {phase.skillsToLearn?.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">Skills to Learn</p>
                      <div className="flex flex-wrap gap-2">
                        {phase.skillsToLearn.map((s, j) => <Badge key={j} variant="default" size="sm">{s}</Badge>)}
                      </div>
                    </div>
                  )}

                  {phase.recommendedResources?.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">Recommended Resources</p>
                      <ul className="space-y-1.5">
                        {phase.recommendedResources.map((r, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                            <Bookmark className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--text-tertiary)]" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {phase.milestones?.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">Milestones</p>
                      <ul className="space-y-1.5">
                        {phase.milestones.map((m, j) => (
                          <li key={j} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                            <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-center pb-4">
              <Button variant="outline" onClick={handleReset}>Generate New Roadmap</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

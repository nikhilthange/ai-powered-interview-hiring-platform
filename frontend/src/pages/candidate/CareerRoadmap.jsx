import { useState, useRef, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { interviewApi } from '../../services/interviewApi'
import Button from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { PageSpinner } from '../../components/ui/Spinner'
import { ArrowLeft, Target, Clock, Upload, FileText, X, AlertCircle } from 'lucide-react'
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

  const handleFileDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer?.files?.[0]
    if (droppedFile && ALLOWED_TYPES.includes(droppedFile.type)) {
      setFile(droppedFile)
    }
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
    if (mode === 'manual') {
      const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean)
      if (skillsArray.length === 0 || !targetRole.trim()) return
      manualMutation.mutate({ skills: skillsArray, targetRole: targetRole.trim() })
    } else {
      if (!file || !targetRole.trim()) return
      setUploadProgress(0)
      const formData = new FormData()
      formData.append('resume', file)
      formData.append('targetRole', targetRole.trim())
      uploadMutation.mutate(formData)
    }
  }

  const handleReset = () => {
    manualMutation.reset()
    uploadMutation.reset()
    setSkills('')
    setTargetRole('')
    setFile(null)
    setUploadProgress(0)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 page-section">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

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
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${mode === 'manual' ? 'bg-[var(--color-primary-500)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              Manual Entry
            </button>
            <button
              onClick={() => setMode('upload')}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${mode === 'upload' ? 'bg-[var(--color-primary-500)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              Upload Resume
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-6">
            <div>
              <label htmlFor="targetRole" className="mb-1 block text-sm font-medium text-[var(--text-primary)]">Target Role</label>
              <input
                id="targetRole"
                type="text"
                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] transition-colors"
                placeholder="e.g. Senior Full Stack Developer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </div>

            {mode === 'manual' ? (
              <div>
                <label htmlFor="skills" className="mb-1 block text-sm font-medium text-[var(--text-primary)]">Current Skills (comma-separated)</label>
                <input
                  id="skills"
                  type="text"
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] transition-colors"
                  placeholder="e.g. JavaScript, Node.js, React, MongoDB"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">Upload Resume</label>
                {!file ? (
                  <div
                    onDrop={handleFileDrop}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={(e) => { e.preventDefault(); setDragOver(false) }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`cursor-pointer flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors ${dragOver ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]' : 'border-[var(--border-color)] hover:border-[var(--color-primary-300)]'}`}
                  >
                    <Upload className="mx-auto h-8 w-8 text-[var(--text-tertiary)]" />
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">
                      Drop your resume here, or <span className="text-[var(--color-primary-600)]">browse</span>
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-tertiary)]">PDF or DOCX (max 5 MB)</p>
                    <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc" onChange={handleFileSelect} className="hidden" />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-3">
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

            {uploadMutation.isPending && uploadProgress > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Uploading...</span>
                  <span className="font-medium text-[var(--text-primary)]">{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
                  <div className="h-full rounded-full bg-[var(--color-primary-500)] transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            <Button type="submit" disabled={isPending}>{isPending ? 'Generating...' : 'Generate Roadmap'}</Button>
          </form>

          {isPending && <PageSpinner />}

          {isError && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">Generation Failed</p>
                <p className="mt-0.5 opacity-90">{error?.response?.data?.message || 'Failed to generate roadmap.'}</p>
              </div>
            </div>
          )}
        </>
      )}

      {roadmap && (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-[var(--color-primary-600)]" />
                <h2 className="font-semibold text-[var(--text-primary)]">Target: {roadmap.role}</h2>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <Clock className="h-4 w-4" />
                Estimated time: {roadmap.estimatedMonths} months
              </div>
            </CardContent>
          </Card>

          {roadmap.phases?.map((phase, i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-700)] text-xs font-bold dark:bg-[var(--color-primary-900)] dark:text-[var(--color-primary-300)]">{i + 1}</div>
                    <h3 className="font-semibold text-[var(--text-primary)]">{phase.title}</h3>
                  </div>
                  <Badge variant="primary" size="sm">{phase.duration}</Badge>
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">Skills to learn</p>
                  <div className="flex flex-wrap gap-2">
                    {phase.skillsToLearn?.map((s, j) => (
                      <Badge key={j} variant="default" size="sm">{s}</Badge>
                    ))}
                  </div>
                </div>

                {phase.recommendedResources?.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">Recommended resources</p>
                    <ul className="space-y-1">
                      {phase.recommendedResources.map((r, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary-500)]" /> {r}
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
  )
}

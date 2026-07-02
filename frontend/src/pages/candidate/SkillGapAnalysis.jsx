import { motion } from 'framer-motion'
import { useState, useRef, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { analysisApi } from '../../services/analysisApi'
import { Card, CardContent } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { cn } from '../../lib/utils'
import { Upload, FileText, X, CheckCircle, XCircle, Target, BookOpen, Zap, Clock, ArrowLeft, Sparkles, AlertTriangle, Award, TrendingUp, Brain, Briefcase } from 'lucide-react'
import { Link } from 'react-router-dom'

const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const roles = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Data Scientist', 'DevOps Engineer', 'Product Manager', 'UI/UX Designer',
  'Machine Learning Engineer', 'Cloud Architect', 'Cybersecurity Analyst', 'Mobile Developer',
]

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
    if (!file || !targetRole) return
    setUploadProgress(0)
    const formData = new FormData()
    formData.append('resume', file)
    formData.append('targetRole', targetRole)
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
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Skill Gap Analysis</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Upload your resume, choose a target role, and discover what skills you need to acquire.
          </p>
        </div>
      </motion.div>

      {!result && (
        <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-6">
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
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/50 scale-[1.01]'
                      : 'border-[var(--border-color)] hover:border-purple-300 hover:bg-[var(--bg-tertiary)]'
                  )}
                >
                  <motion.div animate={dragOver ? { y: -5, scale: 1.1 } : {}} className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                    <Upload className="h-8 w-8 text-purple-500" />
                  </motion.div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Drop your resume here, or <span className="text-purple-600">browse files</span>
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-tertiary)]">PDF, DOC, or DOCX (max 5 MB)</p>
                  <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc" onChange={handleFileSelect} className="hidden" />
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 rounded-xl border border-[var(--border-color)] p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
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
              <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Target Role</h2>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  list="roles"
                  placeholder="Search or type a target role..."
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] pl-10 pr-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                />
                <datalist id="roles">
                  {roles.map((role) => <option key={role} value={role} />)}
                </datalist>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {roles.slice(0, 6).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setTargetRole(role)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-medium border transition-all',
                      targetRole === role
                        ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800'
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-transparent hover:bg-purple-50 dark:hover:bg-purple-950'
                    )}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {isPending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center gap-4 py-10">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                <Brain className="h-8 w-8 text-purple-500" />
              </motion.div>
              <div className="text-center">
                <p className="text-sm font-medium text-[var(--text-primary)]">Analyzing skill gaps...</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">Comparing your skills with the target role requirements</p>
              </div>
            </motion.div>
          )}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={!file || !targetRole || isPending} size="lg" className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600">
              <Sparkles className="h-4 w-4" /> {isPending ? 'Analyzing...' : 'Analyze Skills'}
            </Button>
          </div>

          {isError && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">Analysis Failed</p>
                <p className="mt-0.5 opacity-90">{error?.response?.data?.message || 'Unable to analyze skills. Please try again.'}</p>
              </div>
            </motion.div>
          )}
        </motion.form>
      )}

      {result && (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-5 text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                  <Brain className="h-5 w-5" />
                </div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{result.existingSkills?.length || 0}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Your Skills</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                  <Target className="h-5 w-5" />
                </div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{result.missingSkills?.length || 0}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Missing Skills</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{result.projects?.length || 0}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Projects</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <Award className="h-5 w-5" />
                </div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{result.certifications?.length || 0}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Certifications</p>
              </CardContent>
            </Card>
          </motion.div>

          {result.missingSkills?.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                      <Target className="h-4 w-4" />
                    </div>
                    <h2 className="font-semibold text-[var(--text-primary)]">Missing Skills</h2>
                    <Badge variant="warning" size="xs">{result.missingSkills.length}</Badge>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {result.missingSkills.map((skill, i) => (
                      <div key={i} className="flex items-center justify-between rounded-xl border border-[var(--border-color)] p-4 bg-[var(--bg-secondary)]">
                        <div className="flex items-center gap-3">
                          <XCircle className="h-4 w-4 text-amber-500 shrink-0" />
                          <span className="text-sm font-medium text-[var(--text-primary)]">{skill}</span>
                        </div>
                        <Badge variant="warning" size="xs">Missing</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {result.existingSkills?.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <h2 className="font-semibold text-[var(--text-primary)]">Your Skills</h2>
                    <Badge variant="success" size="xs">{result.existingSkills.length}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.existingSkills.map((skill, i) => (
                      <Badge key={i} variant="success" size="md">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {result.learningResources?.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <h2 className="font-semibold text-[var(--text-primary)]">Learning Resources</h2>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {result.learningResources.map((res, i) => (
                      <div key={i} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 hover:bg-[var(--bg-tertiary)] transition-colors">
                        <p className="font-medium text-sm text-[var(--text-primary)]">{res.title}</p>
                        <p className="mt-1 text-xs text-[var(--text-secondary)]">{res.description}</p>
                        {res.url && (
                          <a href={res.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700">
                            Learn more →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {result.recommendedProjects?.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                      <Zap className="h-4 w-4" />
                    </div>
                    <h2 className="font-semibold text-[var(--text-primary)]">Recommended Projects</h2>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {result.recommendedProjects.map((project, i) => (
                      <div key={i} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                        <p className="font-medium text-sm text-[var(--text-primary)]">{project.title}</p>
                        <p className="mt-1 text-xs text-[var(--text-secondary)]">{project.description}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {project.skills?.map((s, j) => (
                            <Badge key={j} variant="primary" size="xs">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {result.certifications?.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                      <Award className="h-4 w-4" />
                    </div>
                    <h2 className="font-semibold text-[var(--text-primary)]">Recommended Certifications</h2>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {result.certifications.map((cert, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                          <Award className="h-4 w-4" />
                        </div>
                        <div>
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

          {result.timeline && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                      <Clock className="h-4 w-4" />
                    </div>
                    <h2 className="font-semibold text-[var(--text-primary)]">Recommended Timeline</h2>
                  </div>
                  <div className="space-y-3">
                    {result.timeline.map((item, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                            item.status === 'completed' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' :
                            item.status === 'in-progress' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400' :
                            'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
                          )}>
                            {i + 1}
                          </div>
                          {i < result.timeline.length - 1 && <div className="w-px flex-1 bg-[var(--border-color)] my-1" />}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="text-sm font-medium text-[var(--text-primary)]">{item.title}</p>
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{item.duration}</p>
                          {item.description && <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{item.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div variants={itemVariants} className="flex justify-center pb-4">
            <Button variant="outline" onClick={reset}>
              Analyze Another Role
            </Button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}



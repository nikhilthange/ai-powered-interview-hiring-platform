import { motion } from 'framer-motion'
import { useState, useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { interviewApi } from '../../services/interviewApi'
import { Card, CardContent } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import FileDropzone from '../../components/FileUpload/FileDropzone'
import EmptyState from '../../components/ui/EmptyState'
import { cn } from '../../lib/utils'
import { TARGET_ROLES } from '../../lib/constants'
import {
  MapPin, Target, CheckCircle, Clock, BookOpen,
  ArrowLeft, ChevronDown, Download, Upload, Sparkles,
  Briefcase, AlertTriangle,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function CareerRoadmap() {
  const [expandedMilestone, setExpandedMilestone] = useState(null)
  const [file, setFile] = useState(null)
  const [targetRole, setTargetRole] = useState('')
  const [isCreatingNew, setIsCreatingNew] = useState(false)

  const queryClient = useQueryClient()

  // Fetch existing roadmap on load
  const { data: existingData, isLoading: isFetchingRoadmap } = useQuery({
    queryKey: ['myRoadmap'],
    queryFn: () => interviewApi.getMyRoadmap()
  })

  const { mutate, data: mutationData, isPending, isError, error, reset } = useMutation({
    mutationFn: (formData) => interviewApi.careerRoadmapUpload(formData),
    onSuccess: (data) => {
      queryClient.setQueryData(['myRoadmap'], data)
      setIsCreatingNew(false)
      const isFallback = data?.data?.roadmap?.summary?.includes('Fallback');
      if (isFallback) {
        toast('AI unavailable. Generated standard roadmap.', { icon: '⚠️' })
      } else {
        toast.success('Roadmap generated successfully!')
      }
    },
    onError: () => {
      toast.error('Failed to generate roadmap')
    },
  })

  const handleFileChange = useCallback((f) => setFile(f), [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!file || !targetRole) return
    const formData = new FormData()
    formData.append('resume', file)
    formData.append('targetRole', targetRole.trim())
    mutate(formData)
  }

  // Use mutation data if available, otherwise fall back to fetched data
  const rawData = mutationData || existingData
  const result = rawData?.data?.data?.roadmap || rawData?.data?.roadmap || rawData?.roadmap || rawData?.data || null

  if (isFetchingRoadmap) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-sm font-medium text-[var(--text-secondary)]">Loading your career roadmap...</p>
      </div>
    )
  }

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="mb-6"
        >
          <Sparkles className="h-12 w-12 text-indigo-500" />
        </motion.div>
        <p className="text-lg font-medium text-[var(--text-primary)]">Generating your career roadmap...</p>
        <p className="text-sm text-[var(--text-secondary)] mt-1">AI is analyzing your resume and creating a personalized plan</p>
      </div>
    )
  }

  if (!result && isError) {
    return (
      <EmptyState
        icon={MapPin}
        title="Failed to generate roadmap"
        description={error?.response?.data?.message || 'Please try again later.'}
        action={{ label: 'Try Again', props: { onClick: reset } }}
      />
    )
  }

  const roadmap = result || {}
  const milestones = roadmap.milestones || roadmap.steps || roadmap.stages || []
  const hasResult = Object.keys(roadmap).length > 0 && milestones.length > 0 && !isCreatingNew

  const completedMilestones = milestones.filter(m => m.status === 'completed' || m.completed).length
  const progressPercent = milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-6"
    >
      <motion.div variants={itemVariants}>
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-6">
          <Sparkles className="h-4 w-4" /> Back to dashboard
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] break-words">Career Roadmap</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {isCreatingNew ? 'Upload your resume and choose a target role to get a personalized career progression plan.' : 'Your personalized career progression plan based on your skills and goals.'}
          </p>
        </div>
      </motion.div>

      {!hasResult && (
        <motion.div variants={itemVariants} className="mb-4">
          {existingData && existingData.data?.roadmap && isCreatingNew && (
            <Button variant="ghost" size="sm" onClick={() => setIsCreatingNew(false)} className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" /> Cancel
            </Button>
          )}
        </motion.div>
      )}

      {!hasResult && (
        <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-6">
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

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={!file || !targetRole || isPending} size="lg">
              <Upload className="h-4 w-4" /> {isPending ? 'Generating...' : 'Generate Roadmap'}
            </Button>
          </div>

          {isError && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">Generation Failed</p>
                <p className="mt-0.5 opacity-90">{error?.response?.data?.message || 'Unable to generate roadmap. Please try again.'}</p>
              </div>
            </motion.div>
          )}
        </motion.form>
      )}

      {hasResult && (
        <>
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setIsCreatingNew(true); reset(); }}>
                <Upload className="h-4 w-4" /> New Roadmap
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Download className="h-4 w-4" /> Download PDF
              </Button>
            </div>
          </motion.div>

          {roadmap.summary && (
            <motion.div variants={itemVariants}>
              <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900 p-6">
                <h2 className="font-semibold text-[var(--text-primary)] mb-2">Summary</h2>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{roadmap.summary}</p>
              </div>
            </motion.div>
          )}
          
          <motion.div variants={itemVariants} className="bg-white dark:bg-[var(--bg-primary)] p-5 rounded-2xl border border-[var(--border-color)]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-[var(--text-primary)]">Progress</span>
              <span className="text-sm font-bold text-indigo-600">{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 mb-2 overflow-hidden">
              <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">{completedMilestones} of {milestones.length} milestones completed</p>
          </motion.div>

          <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-5 text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <MapPin className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{milestones.length} Milestones</p>
                <p className="text-xs text-[var(--text-tertiary)]">Steps to your goal</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <Clock className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{roadmap.estimatedDuration || roadmap.duration || 'Flexible'}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Estimated time</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                  <Target className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{roadmap.targetRole || roadmap.goal || 'Target Role'}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Your goal</p>
              </CardContent>
            </Card>
          </motion.div>

          {milestones.length > 0 ? (
            <motion.div variants={itemVariants} className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500 via-purple-500 to-transparent" />
              <div className="space-y-4">
                {milestones.map((milestone, i) => {
                  const isExpanded = expandedMilestone === i
                  const isCompleted = milestone.status === 'completed' || milestone.completed
                  const isInProgress = milestone.status === 'in-progress' || milestone.inProgress

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div
                        onClick={() => setExpandedMilestone(isExpanded ? null : i)}
                        className="relative ml-12 cursor-pointer"
                      >
                        <div className={cn(
                          'absolute -left-14 top-4 flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-all',
                          isCompleted
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-600 dark:bg-emerald-950 dark:border-emerald-600 dark:text-emerald-400'
                            : isInProgress
                            ? 'bg-amber-50 border-amber-400 text-amber-600 dark:bg-amber-950 dark:border-amber-600 dark:text-amber-400'
                            : 'bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-tertiary)]'
                        )}>
                          {isCompleted ? <CheckCircle className="h-4 w-4" /> : i + 1}
                        </div>

                        <Card className={cn(
                          'transition-all',
                          isExpanded && 'ring-2 ring-indigo-300 dark:ring-indigo-700'
                        )}>
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-[var(--text-primary)]">
                                    {milestone.title || milestone.name}
                                  </h3>
                                  {isCompleted && <Badge variant="success" size="xs">Done</Badge>}
                                  {isInProgress && <Badge variant="warning" size="xs">In Progress</Badge>}
                                </div>
                                <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-2">
                                  {milestone.description}
                                </p>
                                {milestone.duration && (
                                  <div className="flex items-center gap-1.5 mt-2">
                                    <Clock className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                                    <span className="text-xs text-[var(--text-tertiary)]">{milestone.duration}</span>
                                  </div>
                                )}
                              </div>
                              <ChevronDown className={cn(
                                'h-5 w-5 text-[var(--text-tertiary)] transition-transform mt-1 shrink-0',
                                isExpanded && 'rotate-180'
                              )} />
                            </div>

                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="mt-4 pt-4 border-t border-[var(--border-color)] space-y-3"
                              >
                                {milestone.skills?.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">Skills</p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {milestone.skills.map((skill, j) => (
                                        <Badge key={j} variant="primary" size="xs">{skill}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {milestone.resources?.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">Resources</p>
                                    <div className="space-y-1.5">
                                      {milestone.resources.map((res, j) => (
                                        <div key={j} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                          <BookOpen className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                                          <span>{res.title || res}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {milestone.projects?.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">Projects</p>
                                    <div className="space-y-1.5">
                                      {milestone.projects.map((proj, j) => (
                                        <div key={j} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                          <Briefcase className="h-3.5 w-3.5 shrink-0 text-purple-500" />
                                          <span>{proj.title || proj}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div variants={itemVariants}>
              <EmptyState
                icon={MapPin}
                title="No roadmap available yet"
                description="Complete your profile and skill analysis to generate a personalized career roadmap."
                action={{ label: 'Analyze Skills', props: { as: Link, to: '/skill-gap-analysis' } }}
              />
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  )
}

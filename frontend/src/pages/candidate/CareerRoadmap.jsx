import { motion } from 'framer-motion'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { analysisApi } from '../../services/analysisApi'
import { Card, CardContent } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { SkeletonPage } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import { cn } from '../../lib/utils'
import {
  MapPin, Target, CheckCircle, Clock, BookOpen,
  ArrowLeft, ChevronDown, Download,
  Briefcase,
} from 'lucide-react'
import { Link } from 'react-router-dom'

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

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['career-roadmap'],
    queryFn: () => analysisApi.getCareerRoadmap().then((r) => r.data),
  })

  if (isLoading) return <SkeletonPage />

  if (isError) {
    return (
      <EmptyState
        icon={MapPin}
        title="Failed to load roadmap"
        description={error?.response?.data?.message || 'Please try again later.'}
        action={{ label: 'Retry', props: { onClick: () => window.location.reload() } }}
      />
    )
  }

  const roadmap = data?.data?.roadmap || data?.roadmap || data?.data || {}
  const milestones = roadmap.milestones || roadmap.steps || roadmap.stages || []

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] break-words">Career Roadmap</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Your personalized career progression plan
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4" /> Download PDF
        </Button>
      </motion.div>

      {roadmap.summary && (
        <motion.div variants={itemVariants}>
          <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900 p-6">
            <h2 className="font-semibold text-[var(--text-primary)] mb-2">Summary</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{roadmap.summary}</p>
          </div>
        </motion.div>
      )}

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
    </motion.div>
  )
}

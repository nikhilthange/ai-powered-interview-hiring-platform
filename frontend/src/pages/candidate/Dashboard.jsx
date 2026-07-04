import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { useQueries } from '@tanstack/react-query'
import { jobApi } from '../../services/jobApi'
import { applicationApi } from '../../services/applicationApi'
import { savedJobApi } from '../../services/savedJobApi'
import { interviewApi } from '../../services/interviewApi'
import { profileApi } from '../../services/profileApi'
import { Card, CardContent } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonMetrics, SkeletonList } from '../../components/ui/Skeleton'
import { useNotifications } from '../../hooks/useNotifications'
import {
  Briefcase, FileText, Bookmark, TrendingUp, ArrowRight, Zap,
  Target, GraduationCap, Clock, Award, Sparkles,
  BarChart3, Bell, Rocket, Activity, ChevronRight,
  Eye,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn, calculateProfileCompletion, getGradeColor, getGradeLabel, formatDateRelative } from '../../lib/utils'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function CandidateDashboard() {
  const { user } = useAuth()
  const { unreadCount } = useNotifications()

  const results = useQueries({
    queries: [
      {
        queryKey: ['profile'],
        queryFn: () => profileApi.getMyProfile().then((r) => r.data?.data?.profile),
      },
      {
        queryKey: ['my-applications'],
        queryFn: () => applicationApi.getMyApplications().then((r) => r.data),
      },
      {
        queryKey: ['saved-jobs'],
        queryFn: () => savedJobApi.getSavedJobs().then((r) => r.data),
      },
      {
        queryKey: ['mock-sessions'],
        queryFn: () => interviewApi.getMySessions(),
      },
      {
        queryKey: ['recommended-jobs'],
        queryFn: () => jobApi.getRecommendedJobs().then((r) => r.data?.data?.jobs || []),
      },
    ],
  })

  const [profileQuery, appsQuery, savedQuery, sessionsQuery, jobsQuery] = results
  const isInitialLoading = results.some((q) => q.isPending && !q.data)
  const allFailed = results.every((q) => q.isError)

  if (isInitialLoading) return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="skeleton-shimmer h-4 w-24 rounded-lg" />
          <div className="skeleton-shimmer h-8 w-64 rounded-xl" />
          <div className="skeleton-shimmer h-4 w-48 rounded-lg mt-2" />
        </div>
        <div className="skeleton-shimmer h-10 w-36 rounded-xl" />
      </div>
      <SkeletonMetrics />
      <SkeletonList count={3} />
    </div>
  )

  if (allFailed) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="relative mb-4">
          <div className="absolute inset-0 animate-ping rounded-2xl bg-red-100 dark:bg-red-950/30 opacity-30" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/50 dark:to-rose-950/50 ring-1 ring-red-200/50 dark:ring-red-800/30">
            <Eye className="h-8 w-8 text-[var(--color-error)]" />
          </div>
        </div>
        <p className="text-lg font-medium text-[var(--text-primary)]">Unable to load dashboard</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Something went wrong. Please try again.</p>
        <Button
          onClick={() => results.forEach((q) => q.refetch())}
          className="mt-6"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  const profile = profileQuery.data || {}
  const apps = appsQuery.data?.data?.applications || []
  const appsCount = appsQuery.data?.results || apps.length
  const savedCount = savedQuery.data?.results || 0
  const sessions = Array.isArray(sessionsQuery.data) ? sessionsQuery.data : []
  const recommendedJobs = Array.isArray(jobsQuery.data) ? jobsQuery.data : []

  const name = profile.fullName || user?.email?.split('@')[0] || 'User'
  const profileCompletion = calculateProfileCompletion(profile)

  const completedSessions = sessions.filter((s) => s.status === 'completed')
  const avgScore = completedSessions.length > 0
    ? Math.round(completedSessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / completedSessions.length)
    : null

  const latestApps = apps.slice(0, 5)

  const metrics = [
    { label: 'Applications', value: appsCount, icon: FileText, href: '/my-applications', color: 'primary' },
    { label: 'Saved Jobs', value: savedCount, icon: Bookmark, href: '/saved-jobs', color: 'warning' },
    { label: 'Profile', value: `${profileCompletion}%`, icon: Award, progress: profileCompletion, href: '/profile', color: 'amber' },
    {
      label: 'AI Score',
      value: avgScore !== null ? `${avgScore}%` : '\u2014',
      icon: Target,
      subtitle: avgScore !== null ? `Avg of ${completedSessions.length} sessions` : 'No data yet',
      href: '/mock-interview',
      color: avgScore !== null ? (avgScore >= 70 ? 'success' : 'amber') : 'default',
    },
  ]

  const actionLinks = [
    { to: '/resume-analyzer', label: 'Analyze Resume', icon: FileText, desc: 'Get ATS score & feedback' },
    { to: '/skill-gap-analysis', label: 'Skill Gap', icon: Target, desc: 'Identify missing skills' },
    { to: '/mock-interview', label: 'Mock Interview', icon: GraduationCap, desc: 'Practice with AI' },
    { to: '/saved-jobs', label: 'Saved Jobs', icon: Bookmark, desc: 'Review saved positions' },
  ]

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 p-6 sm:p-8">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/5" />
            <div className="absolute top-1/2 right-1/4 h-32 w-32 rounded-full bg-white/5 animate-float-slow" />
          </div>
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-white/70 mb-1">
                {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'}
              </p>
              <h1 className="text-xl sm:text-2xl font-bold text-white break-words">{name.split(' ')[0]}</h1>
              <p className="text-sm text-white/60 mt-1">{profile.bio || "Let's find your next opportunity"}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/jobs">
                <Button className="bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm shadow-none">
                  <Briefcase className="h-4 w-4" />
                  Browse Jobs
                </Button>
              </Link>
              {profileCompletion < 100 && (
                <Link to="/profile">
                  <Button className="bg-white text-indigo-700 hover:bg-white/90 shadow-none">
                    <Rocket className="h-4 w-4" />
                    Complete Profile
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          const colorMap = {
            primary: { bg: 'bg-indigo-50 dark:bg-indigo-950', text: 'text-indigo-600' },
            warning: { bg: 'bg-amber-50 dark:bg-amber-950', text: 'text-amber-600' },
            amber: { bg: 'bg-amber-50 dark:bg-amber-950', text: 'text-amber-600' },
            success: { bg: 'bg-emerald-50 dark:bg-emerald-950', text: 'text-emerald-600' },
            default: { bg: 'bg-[var(--bg-tertiary)]', text: 'text-[var(--text-tertiary)]' },
          }
          const colors = colorMap[metric.color] || colorMap.default
          return (
            <Link key={metric.label} to={metric.href} className="group">
              <Card className="h-full">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">{metric.label}</span>
                    <div className={cn('rounded-xl p-2 transition-all duration-200 group-hover:scale-110 group-hover:shadow-sm', colors.bg)}>
                      <Icon className={cn('h-4 w-4', colors.text)} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{metric.value}</p>
                  {metric.progress !== undefined && (
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.progress}%` }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                      />
                    </div>
                  )}
                  {metric.subtitle && <p className="text-xs text-[var(--text-tertiary)] mt-1">{metric.subtitle}</p>}
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {recommendedJobs.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 p-2 dark:from-indigo-950/50 dark:to-indigo-900/50">
                      <Sparkles className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-[var(--text-primary)]">Recommended Jobs</h2>
                      <p className="text-xs text-[var(--text-tertiary)]">Matched to your profile</p>
                    </div>
                  </div>
                  <Link to="/jobs" className="group flex items-center gap-1 text-sm font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-colors">
                    View all <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {recommendedJobs.slice(0, 4).map((job) => (
                    <Link key={job._id} to={`/jobs/${job._id}`}>
                      <motion.div whileHover={{ y: -2 }} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 transition-all hover:border-[var(--color-primary-300)] dark:hover:border-indigo-500/30 hover:shadow-md">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 dark:from-indigo-950 dark:to-indigo-900 dark:text-indigo-400 text-xs font-bold">
                                {job.title?.charAt(0) || 'J'}
                              </span>
                              <div>
                                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{job.title}</p>
                                <p className="text-xs text-[var(--text-secondary)]">{job.company || 'Company'}</p>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 shrink-0 text-[var(--text-tertiary)] mt-1" />
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          {job.jobType && <Badge variant="primary" size="xs">{job.jobType}</Badge>}
                          {job.experienceLevel && <Badge variant="default" size="xs">{job.experienceLevel}</Badge>}
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {latestApps.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-2 dark:from-blue-950/50 dark:to-blue-900/50">
                      <Activity className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-[var(--text-primary)]">Recent Activity</h2>
                      <p className="text-xs text-[var(--text-tertiary)]">Your latest applications</p>
                    </div>
                  </div>
                  <Link to="/my-applications" className="group flex items-center gap-1 text-sm font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-colors">
                    View all <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
                <div className="space-y-2">
                  {latestApps.map((app) => {
                    const statusColors = {
                      Applied: 'primary', Reviewing: 'warning', Shortlisted: 'info',
                      'Interview Scheduled': 'info', Rejected: 'danger', Hired: 'success',
                    }
                    return (
                      <Link key={app._id} to="/my-applications">
                        <motion.div whileHover={{ x: 2 }} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 transition-all hover:border-[var(--color-primary-300)] dark:hover:border-indigo-500/30">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{app.jobId?.title || 'Application'}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Clock className="h-3 w-3 text-[var(--text-tertiary)]" />
                              <p className="text-xs text-[var(--text-secondary)]">{formatDateRelative(app.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {app.atsScore > 0 && (
                              <span className={cn('text-xs font-semibold', app.atsScore >= 80 ? 'text-emerald-600 dark:text-emerald-400' : app.atsScore >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400')}>
                                ATS {app.atsScore}
                              </span>
                            )}
                            <Badge variant={statusColors[app.status] || 'default'} size="xs">{app.status}</Badge>
                          </div>
                        </motion.div>
                      </Link>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 p-2 dark:from-amber-950/50 dark:to-amber-900/50">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-[var(--text-primary)]">Career Progress</h2>
                  <p className="text-xs text-[var(--text-tertiary)]">Mock interview results</p>
                </div>
              </div>
              {completedSessions.length === 0 ? (
                <EmptyState
                  icon={GraduationCap}
                  title="No interviews completed yet"
                  description="Practice makes perfect. Start a mock interview to see your progress."
                  small
                  action={{ label: 'Start Mock Interview', props: { size: 'sm', as: Link, to: '/mock-interview' } }}
                />
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-[var(--bg-tertiary)]">
                    <span className="text-sm text-[var(--text-secondary)]">Sessions completed</span>
                    <span className="text-lg font-bold text-[var(--text-primary)]">{completedSessions.length}</span>
                  </div>
                  {avgScore !== null && (
                    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-[var(--bg-tertiary)]">
                      <span className="text-sm text-[var(--text-secondary)]">Average score</span>
                      <span className={cn('text-lg font-bold', getGradeColor(avgScore))}>{getGradeLabel(avgScore)} ({avgScore}%)</span>
                    </div>
                  )}
                  <Link to="/career-roadmap"><Button variant="outline" size="sm" className="w-full"><BarChart3 className="h-4 w-4" /> Career Roadmap</Button></Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-2 dark:from-purple-950/50 dark:to-purple-900/50">
                  <Zap className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-[var(--text-primary)]">Quick Actions</h2>
                  <p className="text-xs text-[var(--text-tertiary)]">Boost your career</p>
                </div>
              </div>
              <div className="space-y-2">
                {actionLinks.map((action) => {
                  const Icon = action.icon
                  return (
                    <Link key={action.to} to={action.to}>
                      <motion.div whileHover={{ x: 3 }} className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-3.5 transition-all hover:border-[var(--color-primary-300)] dark:hover:border-indigo-500/30 group">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 dark:from-indigo-950 dark:to-indigo-900 dark:text-indigo-400">
                          <Icon className="h-[18px] w-[18px]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block text-sm font-medium text-[var(--text-primary)]">{action.label}</span>
                          <span className="block text-xs text-[var(--text-tertiary)]">{action.desc}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-[var(--text-tertiary)] group-hover:text-[var(--color-primary-500)] transition-colors" />
                      </motion.div>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {unreadCount > 0 && (
            <Link to="/notifications">
              <motion.div whileHover={{ scale: 1.01 }} className="rounded-2xl border bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-800/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/50">
                    <Bell className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">Tap to view</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)]" />
                </div>
              </motion.div>
            </Link>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

function RefreshCw(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  )
}

import { useAuth } from '../../hooks/useAuth'
import { useQueries } from '@tanstack/react-query'
import api from '../../services/axios'
import { jobApi } from '../../services/jobApi'
import { Card, CardContent } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { SkeletonMetrics, SkeletonList } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import useNotifications from '../../hooks/useNotifications'
import {
  Briefcase, FileText, Bookmark, TrendingUp, ArrowRight, Zap, Star,
  Target, GraduationCap, Clock, MapPin,
  ChevronRight, Award, Sparkles, Users, Eye,
  BarChart3, Bell, CheckCircle, AlertCircle,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn, calculateProfileCompletion, getGradeColor, getGradeLabel, formatDateRelative } from '../../lib/utils'

export default function CandidateDashboard() {
  const { user } = useAuth()
  const { unreadCount } = useNotifications()

  const results = useQueries({
    queries: [
      {
        queryKey: ['profile'],
        queryFn: () => api.get('/profiles').then((r) => r.data?.data?.profile),
      },
      {
        queryKey: ['my-applications'],
        queryFn: () => api.get('/applications/my-applications').then((r) => r.data),
      },
      {
        queryKey: ['saved-jobs'],
        queryFn: () => api.get('/saved-jobs').then((r) => r.data),
      },
      {
        queryKey: ['mock-sessions'],
        queryFn: () => api.get('/interviews/session/list/mine').then((r) => r.data?.data?.sessions || []),
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
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-error-bg)] mb-4">
          <Eye className="h-8 w-8 text-[var(--color-error)]" />
        </div>
        <p className="text-lg font-medium text-[var(--text-primary)]">Unable to load dashboard</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Something went wrong. Please try refreshing the page.</p>
        <button onClick={() => window.location.reload()} className="mt-6 rounded-xl bg-[var(--color-primary-500)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-600)] shadow-sm shadow-[var(--color-primary-500)]/20 transition-all">
          Refresh Page
        </button>
      </div>
    )
  }

  const profile = profileQuery.data || {}
  const apps = appsQuery.data?.data?.applications || []
  const appsCount = appsQuery.data?.results || apps.length
  const savedCount = savedQuery.data?.results || 0
  const sessions = sessionsQuery.data || []
  const recommendedJobs = jobsQuery.data || []

  const name = profile.fullName || user?.email?.split('@')[0] || 'User'
  const profileCompletion = calculateProfileCompletion(profile)

  const completedSessions = sessions.filter((s) => s.status === 'completed')
  const avgScore = completedSessions.length > 0
    ? Math.round(completedSessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / completedSessions.length)
    : null

  const latestApps = apps.slice(0, 5)

  const metrics = [
    {
      label: 'Applications',
      value: appsCount,
      icon: FileText,
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950',
      href: '/my-applications',
    },
    {
      label: 'Saved Jobs',
      value: savedCount,
      icon: Bookmark,
      gradient: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-950',
      href: '/saved-jobs',
    },
    {
      label: 'Profile',
      value: `${profileCompletion}%`,
      icon: Star,
      gradient: 'from-amber-500 to-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-950',
      progress: profileCompletion,
      href: '/profile',
    },
    {
      label: 'Interview Score',
      value: avgScore !== null ? `${avgScore}%` : '—',
      icon: GraduationCap,
      gradient: avgScore !== null ? (avgScore >= 70 ? 'from-emerald-500 to-emerald-600' : 'from-amber-500 to-amber-600') : 'from-neutral-400 to-neutral-500',
      bg: avgScore !== null ? 'bg-emerald-50 dark:bg-emerald-950' : 'bg-[var(--bg-tertiary)]',
      subtitle: avgScore !== null ? `Avg of ${completedSessions.length} sessions` : 'No data yet',
      href: '/mock-interview',
    },
  ]

  return (
    <div className="space-y-6 page-section">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-primary-600)] via-[var(--color-primary-500)] to-[var(--color-primary-700)] p-6 sm:p-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white" />
        </div>
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white/80 mb-1">Welcome back</p>
            <h1 className="text-2xl font-bold text-white">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {name.split(' ')[0]}
            </h1>
            <p className="text-sm text-white/70 mt-1">
              {profile.bio || "Here's your job search overview"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/jobs">
              <Button className="bg-white/20 text-white border border-white/20 hover:bg-white/30 backdrop-blur-sm shadow-none">
                <Briefcase className="h-4 w-4" />
                Browse Jobs
              </Button>
            </Link>
            {profileCompletion < 100 && (
              <Link to="/profile">
                <Button className="bg-white text-[var(--color-primary-700)] hover:bg-white/90 shadow-none">
                  Complete Profile
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Link key={metric.label} to={metric.href} className="group">
              <Card className="h-full">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">{metric.label}</span>
                    <div className={cn('rounded-xl p-2 transition-all group-hover:scale-110 group-hover:shadow-sm', metric.bg)}>
                      <Icon className="h-4 w-4" style={{ color: `var(--color-${metric.label === 'Applications' ? 'primary' : metric.label === 'Saved Jobs' ? 'warning' : metric.label === 'Profile' ? 'warning' : 'success'}-600)` }} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {metric.value}
                  </p>
                  {metric.progress !== undefined && (
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-700"
                        style={{ width: `${metric.progress}%` }}
                      />
                    </div>
                  )}
                  {metric.subtitle && (
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">{metric.subtitle}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {recommendedJobs.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-xl bg-gradient-to-br from-[var(--color-primary-50)] to-[var(--color-primary-100)] p-2 dark:from-[var(--color-primary-950)] dark:to-[var(--color-primary-900)]">
                      <Sparkles className="h-5 w-5 text-[var(--color-primary-600)]" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-[var(--text-primary)]">Recommended Jobs</h2>
                      <p className="text-xs text-[var(--text-tertiary)]">Matched to your profile and preferences</p>
                    </div>
                  </div>
                  <Link to="/jobs" className="text-sm font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-colors">
                    View all
                  </Link>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {recommendedJobs.slice(0, 4).map((job) => (
                    <Link key={job._id} to={`/jobs/${job._id}`}>
                      <div className="group rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 transition-all card-hover-effect">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-50)] text-[var(--color-primary-600)] dark:bg-[var(--color-primary-950)] dark:text-[var(--color-primary-400)] text-xs font-bold">
                                {job.title?.charAt(0) || 'J'}
                              </span>
                              <p className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--color-primary-600)] transition-colors truncate">
                                {job.title}
                              </p>
                            </div>
                            <p className="text-xs text-[var(--text-secondary)] ml-9">{job.company || job.location}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 shrink-0 text-[var(--text-tertiary)] group-hover:text-[var(--color-primary-500)] transition-colors" />
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-3 ml-9">
                          {job.jobType && (
                            <Badge variant="primary" size="xs">{job.jobType}</Badge>
                          )}
                          {job.experienceLevel && (
                            <Badge variant="default" size="xs">{job.experienceLevel}</Badge>
                          )}
                        </div>
                      </div>
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
                    <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-2 dark:from-blue-950 dark:to-blue-900">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-[var(--text-primary)]">Recent Activity</h2>
                      <p className="text-xs text-[var(--text-tertiary)]">Your latest applications</p>
                    </div>
                  </div>
                  <Link to="/my-applications" className="text-sm font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-colors">
                    View all
                  </Link>
                </div>
                <div className="space-y-2">
                  {latestApps.map((app) => {
                    const statusColors = {
                      Applied: 'primary',
                      Reviewing: 'warning',
                      Shortlisted: 'info',
                      'Interview Scheduled': 'info',
                      Rejected: 'danger',
                      Hired: 'success',
                    }
                    return (
                      <Link key={app._id} to="/my-applications">
                        <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 transition-all card-hover-effect">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                              {app.jobId?.title || 'Application'}
                            </p>
                            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                              {formatDateRelative(app.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {app.atsScore > 0 && (
                              <span className={cn(
                                'text-xs font-semibold',
                                app.atsScore >= 80 ? 'text-green-600 dark:text-green-400' :
                                app.atsScore >= 60 ? 'text-amber-600 dark:text-amber-400' :
                                'text-red-600 dark:text-red-400'
                              )}>
                                {app.atsScore}
                              </span>
                            )}
                            <Badge variant={statusColors[app.status] || 'default'} size="xs">
                              {app.status}
                            </Badge>
                          </div>
                        </div>
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
                <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 p-2 dark:from-amber-950 dark:to-amber-900">
                  <Target className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-[var(--text-primary)]">Career Progress</h2>
                  <p className="text-xs text-[var(--text-tertiary)]">Mock interview results</p>
                </div>
              </div>
              {completedSessions.length === 0 ? (
                <div className="text-center py-6">
                  <GraduationCap className="mx-auto h-10 w-10 text-[var(--text-tertiary)] mb-3" />
                  <p className="text-sm text-[var(--text-secondary)]">No interviews completed yet</p>
                  <Link to="/mock-interview">
                    <Button size="sm" className="mt-4">Start Mock Interview</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-[var(--bg-tertiary)]">
                    <span className="text-sm text-[var(--text-secondary)]">Sessions completed</span>
                    <span className="text-lg font-bold text-[var(--text-primary)]">{completedSessions.length}</span>
                  </div>
                  {avgScore !== null && (
                    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-[var(--bg-tertiary)]">
                      <span className="text-sm text-[var(--text-secondary)]">Average score</span>
                      <span className={cn('text-lg font-bold', getGradeColor(avgScore))}>
                        {getGradeLabel(avgScore)} ({avgScore}%)
                      </span>
                    </div>
                  )}
                  <Link to="/career-roadmap">
                    <Button variant="outline" size="sm" className="w-full">
                      View Career Roadmap
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-2 dark:from-purple-950 dark:to-purple-900">
                  <Zap className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-[var(--text-primary)]">Quick Actions</h2>
                  <p className="text-xs text-[var(--text-tertiary)]">Tools to boost your career</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { to: '/resume-analyzer', label: 'Analyze Resume', icon: FileText, desc: 'Get ATS score & feedback' },
                  { to: '/skill-gap-analysis', label: 'Skill Gap', icon: Target, desc: 'Identify missing skills' },
                  { to: '/mock-interview', label: 'Mock Interview', icon: GraduationCap, desc: 'Practice with AI' },
                  { to: '/saved-jobs', label: 'Saved Jobs', icon: Bookmark, desc: 'Review saved positions' },
                ].map((action) => {
                  const Icon = action.icon
                  return (
                    <Link key={action.to} to={action.to}>
                      <div className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-3.5 transition-all card-hover-effect group">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary-50)] to-[var(--color-primary-100)] text-[var(--color-primary-600)] dark:from-[var(--color-primary-950)] dark:to-[var(--color-primary-900)] dark:text-[var(--color-primary-400)]">
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block text-sm font-medium text-[var(--text-primary)]">{action.label}</span>
                          <span className="block text-xs text-[var(--text-tertiary)]">{action.desc}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-[var(--text-tertiary)] group-hover:text-[var(--color-primary-500)] transition-colors" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {unreadCount > 0 && (
            <Link to="/notifications">
              <Card className="card-hover-effect border-[var(--color-primary-200)] dark:border-[var(--color-primary-800)]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary-50)] to-[var(--color-primary-100)] dark:from-[var(--color-primary-950)] dark:to-[var(--color-primary-900)]">
                      <Bell className="h-5 w-5 text-[var(--color-primary-600)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)]">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
                      <p className="text-xs text-[var(--text-tertiary)]">Tap to view</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)]" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

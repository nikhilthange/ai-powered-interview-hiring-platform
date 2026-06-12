import { useAuth } from '../../hooks/useAuth'
import { useQueries } from '@tanstack/react-query'
import api from '../../services/axios'
import { jobApi } from '../../services/jobApi'
import { Card, CardContent } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { SkeletonPage } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import {
  Briefcase, FileText, Bookmark, TrendingUp, ArrowRight, Zap, Star,
  Target, GraduationCap, Clock, MapPin,
  ChevronRight, Award
} from 'lucide-react'
import { Link } from 'react-router-dom'

function calculateProfileCompletion(profile) {
  if (!profile) return 0
  const fields = [
    profile.fullName,
    profile.bio,
    profile.skills?.length > 0,
    profile.experienceYears > 0,
    profile.resumeUrl,
    profile.avatarUrl,
  ]
  return Math.round((fields.filter(Boolean).length / fields.length) * 100)
}

function getGradeColor(score) {
  if (score >= 90) return 'text-green-600'
  if (score >= 75) return 'text-emerald-500'
  if (score >= 60) return 'text-amber-500'
  return 'text-red-500'
}

function getGradeLabel(score) {
  if (score >= 90) return 'A'
  if (score >= 75) return 'B'
  if (score >= 60) return 'C'
  return 'D'
}

export default function CandidateDashboard() {
  const { user } = useAuth()

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

  if (isInitialLoading) return <SkeletonPage />
  if (allFailed) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium text-[var(--text-primary)]">Unable to load dashboard</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Something went wrong. Please try refreshing the page.</p>
        <button onClick={() => window.location.reload()} className="mt-4 rounded-lg bg-[var(--color-primary-500)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-600)]">
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
  const latestSession = completedSessions[0]
  const interviewScore = latestSession?.overallScore || null
  const avgScore = completedSessions.length > 0
    ? Math.round(completedSessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / completedSessions.length)
    : null

  const latestApps = apps.slice(0, 5)

  return (
    <div className="space-y-6 page-section">
      {/* Welcome Card */}
      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary-50)] text-[var(--color-primary-600)] dark:bg-[var(--color-primary-900)] dark:text-[var(--color-primary-400)]">
                <Zap className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">Welcome back, {name}</h1>
                <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                  {profile.bio || 'Here\'s an overview of your job search journey.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/jobs">
                <Button icon={Briefcase}>Browse Jobs</Button>
              </Link>
              {profileCompletion < 100 && (
                <Link to="/profile">
                  <Button variant="outline" size="sm">Complete Profile</Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {/* Profile Completion */}
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Profile</span>
              <div className="rounded-lg bg-amber-50 p-1.5 dark:bg-amber-950">
                <Star className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{profileCompletion}%</p>
            <p className="text-xs text-[var(--text-secondary)]">Profile Completion</p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
              <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${profileCompletion}%` }} />
            </div>
          </CardContent>
        </Card>

        {/* Applications */}
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Applied</span>
              <div className="rounded-lg bg-blue-50 p-1.5 dark:bg-blue-950">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{appsCount}</p>
            <p className="text-xs text-[var(--text-secondary)]">Applications</p>
          </CardContent>
        </Card>

        {/* Saved Jobs */}
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Saved</span>
              <div className="rounded-lg bg-purple-50 p-1.5 dark:bg-purple-950">
                <Bookmark className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{savedCount}</p>
            <p className="text-xs text-[var(--text-secondary)]">Saved Jobs</p>
          </CardContent>
        </Card>

        {/* Mock Interview Score */}
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Interviews</span>
              <div className="rounded-lg bg-green-50 p-1.5 dark:bg-green-950">
                <GraduationCap className="h-4 w-4 text-green-600" />
              </div>
            </div>
            {avgScore !== null ? (
              <>
                <p className={`text-xl sm:text-2xl font-bold ${getGradeColor(avgScore)}`}>{avgScore}%</p>
                <p className="text-xs text-[var(--text-secondary)]">Avg. Score ({completedSessions.length})</p>
              </>
            ) : (
              <>
                <p className="text-xl sm:text-2xl font-bold text-[var(--text-tertiary)]">—</p>
                <p className="text-xs text-[var(--text-secondary)]">No interviews yet</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommended Jobs */}
      <Card>
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-[var(--color-primary-600)]" />
              <h2 className="font-semibold text-[var(--text-primary)]">Recommended Jobs</h2>
            </div>
            <Link to="/jobs" className="text-xs font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-colors">
              View all
            </Link>
          </div>
          {recommendedJobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No jobs available"
              description="Check back later for new opportunities."
              action={{ label: 'Browse Jobs', props: { onClick: () => window.location.href = '/jobs' } }}
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {recommendedJobs.map((job) => (
                <Link key={job._id} to={`/jobs/${job._id}`}>
                  <div className="group rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 transition-all hover:border-[var(--color-primary-200)] dark:hover:border-[var(--color-primary-800)]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--color-primary-600)] transition-colors truncate">
                          {job.title}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">{job.location}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-[var(--text-tertiary)] group-hover:text-[var(--color-primary-500)] transition-colors" />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {job.location && (
                        <span className="flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
                          <MapPin className="h-3 w-3" /> {job.location}
                        </span>
                      )}
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
          )}
        </CardContent>
      </Card>

      {/* Recent Activity + Career Roadmap */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-[var(--color-primary-600)]" />
              <h2 className="font-semibold text-[var(--text-primary)]">Recent Activity</h2>
            </div>
            {latestApps.length === 0 ? (
              <EmptyState
                icon={TrendingUp}
                title="No recent activity"
                description="Start applying to jobs to see your activity here."
                action={{ label: 'Browse Jobs', props: { onClick: () => window.location.href = '/jobs' } }}
              />
            ) : (
              <div className="space-y-3">
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
                    <Link key={app._id} to={app._id ? `/my-applications` : '#'}>
                      <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-3 transition-all hover:border-[var(--color-primary-200)] dark:hover:border-[var(--color-primary-800)]">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                            {app.jobId?.title || 'Application'}
                          </p>
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                            {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <Badge variant={statusColors[app.status] || 'default'} size="xs">
                          {app.status}
                        </Badge>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Career Roadmap Progress */}
        <Card>
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-[var(--color-primary-600)]" />
              <h2 className="font-semibold text-[var(--text-primary)]">Career Roadmap</h2>
            </div>
            {completedSessions.length === 0 ? (
              <EmptyState
                icon={Award}
                title="No interview data yet"
                description="Complete a mock interview to get personalized career insights."
                action={{ label: 'Start Mock Interview', props: { onClick: () => window.location.href = '/mock-interview' } }}
              />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <GraduationCap className="h-4 w-4" />
                  <span>{completedSessions.length} mock interview{completedSessions.length !== 1 ? 's' : ''} completed</span>
                </div>
                {interviewScore !== null && (
                  <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-[var(--text-primary)]">Latest Score</p>
                      <Badge variant={interviewScore >= 75 ? 'success' : interviewScore >= 60 ? 'warning' : 'danger'} size="sm">
                        Grade {getGradeLabel(interviewScore)}
                      </Badge>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className={`text-2xl font-bold ${getGradeColor(interviewScore)}`}>{interviewScore}%</span>
                      <span className="text-xs text-[var(--text-tertiary)] mb-1">for {latestSession?.targetRole || 'role'}</span>
                    </div>
                  </div>
                )}
                <Link to="/career-roadmap">
                  <Button variant="outline" size="sm" className="w-full" icon={Star}>
                    View Full Roadmap
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-5 sm:p-6">
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { to: '/resume-analyzer', label: 'Analyze Resume', desc: 'Get AI-powered ATS score', icon: Zap },
              { to: '/mock-interview', label: 'Mock Interview', desc: 'Practice with AI', icon: GraduationCap },
              { to: '/skill-gap-analysis', label: 'Skill Gap', desc: 'Identify growth areas', icon: Target },
              { to: '/saved-jobs', label: 'Saved Jobs', desc: 'Review saved positions', icon: Bookmark },
            ].map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.to} to={action.to}>
                  <div className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 transition-all hover:border-[var(--color-primary-200)] dark:hover:border-[var(--color-primary-800)] group">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-50)] text-[var(--color-primary-600)] dark:bg-[var(--color-primary-900)] dark:text-[var(--color-primary-400)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[var(--text-primary)]">{action.label}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{action.desc}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-[var(--text-tertiary)] group-hover:text-[var(--color-primary-500)] transition-colors" />
                  </div>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

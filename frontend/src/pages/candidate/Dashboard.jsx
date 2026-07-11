import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { useQueries } from '@tanstack/react-query'
import { jobApi } from '../../services/jobApi'
import { applicationApi } from '../../services/applicationApi'
import { savedJobApi } from '../../services/savedJobApi'
import { interviewApi } from '../../services/interviewApi'
import { profileApi } from '../../services/profileApi'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import StatCard from '../../components/ui/StatCard'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonMetrics, SkeletonChart } from '../../components/ui/Skeleton'
import { Link } from 'react-router-dom'
import { cn, calculateProfileCompletion } from '../../lib/utils'
import {
  FileText, Bookmark, Briefcase, CalendarCheck, Bot,
  TrendingUp, BarChart3, Sparkles, Activity, Target,
  ChevronRight, ArrowUpRight,
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const appColors = { Applied: '#6366f1', Reviewing: '#f59e0b', Shortlisted: '#06b6d4', Rejected: '#ef4444', Hired: '#10b981' }

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-3 shadow-lg text-sm">
      <p className="font-medium text-[var(--text-primary)] mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="text-xs">{entry.name}: {entry.value}</p>
      ))}
    </div>
  )
}

export default function CandidateDashboard() {
  const { user } = useAuth()

  const results = useQueries({
    queries: [
      { queryKey: ['profile'], queryFn: () => profileApi.getMyProfile().then((r) => r.data) },
      { queryKey: ['my-applications'], queryFn: () => applicationApi.getMyApplications().then((r) => r.data) },
      { queryKey: ['saved-jobs'], queryFn: () => savedJobApi.getSavedJobs().then((r) => r.data) },
      { queryKey: ['my-sessions'], queryFn: () => interviewApi.getMySessions() },
      { queryKey: ['my-interviews'], queryFn: () => interviewApi.getMyInterviews() },
    ],
  })

  const [profileQuery, appsQuery, savedQuery, sessionsQuery, interviewsQuery] = results
  const isLoading = results.some((q) => q.isPending && !q.data)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonMetrics />
        <div className="grid gap-6 lg:grid-cols-2"><SkeletonChart /><SkeletonChart /></div>
        <SkeletonChart />
      </div>
    )
  }

  const profile = profileQuery.data?.data?.profile || profileQuery.data || {}
  const profileCompletion = profileQuery.data?.data?.completion?.completionPercentage ?? calculateProfileCompletion(profile, user).completionPercentage
  const apps = appsQuery.data?.data?.applications || []
  const appsCount = appsQuery.data?.data?.pagination?.totalItems || apps.length
  const savedJobs = savedQuery.data?.results || savedQuery.data?.data?.savedJobs || []
  const savedCount = Array.isArray(savedJobs) ? savedJobs.length : 0
  const sessions = sessionsQuery.data?.data?.sessions || []
  const upcomingInterviews = interviewsQuery.data?.data?.interviews?.filter((i) => i.status === 'scheduled') || []

  const completedSessions = sessions.filter((s) => s.status === 'completed')
  const avgScore = completedSessions.length > 0
    ? Math.round(completedSessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / completedSessions.length)
    : null

  const resumeScore = profile.resumeScore ?? avgScore ?? null
  const aiUsageCount = sessions.length + (profile.aiChatCount || 0) + (profile.resumeAnalyses || 0)

  const metrics = [
    { label: 'Resume Score', value: resumeScore ? `${resumeScore}%` : '---', icon: FileText, color: 'primary', trend: 5, trendLabel: 'last month' },
    { label: 'Profile Completion', value: `${profileCompletion}%`, icon: Target, color: 'amber', trend: profileCompletion > 50 ? 12 : 0, trendLabel: 'last month' },
    { label: 'Jobs Applied', value: appsCount, icon: Briefcase, color: 'emerald', trend: 8, trendLabel: 'last month' },
    { label: 'Saved Jobs', value: savedCount, icon: Bookmark, color: 'purple', trend: -2, trendLabel: 'last month' },
    { label: 'Upcoming Interviews', value: upcomingInterviews.length, icon: CalendarCheck, color: 'blue', trend: upcomingInterviews.length > 0 ? 3 : 0 },
    { label: 'AI Usage', value: aiUsageCount, icon: Bot, color: 'indigo', trend: 20, trendLabel: 'last month' },
  ]

  const statusCounts = {}
  apps.forEach((app) => {
    statusCounts[app.status] = (statusCounts[app.status] || 0) + 1
  })
  const appDistribution = Object.entries(statusCounts).map(([name, value]) => ({ name, value, fill: appColors[name] || '#6366f1' }))

  const appsByMonth = {}
  apps.forEach((app) => {
    const d = new Date(app.createdAt)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    if (!appsByMonth[key]) appsByMonth[key] = { month: months[d.getMonth()], Applied: 0, Reviewing: 0, Shortlisted: 0, Rejected: 0, Hired: 0, total: 0 }
    appsByMonth[key][app.status] = (appsByMonth[key][app.status] || 0) + 1
    appsByMonth[key].total++
  })
  const appTrendData = Object.values(appsByMonth)
  if (appTrendData.length === 0) {
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      appTrendData.push({ month: months[d.getMonth()], Applied: 0, Reviewing: 0, Shortlisted: 0, Rejected: 0, Hired: 0, total: 0 })
    }
  }

  const scoreTrendData = completedSessions.length > 0
    ? completedSessions.slice(-6).map((s, i) => ({ session: `#${i + 1}`, score: s.overallScore || 0 }))
    : []

  const skillNames = profile.skills?.slice(0, 8) || ['React', 'Node.js', 'TypeScript', 'Python', 'SQL', 'Docker', 'AWS', 'GraphQL']
  const skillGrowthData = skillNames.map((skill) => ({
    skill,
    current: Math.floor(Math.random() * 30) + 60,
    previous: Math.floor(Math.random() * 20) + 40,
  }))

  const latestApps = apps.slice(0, 5)

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 p-6 sm:p-8">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/5" />
            <div className="absolute top-1/2 right-1/4 h-32 w-32 rounded-full bg-white/5" />
          </div>
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-white/70 mb-1">
                {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'}
              </p>
              <h1 className="text-xl sm:text-2xl font-bold text-white break-words">{profile.fullName || user?.email?.split('@')[0] || 'Candidate'}</h1>
              <p className="text-sm text-white/60 mt-1">{profile.headline || profile.bio || 'Track your job search journey'}</p>
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
                    <Sparkles className="h-4 w-4" />
                    Complete Profile
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {metrics.map((metric) => (
          <StatCard key={metric.label} label={metric.label} value={metric.value} icon={metric.icon} color={metric.color} trend={metric.trend} trendLabel={metric.trendLabel} />
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 p-2 dark:from-indigo-950/50 dark:to-indigo-900/50">
                    <Activity className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-[var(--text-primary)]">Applications</h2>
                    <p className="text-xs text-[var(--text-tertiary)]">Monthly application trends</p>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={appTrendData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  {Object.keys(appColors).map((status) => (
                    <Bar key={status} dataKey={status} stackId="a" fill={appColors[status]} radius={[2, 2, 0, 0]} name={status} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-2 dark:from-emerald-950/50 dark:to-emerald-900/50">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-[var(--text-primary)]">Resume Score Trend</h2>
                    <p className="text-xs text-[var(--text-tertiary)]">Progress over sessions</p>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={scoreTrendData}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="session" tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} fill="url(#scoreGradient)" name="Score" dot={{ r: 4, fill: '#6366f1' }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-2 dark:from-purple-950/50 dark:to-purple-900/50">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-[var(--text-primary)]">Skill Growth</h2>
                  <p className="text-xs text-[var(--text-tertiary)]">Current vs previous proficiency</p>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={skillGrowthData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="var(--border-color)" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Radar name="Previous" dataKey="previous" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.2} />
                <Radar name="Current" dataKey="current" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {latestApps.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-2 dark:from-blue-950/50 dark:to-blue-900/50">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-[var(--text-primary)]">Recent Applications</h2>
                    <p className="text-xs text-[var(--text-tertiary)]">Your latest activity</p>
                  </div>
                </div>
                <Link to="/my-applications" className="group flex items-center gap-1 text-sm font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-colors">
                  View all <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
              <div className="space-y-2">
                {latestApps.map((app) => (
                  <Link key={app._id} to="/my-applications">
                    <motion.div whileHover={{ x: 2 }} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 transition-colors hover:border-[var(--color-primary-300)] dark:hover:border-indigo-500/30">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{app.jobId?.title || 'Application'}</p>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">{new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {app.atsScore > 0 && (
                          <span className={cn('text-xs font-semibold', app.atsScore >= 80 ? 'text-emerald-600' : app.atsScore >= 60 ? 'text-amber-600' : 'text-red-600')}>
                            ATS {app.atsScore}
                          </span>
                        )}
                        <span className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          app.status === 'Applied' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' :
                          app.status === 'Reviewing' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' :
                          app.status === 'Shortlisted' ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300' :
                          app.status === 'Hired' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' :
                          app.status === 'Rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300'
                        )}>{app.status}</span>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {upcomingInterviews.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 p-2 dark:from-amber-950/50 dark:to-amber-900/50">
                  <CalendarCheck className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-[var(--text-primary)]">Upcoming Interviews</h2>
                  <p className="text-xs text-[var(--text-tertiary)]">Scheduled interviews</p>
                </div>
              </div>
              <div className="space-y-2">
                {upcomingInterviews.slice(0, 4).map((interview) => (
                  <div key={interview._id} className="flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{interview.jobId?.title || 'Interview'}</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">{new Date(interview.date || interview.scheduledAt).toLocaleString()}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-[var(--text-tertiary)]" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}

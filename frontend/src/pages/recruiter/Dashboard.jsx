import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { useQueries } from '@tanstack/react-query'
import { jobApi } from '../../services/jobApi'
import { applicationApi } from '../../services/applicationApi'
import { interviewApi } from '../../services/interviewApi'
import { Card, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import StatCard from '../../components/ui/StatCard'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonMetrics, SkeletonChart } from '../../components/ui/Skeleton'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { Briefcase, Users, CalendarCheck, TrendingUp, Plus, ArrowRight, Activity, Sparkles, ChevronRight, Target, BarChart3 } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area,
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

export default function RecruiterDashboard() {
  const { user } = useAuth()

  const results = useQueries({
    queries: [
      { queryKey: ['recruiter-jobs'], queryFn: () => jobApi.getMyJobs().then((r) => r.data) },
      { queryKey: ['recruiter-interviews'], queryFn: () => interviewApi.getMyInterviews() },
    ],
  })

  const [jobsQuery, interviewsQuery] = results
  const isLoading = results.some((q) => q.isPending && !q.data)

  const jobs = jobsQuery.data?.data?.jobs || []
  const jobIds = jobs.map(j => j._id)

  const appsQuery = useQueries({
    queries: jobIds.length > 0 ? jobIds.map(id => ({
      queryKey: ['job-apps', id],
      queryFn: () => applicationApi.getJobApplications(id).then(r => r.data?.data?.applications || []),
      enabled: !isLoading,
    })) : [],
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonMetrics />
        <div className="grid gap-6 lg:grid-cols-2"><SkeletonChart /><SkeletonChart /></div>
        <SkeletonChart />
      </div>
    )
  }

  const allApps = appsQuery.map(q => q.data || []).flat()
  const activeJobs = jobs.filter((j) => j.status === 'Active').length
  const interviewsList = interviewsQuery.data?.data?.interviews || []
  const hiredApps = allApps.filter((a) => a.status === 'Hired').length
  const hiringRate = allApps.length > 0 ? Math.round((hiredApps / allApps.length) * 100) : 0

  const metrics = [
    { label: 'Jobs Posted', value: jobs.length, icon: Briefcase, color: 'primary' },
    { label: 'Applications', value: allApps.length, icon: Users, color: 'emerald' },
    { label: 'Interviews', value: interviewsList.length, icon: CalendarCheck, color: 'blue' },
    { label: 'Hiring Rate', value: `${hiringRate}%`, icon: TrendingUp, color: 'purple' },
  ]

  const appsPerJobData = jobs.slice(0, 10).map((job) => ({
    title: job.title?.length > 18 ? job.title.slice(0, 16) + '...' : job.title || 'Untitled',
    applications: allApps.filter((a) => a.jobId?.toString() === job._id?.toString()).length,
  }))

  const topSkills = {}
  jobs.forEach((job) => {
    const skills = job.skills || job.requiredSkills || []
    skills.forEach((skill) => {
      if (typeof skill === 'string') {
        topSkills[skill] = (topSkills[skill] || 0) + 1
      }
    })
  })
  allApps.forEach((app) => {
    const job = jobs.find((j) => j._id?.toString() === app.jobId?.toString())
    const skills = job?.skills || job?.requiredSkills || []
    skills.forEach((skill) => {
      if (typeof skill === 'string') {
        topSkills[skill] = (topSkills[skill] || 0) + 1
      }
    })
  })
  const topSkillsData = Object.entries(topSkills)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([skill, count]) => ({ skill, count }))
  if (topSkillsData.length === 0) {
    topSkillsData.push(
      { skill: 'React', count: 12 }, { skill: 'Node.js', count: 10 }, { skill: 'Python', count: 8 },
      { skill: 'TypeScript', count: 7 }, { skill: 'SQL', count: 6 }, { skill: 'Docker', count: 5 },
      { skill: 'AWS', count: 4 }, { skill: 'GraphQL', count: 3 },
    )
  }

  const appsByMonth = {}
  allApps.forEach((app) => {
    const d = new Date(app.createdAt)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    if (!appsByMonth[key]) appsByMonth[key] = { month: months[d.getMonth()], Applications: 0, Hired: 0 }
    appsByMonth[key].Applications++
    if (app.status === 'Hired') appsByMonth[key].Hired++
  })
  const monthlyHiringData = Object.values(appsByMonth).slice(-6)
  while (monthlyHiringData.length < 6) {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - monthlyHiringData.length))
    monthlyHiringData.unshift({ month: months[d.getMonth()], Applications: 0, Hired: 0 })
  }

  const latestApps = allApps.slice(0, 5)

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
              <p className="text-sm font-medium text-white/70 mb-1">
                {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'}
              </p>
              <h1 className="text-xl sm:text-2xl font-bold text-white break-words">{user?.name || 'Recruiter'}</h1>
              <p className="text-sm text-white/60 mt-1">Manage your job listings and find top talent</p>
            </div>
            <Link to="/recruiter/jobs/create">
              <Button className="bg-white text-indigo-700 hover:bg-white/90 shadow-none">
                <Plus className="h-4 w-4" />
                Post a Job
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {metrics.map((metric) => (
          <StatCard key={metric.label} label={metric.label} value={metric.value} icon={metric.icon} color={metric.color} />
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 p-2 dark:from-indigo-950/50 dark:to-indigo-900/50">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-[var(--text-primary)]">Applications Per Job</h2>
                    <p className="text-xs text-[var(--text-tertiary)]">Application distribution</p>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={appsPerJobData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="title" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} width={120} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="applications" fill="#6366f1" radius={[0, 4, 4, 0]} name="Applications" />
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
                  <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 p-2 dark:from-amber-950/50 dark:to-amber-900/50">
                    <Target className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-[var(--text-primary)]">Top Skills</h2>
                    <p className="text-xs text-[var(--text-tertiary)]">Most in-demand skills</p>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topSkillsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="skill" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Count" />
                </BarChart>
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
                <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-2 dark:from-emerald-950/50 dark:to-emerald-900/50">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-[var(--text-primary)]">Monthly Hiring</h2>
                  <p className="text-xs text-[var(--text-tertiary)]">Applications and hires over time</p>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyHiringData}>
                <defs>
                  <linearGradient id="appGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="hireGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Applications" stroke="#6366f1" strokeWidth={2} fill="url(#appGradient)" name="Applications" dot={{ r: 3 }} />
                <Area type="monotone" dataKey="Hired" stroke="#10b981" strokeWidth={2} fill="url(#hireGradient)" name="Hired" dot={{ r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 p-2 dark:from-indigo-950/50 dark:to-indigo-900/50">
                    <Briefcase className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-[var(--text-primary)]">Your Jobs</h2>
                    <p className="text-xs text-[var(--text-tertiary)]">{activeJobs} active listings</p>
                  </div>
                </div>
                <Link to="/recruiter/my-jobs" className="group flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                  View all <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
              {jobs.length === 0 ? (
                <EmptyState
                  icon={Briefcase}
                  title="No jobs posted yet"
                  description="Post your first job and start receiving applications."
                  small
                  action={{ label: 'Post Your First Job', props: { size: 'sm', as: Link, to: '/recruiter/jobs/create' } }}
                />
              ) : (
                <div className="space-y-2">
                  {jobs.slice(0, 4).map((job) => {
                    const appCount = allApps.filter(a => a.jobId?.toString() === job._id?.toString()).length
                    const isActive = job.status === 'Active'
                    return (
                      <Link key={job._id} to={`/recruiter/jobs/${job._id}/edit`}>
                        <motion.div whileHover={{ x: 2 }} className={cn(
                          'flex items-center justify-between rounded-xl border p-3.5 transition-colors',
                          isActive ? 'border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-[var(--border-color)] bg-[var(--bg-secondary)]'
                        )}>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{job.title}</p>
                            <p className="text-xs text-[var(--text-secondary)] mt-0.5">{appCount} applicant{appCount !== 1 ? 's' : ''}</p>
                          </div>
                          <span className={cn(
                            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                            isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300'
                          )}>{job.status || 'Draft'}</span>
                        </motion.div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-2 dark:from-purple-950/50 dark:to-purple-900/50">
                    <Activity className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-[var(--text-primary)]">Recent Activity</h2>
                    <p className="text-xs text-[var(--text-tertiary)]">Latest applications</p>
                  </div>
                </div>
              </div>
              {latestApps.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No applications received yet"
                  description="Applications will appear here once candidates start applying."
                  small
                />
              ) : (
                <div className="space-y-2">
                  {latestApps.map((app) => (
                    <div key={app._id} className="flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-3.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 font-semibold text-xs">
                          {app.candidateId?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{app.candidateId?.name || 'Anonymous'}</p>
                          <p className="text-xs text-[var(--text-tertiary)]">Applied to {app.jobId?.title || 'a job'}</p>
                        </div>
                      </div>
                      <span className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                        app.status === 'Applied' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' :
                        app.status === 'Shortlisted' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' :
                        app.status === 'Rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300'
                      )}>{app.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}



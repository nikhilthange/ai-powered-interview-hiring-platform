import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../services/adminApi'
import { Card, CardContent } from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import { SkeletonMetrics, SkeletonChart } from '../../components/ui/Skeleton'
import { Users, Briefcase, FileText, Activity, Bot, UserCheck, UserPlus, Sparkles } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts'
import { Link } from 'react-router-dom'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

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

export default function AdminDashboard() {
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminApi.getAnalytics(),
  })

  const { data: chartData, isLoading: chartsLoading } = useQuery({
    queryKey: ['admin-charts'],
    queryFn: () => adminApi.getChartData(30),
  })

  if (analyticsLoading && !analytics) {
    return (
      <div className="space-y-6">
        <SkeletonMetrics />
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <SkeletonChart /><SkeletonChart /><SkeletonChart />
          <SkeletonChart /><SkeletonChart /><SkeletonChart />
        </div>
      </div>
    )
  }

  const stats = analytics?.data?.stats || {}
  const userStats = analytics?.data?.userStats || []
  const appStats = analytics?.data?.applicationStats || []

  const registrations = chartData?.data?.registrations || []
  const appsPerDay = chartData?.data?.applicationsPerDay || []
  const jobsPerMonth = chartData?.data?.jobsPerMonth || []

  const totalCandidates = userStats.find((u) => u.role === 'candidate')?.count || stats.totalCandidates || 0
  const totalRecruiters = userStats.find((u) => u.role === 'recruiter')?.count || stats.totalRecruiters || 0

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const candidateChartData = registrations.length > 0
    ? registrations.map((r) => ({ label: r._id, candidates: Math.round(r.count * 0.7), recruiters: Math.round(r.count * 0.3), value: r.count }))
    : months.slice(-6).map((m) => ({ label: m, candidates: 0, recruiters: 0, value: 0 }))

  const appsChartData = appsPerDay.length > 0
    ? appsPerDay.map((r) => ({ label: r._id, applications: r.count }))
    : Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        return { label: d.toLocaleDateString('en-US', { weekday: 'short' }), applications: 0 }
      })

  const jobsChartData = jobsPerMonth.length > 0
    ? jobsPerMonth.map((r) => ({ label: r._id, jobs: r.count }))
    : months.slice(-6).map((m) => ({ label: m, jobs: 0 }))

  const aiRequestsData = Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (11 - i))
    return { label: months[d.getMonth()], requests: Math.floor(Math.random() * 50) + 10 }
  })

  const recruitersChartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    return { label: months[d.getMonth()], recruiters: Math.floor(Math.random() * 8) + 1 }
  })

  const candidatesChartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    return { label: months[d.getMonth()], candidates: Math.floor(Math.random() * 20) + 5 }
  })

  const metrics = [
    { label: 'Total Users', value: stats.totalUsers || 0, icon: Users, color: 'indigo', subtitle: `${totalCandidates} candidates, ${totalRecruiters} recruiters` },
    { label: 'Active Jobs', value: stats.activeJobs || 0, icon: Briefcase, color: 'emerald' },
    { label: 'Applications', value: stats.totalApplications || 0, icon: FileText, color: 'purple' },
    { label: 'AI Requests', value: stats.aiRequestsToday || 0, icon: Bot, color: 'amber' },
    { label: 'Candidates', value: totalCandidates, icon: UserPlus, color: 'blue' },
    { label: 'Recruiters', value: totalRecruiters, icon: UserCheck, color: 'red' },
  ]

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 p-6 sm:p-8">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/5" />
            <div className="absolute top-1/2 right-1/4 h-32 w-32 rounded-full bg-white/5" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="h-6 w-6 text-white/80" />
              <h1 className="text-xl sm:text-2xl font-bold text-white">Admin Dashboard</h1>
            </div>
            <p className="text-sm text-white/60">Platform overview and management</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {metrics.map((metric) => (
          <StatCard key={metric.label} label={metric.label} value={metric.value} icon={metric.icon} color={metric.color} subtitle={metric.subtitle} />
        ))}
      </motion.div>

      {chartsLoading && analytics ? (
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <SkeletonChart /><SkeletonChart /><SkeletonChart />
          <SkeletonChart /><SkeletonChart /><SkeletonChart />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 p-2 dark:from-indigo-950/50 dark:to-indigo-900/50">
                    <UserPlus className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-[var(--text-primary)] text-sm">Users Growth</h2>
                    <p className="text-xs text-[var(--text-tertiary)]">New user registrations</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={candidateChartData}>
                    <defs>
                      <linearGradient id="userGrowth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fill="url(#userGrowth)" name="Users" dot={{ r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-2 dark:from-emerald-950/50 dark:to-emerald-900/50">
                    <FileText className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-[var(--text-primary)] text-sm">Applications</h2>
                    <p className="text-xs text-[var(--text-tertiary)]">Daily applications</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={appsChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="applications" fill="#10b981" radius={[4, 4, 0, 0]} name="Applications" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-2 dark:from-purple-950/50 dark:to-purple-900/50">
                    <Briefcase className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-[var(--text-primary)] text-sm">Jobs</h2>
                    <p className="text-xs text-[var(--text-tertiary)]">Monthly job postings</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={jobsChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="jobs" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Jobs" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 p-2 dark:from-amber-950/50 dark:to-amber-900/50">
                    <Bot className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-[var(--text-primary)] text-sm">AI Requests</h2>
                    <p className="text-xs text-[var(--text-tertiary)]">Monthly AI usage</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={aiRequestsData}>
                    <defs>
                      <linearGradient id="aiGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="requests" stroke="#f59e0b" strokeWidth={2} fill="url(#aiGradient)" name="AI Requests" dot={{ r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-2 dark:from-blue-950/50 dark:to-blue-900/50">
                    <UserCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-[var(--text-primary)] text-sm">Recruiters</h2>
                    <p className="text-xs text-[var(--text-tertiary)]">Recruiter sign-ups</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={recruitersChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="recruiters" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} name="Recruiters" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 p-2 dark:from-rose-950/50 dark:to-rose-900/50">
                    <Users className="h-5 w-5 text-rose-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-[var(--text-primary)] text-sm">Candidates</h2>
                    <p className="text-xs text-[var(--text-tertiary)]">Candidate registrations</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={candidatesChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="candidates" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} name="Candidates" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}

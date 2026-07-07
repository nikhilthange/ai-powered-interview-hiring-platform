import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../services/adminApi'
import { Card, CardContent } from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import { SkeletonMetrics, SkeletonChart } from '../../components/ui/Skeleton'
import { Users, Briefcase, FileText, Activity, DollarSign, CalendarCheck } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-3 shadow-lg text-sm">
      <p className="font-medium text-[var(--text-primary)] mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="text-xs">
          {entry.name}: {entry.value}
        </p>
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

  if (analyticsLoading) return <SkeletonMetrics />

  const stats = analytics?.data?.stats || {}
  const userStats = analytics?.data?.userStats || []
  const jobStats = analytics?.data?.jobStats || []
  const appStats = analytics?.data?.applicationStats || []
  const revenueStats = analytics?.data?.revenueStats || []

  const registrations = chartData?.data?.registrations || []
  const appsPerDay = chartData?.data?.applicationsPerDay || []
  const jobsPerMonth = chartData?.data?.jobsPerMonth || []

  const roleData = userStats.map((u) => ({ name: u.role?.charAt(0).toUpperCase() + u.role?.slice(1) || 'Unknown', value: u.count }))

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 p-6 sm:p-8">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/5" />
            <div className="absolute top-1/2 right-1/4 h-32 w-32 rounded-full bg-white/5 animate-float-slow" />
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

      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Users" value={stats.totalUsers || 0} icon={Users} color="indigo" subtitle={`${stats.totalCandidates || 0} candidates · ${stats.totalRecruiters || 0} recruiters`} />
        <StatCard label="Active Jobs" value={stats.activeJobs || 0} icon={Briefcase} color="emerald" />
        <StatCard label="Applications" value={stats.totalApplications || 0} icon={FileText} color="purple" />
        <StatCard label="Interviews" value={stats.interviewsConducted || 0} icon={CalendarCheck} color="blue" />
        <StatCard label="AI Requests" value={stats.aiRequestsToday || 0} icon={Activity} color="amber" />
        <StatCard label="Revenue" value={stats.revenue ? `$${stats.revenue.toLocaleString()}` : '$0'} icon={DollarSign} color="emerald" />
      </motion.div>

      {chartsLoading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <SkeletonChart /><SkeletonChart /><SkeletonChart /><SkeletonChart />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold text-[var(--text-primary)] mb-4">User Registrations (30 days)</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={registrations}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="_id" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} name="Registrations" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold text-[var(--text-primary)] mb-4">Applications Per Day (30 days)</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={appsPerDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="_id" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Applications" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold text-[var(--text-primary)] mb-4">Jobs Per Month</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={jobsPerMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="_id" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Jobs" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold text-[var(--text-primary)] mb-4">User Role Distribution</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={roleData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {roleData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}

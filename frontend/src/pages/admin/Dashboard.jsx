import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../services/adminApi'
import { Card, CardContent } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { SkeletonMetrics } from '../../components/ui/Skeleton'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { Users, Briefcase, FileText, Activity, Shield, ArrowRight } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function AdminDashboard() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminApi.getAnalytics(),
  })

  if (isLoading) return <SkeletonMetrics />

  const userStats = analytics?.data?.users || []
  const jobStats = analytics?.data?.jobs || []
  const appStats = analytics?.data?.applications || []

  const totalUsers = userStats.reduce((s, u) => s + u.count, 0)
  const recruiters = userStats.find((u) => u.role === 'recruiter')?.count || 0
  const candidates = userStats.find((u) => u.role === 'candidate')?.count || 0
  const totalJobs = jobStats.reduce((s, j) => s + j.count, 0)
  const totalApps = appStats.reduce((s, a) => s + a.count, 0)


  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 p-6 sm:p-8">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/5" />
            <div className="absolute top-1/2 right-1/4 h-32 w-32 rounded-full bg-white/5 animate-float-slow" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-6 w-6 text-white/80" />
              <h1 className="text-xl sm:text-2xl font-bold text-white">Admin Dashboard</h1>
            </div>
            <p className="text-sm text-white/60">Platform overview and management</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: 'indigo', subtitle: `${candidates} candidates, ${recruiters} recruiters` },
          { label: 'Total Jobs', value: jobs.length, icon: Briefcase, color: 'emerald' },
          { label: 'Applications', value: totalApps, icon: FileText, color: 'purple' },
          { label: 'Active Users', value: activeUsers, icon: Activity, color: 'amber', subtitle: `${Math.round((activeUsers / (users.length || 1)) * 100)}% engagement` },
        ].map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">{metric.label}</span>
                  <div className={cn(
                    'rounded-xl p-2',
                    metric.color === 'indigo' ? 'bg-indigo-50 dark:bg-indigo-950' :
                    metric.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-950' :
                    metric.color === 'purple' ? 'bg-purple-50 dark:bg-purple-950' :
                    'bg-amber-50 dark:bg-amber-950'
                  )}>
                    <Icon className={cn(
                      'h-4 w-4',
                      metric.color === 'indigo' ? 'text-indigo-600' :
                      metric.color === 'emerald' ? 'text-emerald-600' :
                      metric.color === 'purple' ? 'text-purple-600' :
                      'text-amber-600'
                    )} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{metric.value}</p>
                {metric.subtitle && <p className="text-xs text-[var(--text-tertiary)] mt-1">{metric.subtitle}</p>}
              </CardContent>
            </Card>
          )
        })}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-[var(--text-primary)]">Recent Users</h2>
                <Badge variant="primary" size="xs">{users.length} total</Badge>
              </div>
              <div className="space-y-2">
                {users.slice(0, 5).map((u) => (
                  <div key={u._id} className="flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 text-indigo-600 font-semibold text-xs">
                        {u.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{u.name || 'User'}</p>
                        <p className="text-xs text-[var(--text-tertiary)]">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {u.isEmailVerified && <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />}
                      <Badge variant={u.role === 'admin' ? 'danger' : u.role === 'recruiter' ? 'primary' : 'default'} size="xs">
                        {u.role}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/admin/users" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                View All Users <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-[var(--text-primary)]">Recent Jobs</h2>
                <Badge variant="primary" size="xs">{jobs.length} total</Badge>
              </div>
              <div className="space-y-2">
                {jobs.slice(0, 5).map((j) => (
                  <div key={j._id} className="flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">{j.title}</p>
                      <p className="text-xs text-[var(--text-tertiary)]">{j.applications?.length || 0} applicants</p>
                    </div>
                    <Badge variant={j.status === 'active' || j.status === 'Active' ? 'success' : 'default'} size="xs">{j.status || 'Draft'}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}

function CheckCircle(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

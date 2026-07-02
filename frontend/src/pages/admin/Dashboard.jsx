import { motion } from 'framer-motion'
import { useQueries } from '@tanstack/react-query'
import api from '../../services/axios'
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
  visible: { opacity: 1, y: 0 },
}

export default function AdminDashboard() {
  const results = useQueries({
    queries: [
      { queryKey: ['admin-users'], queryFn: () => api.get('/admin/users').then((r) => r.data) },
      { queryKey: ['admin-jobs'], queryFn: () => api.get('/admin/jobs').then((r) => r.data) },
    ],
  })

  const isLoading = results.some((q) => q.isPending && !q.data)

  if (isLoading) return <SkeletonMetrics />

  const users = results[0].data?.data?.users || []
  const jobs = results[1].data?.data?.jobs || []

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-1">
          <Shield className="h-6 w-6 text-indigo-500" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Admin Dashboard</h1>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">Platform overview and management</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: 'indigo' },
          { label: 'Total Jobs', value: jobs.length, icon: Briefcase, color: 'emerald' },
          { label: 'Applications', value: jobs.reduce((s, j) => s + (j.applications?.length || 0), 0), icon: FileText, color: 'purple' },
          { label: 'Active Users', value: users.filter((u) => u.isActive !== false).length, icon: Activity, color: 'amber' },
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
              </CardContent>
            </Card>
          )
        })}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold text-[var(--text-primary)] mb-4">Recent Users</h2>
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
                    <Badge variant={u.role === 'admin' ? 'danger' : u.role === 'recruiter' ? 'primary' : 'default'} size="xs">
                      {u.role}
                    </Badge>
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
              <h2 className="font-semibold text-[var(--text-primary)] mb-4">Recent Jobs</h2>
              <div className="space-y-2">
                {jobs.slice(0, 5).map((j) => (
                  <div key={j._id} className="flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">{j.title}</p>
                      <p className="text-xs text-[var(--text-tertiary)]">{j.applications?.length || 0} applicants</p>
                    </div>
                    <Badge variant={j.status === 'active' ? 'success' : 'default'} size="xs">{j.status || 'Draft'}</Badge>
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

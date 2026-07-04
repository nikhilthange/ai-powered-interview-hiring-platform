import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { useQueries } from '@tanstack/react-query'
import { jobApi } from '../../services/jobApi'
import { applicationApi } from '../../services/applicationApi'
import { Card, CardContent } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonMetrics, SkeletonList } from '../../components/ui/Skeleton'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { Briefcase, Users, FileText, Plus, ArrowRight, Activity, TrendingUp, Bell, ChevronRight } from 'lucide-react'
import { useNotifications } from '../../hooks/useNotifications'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function RecruiterDashboard() {
  const { user } = useAuth()
  const { unreadCount } = useNotifications()

  const results = useQueries({
    queries: [
      { queryKey: ['recruiter-jobs'], queryFn: () => jobApi.getMyJobs().then((r) => r.data) },
      { queryKey: ['recruiter-applications'], queryFn: () => applicationApi.getMyApplications().then((r) => r.data) },
    ],
  })

  const [jobsQuery, appsQuery] = results
  const isLoading = results.some((q) => q.isPending && !q.data)

  if (isLoading) return (
    <div className="space-y-6">
      <SkeletonMetrics />
      <SkeletonList count={3} />
    </div>
  )

  const jobs = jobsQuery.data?.data?.jobs || []
  const apps = appsQuery.data?.data?.applications || []
  const activeJobs = jobs.filter((j) => j.status === 'Active').length

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
        {[
          { label: 'Active Jobs', value: activeJobs, icon: Briefcase, href: '/recruiter/my-jobs', color: 'indigo' },
          { label: 'Applications', value: apps.length, icon: Users, href: '/recruiter/my-jobs', color: 'emerald' },
          { label: 'Total Jobs', value: jobs.length, icon: FileText, href: '/recruiter/my-jobs', color: 'purple' },
          { label: 'Pipeline', value: apps.filter((a) => a.status === 'Reviewing' || a.status === 'Shortlisted').length, icon: TrendingUp, href: '/recruiter/my-jobs', color: 'amber' },
        ].map((metric) => {
          const Icon = metric.icon
          return (
            <Link key={metric.label} to={metric.href} className="group">
              <Card className="h-full">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">{metric.label}</span>
                    <div className={cn(
                      'rounded-xl p-2 transition-all group-hover:scale-110',
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
            </Link>
          )
        })}
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
                  View all <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
              {jobs.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No jobs posted yet"
                  description="Post your first job and start receiving applications from top talent."
                  small
                  action={{ label: 'Post Your First Job', props: { size: 'sm', as: Link, to: '/recruiter/jobs/create' } }}
                />
              ) : (
                <div className="space-y-2">
                  {jobs.slice(0, 4).map((job) => (
                    <Link key={job._id} to={`/recruiter/jobs/${job._id}/edit`}>
                      <motion.div whileHover={{ x: 2 }} className="flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-3.5 hover:bg-[var(--bg-tertiary)] transition-colors">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{job.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Users className="h-3 w-3 text-[var(--text-tertiary)]" />
                            <p className="text-xs text-[var(--text-secondary)]">{job.applications?.length || 0} applicants</p>
                          </div>
                        </div>
                        <Badge variant={job.status === 'Active' ? 'success' : 'default'} size="xs" pulse={job.status === 'Active'}>
                          {job.status || 'Draft'}
                        </Badge>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-2 dark:from-purple-950/50 dark:to-purple-900/50">
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-[var(--text-primary)]">Recent Activity</h2>
                  <p className="text-xs text-[var(--text-tertiary)]">Latest applications</p>
                </div>
              </div>
              {apps.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No applications received yet"
                  description="Applications will appear here once candidates start applying."
                  small
                />
              ) : (
                <div className="space-y-2">
                  {apps.slice(0, 4).map((app) => (
                    <motion.div key={app._id} whileHover={{ x: 2 }} className="flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-3.5 hover:bg-[var(--bg-tertiary)] transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 font-semibold text-xs">
                          {app.candidateId?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{app.candidateId?.name || 'Anonymous'}</p>
                          <p className="text-xs text-[var(--text-tertiary)]">Applied to {app.jobId?.title || 'a job'}</p>
                        </div>
                      </div>
                      <Badge variant={app.status === 'Applied' ? 'primary' : app.status === 'Shortlisted' ? 'success' : 'default'} size="xs">
                        {app.status}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {unreadCount > 0 && (
        <motion.div variants={itemVariants}>
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
        </motion.div>
      )}
    </motion.div>
  )
}

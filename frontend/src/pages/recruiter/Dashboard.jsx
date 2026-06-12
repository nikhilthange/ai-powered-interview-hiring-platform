import { useAuth } from '../../hooks/useAuth'
import { useApi } from '../../hooks/useApi'
import { jobApi } from '../../services/jobApi'
import { Card, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { SkeletonPage } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import { Briefcase, Eye, Plus, ArrowRight, FileText, Users, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'

export default function RecruiterDashboard() {
  const { user } = useAuth()

  const { data: jobsData, isLoading: jobsLoading } = useApi(['my-jobs'], () =>
    jobApi.getMyJobs().then((r) => r.data)
  )

  const jobs = jobsData?.data?.jobs || []
  const activeJobs = jobs.filter((j) => j.status === 'Active')

  if (jobsLoading) return <SkeletonPage />

  const totalApps = jobs.reduce((sum, j) => sum + (j.applicationCount || 0), 0)

  const stats = [
    {
      label: 'Active Jobs',
      value: activeJobs.length,
      icon: Briefcase,
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950',
      subtitle: 'Currently hiring',
    },
    {
      label: 'Total Jobs',
      value: jobs.length,
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-950',
      subtitle: 'All time',
    },
    {
      label: 'Applications',
      value: totalApps,
      icon: Users,
      color: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950',
      subtitle: 'Received across all jobs',
    },
    {
      label: 'Closed',
      value: jobs.filter((j) => j.status === 'Closed').length,
      icon: CheckCircle,
      color: 'from-amber-500 to-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-950',
      subtitle: 'Filled positions',
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
            <p className="text-sm font-medium text-white/80 mb-1">Recruiter Dashboard</p>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {user?.email?.split('@')[0] || 'Recruiter'}
            </h1>
            <p className="text-sm text-white/70 mt-1">Manage your job listings and applications</p>
          </div>
          <Link to="/recruiter/jobs/create">
            <Button className="bg-white text-[var(--color-primary-700)] hover:bg-white/90 shadow-none">
              <Plus className="h-4 w-4" />
              Post a Job
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">{stat.label}</span>
                  <div className={cn('rounded-xl p-2 text-[var(--color-primary-600)]', stat.bg)}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">{stat.subtitle}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-2 dark:from-blue-950 dark:to-blue-900">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-[var(--text-primary)]">Your Job Listings</h2>
                <p className="text-xs text-[var(--text-tertiary)]">{activeJobs.length} active, {jobs.length} total</p>
              </div>
            </div>
            <Link to="/recruiter/my-jobs" className="text-sm font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-colors">
              View all
            </Link>
          </div>
          {jobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No jobs posted yet"
              description="Post your first job and start receiving applications."
              action={{ label: 'Post Your First Job', props: { onClick: () => window.location.href = '/recruiter/jobs/create', icon: Plus } }}
            />
          ) : (
            <div className="space-y-2">
              {jobs.slice(0, 5).map((job) => (
                <Link key={job._id} to={`/recruiter/jobs/${job._id}/applications`}>
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 transition-all card-hover-effect">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-50)] text-[var(--color-primary-600)] dark:bg-[var(--color-primary-950)] dark:text-[var(--color-primary-400)] text-xs font-bold">
                          {job.title?.charAt(0) || 'J'}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-[var(--text-primary)]">{job.title}</p>
                          <p className="text-xs text-[var(--text-secondary)]">{job.location} &middot; {job.jobType}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant={job.status === 'Active' ? 'success' : 'default'} size="xs">{job.status}</Badge>
                      <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)]" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}



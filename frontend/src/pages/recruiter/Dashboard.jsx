import { useAuth } from '../../hooks/useAuth'
import { useApi } from '../../hooks/useApi'
import { jobApi } from '../../services/jobApi'
import { Card, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { SkeletonPage } from '../../components/ui/Skeleton'
import { Briefcase, Users, Eye, Plus, ArrowRight, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function RecruiterDashboard() {
  const { user } = useAuth()

  const { data: jobsData, isLoading: jobsLoading } = useApi(['my-jobs'], () =>
    jobApi.getMyJobs().then((r) => r.data)
  )

  const jobs = jobsData?.data?.jobs || []
  const activeJobs = jobs.filter((j) => j.status === 'Active')

  if (jobsLoading) return <SkeletonPage />

  return (
    <div className="space-y-6 page-section">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Recruiter Dashboard</h1>
          <p className="text-sm text-[var(--text-secondary)]">Welcome back, {user?.email?.split('@')[0] || 'Recruiter'}</p>
        </div>
        <Link to="/recruiter/jobs/create">
          <Button icon={Plus}>Post a Job</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Active Jobs</span>
              <div className="rounded-lg bg-blue-50 p-1.5 dark:bg-blue-950">
                <Briefcase className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{activeJobs.length}</p>
            <p className="text-xs text-[var(--text-secondary)]">Currently hiring</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Total Jobs</span>
              <div className="rounded-lg bg-purple-50 p-1.5 dark:bg-purple-950">
                <FileText className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{jobs.length}</p>
            <p className="text-xs text-[var(--text-secondary)]">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Closed</span>
              <div className="rounded-lg bg-amber-50 p-1.5 dark:bg-amber-950">
                <Eye className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{jobs.filter((j) => j.status === 'Closed').length}</p>
            <p className="text-xs text-[var(--text-secondary)]">Filled positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Active</span>
              <div className="rounded-lg bg-green-50 p-1.5 dark:bg-green-950">
                <Briefcase className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{activeJobs.length}</p>
            <p className="text-xs text-[var(--text-secondary)]">Open positions</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Jobs */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[var(--text-primary)]">Your Job Listings</h2>
            <Link to="/recruiter/my-jobs" className="text-xs font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-colors">
              View all
            </Link>
          </div>
          {jobs.length === 0 ? (
            <div className="py-8 text-center">
              <Briefcase className="mx-auto h-10 w-10 text-[var(--text-tertiary)]" />
              <p className="mt-3 text-sm text-[var(--text-secondary)]">You haven't posted any jobs yet.</p>
              <Link to="/recruiter/jobs/create">
                <Button size="sm" className="mt-4" icon={Plus}>Post Your First Job</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {jobs.slice(0, 5).map((job) => (
                <Link key={job._id} to={`/recruiter/jobs/${job._id}/applications`}>
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 transition-all hover:border-[var(--color-primary-200)]">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)]">{job.title}</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">{job.location} &middot; {job.jobType}</p>
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
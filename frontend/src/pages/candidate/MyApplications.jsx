import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from '../../hooks/useApi'
import { applicationApi } from '../../services/applicationApi'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { Card, CardContent } from '../../components/ui/Card'
import { InlineSpinner } from '../../components/ui/Spinner'
import { SkeletonPage } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import { useToast } from '../../components/ui/Toast'
import { cn } from '../../lib/utils'
import { FileText, Send, Clock, Users, IndianRupee, CheckCircle, XCircle, ArrowRight, Briefcase } from 'lucide-react'

const stages = [
  { key: 'Applied', label: 'Applied', icon: Send },
  { key: 'Reviewing', label: 'Reviewing', icon: Clock },
  { key: 'Shortlisted', label: 'Shortlisted', icon: Users },
  { key: 'Interview Scheduled', label: 'Interview', icon: Users },
  { key: 'Hired', label: 'Hired', icon: IndianRupee },
]

const stageOrder = ['Applied', 'Reviewing', 'Shortlisted', 'Interview Scheduled', 'Hired']

const statusBadgeVariant = {
  Applied: 'info',
  Reviewing: 'warning',
  Shortlisted: 'default',
  'Interview Scheduled': 'primary',
  Rejected: 'danger',
  Hired: 'success',
}

const withdrawableStatuses = ['Applied', 'Reviewing']

function ApplicationPipeline({ currentStatus }) {
  const currentIdx = stageOrder.indexOf(currentStatus)

  return (
    <div className="flex items-center gap-0 w-full">
      {stages.map((stage, i) => {
        const Icon = stage.icon
        const isPast = i < currentIdx
        const isCurrent = i === currentIdx
        return (
          <div key={stage.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full transition-all',
                isPast
                  ? 'bg-[var(--color-primary-500)] text-white shadow-sm'
                  : isCurrent
                    ? 'bg-[var(--color-primary-500)] text-white ring-2 ring-[var(--color-primary-200)] dark:ring-[var(--color-primary-800)] shadow-sm'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
              )}>
                {isPast ? <CheckCircle className="h-4.5 w-4.5" /> : <Icon className="h-4 w-4" />}
              </div>
              <span className={cn(
                'text-xs mt-1.5 font-medium whitespace-nowrap',
                i <= currentIdx ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'
              )}>{stage.label}</span>
            </div>
            {i < stages.length - 1 && (
              <div className={cn(
                'flex-1 h-0.5 mx-1.5 sm:mx-3',
                currentIdx > i ? 'bg-[var(--color-primary-500)]' : 'bg-[var(--border-color)]'
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function MyApplications() {
  const queryClient = useQueryClient()
  const [withdrawingId, setWithdrawingId] = useState(null)
  const { toast } = useToast()

  const { data, isLoading, isError, error } = useApi(['my-applications'], () =>
    applicationApi.getMyApplications().then((r) => r.data)
  )

  const withdrawMutation = useMutation({
    mutationFn: (id) => applicationApi.withdrawApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] })
      setWithdrawingId(null)
      toast.success('Application Withdrawn', 'Your application has been withdrawn successfully.')
    },
    onError: (err) => {
      setWithdrawingId(null)
      toast.error('Failed to Withdraw', err?.response?.data?.message || 'Something went wrong.')
    },
  })

  const handleWithdraw = (id) => {
    if (window.confirm('Are you sure you want to withdraw this application?')) {
      setWithdrawingId(id)
      withdrawMutation.mutate(id)
    }
  }

  if (isLoading) return <SkeletonPage />

  if (isError) {
    return (
      <div className="page-section">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <XCircle className="h-12 w-12 text-red-400 mb-4" />
          <p className="text-lg font-medium text-[var(--text-primary)]">Failed to load applications</p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{error?.response?.data?.message || 'Something went wrong.'}</p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['my-applications'] })}
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-primary-500)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-600)] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const applications = data?.data?.applications || []

  return (
    <div className="page-section">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">My Applications</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {applications.length > 0
              ? `You have ${applications.length} application${applications.length !== 1 ? 's' : ''}`
              : 'Track your job applications'}
          </p>
        </div>
        <Link to="/jobs">
          <Button variant="outline" className="mt-2 sm:mt-0">
            <Briefcase className="h-4 w-4" /> Browse Jobs
          </Button>
        </Link>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications yet"
          description="You haven't applied to any jobs yet. Start exploring opportunities!"
          action={{ label: 'Browse Jobs', props: { onClick: () => window.location.href = '/jobs' } }}
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const job = app.jobId || {}
            return (
              <Card key={app._id}>
                <CardContent className="p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-50)] text-[var(--color-primary-600)] dark:bg-[var(--color-primary-950)] dark:text-[var(--color-primary-400)] font-semibold text-sm">
                          {job.title?.charAt(0) || 'J'}
                        </span>
                        <div>
                          <h2 className="text-base font-semibold text-[var(--text-primary)]">
                            {job.title || 'Job'}
                          </h2>
                          <p className="text-xs text-[var(--text-secondary)]">
                            {[job.location, job.jobType].filter(Boolean).join(' · ') || 'Details not available'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Badge variant={statusBadgeVariant[app.status] || 'default'} size="sm" className="self-start sm:self-center">
                      {app.status}
                    </Badge>
                  </div>

                  {app.status !== 'Rejected' && (
                    <div className="overflow-x-auto pb-1">
                      <ApplicationPipeline currentStatus={app.status} />
                    </div>
                  )}

                  {app.status === 'Rejected' && (
                    <div className="flex items-center gap-2 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                      <XCircle className="h-4 w-4 shrink-0" />
                      <span>This application was not selected to move forward.</span>
                    </div>
                  )}

                  {app.atsScore > 0 && (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                      <span className="text-[var(--text-secondary)]">
                        ATS Score:{' '}
                        <span className={cn(
                          'font-semibold',
                          app.atsScore >= 80 ? 'text-green-600 dark:text-green-400' :
                          app.atsScore >= 60 ? 'text-amber-600 dark:text-amber-400' :
                          'text-red-600 dark:text-red-400'
                        )}>{app.atsScore}/100</span>
                      </span>
                      <span className="hidden sm:inline text-[var(--text-tertiary)]">·</span>
                      <span className="text-[var(--text-secondary)]">
                        Match:{' '}
                        <span className={cn(
                          'font-semibold',
                          app.matchPercent >= 80 ? 'text-green-600 dark:text-green-400' :
                          app.matchPercent >= 60 ? 'text-amber-600 dark:text-amber-400' :
                          'text-red-600 dark:text-red-400'
                        )}>{app.matchPercent}%</span>
                      </span>
                      <span className="hidden sm:inline text-[var(--text-tertiary)]">·</span>
                      <span className="text-[var(--text-tertiary)]">
                        Applied {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-[var(--border-color)]">
                    <Link
                      to={`/applications/${app._id}/analysis`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-colors"
                    >
                      View Analysis <ArrowRight className="h-4 w-4" />
                    </Link>
                    {withdrawableStatuses.includes(app.status) && (
                      <button
                        onClick={() => handleWithdraw(app._id)}
                        disabled={withdrawingId === app._id && withdrawMutation.isPending}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-500 disabled:opacity-50 transition-colors"
                      >
                        {withdrawingId === app._id && withdrawMutation.isPending ? (
                          <><InlineSpinner className="h-4 w-4" /> Withdrawing...</>
                        ) : (
                          <><XCircle className="h-4 w-4" /> Withdraw</>
                        )}
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

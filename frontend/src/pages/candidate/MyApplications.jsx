import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from '../../hooks/useApi'
import { applicationApi } from '../../services/applicationApi'
import { PageSpinner } from '../../components/ui/Spinner'
import { useToast } from '../../components/ui/Toast'
import { cn } from '../../lib/utils'
import { FileText, ArrowRight, XCircle, CheckCircle, Clock, Send, Users, Briefcase, Currency } from 'lucide-react'

const stages = [
  { key: 'Applied', label: 'Applied', icon: Send },
  { key: 'Reviewing', label: 'Reviewing', icon: Clock },
  { key: 'Shortlisted', label: 'Shortlisted', icon: Users },
  { key: 'Interview Scheduled', label: 'Interview', icon: Users },
  { key: 'Hired', label: 'Hired', icon: Currency },
]

const stageOrder = ['Applied', 'Reviewing', 'Shortlisted', 'Interview Scheduled', 'Hired']

const statusColors = {
  Applied: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  Reviewing: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  Shortlisted: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  'Interview Scheduled': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  Hired: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
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
                'flex h-8 w-8 items-center justify-center rounded-full transition-all',
                isPast ? 'bg-[var(--color-primary-500)] text-white' :
                isCurrent ? 'bg-[var(--color-primary-500)] text-white ring-2 ring-[var(--color-primary-200)]' :
                'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
              )}>
                {isPast ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <span className={cn(
                'text-xs mt-1 font-medium',
                i <= currentIdx ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'
              )}>{stage.label}</span>
            </div>
            {i < stages.length - 1 && (
              <div className={cn(
                'flex-1 h-0.5 mx-2',
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

  if (isLoading) return <PageSpinner />
  if (isError) {
    return (
      <div className="space-y-6 page-section">
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-red-700">{error?.response?.data?.message || 'Failed to load applications.'}</p>
          <button onClick={() => queryClient.invalidateQueries({ queryKey: ['my-applications'] })} className="mt-4 text-sm font-medium text-red-600 hover:text-red-500">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 page-section">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
      </div>

      {data?.data?.applications?.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-gray-500">You haven't applied to any jobs yet.</p>
          <Link to="/jobs" className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.data?.applications?.map((app) => (
            <div key={app._id} className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {app.jobId?.title || 'Job'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {app.jobId?.location} &middot; {app.jobId?.jobType}
                  </p>
                </div>
                <span className={cn('rounded-full px-3 py-1 text-xs font-medium', statusColors[app.status] || 'bg-gray-100 text-gray-700')}>
                  {app.status}
                </span>
              </div>

              {app.status !== 'Rejected' && (
                <ApplicationPipeline currentStatus={app.status} />
              )}

              {app.status === 'Rejected' && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <XCircle className="h-4 w-4" />
                  <span>This application was not selected to move forward.</span>
                </div>
              )}

              {app.atsScore > 0 && (
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600">
                    ATS Score: <span className="font-semibold text-gray-900">{app.atsScore}/100</span>
                  </span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-600">
                    Match: <span className="font-semibold text-gray-900">{app.matchPercent}%</span>
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-1">
                <Link
                  to={`/applications/${app._id}/analysis`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View Analysis <ArrowRight className="h-4 w-4" />
                </Link>
                {withdrawableStatuses.includes(app.status) && (
                  <button
                    onClick={() => handleWithdraw(app._id)}
                    disabled={withdrawingId === app._id && withdrawMutation.isPending}
                    className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-500 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    {withdrawingId === app._id && withdrawMutation.isPending ? 'Withdrawing...' : 'Withdraw'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

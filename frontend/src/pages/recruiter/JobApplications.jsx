import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { applicationApi } from '../../services/applicationApi'
import { SkeletonPage } from '../../components/ui/Skeleton'
import { useToast } from '../../components/ui/Toast'
import ScheduleInterviewModal from '../../components/interviews/ScheduleInterviewModal'
import { ArrowLeft, ExternalLink, AlertCircle, Calendar } from 'lucide-react'

const statusColors = {
  Applied: 'bg-blue-100 text-blue-700',
  Reviewing: 'bg-yellow-100 text-yellow-700',
  Shortlisted: 'bg-purple-100 text-purple-700',
  'Interview Scheduled': 'bg-indigo-100 text-indigo-700',
  Rejected: 'bg-red-100 text-red-700',
  Hired: 'bg-green-100 text-green-700',
}

const statuses = ['Applied', 'Reviewing', 'Shortlisted', 'Interview Scheduled', 'Rejected', 'Hired']

function getResumeUrl(resumeUrl) {
  if (!resumeUrl) return null
  if (resumeUrl.startsWith('http://') || resumeUrl.startsWith('https://')) return resumeUrl
  return resumeUrl
}

export default function JobApplications() {
  const { jobId } = useParams()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [schedulingApp, setSchedulingApp] = useState(null)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['job-applications', jobId],
    queryFn: () => applicationApi.getJobApplications(jobId).then((r) => r.data),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => applicationApi.updateApplicationStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job-applications', jobId] })
      toast.success('Status Updated', `Application moved to "${variables.status}".`)
    },
    onError: (err) => {
      toast.error('Failed to Update', err?.response?.data?.message || 'Could not update status.')
    },
  })

  const handleStatusChange = (id, currentStatus, newStatus) => {
    if (newStatus === 'Rejected' && !window.confirm('Mark this application as Rejected? This cannot be undone.')) {
      return
    }
    statusMutation.mutate({ id, status: newStatus })
  }

  if (isLoading) return <SkeletonPage />
  if (isError) {
    return (
      <div className="space-y-6">
        <Link to="/recruiter/my-jobs" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Back to my jobs
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-400" />
          <p className="mt-2 text-red-700">{error?.response?.data?.message || 'Failed to load applications.'}</p>
          <button onClick={() => queryClient.invalidateQueries({ queryKey: ['job-applications', jobId] })} className="mt-4 text-sm font-medium text-red-600 hover:text-red-500">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const applications = data?.data?.applications || []
  const sorted = [...applications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return (
    <div className="space-y-6">
      <Link to="/recruiter/my-jobs" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> Back to my jobs
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <span className="text-sm text-gray-500">{sorted.length} total</span>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-3 text-gray-500">No applications received yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((app) => {
            const candidateName = app.candidateId?.name || app.candidateId?.email?.split('@')[0] || 'Unknown'
            const resumeUrl = getResumeUrl(app.resumeUrl)
            const isUpdating = statusMutation.isPending && statusMutation.variables?.id === app._id

            return (
              <div key={app._id} className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{candidateName}</p>
                      <span className="text-sm text-gray-400">{app.candidateId?.email}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-400">
                      Applied {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-sm">
                      {app.atsScore > 0 && (
                        <span className="text-gray-600">
                          ATS: <span className="font-semibold text-gray-900">{app.atsScore}</span>/100
                        </span>
                      )}
                      {app.matchPercent > 0 && (
                        <span className="text-gray-600">
                          Match: <span className="font-semibold text-gray-900">{app.matchPercent}%</span>
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Link
                        to={`/applications/${app._id}/analysis`}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        View Analysis
                      </Link>
                      {resumeUrl && (
                        <a
                          href={resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-xs font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          Resume <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {app.status === 'Interview Scheduled' && (
                        <button
                          onClick={() => setSchedulingApp(app)}
                          className="inline-flex items-center gap-0.5 text-xs font-medium text-green-600 hover:text-green-500"
                        >
                          <Calendar className="h-3 w-3" /> Schedule Interview
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app._id, app.status, e.target.value)}
                      disabled={isUpdating}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium border ${statusColors[app.status] || 'bg-gray-100 text-gray-700'} focus:outline-none disabled:opacity-50`}
                    >
                      {statuses.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {schedulingApp && (
        <ScheduleInterviewModal
          open={!!schedulingApp}
          onClose={() => setSchedulingApp(null)}
          application={schedulingApp}
        />
      )}
    </div>
  )
}

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { interviewApi } from '../services/interviewApi'
import Button from '../components/ui/Button'
import { useToast } from '../components/ui/Toast'
import { useAuth } from '../hooks/useAuth'
import { PageSpinner } from '../components/ui/Spinner'
import { Calendar, Clock, Video, XCircle, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '../lib/utils'

const statusColors = {
  Scheduled: 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
}

export default function MyInterviews() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [cancellingId, setCancellingId] = useState(null)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['my-interviews'],
    queryFn: () => interviewApi.getMyInterviews(),
  })

  const cancelMutation = useMutation({
    mutationFn: (id) => interviewApi.updateInterview(id, { status: 'Cancelled' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-interviews'] })
      setCancellingId(null)
      toast.success('Interview Cancelled', 'The interview has been cancelled.')
    },
    onError: (err) => {
      setCancellingId(null)
      toast.error('Failed to Cancel', err?.response?.data?.message || 'Something went wrong.')
    },
  })

  if (isLoading) return <PageSpinner />
  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Interviews</h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-400" />
          <p className="mt-2 text-red-700">{error?.response?.data?.message || 'Failed to load interviews.'}</p>
          <button onClick={() => queryClient.invalidateQueries({ queryKey: ['my-interviews'] })} className="mt-4 text-sm font-medium text-red-600 hover:text-red-500">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const interviews = data?.data?.interviews || []
  const isRecruiter = user?.role === 'recruiter'
  const upcoming = interviews.filter((i) => i.status === 'Scheduled')
  const past = interviews.filter((i) => i.status !== 'Scheduled')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Interviews</h1>

      {interviews.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-gray-500">
            {isRecruiter
              ? 'No interviews scheduled yet. Review applications to schedule interviews.'
              : 'No interviews scheduled yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">Upcoming</h2>
              <div className="space-y-3">
                {upcoming.map((interview) => {
                  const otherParty = isRecruiter ? interview.candidateId : interview.recruiterId
                  return (
                    <div key={interview._id} className="rounded-xl border border-blue-200 bg-white p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <p className="font-medium text-gray-900">
                              {new Date(interview.scheduledAt).toLocaleDateString('en-US', {
                                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                              })}
                            </p>
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            {new Date(interview.scheduledAt).toLocaleTimeString('en-US', {
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </div>
                          {otherParty && (
                            <p className="mt-2 text-sm text-gray-600">
                              {isRecruiter ? 'Candidate' : 'Recruiter'}: <span className="font-medium text-gray-900">{otherParty.email}</span>
                            </p>
                          )}
                          {interview.meetLink && (
                            <a
                              href={interview.meetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                            >
                              <Video className="h-4 w-4" /> Join Meeting <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className={cn('rounded-full px-3 py-1 text-xs font-medium', statusColors[interview.status])}>
                            {interview.status}
                          </span>
                          {isRecruiter && (
                            <button
                              onClick={() => {
                                if (window.confirm('Cancel this interview?')) {
                                  setCancellingId(interview._id)
                                  cancelMutation.mutate(interview._id)
                                }
                              }}
                              disabled={cancellingId === interview._id && cancelMutation.isPending}
                              className="flex items-center gap-1 text-xs text-red-600 hover:text-red-500 disabled:opacity-50"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              {cancellingId === interview._id && cancelMutation.isPending ? 'Cancelling...' : 'Cancel'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">Past</h2>
              <div className="space-y-3">
                {past.map((interview) => (
                  <div key={interview._id} className="rounded-xl border border-gray-200 bg-white p-5 opacity-70">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <p className="font-medium text-gray-900">
                            {new Date(interview.scheduledAt).toLocaleDateString('en-US', {
                              month: 'long', day: 'numeric', year: 'numeric'
                            })}
                          </p>
                        </div>
                        {interview.gptInterviewFeedback && (
                          <p className="mt-2 text-sm text-gray-600 italic">
                            Feedback: {interview.gptInterviewFeedback}
                          </p>
                        )}
                      </div>
                      <span className={cn('rounded-full px-3 py-1 text-xs font-medium', statusColors[interview.status])}>
                        {interview.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

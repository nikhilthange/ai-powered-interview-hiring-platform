import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { jobApi } from '../services/jobApi'
import { savedJobApi } from '../services/savedJobApi'
import { PageSpinner } from '../components/ui/Spinner'
import Button from '../components/ui/Button'
import { MapPin, Briefcase, Clock, ArrowLeft, Bookmark, BookmarkCheck } from 'lucide-react'

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobApi.getJob(id).then((r) => r.data),
  })

  const { data: savedData } = useQuery({
    queryKey: ['saved-job-check', id],
    queryFn: () => savedJobApi.isJobSaved(id).then((r) => r.data),
    enabled: isAuthenticated,
  })

  const saveMutation = useMutation({
    mutationFn: () => savedJobApi.saveJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-job-check', id] })
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] })
    },
  })

  const unSaveMutation = useMutation({
    mutationFn: () => savedJobApi.unsaveJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-job-check', id] })
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] })
    },
  })

  if (isLoading) return <PageSpinner />

  const job = data?.data?.job
  if (!job) return <p className="text-gray-500">Job not found.</p>

  const isClosed = job.status === 'Closed'
  const isSaved = savedData?.data?.isSaved || false

  return (
    <div className="max-w-3xl space-y-6 page-section">
      <Link
        to="/jobs"
        className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to jobs
      </Link>

      <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">{job.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[var(--text-secondary)]">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location}</span>
              <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{job.jobType}</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{job.experienceLevel}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={() => isSaved ? unSaveMutation.mutate() : saveMutation.mutate()}
                className={`rounded-lg p-2 transition-colors ${isSaved ? 'text-[var(--color-primary-600)] bg-[var(--color-primary-50)]' : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)]'}`}
                title={isSaved ? 'Unsave job' : 'Save job'}
                disabled={saveMutation.isPending || unSaveMutation.isPending}
              >
                {isSaved ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
              </button>
            )}
            {isClosed && (
              <span className="rounded-full bg-[var(--color-error)]/10 px-3 py-1 text-xs font-medium text-[var(--color-error)]">Closed</span>
            )}
          </div>
        </div>

        {job.salaryRange?.min > 0 && (
          <div className="rounded-lg bg-[var(--color-success)]/10 px-4 py-3">
            <p className="text-sm font-medium text-[var(--color-success)]">
              Salary: ₹{job.salaryRange.min.toLocaleString('en-IN')}
              {job.salaryRange.max > 0 && ` - ₹${job.salaryRange.max.toLocaleString('en-IN')}`}
            </p>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Description</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)] whitespace-pre-line">{job.description}</p>
        </div>

        {job.requirements?.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Requirements</h2>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-[var(--text-secondary)]">
              {job.requirements.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button
            disabled={isClosed}
            onClick={() => {
              if (!isAuthenticated) {
                navigate('/login', { state: { from: { pathname: `/jobs/${id}` } } })
              } else {
                navigate(`/jobs/${id}/apply`)
              }
            }}
          >
            {isClosed ? 'Position Closed' : 'Apply Now'}
          </Button>
          {isAuthenticated && (
            <Button
              variant="outline"
              onClick={() => isSaved ? unSaveMutation.mutate() : saveMutation.mutate()}
              disabled={saveMutation.isPending || unSaveMutation.isPending}
              icon={isSaved ? BookmarkCheck : Bookmark}
            >
              {isSaved ? 'Saved' : 'Save Job'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

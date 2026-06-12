import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { jobApi } from '../services/jobApi'
import { savedJobApi } from '../services/savedJobApi'
import { SkeletonPage } from '../components/ui/Skeleton'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { Card, CardContent } from '../components/ui/Card'
import { MapPin, Briefcase, Clock, ArrowLeft, Bookmark, BookmarkCheck, IndianRupee, Building2, Share2, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react'
import { formatDate, formatCurrency, formatDateRelative, cn } from '../lib/utils'

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

  if (isLoading) return <SkeletonPage />

  const job = data?.data?.job
  if (!job) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <AlertCircle className="h-12 w-12 text-[var(--text-tertiary)] mb-4" />
      <p className="text-lg font-medium text-[var(--text-primary)]">Job not found</p>
      <Link to="/jobs" className="mt-4 text-sm font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)]">
        Back to jobs
      </Link>
    </div>
  )

  const isClosed = job.status === 'Closed'
  const isSaved = savedData?.data?.isSaved || false

  return (
    <div className="page-section">
      <Link
        to="/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to jobs
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-primary-50)] to-[var(--color-primary-100)] text-[var(--color-primary-600)] dark:from-[var(--color-primary-950)] dark:to-[var(--color-primary-900)] dark:text-[var(--color-primary-400)] text-xl font-bold">
                    {job.company?.charAt(0) || job.title?.charAt(0) || 'J'}
                  </span>
                  <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">{job.title}</h1>
                    {job.company && (
                      <p className="text-sm text-[var(--text-secondary)] mt-1 flex items-center gap-1.5">
                        <Building2 className="h-4 w-4" />
                        {job.company}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-[var(--text-secondary)]">
                      <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{job.location}</span>
                      <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" />{job.jobType}</span>
                      <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{job.experienceLevel}</span>
                      <span className="text-[var(--text-tertiary)]">Posted {formatDateRelative(job.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isAuthenticated && (
                    <button
                      onClick={() => isSaved ? unSaveMutation.mutate() : saveMutation.mutate()}
                      className={cn(
                        'rounded-xl p-2.5 transition-colors border',
                        isSaved
                          ? 'text-[var(--color-primary-600)] bg-[var(--color-primary-50)] border-[var(--color-primary-200)] dark:bg-[var(--color-primary-950)] dark:border-[var(--color-primary-800)]'
                          : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] border-[var(--border-color)]'
                      )}
                      title={isSaved ? 'Unsave job' : 'Save job'}
                      disabled={saveMutation.isPending || unSaveMutation.isPending}
                      aria-label={isSaved ? 'Unsave job' : 'Save job'}
                    >
                      {isSaved ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                    </button>
                  )}
                  {isClosed && (
                    <Badge variant="danger" size="md">Closed</Badge>
                  )}
                </div>
              </div>

              {job.salaryRange?.min > 0 && (
                <div className="mt-6 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-950 dark:to-emerald-900/50 border border-emerald-200/50 dark:border-emerald-800/50 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                      {formatCurrency(job.salaryRange.min)}
                      {job.salaryRange.max > 0 && ` - ${formatCurrency(job.salaryRange.max)}`}
                      <span className="font-normal text-emerald-600 dark:text-emerald-400"> /year</span>
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Description</h2>
              <p className="text-sm text-[var(--text-secondary)] whitespace-pre-line leading-relaxed">{job.description}</p>
            </CardContent>
          </Card>

          {job.requirements?.length > 0 && (
            <Card>
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Requirements</h2>
                <ul className="space-y-3">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary-500)]" />
                      {req}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {job.benefits?.length > 0 && (
            <Card>
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Benefits</h2>
                <div className="flex flex-wrap gap-2">
                  {job.benefits.map((benefit) => (
                    <Badge key={benefit} variant="success" size="md">{benefit}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="sticky top-24">
            <CardContent className="p-6 space-y-4">
              <Button
                className="w-full"
                size="lg"
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
                  className="w-full"
                  onClick={() => isSaved ? unSaveMutation.mutate() : saveMutation.mutate()}
                  disabled={saveMutation.isPending || unSaveMutation.isPending}
                >
                  {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                  {isSaved ? 'Saved' : 'Save Job'}
                </Button>
              )}

              <div className="border-t border-[var(--border-color)] pt-4 space-y-3">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Job Details</h3>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-tertiary)]">Type</span>
                    <Badge variant={job.jobType === 'Remote' ? 'success' : 'primary'} size="xs">{job.jobType}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-tertiary)]">Level</span>
                    <span className="font-medium text-[var(--text-primary)]">{job.experienceLevel}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-tertiary)]">Location</span>
                    <span className="font-medium text-[var(--text-primary)]">{job.location}</span>
                  </div>
                  {job.salaryRange?.min > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-tertiary)]">Salary</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(job.salaryRange.min)}
                        {job.salaryRange.max > 0 && ` - ${formatCurrency(job.salaryRange.max)}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

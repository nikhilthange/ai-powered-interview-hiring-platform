import { motion } from 'framer-motion'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jobApi } from '../services/jobApi'
import { savedJobApi } from '../services/savedJobApi'
import { chatApi } from '../services/chatApi'
import { Card, CardContent } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { useToast } from '../components/ui/Toast'
import { SkeletonPage } from '../components/ui/Skeleton'
import { cn } from '../lib/utils'
import { useAuth } from '../hooks/useAuth'
import {
  MapPin, Briefcase, DollarSign,
  Share2, Bookmark, ArrowLeft, CheckCircle,
  GraduationCap, Bot, MessageCircle
} from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function JobDetail() {
  const { id } = useParams()
  const { toast } = useToast()
  const { isAuthenticated, user } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobApi.getJob(id).then((r) => r.data),
  })

  const { data: savedData } = useQuery({
    queryKey: ['saved-job-check', id],
    queryFn: () => savedJobApi.isJobSaved(id).then((r) => r.data),
    enabled: !!isAuthenticated,
  })
  const isSaved = savedData?.data?.isSaved === true

  const saveMutation = useMutation({
    mutationFn: () => isSaved ? savedJobApi.unsaveJob(id) : savedJobApi.saveJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] })
      queryClient.invalidateQueries({ queryKey: ['saved-job-check', id] })
      toast.success(isSaved ? 'Job removed from saved' : 'Job saved')
    },
    onError: (err) => {
      toast.error('Failed', err?.response?.data?.message || 'Please try again.')
    },
  })

  const messageMutation = useMutation({
    mutationFn: (recruiterId) => chatApi.getOrCreateRoom(recruiterId),
    onSuccess: () => {
      navigate('/chat')
    },
    onError: () => {
      toast.error('Failed to start conversation.')
    }
  })

  const job = data?.data?.job || data?.data || data

  if (isLoading) return <SkeletonPage />

  if (isError) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <p className="text-lg font-medium text-[var(--text-primary)]">Job not found</p>
        <Link to="/jobs" className="text-sm text-indigo-600 mt-2 inline-block">
          Back to jobs
        </Link>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-6"
    >
      <motion.div variants={itemVariants}>
        <Link to="/jobs" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to jobs
        </Link>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-5 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
              <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 text-indigo-600 dark:text-indigo-400 font-bold text-xl sm:text-2xl">
                {job.title?.charAt(0) || 'J'}
              </div>
              <div className="flex-1 min-w-0 w-full">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] break-words">{job.title}</h1>
                    {job.recruiterId?.email && (
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-sm sm:text-base text-[var(--text-secondary)]">{job.recruiterId.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-4">
                  {job.location && (
                    <Badge variant="default" size="md">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.location}
                    </Badge>
                  )}
                  {job.salaryRange?.min > 0 && (
                    <Badge variant="primary" size="md">
                      <DollarSign className="h-3.5 w-3.5" />
                      ₹{job.salaryRange.min.toLocaleString('en-IN')}
                    </Badge>
                  )}
                  {job.jobType && <Badge variant="info" size="md">{job.jobType}</Badge>}
                  {job.experienceLevel && (
                    <Badge variant="warning" size="md">
                      <GraduationCap className="h-3.5 w-3.5" />
                      {job.experienceLevel}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-6">
                  {isAuthenticated && (
                    <Link to={`/jobs/${id}/apply`}>
                      <Button size="md" className="sm:px-5 sm:py-2.5">
                        <Briefcase className="h-4 w-4" />
                        Apply Now
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant={isSaved ? 'primary' : 'outline'}
                    size="md"
                    className="sm:px-5 sm:py-2.5"
                    onClick={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending}
                  >
                    <Bookmark className={cn('h-4 w-4', isSaved && 'fill-current')} />
                    {saveMutation.isPending ? '...' : isSaved ? 'Saved' : 'Save'}
                  </Button>
                  <Button variant="ghost" size="md" className="sm:px-5 sm:py-2.5">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  {isAuthenticated && (
                    <Button
                      variant="outline"
                      size="md"
                      className="sm:px-5 sm:py-2.5 border-indigo-300 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-400"
                      onClick={() => navigate(`/ai-chat?jobContext=true&jobTitle=${encodeURIComponent(job?.title || '')}&jobDescription=${encodeURIComponent(job?.description || '')}`)}
                    >
                      <Bot className="h-4 w-4" />
                      Ask AI
                    </Button>
                  )}
                  {isAuthenticated && job?.recruiterId?._id && user?._id !== job.recruiterId._id && (
                    <Button
                      variant="outline"
                      size="md"
                      className="sm:px-5 sm:py-2.5"
                      onClick={() => messageMutation.mutate(job.recruiterId._id)}
                      disabled={messageMutation.isPending}
                    >
                      <MessageCircle className="h-4 w-4" />
                      {messageMutation.isPending ? 'Starting...' : 'Message Recruiter'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {job.description && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-semibold text-[var(--text-primary)] mb-3">Description</h2>
                  <div className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                    {job.description}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {job.requirements?.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-semibold text-[var(--text-primary)] mb-3">Requirements</h2>
                  <ul className="space-y-2">
                    {job.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold text-[var(--text-primary)] mb-4">Job Details</h2>
                <div className="space-y-4">
                  {job.experienceLevel && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--text-secondary)]">Experience</span>
                      <span className="text-sm font-medium text-[var(--text-primary)]">{job.experienceLevel}</span>
                    </div>
                  )}
                  {job.jobType && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--text-secondary)]">Type</span>
                      <span className="text-sm font-medium text-[var(--text-primary)]">{job.jobType}</span>
                    </div>
                  )}
                  {job.location && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--text-secondary)]">Location</span>
                      <span className="text-sm font-medium text-[var(--text-primary)]">{job.location}</span>
                    </div>
                  )}
                  {job.salaryRange?.min > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--text-secondary)]">Salary</span>
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        ₹{job.salaryRange.min.toLocaleString('en-IN')}
                        {job.salaryRange.max > 0 && ` - ${job.salaryRange.max.toLocaleString('en-IN')}`}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

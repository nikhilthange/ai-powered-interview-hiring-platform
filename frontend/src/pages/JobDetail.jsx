import { motion } from 'framer-motion'
import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { jobApi } from '../services/jobApi'
import { Card, CardContent } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { useToast } from '../components/ui/Toast'
import { SkeletonPage } from '../components/ui/Skeleton'
import { cn } from '../lib/utils'
import {
  MapPin, Briefcase, DollarSign,
  Share2, Bookmark, ArrowLeft, CheckCircle,
  GraduationCap,
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
  const [saved, setSaved] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobApi.getJobById(id).then((r) => r.data),
  })

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

  const job = data?.data?.job || data?.data || data

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
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-start gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 text-indigo-600 dark:text-indigo-400 font-bold text-2xl">
                {job.company?.charAt(0) || job.title?.charAt(0) || 'J'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">{job.title}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-base text-[var(--text-secondary)]">{job.company || 'Company'}</span>
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs text-emerald-600 font-medium">Verified</span>
                    </div>
                  </div>
                  {job.aiMatchScore && (
                    <div className="flex flex-col items-center shrink-0">
                      <div className={cn(
                        'flex h-14 w-14 items-center justify-center rounded-xl text-sm font-bold',
                        job.aiMatchScore >= 80 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' :
                        job.aiMatchScore >= 60 ? 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400' :
                        'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400'
                      )}>
                        {job.aiMatchScore}%
                      </div>
                      <span className="text-[10px] text-[var(--text-tertiary)] mt-1">AI Match</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-4">
                  {job.location && (
                    <Badge variant="default" size="md">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.location}
                    </Badge>
                  )}
                  {job.salary && (
                    <Badge variant="primary" size="md">
                      <DollarSign className="h-3.5 w-3.5" />
                      {job.salary}
                    </Badge>
                  )}
                  {job.jobType && (
                    <Badge variant="info" size="md">{job.jobType}</Badge>
                  )}
                  {job.experienceLevel && (
                    <Badge variant="warning" size="md">
                      <GraduationCap className="h-3.5 w-3.5" />
                      {job.experienceLevel}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-6">
                  <Link to={`/jobs/${id}/apply`}>
                    <Button size="lg">
                      <Briefcase className="h-4 w-4" />
                      Apply Now
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => { setSaved(!saved); toast.success(saved ? 'Job removed from saved' : 'Job saved') }}
                  >
                    <Bookmark className={cn('h-4 w-4', saved && 'fill-current')} />
                    {saved ? 'Saved' : 'Save'}
                  </Button>
                  <Button variant="ghost" size="lg">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
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

          {job.responsibilities?.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-semibold text-[var(--text-primary)] mb-3">Responsibilities</h2>
                  <ul className="space-y-2">
                    {job.responsibilities.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                        {r}
                      </li>
                    ))}
                  </ul>
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
                  {job.salary && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--text-secondary)]">Salary</span>
                      <span className="text-sm font-medium text-[var(--text-primary)]">{job.salary}</span>
                    </div>
                  )}
                  {job.applicationsCount !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--text-secondary)]">Applicants</span>
                      <span className="text-sm font-medium text-[var(--text-primary)]">{job.applicationsCount}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {job.skills?.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-semibold text-[var(--text-primary)] mb-4">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <Badge key={skill} variant="primary" size="md">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold text-[var(--text-primary)] mb-4">About the Company</h2>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                    {job.company?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{job.company || 'Company'}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{job.industry || 'Technology'}</p>
                  </div>
                </div>
                {job.companyDescription && (
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {job.companyDescription}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

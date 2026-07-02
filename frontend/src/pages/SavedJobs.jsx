import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import api from '../services/axios'
import { Card, CardContent } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { SkeletonList } from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import {
  Bookmark, MapPin, DollarSign, Briefcase,
  Heart, GraduationCap, Building2,
} from 'lucide-react'
import { Link } from 'react-router-dom'


const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
}

export default function SavedJobs() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['saved-jobs-page'],
    queryFn: () => api.get('/saved-jobs').then((r) => r.data),
  })

  if (isLoading) return (
    <div className="space-y-6">
      <div className="skeleton-shimmer h-8 w-48 rounded-xl" />
      <SkeletonList count={4} />
    </div>
  )

  const savedJobs = data?.data?.jobs || data?.jobs || []

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Saved Jobs</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">{savedJobs.length} saved job{savedJobs.length !== 1 ? 's' : ''}</p>
      </motion.div>

      {savedJobs.length === 0 ? (
        <motion.div variants={itemVariants}>
          <EmptyState
            icon={Bookmark}
            title="No saved jobs"
            description="Save jobs you're interested in to review them later."
            action={{ label: 'Browse Jobs', props: { as: Link, to: '/jobs' } }}
          />
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-3">
          {savedJobs.map((saved) => {
            const job = saved.jobId || saved
            return (
              <motion.div key={saved._id || job._id} variants={itemVariants}>
                <Link to={`/jobs/${job._id}`}>
                  <Card className="hover:shadow-md transition-all">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                          {job.company?.charAt(0) || job.title?.charAt(0) || 'J'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-semibold text-[var(--text-primary)]">{job.title}</h3>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Building2 className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                                <span className="text-sm text-[var(--text-secondary)]">{job.company || 'Company'}</span>
                              </div>
                            </div>
                            <Heart className="h-5 w-5 text-red-500 fill-red-500 shrink-0" />
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            {job.location && (
                              <Badge variant="default" size="xs">
                                <MapPin className="h-3 w-3" />
                                {job.location}
                              </Badge>
                            )}
                            {job.salary && (
                              <Badge variant="primary" size="xs">
                                <DollarSign className="h-3 w-3" />
                                {job.salary}
                              </Badge>
                            )}
                            {job.jobType && <Badge variant="info" size="xs">{job.jobType}</Badge>}
                            {job.experienceLevel && (
                              <Badge variant="warning" size="xs">
                                <GraduationCap className="h-3 w-3" />
                                {job.experienceLevel}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-3">
                            <Link to={`/jobs/${job._id}/apply`}>
                              <Button size="sm">
                                <Briefcase className="h-3.5 w-3.5" />
                                Apply Now
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </motion.div>
  )
}

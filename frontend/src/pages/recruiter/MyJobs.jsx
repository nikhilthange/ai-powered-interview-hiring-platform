import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/axios'
import { Card, CardContent } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { SkeletonList } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import { Link } from 'react-router-dom'
import { Briefcase, Users, Eye, Plus, Edit, MapPin } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
}

export default function MyJobs() {
  const { data, isLoading } = useQuery({
    queryKey: ['recruiter-jobs'],
    queryFn: () => api.get('/jobs/my-jobs').then((r) => r.data),
  })

  if (isLoading) return (
    <div className="space-y-6">
      <div className="skeleton-shimmer h-8 w-48 rounded-xl" />
      <SkeletonList count={5} />
    </div>
  )

  const jobs = data?.data?.jobs || []

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">My Jobs</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{jobs.length} job{jobs.length !== 1 ? 's' : ''} posted</p>
        </div>
        <Link to="/recruiter/jobs/create">
          <Button>
            <Plus className="h-4 w-4" />
            Post a Job
          </Button>
        </Link>
      </motion.div>

      {jobs.length === 0 ? (
        <motion.div variants={itemVariants}>
          <EmptyState
            icon={Briefcase}
            title="No jobs posted yet"
            description="Create your first job listing to start receiving applications."
            action={{ label: 'Post a Job', props: { as: Link, to: '/recruiter/jobs/create' } }}
          />
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
          {jobs.map((job) => (
            <motion.div key={job._id} variants={itemVariants}>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                      {job.title?.charAt(0) || 'J'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-[var(--text-primary)]">{job.title}</h3>
                          <p className="text-sm text-[var(--text-secondary)] mt-0.5">{job.company || 'Company'}</p>
                        </div>
                        <Badge variant={job.status === 'active' ? 'success' : 'default'} size="sm">
                          {job.status || 'Draft'}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        {job.location && (
                          <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
                          <Users className="h-3 w-3" />
                          {job.applications?.length || 0} applicants
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
                          <Eye className="h-3 w-3" />
                          {job.views || 0} views
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <Link to={`/recruiter/jobs/${job._id}/edit`}>
                          <Button size="xs" variant="outline">
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                        </Link>
                        <Link to={`/recruiter/jobs/${job._id}/applications`}>
                          <Button size="xs" variant="primary">
                            <Users className="h-3 w-3" />
                            View Applications
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}

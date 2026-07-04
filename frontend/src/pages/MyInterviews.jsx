import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { interviewApi } from '../services/interviewApi'
import { Card, CardContent } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { SkeletonList } from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import { cn } from '../lib/utils'
import {
  Clock, Video,
  GraduationCap, BarChart3, Star,
  Play, FileText, AlertCircle, Calendar,
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

export default function MyInterviews() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['my-interviews'],
    queryFn: () => interviewApi.getMySessions(),
  })

  const sessions = Array.isArray(data) ? data : []

  if (isLoading) return (
    <div className="space-y-6">
      <div className="skeleton-shimmer h-8 w-48 rounded-xl" />
      <SkeletonList count={3} />
    </div>
  )

  if (isError) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to load interviews"
        action={{ label: 'Retry', props: { onClick: () => refetch() } }}
      />
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] break-words">My Interviews</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link to="/mock-interview">
          <Button>
            <Play className="h-4 w-4" />
            Start New Interview
          </Button>
        </Link>
      </motion.div>

      {sessions.length === 0 ? (
        <motion.div variants={itemVariants}>
          <EmptyState
            icon={GraduationCap}
            title="No interviews yet"
            description="Practice makes perfect. Start your first mock interview to prepare for the real thing."
            action={{ label: 'Start Mock Interview', props: { as: Link, to: '/mock-interview' } }}
          />
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
          {sessions.map((session) => (
            <motion.div key={session._id} variants={itemVariants}>
              <Card hover>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 text-indigo-600 dark:text-indigo-400 font-bold">
                      <Video className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-[var(--text-primary)]">
                            {session.targetRole || session.jobTitle || 'Mock Interview'}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Calendar className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                            <span className="text-sm text-[var(--text-secondary)]">
                              {new Date(session.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant={session.status === 'completed' ? 'success' : session.status === 'in-progress' ? 'warning' : 'default'}
                          size="sm"
                          pulse={session.status === 'in-progress'}
                        >
                          {session.status === 'completed' ? 'Completed' : session.status === 'in-progress' ? 'In Progress' : session.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        {session.overallScore && (
                          <div className="flex items-center gap-1.5">
                            <Star className="h-4 w-4 text-amber-500" />
                            <span className={cn('text-sm font-semibold', session.overallScore >= 70 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400')}>
                              {session.overallScore}%
                            </span>
                          </div>
                        )}
                        {session.questionCount && (
                          <div className="flex items-center gap-1.5 text-sm text-[var(--text-tertiary)]">
                            <FileText className="h-3.5 w-3.5" />
                            {session.questionCount} questions
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-sm text-[var(--text-tertiary)]">
                          <Clock className="h-3.5 w-3.5" />
                          {session.duration || 'N/A'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        {session.status === 'completed' && (
                          <Button size="xs" variant="outline">
                            <BarChart3 className="h-3 w-3" />
                            View Results
                          </Button>
                        )}
                        {session.status === 'in-progress' && (
                          <Button size="xs">
                            <Play className="h-3 w-3" />
                            Continue
                          </Button>
                        )}
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

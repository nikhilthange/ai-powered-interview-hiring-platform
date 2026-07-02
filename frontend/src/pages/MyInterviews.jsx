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
  Clock, CheckCircle, Video,
  GraduationCap, BarChart3, Star,
  Play, FileText,
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
  const { data, isLoading } = useQuery({
    queryKey: ['my-interviews'],
    queryFn: () => interviewApi.getMySessions(),
  })

  if (isLoading) return (
    <div className="space-y-6">
      <div className="skeleton-shimmer h-8 w-48 rounded-xl" />
      <SkeletonList count={3} />
    </div>
  )

  const sessions = Array.isArray(data) ? data : []

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">My Interviews</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{sessions.length} session{sessions.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/mock-interview">
          <Button>
            <Play className="h-4 w-4" />
            New Mock Interview
          </Button>
        </Link>
      </motion.div>

      {sessions.length === 0 ? (
        <motion.div variants={itemVariants}>
          <EmptyState
            icon={GraduationCap}
            title="No interview sessions yet"
            description="Start a mock interview to practice and improve your skills."
            action={{ label: 'Start Mock Interview', props: { as: Link, to: '/mock-interview' } }}
          />
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
          {sessions.map((session) => {
            const isCompleted = session.status === 'completed'
            const score = session.overallScore || session.score
            return (
              <motion.div key={session._id} variants={itemVariants}>
                <Card className="hover:shadow-md transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                        isCompleted ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                      )}>
                        {isCompleted ? <CheckCircle className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-[var(--text-primary)]">
                              {session.jobRole || session.title || 'Mock Interview'}
                            </h3>
                            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                              {session.experience || session.level || 'General'} level
                            </p>
                          </div>
                          <Badge variant={isCompleted ? 'success' : 'warning'} size="sm">
                            {session.status || 'In Progress'}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          {score && (
                            <div className="flex items-center gap-1.5 text-sm">
                              <Star className="h-4 w-4 text-amber-500" />
                              <span className="font-medium text-[var(--text-primary)]">{score}%</span>
                            </div>
                          )}
                          {session.createdAt && (
                            <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
                              <Clock className="h-3 w-3" />
                              {new Date(session.createdAt).toLocaleDateString()}
                            </div>
                          )}
                          {session.questionsCount && (
                            <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
                              <FileText className="h-3 w-3" />
                              {session.questionsCount} questions
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                          {isCompleted && (
                            <Button size="xs" variant="outline">
                              <BarChart3 className="h-3 w-3" />
                              View Results
                            </Button>
                          )}
                          {!isCompleted && (
                            <Link to="/mock-interview">
                              <Button size="xs">
                                <Play className="h-3 w-3" />
                                Continue
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </motion.div>
  )
}

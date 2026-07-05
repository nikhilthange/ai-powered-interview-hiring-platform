import { memo, useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { applicationApi } from '../../services/applicationApi'
import { Card, CardContent } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { SkeletonList } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import { cn } from '../../lib/utils'
import {
  MapPin, Clock, Eye,
  Building2, Star,
  Calendar, AlertCircle, Search,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { APPLICATION_STATUSES, STATUS_COLORS } from '../../lib/constants'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
}

const ApplicationItem = memo(function ApplicationItem({ app }) {
  return (
    <motion.div variants={itemVariants}>
      <Link to="/my-applications" className="block">
        <Card className="hover:shadow-md transition-all">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                {app.jobId?.title?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">{app.jobId?.title || 'Application'}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Building2 className="h-3.5 w-3.5 text-[var(--text-tertiary)]" aria-hidden="true" />
                      <span className="text-sm text-[var(--text-secondary)]">{app.jobId?.location || 'Company'}</span>
                    </div>
                  </div>
                  <Badge variant={STATUS_COLORS[app.status] || 'default'} size="sm">
                    {app.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  {app.jobId?.location && (
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
                      <MapPin className="h-3 w-3" aria-hidden="true" />
                      {app.jobId.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {new Date(app.createdAt).toLocaleDateString()}
                  </div>
                  {app.atsScore > 0 && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Star className={cn('h-3 w-3', app.atsScore >= 80 ? 'text-emerald-500' : app.atsScore >= 60 ? 'text-amber-500' : 'text-red-500')} aria-hidden="true" />
                      <span className="font-medium">ATS {app.atsScore}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-4">
                  {app.status === 'Interview Scheduled' && (
                    <Button size="xs" variant="primary">
                      <Calendar className="h-3 w-3" aria-hidden="true" />
                      View Interview
                    </Button>
                  )}
                  <Button size="xs" variant="ghost">
                    <Eye className="h-3 w-3" aria-hidden="true" />
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
})

export default function MyApplications() {
  const [activeTab, setActiveTab] = useState('All')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['my-applications-page'],
    queryFn: () => applicationApi.getMyApplications().then((r) => r.data),
    staleTime: 30000,
  })

  const applications = useMemo(() => data?.data?.applications || [], [data])

  const filtered = useMemo(() =>
    activeTab === 'All' ? applications : applications.filter((a) => a.status === activeTab),
    [applications, activeTab]
  )

  const handleTabChange = useCallback((status) => setActiveTab(status), [])

  if (isLoading) return (
    <div className="space-y-6">
      <div className="skeleton-shimmer h-8 w-48 rounded-xl" />
      <SkeletonList count={5} />
    </div>
  )

  if (isError) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to load applications"
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
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] break-words">My Applications</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {applications.length} application{applications.length !== 1 ? 's' : ''} total
          </p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex overflow-x-auto gap-1 pb-2 -mx-3 sm:-mx-4 px-3 sm:px-4 lg:mx-0 lg:px-0 scrollbar-none">
        {APPLICATION_STATUSES.map((status) => {
          const count = status === 'All' ? applications.length : applications.filter((a) => a.status === status).length
          const isActive = activeTab === status
          return (
            <button
              key={status}
              onClick={() => handleTabChange(status)}
              className={cn(
                'whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all shrink-0',
                isActive
                  ? 'bg-[var(--color-primary-500)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
              )}
            >
              {status}
              <span className={cn(
                'ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                isActive ? 'bg-white/20 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
              )}>
                {count}
              </span>
            </button>
          )
        })}
      </motion.div>

      {filtered.length === 0 ? (
        <motion.div variants={itemVariants}>
          <EmptyState
            icon={Search}
            title="No applications found"
            description={activeTab === 'All' ? "You haven't applied to any jobs yet." : `No applications with status "${activeTab}".`}
            action={activeTab === 'All' ? { label: 'Browse Jobs', props: { as: Link, to: '/jobs' } } : undefined}
          />
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
          {filtered.map((app) => (
            <ApplicationItem key={app._id} app={app} />
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}

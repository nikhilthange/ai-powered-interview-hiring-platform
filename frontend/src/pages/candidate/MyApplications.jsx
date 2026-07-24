import { memo, useState, useCallback, useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { applicationApi } from '../../services/applicationApi'
import { Card, CardContent } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { SkeletonList } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import KanbanBoard from '../../components/applications/KanbanBoard'
import { cn } from '../../lib/utils'
import {
  MapPin, Clock, Eye,
  Building2, Star,
  Calendar, AlertCircle, Search, LayoutGrid, List
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { APPLICATION_STATUSES, STATUS_COLORS } from '../../lib/constants'
import { staggerContainer, staggerItem } from '../../lib/motion'

const ApplicationItem = memo(function ApplicationItem({ app }) {
  return (
    <motion.div variants={staggerItem}>
      <Link to={`/applications/${app._id}/analysis`} className="block">
        <Card hover>
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
                    Applied {new Date(app.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border-color)]">
                  {app.atsScore > 0 ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <Star className="h-3.5 w-3.5" /> ATS Match {app.atsScore}%
                    </span>
                  ) : <span />}
                  <Button variant="ghost" size="xs">
                    View <Eye className="h-3 w-3 ml-1" />
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
  const [viewMode, setViewMode] = useState('kanban')
  const [page, setPage] = useState(1)
  const shouldReduceMotion = useReducedMotion()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['my-applications-page', activeTab, page],
    queryFn: () => applicationApi.getMyApplicationsPaginated({ page, status: activeTab }),
  })

  const applications = useMemo(() => data?.data?.applications || [], [data])
  const pagination = useMemo(() => data?.data?.pagination || {}, [data])

  const handleTabChange = useCallback((status) => {
    setActiveTab(status)
    setPage(1)
  }, [])

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
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">My Applications</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Track and manage your job applications pipeline in real time.
          </p>
        </div>

        {/* View Switcher Toggle */}
        <div className="flex items-center gap-1 bg-[var(--bg-tertiary)] p-1 rounded-xl border border-[var(--border-color)] self-start sm:self-auto">
          <button
            onClick={() => setViewMode('kanban')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
              viewMode === 'kanban'
                ? 'bg-[var(--bg-primary)] text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Kanban Board
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
              viewMode === 'list'
                ? 'bg-[var(--bg-primary)] text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
          >
            <List className="h-3.5 w-3.5" /> List View
          </button>
        </div>
      </div>

      {/* Render View Mode */}
      {viewMode === 'kanban' ? (
        <KanbanBoard applications={applications} />
      ) : (
        <div className="space-y-6">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {['All', ...APPLICATION_STATUSES].map((status) => (
              <button
                key={status}
                onClick={() => handleTabChange(status)}
                className={cn(
                  'rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all border',
                  activeTab === status
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-indigo-300'
                )}
              >
                {status}
              </button>
            ))}
          </div>

          {applications.length === 0 ? (
            <EmptyState preset="NoApplications" />
          ) : (
            <motion.div
              variants={shouldReduceMotion ? undefined : staggerContainer(0.06)}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {applications.map((app) => (
                <ApplicationItem key={app._id} app={app} />
              ))}
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}

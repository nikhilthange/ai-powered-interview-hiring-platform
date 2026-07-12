import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../services/adminApi'
import Badge from '../../components/ui/Badge'
import DataTable from '../../components/ui/DataTable'
import { SkeletonTable } from '../../components/ui/Skeleton'
import { ScrollText, Shield } from 'lucide-react'
import { formatDate } from '../../lib/utils'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const actionBadge = (action) => {
  const map = {
    user_login: { label: 'Login', variant: 'info' },
    user_deleted: { label: 'Deleted', variant: 'danger' },
    user_updated: { label: 'Updated', variant: 'primary' },
    user_suspended: { label: 'Suspended', variant: 'danger' },
    user_activated: { label: 'Activated', variant: 'success' },
    bulk_user_delete: { label: 'Bulk Delete', variant: 'danger' },
    bulk_user_suspend: { label: 'Bulk Suspend', variant: 'danger' },
    password_reset: { label: 'Password Reset', variant: 'warning' },
    role_changed: { label: 'Role Changed', variant: 'warning' },
    job_created: { label: 'Job Created', variant: 'success' },
    job_approved: { label: 'Job Approved', variant: 'success' },
    job_rejected: { label: 'Job Rejected', variant: 'danger' },
    job_deleted: { label: 'Job Deleted', variant: 'danger' },
    job_featured: { label: 'Featured', variant: 'primary' },
    job_unfeatured: { label: 'Unfeatured', variant: 'default' },
    profile_updated: { label: 'Profile Updated', variant: 'primary' },
    ai_request: { label: 'AI Request', variant: 'info' },
    ai_provider_changed: { label: 'AI Provider', variant: 'warning' },
    ai_metrics_reset: { label: 'AI Reset', variant: 'warning' },
    admin_action: { label: 'Admin Action', variant: 'primary' },
    recruiter_verified: { label: 'Recruiter Verified', variant: 'success' },
    recruiter_rejected: { label: 'Recruiter Rejected', variant: 'danger' },
    application_deleted: { label: 'App Deleted', variant: 'danger' },
    broadcast_sent: { label: 'Broadcast', variant: 'primary' },
    settings_updated: { label: 'Settings Updated', variant: 'warning' },
  }
  const config = map[action] || { label: action, variant: 'default' }
  return <Badge variant={config.variant} size="xs">{config.label}</Badge>
}

export default function AuditLogs() {
  const [page, setPage] = useState(1)
  const [actionFilter, setActionFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit-logs', page, actionFilter],
    queryFn: () => adminApi.getAuditLogs({ page, limit: 50, action: actionFilter || undefined }),
    keepPreviousData: true,
  })

  const logs = data?.data?.logs || []
  const pagination = data?.data?.pagination || {}

  const uniqueActions = [...new Set(logs.map((l) => l.action))]

  const columns = [
    { key: 'action', label: 'Action', render: (val) => actionBadge(val) },
    { key: 'actor', label: 'Actor', render: (val) => (
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)]">{val?.name || 'System'}</p>
        {val?.email && <p className="text-xs text-[var(--text-tertiary)]">{val.email}</p>}
      </div>
    )},
    { key: 'targetType', label: 'Target', render: (val, row) => (
      <div>
        <p className="text-sm capitalize text-[var(--text-primary)]">{val || '—'}</p>
        {row.targetId && <p className="text-xs text-[var(--text-tertiary)] truncate max-w-[120px]">{row.targetId}</p>}
      </div>
    )},
    { key: 'ip', label: 'IP', render: (val) => <span className="text-xs text-[var(--text-tertiary)]">{val || '—'}</span> },
    { key: 'createdAt', label: 'Timestamp', render: (val) => (
      <span className="text-xs text-[var(--text-tertiary)]" title={val ? new Date(val).toLocaleString() : ''}>
        {val ? formatDate(val, { hour: '2-digit', minute: '2-digit' }) : '—'}
      </span>
    )},
  ]

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 p-6 sm:p-8">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/5" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <ScrollText className="h-6 w-6 text-white/80" />
              <h1 className="text-xl sm:text-2xl font-bold text-white">Audit Logs</h1>
            </div>
            <p className="text-sm text-white/60">Track all administrative actions and system events</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setActionFilter('')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${!actionFilter ? 'bg-[var(--color-primary-500)] text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]'}`}
        >
          All
        </button>
        {uniqueActions.slice(0, 15).map((a) => (
          <button
            key={a}
            onClick={() => setActionFilter(a)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${actionFilter === a ? 'bg-[var(--color-primary-500)] text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]'}`}
          >
            {a.replace(/_/g, ' ')}
          </button>
        ))}
      </motion.div>

      <motion.div variants={itemVariants}>
        {isLoading ? <SkeletonTable rows={10} /> : (
          <DataTable
            columns={columns}
            data={logs}
            page={pagination.page || page}
            totalPages={pagination.totalPages || 1}
            totalItems={pagination.totalItems || logs.length}
            onPageChange={setPage}
            emptyMessage="No audit logs found"
            emptyIcon={Shield}
          />
        )}
      </motion.div>
    </motion.div>
  )
}

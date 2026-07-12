import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../services/adminApi'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import DataTable from '../../components/ui/DataTable'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { SkeletonTable } from '../../components/ui/Skeleton'
import { useToast } from '../../components/ui/Toast'
import { FileText, Trash2, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDate } from '../../lib/utils'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const statusBadge = (status) => {
  const map = { Applied: 'primary', Reviewed: 'info', 'Interview Scheduled': 'warning', Accepted: 'success', Rejected: 'danger', Withdrawn: 'default' }
  return <Badge variant={map[status] || 'default'} size="xs">{status}</Badge>
}

export default function AdminApplications() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-applications', page, statusFilter],
    queryFn: () => adminApi.getApplications({ page, limit: 20, status: statusFilter || undefined }),
    keepPreviousData: true,
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteApplication(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-applications'] }); setConfirmDelete(null); toast({ type: 'success', title: 'Deleted', message: 'Application deleted.' }) },
    onError: () => toast({ type: 'error', title: 'Error', message: 'Could not delete application.' }),
  })

  const apps = data?.data?.applications || []
  const pagination = data?.data?.pagination || {}

  const columns = [
    { key: 'candidateId', label: 'Candidate', render: (val) => (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 flex items-center justify-center text-xs font-semibold text-indigo-600">
          {val?.name?.charAt(0) || 'U'}
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">{val?.name || 'Unknown'}</p>
          <p className="text-xs text-[var(--text-tertiary)]">{val?.email}</p>
        </div>
      </div>
    )},
    { key: 'jobId', label: 'Job', render: (val) => (
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)]">{val?.title || 'N/A'}</p>
      </div>
    )},
    { key: 'status', label: 'Status', render: (val) => statusBadge(val) },
    { key: 'atsScore', label: 'ATS Score', render: (val) => val ? <span className="font-medium">{val}%</span> : '—' },
    { key: 'createdAt', label: 'Applied', render: (val) => <span className="text-[var(--text-tertiary)]">{val ? formatDate(val) : '—'}</span> },
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
              <FileText className="h-6 w-6 text-white/80" />
              <h1 className="text-xl sm:text-2xl font-bold text-white">Applications</h1>
            </div>
            <p className="text-sm text-white/60">View and manage all job applications</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2 mb-4">
          {['', 'Applied', 'Reviewed', 'Interview Scheduled', 'Accepted', 'Rejected'].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1) }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-[var(--color-primary-500)] text-white'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        {isLoading ? <SkeletonTable rows={8} /> : (
          <DataTable
            columns={columns}
            data={apps}
            page={pagination.page || page}
            totalPages={pagination.totalPages || 1}
            totalItems={pagination.totalItems || apps.length}
            onPageChange={setPage}
            emptyMessage="No applications found"
            emptyIcon={FileText}
            renderActions={(row) => (
              <div className="flex items-center gap-1">
                {row._id && (
                  <Link to={`/applications/${row._id}/analysis`}>
                    <Button size="xs" variant="ghost"><Eye className="h-3 w-3" /></Button>
                  </Link>
                )}
                <Button size="xs" variant="ghost" className="text-red-500" onClick={() => setConfirmDelete(row)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          />
        )}
      </motion.div>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => deleteMutation.mutate(confirmDelete._id)}
        title="Delete Application"
        message="Are you sure you want to delete this application? This action cannot be undone."
        confirmText="Delete"
        loading={deleteMutation.isPending}
      />
    </motion.div>
  )
}

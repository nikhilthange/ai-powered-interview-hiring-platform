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
import { Briefcase, CheckCircle, XCircle, Star, Trash2, Eye } from 'lucide-react'
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
  const map = { Active: 'success', Draft: 'default', Closed: 'danger', Pending: 'warning' }
  return <Badge variant={map[status] || 'default'} size="xs">{status}</Badge>
}

export default function AdminJobs() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-jobs', page, search, statusFilter],
    queryFn: () => adminApi.getJobs({ page, limit: 20, search, status: statusFilter || undefined }),
    keepPreviousData: true,
  })

  const approveMutation = useMutation({
    mutationFn: (id) => adminApi.approveJob(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-jobs'] }); toast({ type: 'success', title: 'Approved', message: 'Job has been approved.' }) },
    onError: () => toast({ type: 'error', title: 'Error', message: 'Could not approve job.' }),
  })

  const rejectMutation = useMutation({
    mutationFn: (id) => adminApi.rejectJob(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-jobs'] }); toast({ type: 'success', title: 'Rejected', message: 'Job has been rejected.' }) },
    onError: () => toast({ type: 'error', title: 'Error', message: 'Could not reject job.' }),
  })

  const featureMutation = useMutation({
    mutationFn: (id) => adminApi.featureJob(id),
    onSuccess: (res) => { queryClient.invalidateQueries({ queryKey: ['admin-jobs'] }); toast({ type: 'success', title: res.data.job.isFeatured ? 'Featured' : 'Unfeatured', message: 'Job feature status toggled.' }) },
    onError: () => toast({ type: 'error', title: 'Error', message: 'Could not toggle feature.' }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteJob(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-jobs'] }); setConfirmDelete(null); toast({ type: 'success', title: 'Deleted', message: 'Job deleted.' }) },
    onError: () => toast({ type: 'error', title: 'Error', message: 'Could not delete job.' }),
  })

  const jobs = data?.data?.jobs || []
  const pagination = data?.data?.pagination || {}

  const columns = [
    { key: 'title', label: 'Title', sortable: true, render: (val, row) => (
      <div>
        <p className="font-medium text-[var(--text-primary)]">{val}</p>
        <p className="text-xs text-[var(--text-tertiary)]">{row.recruiter?.name || 'Unknown'} · {row.location || 'Remote'}</p>
      </div>
    )},
    { key: 'status', label: 'Status', render: (val) => statusBadge(val) },
    { key: 'isFeatured', label: 'Featured', render: (val) => val ? <Star className="h-4 w-4 text-amber-500 fill-amber-500" /> : '—' },
    { key: 'applicantCount', label: 'Applicants', align: 'center' },
    { key: 'createdAt', label: 'Posted', render: (val) => <span className="text-[var(--text-tertiary)]">{val ? formatDate(val) : '—'}</span> },
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
              <Briefcase className="h-6 w-6 text-white/80" />
              <h1 className="text-xl sm:text-2xl font-bold text-white">Jobs Management</h1>
            </div>
            <p className="text-sm text-white/60">Approve, reject, feature, and manage job listings</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2 mb-4">
          {['', 'Active', 'Draft', 'Closed', 'Pending'].map((s) => (
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
        {isLoading ? (
          <SkeletonTable rows={8} />
        ) : (
          <DataTable
            columns={columns}
            data={jobs}
            searchable
            searchValue={search}
            onSearch={(v) => { setSearch(v); setPage(1) }}
            searchPlaceholder="Search jobs by title..."
            page={pagination.page || page}
            totalPages={pagination.totalPages || 1}
            totalItems={pagination.totalItems || jobs.length}
            onPageChange={setPage}
            emptyMessage="No jobs found"
            emptyIcon={Briefcase}
            renderActions={(row) => (
              <div className="flex items-center gap-1">
                <Link to={`/jobs/${row._id}`}>
                  <Button size="xs" variant="ghost"><Eye className="h-3 w-3" /></Button>
                </Link>
                {row.status !== 'Active' && (
                  <Button size="xs" variant="ghost" className="text-emerald-500" onClick={() => approveMutation.mutate(row._id)} loading={approveMutation.isPending}>
                    <CheckCircle className="h-3 w-3" />
                  </Button>
                )}
                {row.status !== 'Closed' && (
                  <Button size="xs" variant="ghost" className="text-red-500" onClick={() => rejectMutation.mutate(row._id)} loading={rejectMutation.isPending}>
                    <XCircle className="h-3 w-3" />
                  </Button>
                )}
                <Button size="xs" variant="ghost" className={row.isFeatured ? 'text-amber-500' : 'text-[var(--text-tertiary)]'} onClick={() => featureMutation.mutate(row._id)} loading={featureMutation.isPending}>
                  <Star className={`h-3 w-3 ${row.isFeatured ? 'fill-amber-500' : ''}`} />
                </Button>
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
        title="Delete Job"
        message={`Are you sure you want to delete "${confirmDelete?.title}"? All applications for this job will also be deleted.`}
        confirmText="Delete"
        loading={deleteMutation.isPending}
      />
    </motion.div>
  )
}

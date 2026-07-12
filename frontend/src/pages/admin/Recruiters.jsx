import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../services/adminApi'
import Button from '../../components/ui/Button'
import DataTable from '../../components/ui/DataTable'
import { SkeletonTable } from '../../components/ui/Skeleton'
import { useToast } from '../../components/ui/Toast'
import { Users, CheckCircle, XCircle, Briefcase } from 'lucide-react'
import { formatDate } from '../../lib/utils'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function AdminRecruiters() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-recruiters', page, search],
    queryFn: () => adminApi.getRecruiters({ page, limit: 20, search }),
    keepPreviousData: true,
  })

  const verifyMutation = useMutation({
    mutationFn: (id) => adminApi.verifyRecruiter(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-recruiters'] }); toast({ type: 'success', title: 'Verified', message: 'Recruiter company has been verified.' }) },
    onError: () => toast({ type: 'error', title: 'Error', message: 'Could not verify recruiter.' }),
  })

  const rejectMutation = useMutation({
    mutationFn: (id) => adminApi.rejectRecruiter(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-recruiters'] }); toast({ type: 'success', title: 'Rejected', message: 'Recruiter verification rejected.' }) },
    onError: () => toast({ type: 'error', title: 'Error', message: 'Could not reject recruiter.' }),
  })

  const recruiters = data?.data?.recruiters || []
  const pagination = data?.data?.pagination || {}

  const columns = [
    { key: 'name', label: 'Recruiter', render: (val, row) => (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 flex items-center justify-center text-xs font-semibold text-indigo-600 shrink-0">
          {val?.charAt(0) || 'U'}
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">{val || 'Unknown'}</p>
          <p className="text-xs text-[var(--text-tertiary)]">{row.email}</p>
        </div>
      </div>
    )},
    { key: 'companyName', label: 'Company', render: (val) => <span className="text-sm">{val || '—'}</span> },
    { key: 'isVerified', label: 'Verified', render: (val) => val ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-[var(--text-tertiary)]" /> },
    { key: 'jobsPosted', label: 'Jobs Posted', align: 'center' },
    { key: 'createdAt', label: 'Joined', render: (val) => <span className="text-[var(--text-tertiary)]">{val ? formatDate(val) : '—'}</span> },
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
              <h1 className="text-xl sm:text-2xl font-bold text-white">Recruiters</h1>
            </div>
            <p className="text-sm text-white/60">Manage recruiter accounts and company verifications</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        {isLoading ? <SkeletonTable rows={8} /> : (
          <DataTable
            columns={columns}
            data={recruiters}
            searchable
            searchValue={search}
            onSearch={(v) => { setSearch(v); setPage(1) }}
            searchPlaceholder="Search recruiters by name or email..."
            page={pagination.page || page}
            totalPages={pagination.totalPages || 1}
            totalItems={pagination.totalItems || recruiters.length}
            onPageChange={setPage}
            emptyMessage="No recruiters found"
            emptyIcon={Users}
            renderActions={(row) => (
              <div className="flex items-center gap-1">
                {!row.isVerified ? (
                  <Button size="xs" variant="ghost" className="text-emerald-500" onClick={() => verifyMutation.mutate(row._id)} loading={verifyMutation.isPending}>
                    <CheckCircle className="h-3 w-3" /> Verify
                  </Button>
                ) : (
                  <Button size="xs" variant="ghost" className="text-red-500" onClick={() => rejectMutation.mutate(row._id)} loading={rejectMutation.isPending}>
                    <XCircle className="h-3 w-3" /> Reject
                  </Button>
                )}
              </div>
            )}
          />
        )}
      </motion.div>
    </motion.div>
  )
}

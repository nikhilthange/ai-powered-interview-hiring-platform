import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../services/adminApi'
import { Card, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import DataTable from '../../components/ui/DataTable'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Modal from '../../components/ui/Modal'
import Select from '../../components/ui/Select'
import { SkeletonTable } from '../../components/ui/Skeleton'
import { useToast } from '../../components/ui/Toast'
import { Users as UsersIcon, Trash2, Ban, CheckCircle, RotateCcw, Key, Shield, Mail, Calendar, Eye, Edit2 } from 'lucide-react'
import { formatDate } from '../../lib/utils'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const roleBadge = (role) => {
  const map = { admin: 'danger', recruiter: 'primary', candidate: 'default' }
  return <Badge variant={map[role] || 'default'} size="xs">{role}</Badge>
}

export default function AdminUsers() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [changeRoleUser, setChangeRoleUser] = useState(null)
  const [newRole, setNewRole] = useState('candidate')
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false)
  const [confirmBulkSuspend, setConfirmBulkSuspend] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, roleFilter, statusFilter],
    queryFn: () => adminApi.getUsers({ page, limit: 20, search, role: roleFilter || undefined, status: statusFilter || undefined }),
    keepPreviousData: true,
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteUser(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); setConfirmDelete(null); toast({ type: 'success', title: 'Deleted', message: 'User deleted.' }) },
    onError: (err) => { toast({ type: 'error', title: 'Error', message: err.response?.data?.message || 'Could not delete user.' }) },
  })

  const suspendMutation = useMutation({
    mutationFn: (id) => adminApi.suspendUser(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); toast({ type: 'success', title: 'Suspended', message: 'User suspended.' }) },
    onError: () => toast({ type: 'error', title: 'Error', message: 'Could not suspend user.' }),
  })

  const activateMutation = useMutation({
    mutationFn: (id) => adminApi.activateUser(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); toast({ type: 'success', title: 'Activated', message: 'User activated.' }) },
    onError: () => toast({ type: 'error', title: 'Error', message: 'Could not activate user.' }),
  })

  const resetPasswordMutation = useMutation({
    mutationFn: (id) => adminApi.resetUserPassword(id),
    onSuccess: () => { toast({ type: 'success', title: 'Password Reset', message: 'Password has been reset. User will receive email.' }) },
    onError: () => toast({ type: 'error', title: 'Error', message: 'Could not reset password.' }),
  })

  const changeRoleMutation = useMutation({
    mutationFn: ({ id, role }) => adminApi.changeUserRole(id, role),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); setChangeRoleUser(null); toast({ type: 'success', title: 'Role Updated', message: 'User role changed.' }) },
    onError: () => toast({ type: 'error', title: 'Error', message: 'Could not change role.' }),
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids) => adminApi.bulkDeleteUsers(ids),
    onSuccess: (res) => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); setConfirmBulkDelete(false); setSelectedIds([]); toast({ type: 'success', title: 'Bulk Delete', message: res.data?.message || 'Users deleted.' }) },
    onError: () => toast({ type: 'error', title: 'Error', message: 'Could not delete users.' }),
  })

  const bulkSuspendMutation = useMutation({
    mutationFn: (ids) => adminApi.bulkSuspendUsers(ids),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); setConfirmBulkSuspend(false); setSelectedIds([]); toast({ type: 'success', title: 'Bulk Suspend', message: 'Users suspended.' }) },
    onError: () => toast({ type: 'error', title: 'Error', message: 'Could not suspend users.' }),
  })

  const users = data?.data?.users || []
  const pagination = data?.data?.pagination || {}

  const columns = [
    { key: 'name', label: 'User', render: (val, row) => (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 flex items-center justify-center text-xs font-semibold text-indigo-600 shrink-0">
          {val?.charAt(0) || 'U'}
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">{val || 'Unnamed'}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
              <Mail className="h-3 w-3" /> {row.email}
            </div>
          </div>
        </div>
      </div>
    )},
    { key: 'role', label: 'Role', render: (val) => roleBadge(val) },
    { key: 'isEmailVerified', label: 'Verified', render: (val) => val ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <span className="text-xs text-[var(--text-tertiary)]">No</span> },
    { key: 'createdAt', label: 'Joined', render: (val) => <span className="text-xs text-[var(--text-tertiary)]">{val ? formatDate(val) : '—'}</span> },
  ]

  const handleSelect = (id) => {
    if (Array.isArray(id)) setSelectedIds((prev) => prev.length === id.length ? [] : id)
    else setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id])
  }

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
              <UsersIcon className="h-6 w-6 text-white/80" />
              <h1 className="text-xl sm:text-2xl font-bold text-white">Users</h1>
            </div>
            <p className="text-sm text-white/60">Manage all platform users</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center gap-2 flex-wrap">
        {['', 'candidate', 'recruiter', 'admin'].map((r) => (
          <button key={r} onClick={() => { setRoleFilter(r); setPage(1) }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${roleFilter === r ? 'bg-[var(--color-primary-500)] text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]'}`}
          >
            {r || 'All Roles'}
          </button>
        ))}
        <div className="w-px h-6 bg-[var(--border-color)] mx-1" />
        {['', 'verified', 'unverified'].map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${statusFilter === s ? 'bg-[var(--color-primary-500)] text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]'}`}
          >
            {s || 'All Status'}
          </button>
        ))}
      </motion.div>

      {selectedIds.length > 0 && (
        <motion.div variants={itemVariants} className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-primary-50)] dark:bg-indigo-950/30 border border-[var(--color-primary-200)] dark:border-indigo-800/30">
          <span className="text-sm text-[var(--text-primary)] font-medium">{selectedIds.length} selected</span>
          <div className="flex-1" />
          <Button size="xs" variant="ghost" className="text-red-500" onClick={() => setConfirmBulkDelete(true)}>
            <Trash2 className="h-3 w-3" /> Delete
          </Button>
          <Button size="xs" variant="ghost" className="text-amber-500" onClick={() => setConfirmBulkSuspend(true)}>
            <Ban className="h-3 w-3" /> Suspend
          </Button>
          <Button size="xs" variant="ghost" onClick={() => setSelectedIds([])}>
            Clear
          </Button>
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        {isLoading ? <SkeletonTable rows={8} /> : (
          <DataTable
            columns={columns}
            data={users}
            searchable
            searchValue={search}
            onSearch={(v) => { setSearch(v); setPage(1) }}
            searchPlaceholder="Search by name or email..."
            page={pagination.page || page}
            totalPages={pagination.totalPages || 1}
            totalItems={pagination.totalItems || users.length}
            onPageChange={setPage}
            selectable
            selectedIds={selectedIds}
            onSelect={handleSelect}
            emptyMessage="No users found"
            emptyIcon={UsersIcon}
            renderActions={(row) => (
              <div className="flex items-center gap-0.5">
                <button
                  title="View user details"
                  onClick={() => window.open(`/admin/users/${row._id}`, '_blank')}
                  className="rounded-lg p-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
                <button
                  title="Change role"
                  onClick={() => { setChangeRoleUser(row); setNewRole(row.role) }}
                  className="rounded-lg p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  title="Reset password"
                  onClick={() => resetPasswordMutation.mutate(row._id)}
                  className="rounded-lg p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                >
                  <Key className="h-3.5 w-3.5" />
                </button>
                {!row.isSuspended ? (
                  <button
                    title="Suspend user"
                    onClick={() => suspendMutation.mutate(row._id)}
                    className="rounded-lg p-1.5 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors"
                  >
                    <Ban className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    title="Activate user"
                    onClick={() => activateMutation.mutate(row._id)}
                    className="rounded-lg p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  title="Delete user"
                  onClick={() => setConfirmDelete(row)}
                  className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          />
        )}
      </motion.div>

      <ConfirmDialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}
        onConfirm={() => deleteMutation.mutate(confirmDelete._id)}
        title="Delete User" message={`Are you sure you want to delete "${confirmDelete?.name || 'this user'}"? This cannot be undone.`}
        confirmText="Delete" loading={deleteMutation.isPending} />

      <ConfirmDialog open={confirmBulkDelete} onClose={() => setConfirmBulkDelete(false)}
        onConfirm={() => bulkDeleteMutation.mutate(selectedIds)}
        title="Bulk Delete Users" message={`Are you sure you want to delete ${selectedIds.length} users? This cannot be undone.`}
        confirmText="Delete All" loading={bulkDeleteMutation.isPending} variant="danger" />

      <ConfirmDialog open={confirmBulkSuspend} onClose={() => setConfirmBulkSuspend(false)}
        onConfirm={() => bulkSuspendMutation.mutate(selectedIds)}
        title="Bulk Suspend Users" message={`Are you sure you want to suspend ${selectedIds.length} users?`}
        confirmText="Suspend All" loading={bulkSuspendMutation.isPending} variant="warning" />

      <Modal open={!!changeRoleUser} onClose={() => setChangeRoleUser(null)} title="Change User Role" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Change role for <strong className="text-[var(--text-primary)]">{changeRoleUser?.name || 'user'}</strong>
          </p>
          <Select label="New Role" value={newRole} onChange={(e) => setNewRole(e.target.value)} options={[
            { value: 'candidate', label: 'Candidate' },
            { value: 'recruiter', label: 'Recruiter' },
            { value: 'admin', label: 'Admin' },
          ]} />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setChangeRoleUser(null)}>Cancel</Button>
            <Button onClick={() => changeRoleMutation.mutate({ id: changeRoleUser._id, role: newRole })} loading={changeRoleMutation.isPending}>
              Change Role
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  )
}

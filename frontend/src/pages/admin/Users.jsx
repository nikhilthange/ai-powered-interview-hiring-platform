import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../services/adminApi'
import { PageSpinner } from '../../components/ui/Spinner'
import { useToast } from '../../components/ui/Toast'
import { Trash2, CheckCircle, Search, ShieldCheck } from 'lucide-react'

export default function AdminUsers() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [page, setPage] = useState(1)
  const [roleFilter, setRoleFilter] = useState('')
  const [search, setSearch] = useState('')

  const users = useQuery({
    queryKey: ['admin-users', page, roleFilter, search],
    queryFn: () => adminApi.getUsers({ page, limit: 10, role: roleFilter || undefined, search: search || undefined }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User Deleted', 'User has been removed permanently.')
    },
    onError: (err) => {
      toast.error('Delete Failed', err?.response?.data?.message || 'Could not delete user.')
    },
  })

  const verifyMutation = useMutation({
    mutationFn: (id) => adminApi.verifyRecruiter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('Recruiter Verified', 'Company verification approved.')
    },
    onError: (err) => {
      toast.error('Verification Failed', err?.response?.data?.message || 'Could not verify recruiter.')
    },
  })

  return (
    <div className="space-y-6 page-section">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">User Management</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Manage all platform users, roles, and verifications.</p>
      </div>

      <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]">
        <div className="border-b border-[var(--border-color)] px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  placeholder="Search by email..."
                  className="w-48 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] py-1.5 pl-9 pr-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                />
              </div>
              <select
                className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20"
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
              >
                <option value="">All roles</option>
                <option value="candidate">Candidate</option>
                <option value="recruiter">Recruiter</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>

        {users.isLoading ? (
          <div className="p-6"><PageSpinner /></div>
        ) : users.isError ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-600">Failed to load users.</p>
            <button onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-users'] })} className="mt-2 text-sm font-medium text-red-600 hover:text-red-500">Try Again</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-xs uppercase text-[var(--text-tertiary)]">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Verified</th>
                  <th className="px-6 py-3 font-medium">Joined</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(users.data?.data?.users || []).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[var(--text-tertiary)]">No users found.</td>
                  </tr>
                ) : (
                  (users.data?.data?.users || []).map((u) => (
                    <tr key={u._id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-tertiary)]">
                      <td className="px-6 py-4 font-medium text-[var(--text-primary)]">{u.name || '—'}</td>
                      <td className="px-6 py-4 text-[var(--text-secondary)]">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          u.role === 'admin' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                          u.role === 'recruiter' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                          'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        }`}>{u.role}</span>
                      </td>
                      <td className="px-6 py-4">
                        {u.isEmailVerified ? (
                          <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle className="h-3.5 w-3.5" /> Yes</span>
                        ) : (
                          <span className="text-xs text-[var(--text-tertiary)]">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-[var(--text-tertiary)]">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {u.role === 'recruiter' && (
                            <button
                              onClick={() => verifyMutation.mutate(u._id)}
                              disabled={verifyMutation.isPending}
                              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                              title="Verify company"
                            >
                              <ShieldCheck className="h-3.5 w-3.5" /> Verify
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete user "${u.name || u.email}"? This cannot be undone.`)) {
                                deleteMutation.mutate(u._id)
                              }
                            }}
                            disabled={deleteMutation.isPending}
                            className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {users.data?.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--border-color)] px-6 py-3">
            <span className="text-xs text-[var(--text-tertiary)]">Page {page} of {users.data.totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded border border-[var(--border-color)] px-3 py-1 text-xs disabled:opacity-50">Previous</button>
              <button onClick={() => setPage((p) => Math.min(users.data.totalPages, p + 1))} disabled={page === users.data.totalPages} className="rounded border border-[var(--border-color)] px-3 py-1 text-xs disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
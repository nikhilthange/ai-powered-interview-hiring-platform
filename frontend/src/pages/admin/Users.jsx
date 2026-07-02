import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/axios'
import { Card, CardContent } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { SkeletonList } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import { Users as UsersIcon, Mail, Calendar, Trash2, Ban, CheckCircle } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

export default function AdminUsers() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users').then((r) => r.data),
  })

  if (isLoading) return (
    <div className="space-y-6">
      <div className="skeleton-shimmer h-8 w-48 rounded-xl" />
      <SkeletonList count={8} />
    </div>
  )

  const users = data?.data?.users || []

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Users</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">{users.length} total users</p>
      </motion.div>

      {users.length === 0 ? (
        <motion.div variants={itemVariants}>
          <EmptyState icon={UsersIcon} title="No users found" />
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-2">
          {users.map((u) => (
            <motion.div key={u._id} variants={itemVariants}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                      {u.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[var(--text-primary)]">{u.name || 'Unnamed'}</p>
                        <Badge variant={u.role === 'admin' ? 'danger' : u.role === 'recruiter' ? 'primary' : 'default'} size="xs">
                          {u.role}
                        </Badge>
                        {u.isVerified && <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <div className="flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
                          <Mail className="h-3 w-3" />
                          {u.email}
                        </div>
                        {u.createdAt && (
                          <div className="flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
                            <Calendar className="h-3 w-3" />
                            {new Date(u.createdAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button size="xs" variant="ghost">
                        <Ban className="h-3 w-3" />
                      </Button>
                      <Button size="xs" variant="ghost" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">
                        <Trash2 className="h-3 w-3" />
                      </Button>
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

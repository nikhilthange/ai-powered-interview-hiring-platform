import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../services/adminApi'
import { Card, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Select from '../../components/ui/Select'
import Badge from '../../components/ui/Badge'
import { SkeletonPage } from '../../components/ui/Skeleton'
import { useToast } from '../../components/ui/Toast'
import { Bell, Send, Megaphone, Users as UsersIcon } from 'lucide-react'
import { formatDate } from '../../lib/utils'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function AdminNotifications() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [target, setTarget] = useState('all')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')

  const { data: notifData } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: () => adminApi.getNotifications({ page: 1, limit: 10 }),
  })

  const broadcastMutation = useMutation({
    mutationFn: () => adminApi.broadcastNotification({ target, title, message }),
    onSuccess: (res) => {
      toast({ type: 'success', title: 'Sent!', message: res.data?.message || 'Notification broadcast successfully.' })
      setTitle(''); setMessage(''); setTarget('all')
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] })
    },
    onError: () => toast({ type: 'error', title: 'Error', message: 'Could not send notification.' }),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() || !message.trim()) {
      toast({ type: 'warning', title: 'Validation', message: 'Title and message are required.' })
      return
    }
    broadcastMutation.mutate()
  }

  const recentNotifs = notifData?.data?.notifications || []

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
              <Bell className="h-6 w-6 text-white/80" />
              <h1 className="text-xl sm:text-2xl font-bold text-white">Notifications</h1>
            </div>
            <p className="text-sm text-white/60">Broadcast system notifications to users</p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Megaphone className="h-5 w-5 text-[var(--color-primary-500)]" />
                <h2 className="font-semibold text-[var(--text-primary)]">Send Broadcast</h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Select label="Target Audience" value={target} onChange={(e) => setTarget(e.target.value)} options={[
                  { value: 'all', label: 'All Users' },
                  { value: 'candidates', label: 'Candidates Only' },
                  { value: 'recruiters', label: 'Recruiters Only' },
                  { value: 'admins', label: 'Admins Only' },
                ]} />
                <Input label="Notification Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., System Maintenance" required />
                <Textarea label="Message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Enter your notification message..." rows={4} required />
                <Button type="submit" className="w-full" loading={broadcastMutation.isPending} icon={Send}>
                  Broadcast Notification
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <UsersIcon className="h-5 w-5 text-[var(--color-primary-500)]" />
                <h2 className="font-semibold text-[var(--text-primary)]">Recent Broadcasts</h2>
              </div>
              {recentNotifs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-10 w-10 text-[var(--text-tertiary)] mb-3" />
                  <p className="text-sm text-[var(--text-secondary)]">No notifications sent yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {recentNotifs.map((n) => (
                    <div key={n._id} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-[var(--text-primary)]">{n.title || 'Notification'}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={n.isRead ? 'default' : 'primary'} size="xs">{n.isRead ? 'Read' : 'New'}</Badge>
                          {n.createdAt && <span className="text-[10px] text-[var(--text-tertiary)]">{formatDate(n.createdAt)}</span>}
                        </div>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{n.message}</p>
                      {n.recipientId && (
                        <p className="text-[10px] text-[var(--text-tertiary)] mt-1">To: {typeof n.recipientId === 'object' ? n.recipientId.name || n.recipientId.email : n.recipientId}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}

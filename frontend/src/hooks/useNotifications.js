import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationApi } from '../services/notificationApi'
import { getSocket, connectSocket } from '../services/socket'
import { useAuth } from './useAuth'

export default function useNotifications() {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [newNotif, setNewNotif] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getNotifications().then((r) => r.data),
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated ? 30000 : false,
  })

  useEffect(() => {
    if (!isAuthenticated) return

    let socket = getSocket()
    if (!socket) {
      socket = connectSocket()
    }

    if (!socket) return

    const handler = (payload) => {
      setNewNotif(payload)
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }

    socket.on('notification', handler)
    return () => socket.off('notification', handler)
  }, [isAuthenticated, queryClient])

  const markAsRead = useMutation({
    mutationFn: (id) => notificationApi.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markAllAsRead = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const clearNewNotif = useCallback(() => setNewNotif(null), [])

  return {
    notifications: data?.data?.notifications || [],
    unreadCount: data?.unreadCount || 0,
    totalPages: data?.totalPages || 1,
    isLoading,
    newNotif,
    clearNewNotif,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
  }
}

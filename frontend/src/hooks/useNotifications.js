import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationApi } from '../services/notificationApi'
import { useAuth } from './useAuth'

const NOTIFICATIONS_KEY = ['notifications']

export function useNotifications() {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: () => notificationApi.getNotifications().then((r) => r.data),
    enabled: isAuthenticated,
    staleTime: 10000,
    refetchInterval: isAuthenticated ? 30000 : false,
  })

  const markAsRead = useMutation({
    mutationFn: (id) => notificationApi.markAsRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY })
      const previous = queryClient.getQueryData(NOTIFICATIONS_KEY)

      queryClient.setQueryData(NOTIFICATIONS_KEY, (old) => {
        if (!old?.data?.notifications) return old
        return {
          ...old,
          data: {
            ...old.data,
            notifications: old.data.notifications.map((n) =>
              n._id === id ? { ...n, isRead: true } : n
            ),
          },
          unreadCount: Math.max(0, (old.unreadCount || 0) - 1),
        }
      })

      return { previous }
    },
    onError: (err, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(NOTIFICATIONS_KEY, context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY })
    },
  })

  const markAllAsRead = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY })
      const previous = queryClient.getQueryData(NOTIFICATIONS_KEY)

      queryClient.setQueryData(NOTIFICATIONS_KEY, (old) => {
        if (!old?.data?.notifications) return old
        return {
          ...old,
          data: {
            ...old.data,
            notifications: old.data.notifications.map((n) => ({ ...n, isRead: true })),
          },
          unreadCount: 0,
        }
      })

      return { previous }
    },
    onError: (err, vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(NOTIFICATIONS_KEY, context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY })
    },
  })

  const handleMarkAsRead = useCallback((id) => {
    markAsRead.mutate(id)
  }, [markAsRead])

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead.mutate()
  }, [markAllAsRead])

  return {
    notifications: data?.data?.notifications || [],
    unreadCount: data?.unreadCount || 0,
    totalPages: data?.totalPages || 1,
    isLoading,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
  }
}

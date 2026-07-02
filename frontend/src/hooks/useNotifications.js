import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationApi } from '../services/notificationApi'
import { useAuth } from './useAuth'

export function useNotifications() {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getNotifications().then((r) => r.data),
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated ? 30000 : false,
  })

  const markAsRead = useMutation({
    mutationFn: (id) => notificationApi.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markAllAsRead = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  return {
    notifications: data?.data?.notifications || [],
    unreadCount: data?.unreadCount || 0,
    totalPages: data?.totalPages || 1,
    isLoading,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
  }
}

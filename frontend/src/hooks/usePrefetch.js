import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'

export function usePrefetch() {
  const queryClient = useQueryClient()

  const prefetch = useCallback((queryKey, queryFn, options = {}) => {
    const { staleTime = 30000, ...rest } = options
    return queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime,
      ...rest,
    })
  }, [queryClient])

  const cancelPrefetch = useCallback((queryKey) => {
    queryClient.cancelQueries({ queryKey })
  }, [queryClient])

  return { prefetch, cancelPrefetch }
}

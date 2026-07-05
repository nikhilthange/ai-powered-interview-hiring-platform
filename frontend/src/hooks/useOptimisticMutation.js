import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useOptimisticMutation({
  mutationFn,
  queryKey,
  optimisticUpdate,
  onSuccess,
  onError,
  rollbackOnError = true,
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData(queryKey)

      if (optimisticUpdate) {
        queryClient.setQueryData(queryKey, (old) => optimisticUpdate(old, variables))
      }

      return { previousData }
    },
    onError: (err, variables, context) => {
      if (rollbackOnError && context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      onError?.(err, variables, context)
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey })
      onSuccess?.(data, variables, context)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })
}

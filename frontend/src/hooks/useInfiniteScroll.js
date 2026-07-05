import { useCallback, useRef } from 'react'

export function useInfiniteScroll({ onLoadMore, hasMore, isLoading, threshold = 200 }) {
  const observerRef = useRef(null)

  const sentinelRef = useCallback(
    (node) => {
      if (isLoading) return
      if (observerRef.current) observerRef.current.disconnect()

      if (!hasMore) return

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !isLoading) {
            onLoadMore()
          }
        },
        { rootMargin: `${threshold}px` }
      )

      if (node) observerRef.current.observe(node)
    },
    [onLoadMore, hasMore, isLoading, threshold]
  )

  return { sentinelRef }
}

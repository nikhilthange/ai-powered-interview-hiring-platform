import { useEffect, useRef, useState } from 'react'

export function useIntersectionObserver(options = {}) {
  const { threshold = 0, root = null, rootMargin = '0px', once = false } = options
  const ref = useRef(null)
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [entry, setEntry] = useState(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        setEntry(entry)
        if (entry.isIntersecting && once) {
          observer.unobserve(element)
        }
      },
      { threshold, root, rootMargin }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold, root, rootMargin, once])

  return { ref, isIntersecting, entry }
}

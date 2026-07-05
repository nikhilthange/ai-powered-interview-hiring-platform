import { useState } from 'react'
import { cn } from '../../lib/utils'
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver'

export default function LazyImage({ src, alt, className, wrapperClassName, placeholder, ...props }) {
  const [loaded, setLoaded] = useState(false)
  const { ref, isIntersecting } = useIntersectionObserver({ once: true, rootMargin: '200px' })

  return (
    <div ref={ref} className={cn('relative overflow-hidden', wrapperClassName)}>
      {!loaded && (
        <div
          className={cn('absolute inset-0 skeleton-shimmer', className)}
          aria-hidden="true"
        >
          {placeholder}
        </div>
      )}
      {isIntersecting && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={cn(
            'transition-opacity duration-300',
            loaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          {...props}
        />
      )}
    </div>
  )
}

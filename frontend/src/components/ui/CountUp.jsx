import { useState, useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

export default function CountUp({
  value,
  duration = 1.2,
  prefix = '',
  suffix = '',
  className = '',
}) {
  const shouldReduceMotion = useReducedMotion()
  
  // Extract number from input (e.g. 85, '85%', '₹50,000')
  const numericTarget = typeof value === 'number'
    ? value
    : parseFloat(String(value || '0').replace(/[^0-9.-]+/g, '')) || 0

  const [count, setCount] = useState(shouldReduceMotion ? numericTarget : 0)
  const countRef = useRef(0)
  const startTimeRef = useRef(null)

  useEffect(() => {
    if (shouldReduceMotion) {
      setCount(numericTarget)
      return
    }

    let animationFrameId
    const startValue = 0
    const durationMs = duration * 1000

    const updateCount = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const progress = timestamp - startTimeRef.current
      const percentage = Math.min(progress / durationMs, 1)
      
      // Ease out cubic: 1 - Math.pow(1 - progress, 3)
      const easeOutProgress = 1 - Math.pow(1 - percentage, 3)
      const currentCount = Math.round(startValue + easeOutProgress * (numericTarget - startValue))

      setCount(currentCount)

      if (percentage < 1) {
        animationFrameId = requestAnimationFrame(updateCount)
      } else {
        setCount(numericTarget)
      }
    }

    startTimeRef.current = null
    animationFrameId = requestAnimationFrame(updateCount)

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [numericTarget, duration, shouldReduceMotion])

  // Preserve percentage or suffix from original value if string was passed
  const displaySuffix = suffix || (typeof value === 'string' && value.endsWith('%') ? '%' : '')

  return (
    <span className={className}>
      {prefix}
      {count.toLocaleString()}
      {displaySuffix}
    </span>
  )
}

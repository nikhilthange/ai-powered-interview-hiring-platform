const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ onCLS, onFID, onLCP, onFCP, onTTFB }) => {
      onCLS(onPerfEntry)
      onFID(onPerfEntry)
      onLCP(onPerfEntry)
      onFCP(onPerfEntry)
      onTTFB(onPerfEntry)
    }).catch(() => {})
  }
}

export function measureRenderTime(label) {
  if (import.meta.env.DEV) {
    performance.mark(`${label}-start`)
    return () => {
      performance.mark(`${label}-end`)
      performance.measure(label, `${label}-start`, `${label}-end`)
      const entries = performance.getEntriesByName(label)
      if (entries.length > 0) {
        console.debug(`[Perf] ${label}: ${entries[entries.length - 1].duration.toFixed(2)}ms`)
      }
      performance.clearMarks(`${label}-start`)
      performance.clearMarks(`${label}-end`)
      performance.clearMeasures(label)
    }
  }
  return () => {}
}

export function initPerformanceMonitoring() {
  if (import.meta.env.PROD) {
    reportWebVitals((metric) => {
      const body = {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        url: window.location.pathname,
        timestamp: Date.now(),
      }
      if (navigator.sendBeacon) {
        const baseUrl = import.meta.env.VITE_API_URL || '';
        navigator.sendBeacon(`${baseUrl}/analytics/vitals`, JSON.stringify(body))
      }
    })
  }
}

export function debounce(fn, delay = 300) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export function throttle(fn, limit = 100) {
  let inThrottle
  return (...args) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => { inThrottle = false }, limit)
    }
  }
}

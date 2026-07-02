import { useEffect } from 'react'

export function useDocumentTitle(title) {
  useEffect(() => {
    const prev = document.title
    document.title = title ? `${title} | HireMate` : 'HireMate'
    return () => { document.title = prev }
  }, [title])
}

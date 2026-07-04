import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, X } from 'lucide-react'
import { cn, formatFileSize } from '../../lib/utils'
import { ALLOWED_FILE_TYPES } from '../../lib/constants'

export default function FileDropzone({ onFile, accept, label, icon: Icon = Upload }) {
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  const handleFileDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer?.files?.[0]
    if (droppedFile && ALLOWED_FILE_TYPES.includes(droppedFile.type)) {
      setFile(droppedFile)
      onFile?.(droppedFile)
    }
  }, [onFile])

  const handleDragOver = useCallback((e) => { e.preventDefault(); setDragOver(true) }, [])
  const handleDragLeave = useCallback((e) => { e.preventDefault(); setDragOver(false) }, [])
  const handleFileSelect = useCallback((e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
      setFile(selectedFile)
      onFile?.(selectedFile)
    }
  }, [onFile])

  const removeFile = useCallback(() => {
    setFile(null)
    onFile?.(null)
    if (inputRef.current) inputRef.current.value = ''
  }, [onFile])

  const accentColor = 'indigo'

  return (
    <div>
      {!file ? (
        <div
          onDrop={handleFileDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'cursor-pointer flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 sm:p-12 text-center transition-all duration-200',
            dragOver
              ? `border-${accentColor}-500 bg-${accentColor}-50 dark:bg-${accentColor}-950/50 scale-[1.01]`
              : 'border-[var(--border-color)] hover:border-indigo-300 hover:bg-[var(--bg-tertiary)]'
          )}
        >
          <motion.div
            animate={dragOver ? { y: -5, scale: 1.1 } : {}}
            className="mb-4 sm:mb-5 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900"
          >
            <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-500" aria-hidden="true" />
          </motion.div>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            Drop your file here, or <span className="text-indigo-600">browse files</span>
          </p>
          <p className="mt-1 text-xs text-[var(--text-tertiary)]">{label || 'PDF, DOC, or DOCX (max 5 MB)'}</p>
          <input ref={inputRef} type="file" accept={accept || '.pdf,.docx,.doc'} onChange={handleFileSelect} className="sr-only" tabIndex={-1} />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 rounded-xl border border-[var(--border-color)] p-4"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <FileText className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--text-primary)]">{file.name}</p>
            <p className="text-xs text-[var(--text-tertiary)]">{formatFileSize(file.size)}</p>
          </div>
          <button type="button" onClick={removeFile} aria-label={`Remove ${file.name}`} className="rounded-lg p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] transition-colors">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </motion.div>
      )}
    </div>
  )
}

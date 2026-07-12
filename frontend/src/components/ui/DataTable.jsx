import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, ChevronLeft, ChevronRight } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.03 } },
}

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
}

export default function DataTable({
  columns,
  data,
  onSort,
  sortKey,
  sortOrder,
  onPageChange,
  page,
  totalPages,
  totalItems,
  searchable = false,
  onSearch,
  searchValue,
  searchPlaceholder = 'Search...',
  isLoading,
  renderActions,
  emptyMessage = 'No data found',
  emptyIcon: EmptyIcon,
  keyExtractor = (row, i) => row._id || i,
  onRowClick,
  selectedIds,
  onSelect,
  selectable = false,
}) {
  const [localSearch, setLocalSearch] = useState('')
  const searchRef = useRef(null)

  useEffect(() => {
    if (searchValue !== undefined) setLocalSearch(searchValue)
  }, [searchValue])

  const handleSearch = (val) => {
    setLocalSearch(val)
    if (onSearch) onSearch(val)
  }

  const SortIcon = ({ columnKey }) => {
    if (sortKey !== columnKey) return <ChevronsUpDown className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
    return sortOrder === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
  }

  return (
    <div className="space-y-4">
      {(searchable || onSearch) && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
          <input
            ref={searchRef}
            type="text"
            value={localSearch}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/30 focus:border-[var(--color-primary-500)] transition-all"
          />
        </div>
      )}

        <div className="overflow-x-auto max-w-full surface-card">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/50 backdrop-blur-md">
              {selectable && (
                <th className="px-4 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds?.length === data?.length && data?.length > 0}
                    onChange={() => onSelect?.(data.map((r) => keyExtractor(r)))}
                    className="rounded border-[var(--border-color)]"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider',
                    col.sortable ? 'cursor-pointer select-none hover:text-[var(--text-primary)]' : '',
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  )}
                  style={col.width ? { width: col.width, minWidth: col.width } : undefined}
                  onClick={() => {
                    if (col.sortable && onSort) {
                      onSort(col.key)
                    }
                  }}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && <SortIcon columnKey={col.key} />}
                  </div>
                </th>
              ))}
              {renderActions && <th className="px-4 py-3 text-right w-24"><span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Actions</span></th>}
            </tr>
          </thead>
          {(() => {
            const totalCols = columns.length + (selectable ? 1 : 0) + (renderActions ? 1 : 0)
            if (isLoading) {
              return (
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="border-b border-[var(--border-color)] last:border-b-0">
                      {selectable && <td className="px-4 py-3"><div className="skeleton-shimmer h-4 w-4 rounded" /></td>}
                      {columns.map((col) => (
                        <td key={col.key} className="px-4 py-3"><div className="skeleton-shimmer h-4 w-3/4 rounded-lg" /></td>
                      ))}
                      {renderActions && <td className="px-4 py-3"><div className="skeleton-shimmer h-8 w-16 rounded-lg ml-auto" /></td>}
                    </tr>
                  ))}
                </tbody>
              )
            }
            if (data && data.length > 0) {
              return (
                <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                  {data.map((row, i) => (
                    <motion.tr
                      key={keyExtractor(row, i)}
                      variants={rowVariants}
                      className={cn(
                        'border-b border-[var(--border-color)] last:border-b-0 transition-colors',
                        onRowClick ? 'cursor-pointer hover:bg-[var(--bg-secondary)]/50' : 'hover:bg-[var(--bg-secondary)]/30',
                        selectedIds?.includes(keyExtractor(row, i)) ? 'bg-[var(--color-primary-50)]/30 dark:bg-indigo-500/5' : ''
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      {selectable && (
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds?.includes(keyExtractor(row, i))}
                            onChange={() => onSelect?.(keyExtractor(row, i))}
                            className="rounded border-[var(--border-color)]"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                      )}
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={cn(
                            'px-4 py-3 text-sm',
                            col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                          )}
                        >
                          {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                        </td>
                      ))}
                      {renderActions && (
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            {renderActions(row)}
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </motion.tbody>
              )
            }
            return (
              <tbody>
                <tr>
                  <td colSpan={totalCols} className="px-4 py-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      {EmptyIcon && <EmptyIcon className="h-10 w-10 text-[var(--text-tertiary)] mb-3" />}
                      <p className="text-sm text-[var(--text-secondary)]">{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            )
          })()}
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-[var(--text-tertiary)]">
            Page {page} of {totalPages} ({totalItems} total)
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
              className="rounded-lg p-2 text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4))
              const p = start + i
              if (p > totalPages) return null
              return (
                <button
                  key={p}
                  onClick={() => onPageChange?.(p)}
                  className={cn(
                    'min-w-[32px] h-8 rounded-lg text-xs font-medium transition-colors',
                    p === page
                      ? 'bg-[var(--color-primary-500)] text-white'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                  )}
                >
                  {p}
                </button>
              )
            })}
            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
              className="rounded-lg p-2 text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

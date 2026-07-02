import { X } from 'lucide-react'

export default function SkillBadge({ skill, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 px-3 py-1.5 text-xs font-medium border border-indigo-200 dark:border-indigo-800">
      {skill}
      {onRemove && (
        <button
          onClick={() => onRemove(skill)}
          className="rounded-full p-0.5 hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
          aria-label={`Remove ${skill}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  )
}

import { X } from 'lucide-react'

export default function SkillBadge({ skill, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
      {skill}
      {onRemove && (
        <button type="button" onClick={() => onRemove(skill)} className="hover:text-indigo-500">
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  )
}

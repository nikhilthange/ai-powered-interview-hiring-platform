import { cn } from '../../lib/utils'
import { useAuth } from '../../hooks/useAuth'
import { formatDateRelative } from '../../lib/utils'

export default function ChatMessage({ message }) {
  const { user } = useAuth()
  const isOwn = message.senderId?._id === user?._id || message.senderId === user?._id || message.isOwn

  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2.5',
          isOwn
            ? 'bg-indigo-500 text-white rounded-tr-md'
            : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-tl-md'
        )}
      >
        <p className="text-sm leading-relaxed">{message.content || message.text}</p>
        <p className={cn(
          'text-[10px] mt-1',
          isOwn ? 'text-white/60' : 'text-[var(--text-tertiary)]'
        )}>
          {formatDateRelative(message.createdAt || message.timestamp)}
        </p>
      </div>
    </div>
  )
}

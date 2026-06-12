import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../lib/utils'

export default function ChatMessage({ message }) {
  const { user } = useAuth()
  const isOwn = message.senderId === user?._id

  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm',
          isOwn
            ? 'bg-[var(--color-primary-500)] text-white rounded-br-sm'
            : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-bl-sm'
        )}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.messageText}</p>
        <div className={cn('mt-1 flex items-center gap-1.5', isOwn ? 'justify-end' : 'justify-start')}>
          <span className={cn('text-[10px]', isOwn ? 'text-white/70' : 'text-[var(--text-tertiary)]')}>
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isOwn && message.isRead && (
            <span className="text-[10px] text-white/70">· Read</span>
          )}
        </div>
      </div>
    </div>
  )
}

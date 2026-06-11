import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../lib/utils'

export default function ChatMessage({ message }) {
  const { user } = useAuth()
  const isOwn = message.senderId === user?._id

  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[70%] rounded-2xl px-4 py-2 text-sm',
          isOwn
            ? 'bg-indigo-600 text-white rounded-br-md'
            : 'bg-gray-100 text-gray-900 rounded-bl-md'
        )}
      >
        <p className="whitespace-pre-wrap">{message.messageText}</p>
        <div className={cn('mt-1 flex items-center gap-1', isOwn ? 'justify-end' : 'justify-start')}>
          <span className={cn('text-xs', isOwn ? 'text-indigo-200' : 'text-gray-400')}>
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isOwn && message.isRead && (
            <span className="text-xs text-indigo-200">Read</span>
          )}
        </div>
      </div>
    </div>
  )
}

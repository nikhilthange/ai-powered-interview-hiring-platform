import { memo } from 'react'
import { cn } from '../../lib/utils'
import { useAuth } from '../../hooks/useAuth'
import { formatDateRelative } from '../../lib/utils'

function ChatMessageInner({ message }) {
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
        {message.attachments?.length > 0 && (
          <div className="mb-2 space-y-2">
            {message.attachments.map((att, i) => (
              att.resourceType === 'image' ? (
                <img key={i} src={att.url} alt={att.name} className="max-w-full rounded-lg max-h-48 object-cover" />
              ) : (
                <a key={i} href={att.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 underline text-sm">
                  📄 {att.name}
                </a>
              )
            ))}
          </div>
        )}
        <p className="text-sm leading-relaxed">{message.messageText || message.content || message.text}</p>
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

const ChatMessage = memo(ChatMessageInner)
export default ChatMessage

import { memo, useMemo } from 'react'
import { cn } from '../../lib/utils'
import { useAuth } from '../../hooks/useAuth'

const ChatRoomItem = memo(function ChatRoomItem({ room, isSelected, onSelect }) {
  const { user } = useAuth()
  const unread = room.unreadCount || 0

  const otherUser = useMemo(() => {
    const candidateEmail = room.candidateId?.email || ''
    const recruiterEmail = room.recruiterId?.email || ''
    return user?._id === room.candidateId?._id
      ? { name: recruiterEmail?.split('@')[0] || 'Recruiter', email: recruiterEmail }
      : { name: candidateEmail?.split('@')[0] || 'Candidate', email: candidateEmail }
  }, [room.candidateId, room.recruiterId, user?._id])

  return (
    <button
      onClick={() => onSelect(room)}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors',
        isSelected ? 'bg-indigo-50 dark:bg-indigo-950/30' : 'hover:bg-[var(--bg-tertiary)]'
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
        {otherUser.name?.charAt(0) || 'U'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className={cn('text-sm truncate', unread > 0 ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-primary)]')}>
            {otherUser.name || 'User'}
          </p>
          {room.updatedAt && (
            <span className="text-[10px] text-[var(--text-tertiary)] shrink-0 ml-2">
              {new Date(room.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xs text-[var(--text-secondary)] truncate">
            No messages yet
          </p>
          {unread > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-500 px-1.5 text-[10px] font-bold text-white ml-2">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </div>
      </div>
    </button>
  )
})

function ChatRoomList({ rooms, selectedRoom, onSelect }) {
  return (
    <div className="divide-y divide-[var(--border-color)]">
      {rooms.map((room) => (
        <ChatRoomItem
          key={room._id}
          room={room}
          isSelected={selectedRoom?._id === room._id}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

export default memo(ChatRoomList)

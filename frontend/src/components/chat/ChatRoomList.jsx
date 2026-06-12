import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../lib/utils'
import { MessageCircle, Loader2 } from 'lucide-react'

export default function ChatRoomList({ rooms, activeRoomId, onSelect, loading }) {
  const { user } = useAuth()

  const getOtherParticipant = (room) => {
    if (!room) return { email: 'Unknown' }
    return user?._id === room.candidateId?._id
      ? room.recruiterId || { email: 'Recruiter' }
      : room.candidateId || { email: 'Candidate' }
  }

  return (
    <div className="border-r border-[var(--border-color)] bg-[var(--bg-primary)]">
      <div className="border-b border-[var(--border-color)] px-4 py-3.5">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Messages</h2>
      </div>
      <div className="overflow-y-auto h-[calc(100vh-13rem)]">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--text-tertiary)]" />
          </div>
        ) : rooms?.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <MessageCircle className="h-8 w-8 text-[var(--text-tertiary)]" />
            <p className="mt-2 text-sm text-[var(--text-secondary)]">No conversations yet</p>
          </div>
        ) : (
          rooms?.map((room) => {
            const other = getOtherParticipant(room)
            const isActive = room._id === activeRoomId
            return (
              <button
                key={room._id}
                onClick={() => onSelect(room)}
                className={cn(
                  'w-full border-b border-[var(--border-color)] px-4 py-3.5 text-left transition-colors',
                  isActive ? 'bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-950)]' : 'hover:bg-[var(--bg-tertiary)]'
                )}
              >
                <p className="text-sm font-medium text-[var(--text-primary)]">{other.email}</p>
                <p className="mt-0.5 text-xs text-[var(--text-tertiary)] truncate">
                  {room.lastMessage || 'No messages yet'}
                </p>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

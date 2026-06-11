import { useAuth } from '../../hooks/useAuth'
import { MessageCircle } from 'lucide-react'

export default function ChatRoomList({ rooms, activeRoomId, onSelect, loading }) {
  const { user } = useAuth()

  const getOtherParticipant = (room) => {
    if (!room) return { email: 'Unknown' }
    return user?._id === room.candidateId?._id
      ? room.recruiterId || { email: 'Recruiter' }
      : room.candidateId || { email: 'Candidate' }
  }

  return (
    <div className="border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
      </div>
      <div className="overflow-y-auto h-[calc(100vh-12rem)]">
        {loading ? (
          <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
        ) : rooms?.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <MessageCircle className="h-8 w-8 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">No conversations yet</p>
          </div>
        ) : (
          rooms?.map((room) => {
            const other = getOtherParticipant(room)
            const isActive = room._id === activeRoomId
            return (
              <button
                key={room._id}
                onClick={() => onSelect(room)}
                className={`w-full border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                  isActive ? 'bg-indigo-50' : ''
                }`}
              >
                <p className="text-sm font-medium text-gray-900">{other.email}</p>
                <p className="mt-0.5 text-xs text-gray-500 truncate">
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

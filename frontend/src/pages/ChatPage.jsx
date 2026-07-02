import { motion } from 'framer-motion'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '../components/ui/Card'

import { SkeletonList } from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import ChatRoomList from '../components/chat/ChatRoomList'
import ChatMessages from '../components/chat/ChatMessages'
import ChatInput from '../components/chat/ChatInput'
import { chatApi } from '../services/chatApi'
import {
  MessageCircle, ArrowLeft, Phone, Video, MoreHorizontal,
} from 'lucide-react'
import { cn } from '../lib/utils'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
}

export default function ChatPage() {
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [showMobileList, setShowMobileList] = useState(true)

  const { data: roomsData, isLoading } = useQuery({
    queryKey: ['chat-rooms'],
    queryFn: () => chatApi.getRooms().then((r) => r.data?.data?.rooms || []),
  })

  const rooms = Array.isArray(roomsData) ? roomsData : []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="skeleton-shimmer h-8 w-48 rounded-xl" />
        <SkeletonList count={5} />
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="h-[calc(100vh-8rem)]"
    >
      <div className="flex h-full gap-4">
        <div className={cn(
          'w-full lg:w-80 shrink-0',
          selectedRoom && 'hidden lg:block'
        )}>
          <Card className="h-full">
            <CardContent className="p-0 h-full flex flex-col">
              <div className="p-4 border-b border-[var(--border-color)]">
                <h2 className="font-semibold text-[var(--text-primary)]">Messages</h2>
                <p className="text-xs text-[var(--text-tertiary)]">{rooms.length} conversation{rooms.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {rooms.length === 0 ? (
                  <EmptyState
                    icon={MessageCircle}
                    title="No messages yet"
                    description="Start a conversation with a recruiter or candidate."
                    small
                  />
                ) : (
                  <ChatRoomList
                    rooms={rooms}
                    selectedRoom={selectedRoom}
                    onSelect={(room) => { setSelectedRoom(room); setShowMobileList(false) }}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className={cn(
          'flex-1 min-w-0',
          !selectedRoom && 'hidden lg:block'
        )}>
          {selectedRoom ? (
            <Card className="h-full">
              <CardContent className="p-0 h-full flex flex-col">
                <div className="flex items-center gap-3 p-4 border-b border-[var(--border-color)]">
                  <button
                    onClick={() => setSelectedRoom(null)}
                    className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] lg:hidden"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                    {selectedRoom.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{selectedRoom.name || 'User'}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">Online</p>
                  </div>
                  <button className="rounded-xl p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]">
                    <Phone className="h-4 w-4" />
                  </button>
                  <button className="rounded-xl p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]">
                    <Video className="h-4 w-4" />
                  </button>
                  <button className="rounded-xl p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <ChatMessages roomId={selectedRoom._id} />
                </div>

                <div className="p-4 border-t border-[var(--border-color)]">
                  <ChatInput roomId={selectedRoom._id} />
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-tertiary)]">
                  <MessageCircle className="h-8 w-8 text-[var(--text-tertiary)]" />
                </div>
                <p className="text-lg font-medium text-[var(--text-primary)]">Select a conversation</p>
                <p className="text-sm text-[var(--text-secondary)] mt-1">Choose a chat from the left to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

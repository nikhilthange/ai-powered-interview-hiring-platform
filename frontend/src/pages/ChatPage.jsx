import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { chatApi } from '../services/chatApi'
import { useAuth } from '../hooks/useAuth'
import { useSocket } from '../hooks/useSocket'
import ChatRoomList from '../components/chat/ChatRoomList'
import ChatMessages from '../components/chat/ChatMessages'
import ChatInput from '../components/chat/ChatInput'
import { Card, CardContent } from '../components/ui/Card'
import { SkeletonList } from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import { MessageCircle, ArrowLeft, MoreHorizontal, Briefcase, Mail, Phone, Video } from 'lucide-react'
import { cn } from '../lib/utils'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

export default function ChatPage() {
  const { user } = useAuth()
  const { isUserOnline } = useSocket()
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const { data: roomsData, isLoading } = useQuery({
    queryKey: ['chat-rooms'],
    queryFn: () => chatApi.getMyRooms().then((r) => r.data?.data?.rooms || []),
  })

  const allRooms = Array.isArray(roomsData) ? roomsData : []
  
  const rooms = useMemo(() => {
    if (!searchQuery) return allRooms
    return allRooms.filter((r) => {
      const otherUser = user?._id === r.candidateId?._id ? r.recruiterId : r.candidateId
      const name = otherUser?.name || otherUser?.email?.split('@')[0] || ''
      return name.toLowerCase().includes(searchQuery.toLowerCase())
    })
  }, [allRooms, searchQuery, user?._id])

  const otherUser = useMemo(() => {
    if (!selectedRoom || !user) return null
    return user._id === selectedRoom.candidateId?._id ? selectedRoom.recruiterId : selectedRoom.candidateId
  }, [selectedRoom, user])

  const otherUserName = otherUser?.name || otherUser?.email?.split('@')[0] || 'User'
  const isOnline = otherUser ? isUserOnline(otherUser._id) : false

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
      className="h-[calc(100dvh-8rem)] lg:h-[calc(100vh-8rem)]"
    >
      <div className="flex h-full gap-4">
        {/* Left Panel: Room List */}
        <div className={cn(
          'w-full sm:w-80 lg:w-80 shrink-0 flex flex-col',
          selectedRoom && 'hidden lg:flex'
        )}>
          <Card className="h-full flex flex-col">
            <CardContent className="p-0 flex-1 flex flex-col min-h-0">
              <div className="p-4 border-b border-[var(--border-color)]">
                <h2 className="font-semibold text-lg text-[var(--text-primary)]">Messaging</h2>
                <div className="mt-3">
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {rooms.length === 0 ? (
                  <EmptyState
                    icon={MessageCircle}
                    title="No conversations"
                    description="You don't have any messages yet."
                    small
                  />
                ) : (
                  <ChatRoomList
                    rooms={rooms}
                    selectedRoom={selectedRoom}
                    onSelect={(room) => setSelectedRoom(room)}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center Panel: Chat Window */}
        <div className={cn(
          'flex-1 flex flex-col min-w-0',
          !selectedRoom && 'hidden lg:flex'
        )}>
          {selectedRoom ? (
            <Card className="h-full flex flex-col shadow-sm">
              <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                <div className="flex items-center gap-3 p-4 border-b border-[var(--border-color)] bg-[var(--bg-primary)] z-10 relative">
                  <button
                    onClick={() => setSelectedRoom(null)}
                    className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] lg:hidden shrink-0"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="relative shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                      {otherUserName.charAt(0)}
                    </div>
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[var(--bg-primary)]"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{otherUserName}</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {isOnline ? 'Active now' : 'Offline'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button className="rounded-xl p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors hidden sm:block">
                      <Phone className="h-4 w-4" />
                    </button>
                    <button className="rounded-xl p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors hidden sm:block">
                      <Video className="h-4 w-4" />
                    </button>
                    <button className="rounded-xl p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-[var(--bg-secondary)] dark:bg-[var(--bg-primary)]/50">
                  <ChatMessages roomId={selectedRoom._id} />
                </div>

                <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-primary)]">
                  <ChatInput roomId={selectedRoom._id} />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full">
              <CardContent className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-tertiary)]">
                    <MessageCircle className="h-8 w-8 text-[var(--text-tertiary)]" />
                  </div>
                  <p className="text-lg font-medium text-[var(--text-primary)]">Select a conversation</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">Choose a chat from the left to start messaging</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel: User Details */}
        {selectedRoom && otherUser && (
          <div className="hidden xl:flex w-72 shrink-0 flex-col">
            <Card className="h-full overflow-y-auto">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl font-bold mb-4 relative">
                    {otherUserName.charAt(0)}
                    {isOnline && (
                      <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-[var(--bg-primary)]"></span>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg text-[var(--text-primary)]">{otherUserName}</h3>
                  <p className="text-sm text-[var(--text-secondary)] capitalize">{otherUser.role || 'Member'}</p>
                </div>
                
                <div className="mt-8 space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Contact</h4>
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <Mail className="h-4 w-4 text-[var(--text-tertiary)]" />
                      <span className="truncate">{otherUser.email}</span>
                    </div>
                  </div>

                  {otherUser.role === 'candidate' && (
                    <div>
                      <h4 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="inline-flex items-center rounded-md bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">React</span>
                        <span className="inline-flex items-center rounded-md bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">Node.js</span>
                      </div>
                    </div>
                  )}

                  {otherUser.role === 'recruiter' && (
                    <div>
                      <h4 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Company</h4>
                      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                        <Briefcase className="h-4 w-4 text-[var(--text-tertiary)]" />
                        <span>HireMate Inc.</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </motion.div>
  )
}

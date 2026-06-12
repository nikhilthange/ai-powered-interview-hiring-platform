import { useState, useEffect, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import useSocket from '../hooks/useSocket'
import { useApi } from '../hooks/useApi'
import { chatApi } from '../services/chatApi'
import ChatRoomList from '../components/chat/ChatRoomList'
import ChatMessages from '../components/chat/ChatMessages'
import ChatInput from '../components/chat/ChatInput'
import { SkeletonPage } from '../components/ui/Skeleton'
import { MessageCircle, AlertCircle } from 'lucide-react'

export default function ChatPage() {
  const queryClient = useQueryClient()
  const [activeRoom, setActiveRoom] = useState(null)
  const [messages, setMessages] = useState([])

  const { data: roomsData, isLoading: roomsLoading, isError: roomsError, error: roomsErrorObj } = useApi(['chat-rooms'], () =>
    chatApi.getMyRooms().then((r) => r.data)
  )

  const { data: messagesData, isLoading: messagesLoading, isError: messagesError, refetch: refetchMessages } = useQuery({
    queryKey: ['chat-messages', activeRoom?._id],
    queryFn: () => chatApi.getRoomMessages(activeRoom._id).then((r) => r.data),
    enabled: !!activeRoom,
  })

  const {
    typingUsers,
    isUserOnline,
    joinRoom,
    sendMessage,
    emitTyping,
    markRead,
    onMessage,
    onMessagesRead,
  } = useSocket()

  useEffect(() => {
    if (messagesData?.data?.messages) {
      setMessages(messagesData.data.messages)
    }
  }, [messagesData])

  useEffect(() => {
    if (activeRoom) {
      joinRoom(activeRoom._id)
      markRead(activeRoom._id)
    }
  }, [activeRoom, joinRoom, markRead])

  useEffect(() => {
    const unsubMessage = onMessage((payload) => {
      setMessages((prev) => [...prev, payload])
      queryClient.invalidateQueries({ queryKey: ['chat-rooms'] })
    })
    return () => unsubMessage?.()
  }, [onMessage, queryClient])

  useEffect(() => {
    const unsubRead = onMessagesRead(({ roomId }) => {
      if (roomId === activeRoom?._id) {
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId !== activeRoom?.candidateId?._id &&
            m.senderId !== activeRoom?.recruiterId?._id
              ? m
              : { ...m, isRead: true }
          )
        )
      }
    })
    return () => unsubRead?.()
  }, [onMessagesRead, activeRoom])

  const handleSend = useCallback(
    (text) => {
      if (!activeRoom) return
      sendMessage(activeRoom._id, text)
      const optimistic = {
        _id: `temp-${Date.now()}`,
        chatRoomId: activeRoom._id,
        senderId: 'self',
        messageText: text,
        createdAt: new Date().toISOString(),
        isRead: false,
      }
      setMessages((prev) => [...prev, optimistic])
    },
    [activeRoom, sendMessage]
  )

  const handleRoomSelect = (room) => {
    setActiveRoom(null)
    setTimeout(() => {
      setActiveRoom(room)
    }, 0)
  }

  if (roomsLoading) return <SkeletonPage />
  if (roomsError) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center rounded-xl border border-gray-200 bg-white">
        <div className="text-center p-8">
          <AlertCircle className="mx-auto h-10 w-10 text-red-400" />
          <p className="mt-3 text-gray-700">{roomsErrorObj?.response?.data?.message || 'Failed to load conversations.'}</p>
          <button onClick={() => queryClient.invalidateQueries({ queryKey: ['chat-rooms'] })} className="mt-4 text-sm font-medium text-red-600 hover:text-red-500">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const rooms = roomsData?.data?.rooms

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="w-80 flex-shrink-0">
        <ChatRoomList
          rooms={rooms}
          activeRoomId={activeRoom?._id}
          onSelect={handleRoomSelect}
          loading={roomsLoading}
        />
      </div>

      <div className="flex flex-1 flex-col">
        {activeRoom ? (
          <>
            {messagesError ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center p-8">
                  <AlertCircle className="mx-auto h-8 w-8 text-red-400" />
                  <p className="mt-2 text-sm text-gray-600">Failed to load messages.</p>
                  <button onClick={() => refetchMessages()} className="mt-2 text-sm font-medium text-red-600 hover:text-red-500">
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="border-b border-gray-200 px-6 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {activeRoom.candidateId?.email?.split('@')[0] || activeRoom.recruiterId?.email?.split('@')[0] || 'Chat'}
                    </span>
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isUserOnline(activeRoom.candidateId?._id || activeRoom.recruiterId?._id)
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                    />
                    <span className="text-xs text-gray-400">
                      {isUserOnline(activeRoom.candidateId?._id || activeRoom.recruiterId?._id)
                        ? 'Online'
                        : 'Offline'}
                    </span>
                  </div>
                </div>
                <ChatMessages
                  messages={messages}
                  loading={messagesLoading}
                  typingUsers={typingUsers}
                />
                <ChatInput
                  roomId={activeRoom._id}
                  onSend={handleSend}
                  onTyping={(isTyping) => emitTyping(activeRoom._id, isTyping)}
                />
              </>
            )}
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center p-8">
            <MessageCircle className="h-16 w-16 text-gray-200" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Your Messages</h3>
            <p className="mt-1 text-sm text-gray-500">
              {rooms?.length > 0 ? 'Select a conversation to start chatting' : 'No conversations yet. Apply to jobs to start messaging with recruiters.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

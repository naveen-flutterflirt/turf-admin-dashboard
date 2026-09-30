"use client"
import React, { useState, useMemo, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { communityService } from '@/services/community'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, MessageSquare, Users, UserPlus, Clock, Calendar, Check, X, Trash2, Send, ArrowLeft, Trophy, Settings } from 'lucide-react'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/modal'
import { AnimatePresence, motion } from 'framer-motion'
import { EmptyState } from '@/components/ui/empty-state'

export default function CustomerCommunityPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'feed' | 'my-broadcasts' | 'chats'>('feed')
  const [searchTerm, setSearchTerm] = useState('')

  // Read from sessionStorage on client mount to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTab = sessionStorage.getItem('community_activeTab') as 'feed' | 'my-broadcasts' | 'chats'
      if (savedTab) setActiveTab(savedTab)
    }
  }, [])

  useEffect(() => {
    sessionStorage.setItem('community_activeTab', activeTab)
  }, [activeTab])

  // Queries
  const { data: feedData, isLoading: isFeedLoading } = useQuery({ queryKey: ['community_feed'], queryFn: communityService.getFeed })
  const { data: myBroadcastsData, isLoading: isMyBroadcastsLoading } = useQuery({ queryKey: ['my_broadcasts'], queryFn: communityService.getMyBroadcasts })
  const { data: requestsData, isLoading: isRequestsLoading } = useQuery({ queryKey: ['community_requests'], queryFn: communityService.getRequests })
  const { data: chatsData, isLoading: isChatsLoading } = useQuery({ queryKey: ['my_chats'], queryFn: communityService.getMyChats })

  // Data unwrapping
  const feed = feedData?.data || []
  const myBroadcasts = myBroadcastsData?.data || []
  const pendingRequests = requestsData?.data || []
  const chats = chatsData?.data || []

  // Create Broadcast State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [broadcastToDelete, setBroadcastToDelete] = useState<string | null>(null)
  const [broadcastForm, setBroadcastForm] = useState<any>({
    message: '',
    sport_id: '',
    play_date: '',
    start_time: '',
    end_time: '',
    players_needed: ''
  })

  // Chat State
  const [currentUser, setCurrentUser] = useState<any>(null)
  useEffect(() => {
    try {
      const token = localStorage.getItem('customer_token')
      if (token) {
        // Parse JWT payload safely
        const base64Url = token.split('.')[1];
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4 !== 0) {
          base64 += '=';
        }
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const decoded = JSON.parse(jsonPayload);
        
        const userStr = localStorage.getItem('customer_user')
        const storedUser = userStr ? JSON.parse(userStr) : {}
        
        setCurrentUser({ ...storedUser, id: decoded.id || decoded.userId || decoded.sub })
      }
    } catch(e) {
      console.error('Error parsing token:', e)
    }
  }, [])

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedChat = sessionStorage.getItem('community_selectedChatId')
      if (savedChat) setSelectedChatId(savedChat)
    }
  }, [])

  useEffect(() => {
    if (selectedChatId) {
      sessionStorage.setItem('community_selectedChatId', selectedChatId)
    } else {
      sessionStorage.removeItem('community_selectedChatId')
    }
  }, [selectedChatId])

  const [chatMessage, setChatMessage] = useState('')
  const { data: chatHistoryData, isLoading: isChatHistoryLoading } = useQuery({ 
    queryKey: ['chat_history', selectedChatId], 
    queryFn: () => communityService.getChatHistory(selectedChatId!),
    enabled: !!selectedChatId
  })
  const chatMessages = chatHistoryData?.data ? chatHistoryData.data : (Array.isArray(chatHistoryData) ? chatHistoryData : [])
  const [realtimeMessages, setRealtimeMessages] = useState<any[]>([])
  const socketRef = useRef<Socket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false)
  const [chatRoomNameForm, setChatRoomNameForm] = useState('')

  const { data: chatMembersData, isLoading: isChatMembersLoading } = useQuery({
    queryKey: ['chat_members', selectedChatId],
    queryFn: () => communityService.getChatRoomMembers(selectedChatId!),
    enabled: !!selectedChatId && isMembersModalOpen
  })
  const chatMembers = chatMembersData?.data || []
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    setRealtimeMessages([]) // clear on room change
    
    if (activeTab === 'chats' && selectedChatId) {
      const token = localStorage.getItem('customer_token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.eatmeat.live'
      
      let socketUrl = 'https://api.eatmeat.live';
      try {
        const url = new URL(apiUrl)
        socketUrl = `${url.protocol}//${url.host}`
      } catch (e) {
        socketUrl = apiUrl.split('/api')[0]
      }
      
      const socket = io(socketUrl, {
        auth: { token: `Bearer ${token}` },
        transports: ['websocket', 'polling']
      })
      socketRef.current = socket

      const joinRoom = () => {
        if (currentUser?.id) {
          socket.emit("join_chat_room", { roomId: selectedChatId, userId: currentUser.id }) 
        }
      }

      if (socket.connected) {
        joinRoom()
      }

      socket.on("connect", joinRoom)

      const handleIncomingMessage = (data: any) => {
        setRealtimeMessages(prev => {
          // Replace optimistic message or ignore duplicate
          if (prev.some(m => m.id === data.id || (m.sender_id === data.sender_id && m.message === data.message && m.id?.toString().startsWith('temp-')))) {
            return prev.map(m => (m.sender_id === data.sender_id && m.message === data.message && m.id?.toString().startsWith('temp-')) ? data : m)
          }
          return [...prev, data]
        })
      }

      socket.on("receive_message", handleIncomingMessage)
      socket.on("message", handleIncomingMessage)
      socket.on("message_error", (err) => {
        toast.error(`Message error: ${err.error || 'Failed to send'}`)
      })

      return () => {
        socket.disconnect()
        socketRef.current = null
      }
    }
  }, [activeTab, selectedChatId, currentUser?.id])

  const allMessages = [...chatMessages, ...realtimeMessages]

  useEffect(() => {
    scrollToBottom()
  }, [allMessages])

  // Mutations
  const createBroadcastMutation = useMutation({
    mutationFn: communityService.createBroadcast,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my_broadcasts'] })
      queryClient.invalidateQueries({ queryKey: ['community_feed'] })
      setIsCreateModalOpen(false)
      toast.success("Broadcast created successfully")
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to create broadcast")
  })

  const joinBroadcastMutation = useMutation({
    mutationFn: communityService.joinBroadcast,
    onSuccess: () => {
      toast.success("Request to join sent successfully")
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to send request")
  })

  const acceptRequestMutation = useMutation({
    mutationFn: communityService.acceptRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community_requests'] })
      toast.success("Request accepted")
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to accept request")
  })

  const deleteBroadcastMutation = useMutation({
    mutationFn: communityService.deleteBroadcast,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my_broadcasts'] })
      queryClient.invalidateQueries({ queryKey: ['community_feed'] })
      setBroadcastToDelete(null)
      toast.success("Broadcast deleted")
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to delete broadcast")
  })

  const updateRoomNameMutation = useMutation({
    mutationFn: (data: { roomId: string, name: string }) => communityService.updateChatRoomName(data.roomId, data.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my_chats'] })
      toast.success("Room name updated")
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to update room name")
  })

  const removeMemberMutation = useMutation({
    mutationFn: (data: { roomId: string, userId: string }) => communityService.removeChatMember(data.roomId, data.userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat_members', selectedChatId] })
      toast.success("Member removed")
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to remove member")
  })

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatMessage.trim()) return

    if (socketRef.current && socketRef.current.connected) {
      const tempId = `temp-${Date.now()}`
      socketRef.current.emit("send_message", {
        roomId: selectedChatId,
        senderId: currentUser?.id,
        message: chatMessage
      })
      
      // Optimistic update so you see your own message instantly
      setRealtimeMessages(prev => [...prev, {
        id: tempId,
        sender_id: currentUser?.id,
        sender_name: currentUser?.name || 'Me',
        message: chatMessage,
        created_at: new Date().toISOString()
      }])
      
      setChatMessage('')
    } else {
      toast.error("Not connected to chat server")
    }
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!broadcastForm.message.trim()) {
      toast.error("Message is required to broadcast")
      return
    }
    
    // Only send fields that have values (optional as per API)
    const payload: any = { message: broadcastForm.message }
    if (broadcastForm.sport_id) payload.sport_id = broadcastForm.sport_id
    if (broadcastForm.play_date) payload.play_date = broadcastForm.play_date
    if (broadcastForm.start_time) payload.start_time = broadcastForm.start_time
    if (broadcastForm.end_time) payload.end_time = broadcastForm.end_time
    if (broadcastForm.players_needed) payload.players_needed = broadcastForm.players_needed
      
    createBroadcastMutation.mutate(payload)
  }

  // Filtered Feed
  const filteredFeed = useMemo(() => {
    return feed.filter((b: any) => 
      b.message?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [feed, searchTerm])

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Community Hub</h1>
          <p className="text-muted-foreground mt-1">Connect with players, broadcast matches, and chat.</p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-brand-caribbean hover:bg-brand-caribbean/90 text-white rounded-xl shadow-lg shadow-brand-caribbean/20 flex items-center gap-2 px-6"
        >
          <Plus className="w-4 h-4" /> Create Broadcast
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-secondary/30 rounded-2xl w-max border border-border/50 shadow-inner overflow-x-auto">
        <button
          onClick={() => { setActiveTab('feed'); setSelectedChatId(null); }}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${activeTab === 'feed' ? 'bg-background shadow-md text-brand-mint border border-border/40' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
        >
          <Users className="w-4 h-4" /> Community Feed
        </button>
        <button
          onClick={() => { setActiveTab('my-broadcasts'); setSelectedChatId(null); }}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${activeTab === 'my-broadcasts' ? 'bg-background shadow-md text-brand-caribbean border border-border/40' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
        >
          <Trophy className="w-4 h-4" /> My Broadcasts
        </button>
        <button
          onClick={() => { setActiveTab('chats'); }}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${activeTab === 'chats' ? 'bg-background shadow-md text-blue-500 border border-border/40' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
        >
          <MessageSquare className="w-4 h-4" /> Chat Rooms
        </button>
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab + (selectedChatId ? 'chat' : '')}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          
          {/* ================== FEED TAB ================== */}
          {activeTab === 'feed' && (
            <div className="space-y-4">
              <div className="relative max-w-md mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search broadcasts..." 
                  className="pl-9 bg-secondary/20 rounded-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {isFeedLoading ? (
                <div className="py-12 flex justify-center text-brand-caribbean"><span className="animate-spin rounded-full h-8 w-8 border-2 border-current border-t-transparent" /></div>
              ) : filteredFeed.length === 0 ? (
                <EmptyState icon={Users} title="No Active Broadcasts" description="There are no broadcasts matching your search right now." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFeed.map((broadcast: any) => {
                    const isOwnBroadcast = myBroadcasts.some((b: any) => b.id === broadcast.id);
                    
                    return (
                    <Card key={broadcast.id} className="border border-border/40 bg-card/50 backdrop-blur-sm rounded-2xl hover:border-brand-caribbean/30 transition-all overflow-hidden flex flex-col">
                      <div className="p-5 flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-caribbean/10 text-brand-caribbean text-xs font-bold">
                            <Calendar className="w-3.5 h-3.5" /> {broadcast.play_date || 'TBD'}
                          </span>
                          <span className="text-xs font-medium text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full flex items-center gap-1">
                            <Users className="w-3 h-3" /> {broadcast.players_needed ? `Need ${broadcast.players_needed}` : 'Any'}
                          </span>
                        </div>
                        <p className="font-semibold text-foreground text-lg mb-2 line-clamp-2">{broadcast.message}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                          <Clock className="w-4 h-4" /> {broadcast.start_time || 'TBA'} - {broadcast.end_time || 'TBA'}
                        </div>
                      </div>
                      <div className="p-3 border-t border-border/40 bg-secondary/10">
                        {isOwnBroadcast ? (
                           <Button 
                             onClick={() => setBroadcastToDelete(broadcast.id)}
                             className="w-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                           >
                             <Trash2 className="w-4 h-4 mr-2" /> Delete Broadcast
                           </Button>
                        ) : (
                          <Button 
                            onClick={() => joinBroadcastMutation.mutate(broadcast.id)}
                            disabled={joinBroadcastMutation.isPending}
                            className="w-full bg-brand-mint/10 text-brand-mint hover:bg-brand-mint hover:text-white rounded-xl transition-all font-semibold"
                          >
                            Request to Join
                          </Button>
                        )}
                      </div>
                    </Card>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================== MY BROADCASTS TAB ================== */}
          {activeTab === 'my-broadcasts' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-brand-caribbean" /> My Broadcasts</h2>
                {isMyBroadcastsLoading ? (
                  <div className="py-8 flex justify-center text-brand-caribbean"><span className="animate-spin rounded-full h-6 w-6 border-2 border-current border-t-transparent" /></div>
                ) : myBroadcasts.length === 0 ? (
                  <EmptyState icon={Trophy} title="No Broadcasts" description="You haven't created any broadcasts yet." />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myBroadcasts.map((broadcast: any) => (
                      <Card key={broadcast.id} className="border border-border/40 bg-card rounded-2xl relative overflow-hidden group">
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-caribbean/10 text-brand-caribbean text-xs font-bold">
                              <Calendar className="w-3.5 h-3.5" /> {broadcast.play_date}
                            </span>
                            <button 
                              onClick={() => setBroadcastToDelete(broadcast.id)}
                              className="text-red-400 hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="font-semibold text-foreground text-lg mb-2">{broadcast.message}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" /> {broadcast.start_time} - {broadcast.end_time}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><UserPlus className="w-5 h-5 text-brand-mint" /> Pending Join Requests</h2>
                {isRequestsLoading ? (
                  <div className="py-8 flex justify-center text-brand-mint"><span className="animate-spin rounded-full h-6 w-6 border-2 border-current border-t-transparent" /></div>
                ) : pendingRequests.length === 0 ? (
                  <div className="bg-secondary/20 border border-border/40 rounded-2xl p-6 text-center text-muted-foreground text-sm">
                    No pending requests for your broadcasts.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingRequests.map((req: any) => (
                      <div key={req.id} className="flex items-center justify-between p-4 bg-card border border-border/50 rounded-2xl shadow-sm">
                        <div>
                          <p className="font-semibold text-foreground">
                            <span className="text-brand-mint">{req.requester_name || 'A player'}</span> is requesting to join
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-1">"{req.broadcast_message}"</p>
                        </div>
                        <Button 
                          onClick={() => acceptRequestMutation.mutate(req.id)}
                          disabled={acceptRequestMutation.isPending}
                          className="bg-brand-mint text-white rounded-xl hover:opacity-90 shadow shadow-brand-mint/20"
                        >
                          Accept
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================== CHATS TAB ================== */}
          {activeTab === 'chats' && !selectedChatId && (
            <div className="space-y-4">
              {isChatsLoading ? (
                <div className="py-12 flex justify-center text-blue-500"><span className="animate-spin rounded-full h-8 w-8 border-2 border-current border-t-transparent" /></div>
              ) : chats.length === 0 ? (
                <EmptyState icon={MessageSquare} title="No Chat Rooms" description="You haven't joined any broadcast chats yet." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {chats.map((chat: any, index: number) => (
                    <div 
                      key={chat.id || chat.room_id || chat.roomId || chat._id || `chat-${index}`} 
                      onClick={() => setSelectedChatId(chat.id || chat.room_id || chat.roomId || chat._id)}
                      className="p-5 bg-card border border-border/50 hover:border-blue-500/30 rounded-2xl cursor-pointer hover:shadow-md transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-105 transition-transform">
                          <MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground line-clamp-1">{chat.name || chat.broadcast_message || `Community Match`}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Users className="w-3.5 h-3.5" /> 
                            {chat.host_name ? `Hosted by ${chat.host_name}` : 'Tap to view conversation'}
                          </p>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowLeft className="w-4 h-4 rotate-180" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================== ACTIVE CHAT VIEW ================== */}
          {activeTab === 'chats' && selectedChatId && (
            <div className="flex flex-col h-[600px] border border-border/50 bg-card rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-border/50 bg-secondary/20 flex items-center gap-3">
                <button onClick={() => setSelectedChatId(null)} className="p-2 hover:bg-secondary rounded-full transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  {(() => {
                    const activeChat = chats.find((c: any) => (c.id || c.room_id || c.roomId || c._id) === selectedChatId)
                    return (
                      <>
                        <h3 className="font-bold text-foreground">{activeChat?.name || activeChat?.broadcast_message || `Chat Room ${(selectedChatId || '').slice(0, 6)}`}</h3>
                        <p className="text-xs text-muted-foreground">Community Match Conversation</p>
                      </>
                    )
                  })()}
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsMembersModalOpen(true)} className="rounded-xl hover:bg-secondary flex items-center gap-2">
                  <Settings className="w-4 h-4 text-blue-500" />
                  <span className="hidden sm:inline">Group Info</span>
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {isChatHistoryLoading ? (
                   <div className="py-8 flex justify-center text-blue-500"><span className="animate-spin rounded-full h-6 w-6 border-2 border-current border-t-transparent" /></div>
                ) : allMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-70">
                    <MessageSquare className="w-10 h-10 mb-2 opacity-50" />
                    <p>No messages yet. Say hello!</p>
                  </div>
                ) : (
                  allMessages.map((msg: any, i: number) => {
                    const msgText = msg.message || msg.content || msg.text || (typeof msg === 'string' ? msg : '')
                    const isMe = msg.sender_id === 'Me' || msg.sender_name === 'Me' || msg.is_mine === true || (currentUser && currentUser.id === msg.sender_id)
                    const senderDisplay = msg.sender_name || (msg.sender_id ? `Player ${(msg.sender_id.toString()).slice(0, 4)}` : 'User')
                    
                    return (
                      <div 
                        key={i} 
                        className={`p-3 rounded-2xl max-w-[80%] ${
                          isMe 
                            ? 'bg-blue-500 text-white self-end rounded-tr-sm' 
                            : 'bg-secondary/40 text-foreground self-start rounded-tl-sm'
                        }`}
                      >
                        {!isMe && (
                          <p className="text-xs font-semibold text-blue-500 mb-1">{senderDisplay}</p>
                        )}
                        <p className={`text-sm ${isMe ? 'text-white' : 'text-foreground'}`}>{msgText}</p>
                        {msg.created_at && (
                          <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-muted-foreground'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form 
                onSubmit={handleSendMessage}
                className="p-4 bg-secondary/10 border-t border-border/50 flex gap-2"
              >
                <Input 
                  placeholder="Type your message..." 
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="rounded-xl border-border/50 focus-visible:ring-blue-500 bg-background"
                />
                <Button type="submit" disabled={!chatMessage.trim()} className="rounded-xl bg-blue-500 hover:bg-blue-600 text-white shadow-md">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Create Broadcast Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Broadcast">
        <form onSubmit={handleCreateSubmit} className="space-y-6 pt-2">
          
          <div className="bg-gradient-to-br from-brand-caribbean/10 to-transparent p-4 rounded-2xl border border-brand-caribbean/20 mb-2">
            <p className="text-sm text-foreground/80 leading-relaxed">
              Fill out the details below to broadcast your match to the community. Other players will be able to see this and request to join your game!
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <MessageSquare className="w-4 h-4 text-brand-caribbean" />
              Broadcast Message
            </label>
            <textarea 
              required
              placeholder="e.g. Looking for 3 players for a friendly 5v5 match. Beginners welcome!" 
              value={broadcastForm.message}
              onChange={e => setBroadcastForm({...broadcastForm, message: e.target.value})}
              className="w-full min-h-[100px] p-3.5 rounded-xl border border-border/50 bg-secondary/20 text-sm shadow-inner placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-caribbean focus-visible:border-brand-caribbean transition-all resize-none"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Calendar className="w-4 h-4 text-brand-caribbean" />
                Play Date
              </label>
              <Input 
                type="date" 
                value={broadcastForm.play_date}
                onChange={e => setBroadcastForm({...broadcastForm, play_date: e.target.value})}
                className="rounded-xl bg-secondary/20 border-border/50 h-11 focus-visible:ring-brand-caribbean"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Users className="w-4 h-4 text-brand-caribbean" />
                Players Needed
              </label>
              <Input 
                type="number" 
                min="1"
                value={broadcastForm.players_needed}
                onChange={e => setBroadcastForm({...broadcastForm, players_needed: e.target.value === '' ? '' : parseInt(e.target.value)})}
                className="rounded-xl bg-secondary/20 border-border/50 h-11 focus-visible:ring-brand-caribbean"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Clock className="w-4 h-4 text-brand-caribbean" />
                Start Time
              </label>
              <Input 
                type="time" 
                value={broadcastForm.start_time}
                onChange={e => setBroadcastForm({...broadcastForm, start_time: e.target.value})}
                className="rounded-xl bg-secondary/20 border-border/50 h-11 focus-visible:ring-brand-caribbean"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Clock className="w-4 h-4 text-brand-caribbean opacity-50" />
                End Time
              </label>
              <Input 
                type="time" 
                value={broadcastForm.end_time}
                onChange={e => setBroadcastForm({...broadcastForm, end_time: e.target.value})}
                className="rounded-xl bg-secondary/20 border-border/50 h-11 focus-visible:ring-brand-caribbean"
              />
            </div>
          </div>
          
          <div className="pt-6 mt-2 flex justify-end gap-3 border-t border-border/50">
            <Button type="button" variant="outline" className="rounded-xl px-5 border-border/60 hover:bg-secondary/50" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createBroadcastMutation.isPending} 
              className="rounded-xl px-6 bg-gradient-to-r from-brand-caribbean to-[#0f766e] text-white shadow-lg shadow-brand-caribbean/20 hover:opacity-90 transition-opacity font-bold"
            >
              {createBroadcastMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" />
                  Creating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Broadcast Match
                </span>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!broadcastToDelete} onClose={() => setBroadcastToDelete(null)} title="Delete Broadcast">
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Are you sure you want to delete this broadcast? This action cannot be undone and will permanently remove it from the community feed.
          </p>
          <div className="pt-4 flex justify-end gap-3 border-t border-border/50">
            <Button variant="outline" className="rounded-xl px-5 border-border/60 hover:bg-secondary/50" onClick={() => setBroadcastToDelete(null)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (broadcastToDelete) {
                  deleteBroadcastMutation.mutate(broadcastToDelete)
                }
              }}
              disabled={deleteBroadcastMutation.isPending} 
              className="rounded-xl px-6 bg-red-500 hover:bg-red-600 text-white shadow-lg transition-opacity font-bold"
            >
              {deleteBroadcastMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Chat Room Members Modal */}
      <Modal isOpen={isMembersModalOpen} onClose={() => setIsMembersModalOpen(false)} title="Chat Room Details">
        <div className="space-y-6 pt-2">
          {(() => {
            const activeChat = chats.find((c: any) => (c.id || c.room_id || c.roomId || c._id) === selectedChatId)
            const isHost = Boolean(activeChat && currentUser && String(activeChat.host_id) === String(currentUser.id))
            return (
              <>
                <div className="space-y-3 pb-4 border-b border-border/50">
                  <label className="text-sm font-semibold flex items-center gap-2 text-foreground">
                    <Settings className="w-4 h-4 text-blue-500" />
                    Update Room Name
                  </label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="New room name..." 
                        value={chatRoomNameForm}
                        onChange={(e) => setChatRoomNameForm(e.target.value)}
                        className="rounded-xl bg-secondary/20 border-border/50 h-11 focus-visible:ring-blue-500"
                      />
                      <Button 
                        onClick={() => {
                          if (chatRoomNameForm.trim() && selectedChatId) {
                            updateRoomNameMutation.mutate({ roomId: selectedChatId, name: chatRoomNameForm })
                          }
                        }}
                        disabled={updateRoomNameMutation.isPending || !chatRoomNameForm.trim()}
                        className="rounded-xl px-6 bg-blue-500 text-white shadow-md hover:bg-blue-600 font-bold"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                    <Users className="w-4 h-4 text-blue-500" />
                    Members
                  </h4>
                  {isChatMembersLoading ? (
                    <div className="flex justify-center py-4 text-blue-500"><span className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent" /></div>
                  ) : chatMembers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No members found.</p>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                      {chatMembers.map((member: any) => (
                        <div key={member.id} className="flex items-center justify-between p-3 bg-secondary/10 border border-border/50 rounded-xl">
                          <div>
                            <p className="font-semibold text-sm text-foreground">{member.name || `User ${member.id}`}</p>
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                          </div>
                          {isHost && String(currentUser?.id) !== String(member.id) && (
                            <Button 
                              size="sm"
                              variant="ghost"
                              onClick={() => selectedChatId && removeMemberMutation.mutate({ roomId: selectedChatId, userId: member.id })}
                              disabled={removeMemberMutation.isPending}
                              className="h-8 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-lg px-3 text-xs font-semibold"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )
          })()}
        </div>
      </Modal>
    </div>
  )
}

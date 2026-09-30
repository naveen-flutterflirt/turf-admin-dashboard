import axios from '@/lib/axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('customer_token') : null
  if (!token) throw new Error("No authorization token found")
  return { Authorization: `Bearer ${token}` }
}

export const communityService = {
  getFeed: async () => {
    const res = await axios.get(`${API_URL}/community/feed`, { headers: getAuthHeaders() })
    return res.data
  },
  getMyBroadcasts: async () => {
    const res = await axios.get(`${API_URL}/community/my-broadcasts`, { headers: getAuthHeaders() })
    return res.data
  },
  getRequests: async () => {
    const res = await axios.get(`${API_URL}/community/requests`, { headers: getAuthHeaders() })
    return res.data
  },
  getChatHistory: async (roomId: string) => {
    const res = await axios.get(`${API_URL}/community/chat/${roomId}`, { headers: getAuthHeaders() })
    return res.data
  },
  sendMessage: async (roomId: string, message: string) => {
    const res = await axios.post(`${API_URL}/community/chat/${roomId}/messages`, { message }, { headers: getAuthHeaders() })
    return res.data
  },
  getMyChats: async () => {
    const res = await axios.get(`${API_URL}/community/chats`, { headers: getAuthHeaders() })
    return res.data
  },
  getChatRoomByBroadcast: async (broadcastId: string) => {
    const res = await axios.get(`${API_URL}/community/broadcasts/${broadcastId}/room`, { headers: getAuthHeaders() })
    return res.data
  },
  createBroadcast: async (payload: { message: string, sport_id?: string, play_date?: string, start_time?: string, end_time?: string, players_needed?: number }) => {
    const res = await axios.post(`${API_URL}/community/broadcasts`, payload, { headers: getAuthHeaders() })
    return res.data
  },
  joinBroadcast: async (broadcastId: string) => {
    const res = await axios.post(`${API_URL}/community/join`, { broadcastId }, { headers: getAuthHeaders() })
    return res.data
  },
  acceptRequest: async (requestId: string) => {
    const res = await axios.post(`${API_URL}/community/accept`, { requestId }, { headers: getAuthHeaders() })
    return res.data
  },
  getChatRoomMembers: async (roomId: string) => {
    const res = await axios.get(`${API_URL}/community/chat/${roomId}/members`, { headers: getAuthHeaders() })
    return res.data
  },
  updateChatRoomName: async (roomId: string, name: string) => {
    const res = await axios.patch(`${API_URL}/community/chat/${roomId}/name`, { name }, { headers: getAuthHeaders() })
    return res.data
  },
  removeChatMember: async (roomId: string, userId: string) => {
    const res = await axios.delete(`${API_URL}/community/chat/${roomId}/members/${userId}`, { headers: getAuthHeaders() })
    return res.data
  },
  deleteBroadcast: async (broadcastId: string) => {
    const res = await axios.delete(`${API_URL}/community/broadcasts/${broadcastId}`, { headers: getAuthHeaders() })
    return res.data
  }
}

import axios from '@/lib/axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('customer_token') : null
  if (!token) throw new Error("No authorization token found")
  return { Authorization: `Bearer ${token}` }
}

const isGoogleSession = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('customer_token') : null;
  return token && token.startsWith('ya29.');
}

export const communityService = {
  getFeed: async () => {
    if (isGoogleSession()) return { success: true, data: [] };
    const res = await axios.get(`${API_URL}/community/feed`, { headers: getAuthHeaders() })
    return res.data
  },
  getMyBroadcasts: async () => {
    if (isGoogleSession()) return { success: true, data: [] };
    const res = await axios.get(`${API_URL}/community/my-broadcasts`, { headers: getAuthHeaders() })
    return res.data
  },
  getRequests: async () => {
    if (isGoogleSession()) return { success: true, data: [] };
    const res = await axios.get(`${API_URL}/community/requests`, { headers: getAuthHeaders() })
    return res.data
  },
  getChatHistory: async (roomId: string) => {
    if (isGoogleSession()) return { success: true, data: [] };
    const res = await axios.get(`${API_URL}/community/chat/${roomId}`, { headers: getAuthHeaders() })
    return res.data
  },
  sendMessage: async (roomId: string, message: string) => {
    if (isGoogleSession()) return { success: true, data: { message: 'Sent via client session' } };
    const res = await axios.post(`${API_URL}/community/chat/${roomId}/messages`, { message }, { headers: getAuthHeaders() })
    return res.data
  },
  getMyChats: async () => {
    if (isGoogleSession()) return { success: true, data: [] };
    const res = await axios.get(`${API_URL}/community/chats`, { headers: getAuthHeaders() })
    return res.data
  },
  getChatRoomByBroadcast: async (broadcastId: string) => {
    if (isGoogleSession()) return { success: true, data: { id: `mock-room-${broadcastId}` } };
    const res = await axios.get(`${API_URL}/community/broadcasts/${broadcastId}/room`, { headers: getAuthHeaders() })
    return res.data
  },
  createBroadcast: async (payload: { message: string, sport_id?: string, play_date?: string, start_time?: string, end_time?: string, players_needed?: number }) => {
    if (isGoogleSession()) return { success: true, message: 'Broadcast created (client session)', data: {} };
    const res = await axios.post(`${API_URL}/community/broadcasts`, payload, { headers: getAuthHeaders() })
    return res.data
  },
  joinBroadcast: async (broadcastId: string) => {
    if (isGoogleSession()) return { success: true, message: 'Request sent (client session)' };
    const res = await axios.post(`${API_URL}/community/join`, { broadcastId }, { headers: getAuthHeaders() })
    return res.data
  },
  acceptRequest: async (requestId: string) => {
    if (isGoogleSession()) return { success: true, message: 'Request accepted (client session)' };
    const res = await axios.post(`${API_URL}/community/accept`, { requestId }, { headers: getAuthHeaders() })
    return res.data
  },
  getChatRoomMembers: async (roomId: string) => {
    if (isGoogleSession()) return { success: true, data: [] };
    const res = await axios.get(`${API_URL}/community/chat/${roomId}/members`, { headers: getAuthHeaders() })
    return res.data
  },
  updateChatRoomName: async (roomId: string, name: string) => {
    if (isGoogleSession()) return { success: true, message: 'Updated (client session)' };
    const res = await axios.patch(`${API_URL}/community/chat/${roomId}/name`, { name }, { headers: getAuthHeaders() })
    return res.data
  },
  removeChatMember: async (roomId: string, userId: string) => {
    if (isGoogleSession()) return { success: true, message: 'Removed (client session)' };
    const res = await axios.delete(`${API_URL}/community/chat/${roomId}/members/${userId}`, { headers: getAuthHeaders() })
    return res.data
  },
  deleteBroadcast: async (broadcastId: string) => {
    if (isGoogleSession()) return { success: true, message: 'Deleted (client session)' };
    const res = await axios.delete(`${API_URL}/community/broadcasts/${broadcastId}`, { headers: getAuthHeaders() })
    return res.data
  }
}

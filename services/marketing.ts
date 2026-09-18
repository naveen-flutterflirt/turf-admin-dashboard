import axios from 'axios'

export interface BroadcastNotification {
  id: string
  turf_id: string
  title: string
  message: string
  radius_km: string
  users_targeted: number
  created_at: string
  turf_name: string
  targeted_names?: string
}

export interface SendBroadcastPayload {
  turf_id: string
  radius_km?: number
  title: string
  body: string
  customer_ids?: string[]
}

const API_BASE_URL = 'https://api.eatmeat.live' // Using localhost as requested

export const marketingService = {
  getBroadcasts: async (): Promise<BroadcastNotification[]> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
    if (!token) throw new Error("No authorization token found")

    const response = await axios.get(`${API_BASE_URL}/admin/turfs/notify-nearby`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (response.data && response.data.success) {
      return response.data.data || []
    }
    throw new Error(response.data?.message || "Failed to fetch broadcasts")
  },

  sendBroadcast: async (payload: SendBroadcastPayload): Promise<void> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
    if (!token) throw new Error("No authorization token found")

    const response = await axios.post(`${API_BASE_URL}/admin/turfs/notify-nearby`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || "Failed to send broadcast")
    }
  },

  deleteBroadcast: async (id: string): Promise<void> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
    if (!token) throw new Error("No authorization token found")

    const response = await axios.delete(`${API_BASE_URL}/admin/turfs/notify-nearby/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || "Failed to delete broadcast")
    }
  }
}

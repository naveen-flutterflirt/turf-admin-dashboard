import axios from 'axios'

export interface AppNotification {
  id?: string
  notification_id?: string
  title: string
  message: string
  time?: string
  created_at?: string
  isRead?: boolean
  is_read?: boolean
  type?: 'INFO' | 'WARNING' | 'SUCCESS' | string
}

export const notificationsService = {
  getNotifications: async (): Promise<AppNotification[]> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
    if (!token) throw new Error("No authorization token found")

    const response = await axios.get('https://turf-booking-1-mns7.onrender.com/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    if (response.data && response.data.success !== false) {
      return response.data.data || response.data || []
    }
    throw new Error(response.data?.message || "Failed to fetch notifications")
  },

  markAsRead: async (id: string): Promise<void> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
    if (!token) throw new Error("No authorization token found")

    const response = await axios.patch(`https://turf-booking-1-mns7.onrender.com/notifications/${id}/read`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (response.data && response.data.success === false) {
      throw new Error(response.data?.message || "Failed to mark as read")
    }
  },

  markAllAsRead: async (): Promise<void> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
    if (!token) throw new Error("No authorization token found")

    const response = await axios.patch('https://turf-booking-1-mns7.onrender.com/notifications/read-all', {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (response.data && response.data.success === false) {
      throw new Error(response.data?.message || "Failed to mark all as read")
    }
  },

  deleteNotification: async (id: string): Promise<void> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
    if (!token) throw new Error("No authorization token found")

    const response = await axios.delete(`https://turf-booking-1-mns7.onrender.com/notifications/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (response.data && response.data.success === false) {
      throw new Error(response.data?.message || "Failed to delete notification")
    }
  },

  clearAllNotifications: async (): Promise<void> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
    if (!token) throw new Error("No authorization token found")

    const response = await axios.delete('https://turf-booking-1-mns7.onrender.com/notifications/clear-all', {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (response.data && response.data.success === false) {
      throw new Error(response.data?.message || "Failed to clear all notifications")
    }
  }
}

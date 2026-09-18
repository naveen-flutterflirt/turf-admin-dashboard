import axios from 'axios'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  created_at: string
}

const API_URL = 'https://turf-booking-1-mns7.onrender.com'

export const usersService = {
  getUsers: async (): Promise<User[]> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null

    if (!token) throw new Error("No authorization token found")

    const response = await axios.get(`${API_URL}/admin/customers`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (response.data && response.data.success) {
      return response.data.data
    } else {
      throw new Error(response.data?.message || "Failed to fetch customers")
    }
  },

  deleteUser: async (id: string): Promise<void> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
    if (!token) throw new Error("No authorization token found")

    const response = await axios.delete(`${API_URL}/admin/customers/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || "Failed to delete customer")
    }
  }
}

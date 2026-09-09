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

    try {
      const response = await axios.delete(`${API_URL}/admin/customers/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      // If the API returns success: false explicitly, throw an error
      if (response.data && response.data.success === false) {
        throw new Error(response.data.message || "Failed to delete customer")
      }
      
      // Otherwise, any 2xx response (including 204 No Content with empty data) is considered successful
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // If it's a 404, the endpoint might be singular, but we assume REST plural standard here
      throw new Error(error.response?.data?.message || error.message || "Failed to delete customer")
    }
  }
}

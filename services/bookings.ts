import axios from 'axios'

export interface Booking {
  booking_id: string
  booking_date: string
  start_time: string
  end_time: string
  status: string
  total_price: string
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  turf_id: string
  turf_name: string
  owner_business_name: string
  customer_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
}

const API_URL = 'https://api.eatmeat.live'

export const bookingsService = {
  getBookings: async (): Promise<Booking[]> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
      if (!token) throw new Error("No authorization token found")

      const response = await axios.get(`${API_URL}/admin/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data && response.data.success && response.data.data) {
        return response.data.data
      }
      return []
    } catch (error) {
      console.error('Error fetching bookings:', error)
      throw error
    }
  }
}

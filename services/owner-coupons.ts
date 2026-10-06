import axios from '@/lib/axios'

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  total_bookings: number
}

export interface Coupon {
  id: string
  code: string
  discount_type: 'FLAT' | 'PERCENTAGE'
  discount_value: number
  max_discount_amount?: number
  min_booking_amount?: number
  start_date: string
  end_date: string
  usage_limit?: number
  user_usage_limit: number
  new_users_only: boolean
  owner_id?: string
  allowed_user_id?: string
  allowed_user_name?: string
  status: 'ACTIVE' | 'INACTIVE'
  created_at: string
  updated_at: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const ownerCouponService = {
  getCustomers: async (): Promise<Customer[]> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('owner_token') : null
    if (!token) throw new Error("No authorization token found")

    const response = await axios.get(`${API_URL}/owner/customers`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (response.data && response.data.success) {
      return response.data.data
    } else {
      throw new Error(response.data?.message || "Failed to fetch customers")
    }
  },

  getCoupons: async (): Promise<Coupon[]> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('owner_token') : null
    if (!token) throw new Error("No authorization token found")

    const response = await axios.get(`${API_URL}/owner/coupons`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (response.data && response.data.success) {
      return response.data.data
    } else {
      throw new Error(response.data?.message || "Failed to fetch coupons")
    }
  },

  createCoupon: async (couponData: Partial<Coupon>): Promise<Coupon> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('owner_token') : null
    if (!token) throw new Error("No authorization token found")

    try {
      const response = await axios.post(`${API_URL}/owner/coupons`, couponData, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data && response.data.success) {
        return response.data.data
      } else {
        throw new Error(response.data?.message || "Failed to create coupon")
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "Failed to create coupon")
    }
  },

  deleteCoupon: async (id: string): Promise<void> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('owner_token') : null
    if (!token) throw new Error("No authorization token found")

    try {
      const response = await axios.delete(`${API_URL}/owner/coupons/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || "Failed to delete coupon")
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "Failed to delete coupon")
    }
  }
}

import axios from '@/lib/axios'

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
  status: 'ACTIVE' | 'INACTIVE'
  created_at: string
  updated_at: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const couponService = {
  getCoupons: async (): Promise<Coupon[]> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null

    if (!token) throw new Error("No authorization token found")

    const response = await axios.get(`${API_URL}/coupons`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (response.data && response.data.success) {
      return response.data.coupons
    } else {
      throw new Error(response.data?.message || "Failed to fetch coupons")
    }
  },

  createCoupon: async (couponData: Partial<Coupon>): Promise<Coupon> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
    if (!token) throw new Error("No authorization token found")

    try {
      const response = await axios.post(`${API_URL}/coupons`, couponData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data && response.data.success) {
        return response.data.coupon
      } else {
        throw new Error(response.data?.message || "Failed to create coupon")
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "Failed to create coupon")
    }
  },

  // Customer Methods
  validateCoupon: async (code: string, turfId: string, subtotal: number): Promise<any> => {
    try {
      const response = await axios.post(`${API_URL}/coupons/validate`, {
        code,
        turf_id: turfId,
        subtotal
      })
      if (response.data && response.data.success) {
        return response.data
      }
      throw new Error(response.data?.message || "Failed to validate coupon")
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "Failed to validate coupon")
    }
  },

  getAvailableCoupons: async (turfId?: string): Promise<Coupon[]> => {
    try {
      const params = turfId ? { turf_id: turfId } : {}
      const response = await axios.get(`${API_URL}/coupons/available`, { params })
      if (response.data && response.data.success) {
        return response.data.coupons
      }
      throw new Error(response.data?.message || "Failed to fetch coupons")
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "Failed to fetch coupons")
    }
  }
}

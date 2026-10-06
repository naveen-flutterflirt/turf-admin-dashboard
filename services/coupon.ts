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
      const token = typeof window !== 'undefined' ? localStorage.getItem('customer_token') : null;
      if (token && token.startsWith('ya29.')) {
        // Mock fallback for client-side Google sessions
        if (code === 'WELCOME50') {
          const discount = Math.min(subtotal * 0.5, 200);
          return {
            success: true,
            code,
            discount_amount: discount,
            final_total: subtotal - discount
          };
        }
        if (code === 'FLAT100' && subtotal >= 500) {
          return {
            success: true,
            code,
            discount_amount: 100,
            final_total: subtotal - 100
          };
        }
        throw new Error("Invalid coupon code");
      }

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
      const token = typeof window !== 'undefined' ? localStorage.getItem('customer_token') : null;
      if (token && token.startsWith('ya29.')) {
        // Mock fallback for client-side Google sessions
        return [
          {
            id: 'mock-1',
            code: 'WELCOME50',
            discount_type: 'PERCENTAGE',
            discount_value: 50,
            max_discount_amount: 200,
            min_booking_amount: 0,
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 86400000 * 30).toISOString(),
            user_usage_limit: 1,
            new_users_only: true,
            status: 'ACTIVE',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'mock-2',
            code: 'FLAT100',
            discount_type: 'FLAT',
            discount_value: 100,
            min_booking_amount: 500,
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 86400000 * 30).toISOString(),
            user_usage_limit: 5,
            new_users_only: false,
            status: 'ACTIVE',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ] as Coupon[];
      }

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

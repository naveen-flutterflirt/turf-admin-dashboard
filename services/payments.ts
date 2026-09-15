import axios from 'axios'

export interface PaymentStats {
  total_revenue: number
  successful_payments: number
  total_transactions: number
}

export interface Payment {
  booking_id: string
  amount: string
  payment_status: string
  razorpay_order_id: string
  razorpay_payment_id: string | null
  payment_method: string | null
  payment_date: string
  turf_name: string
  owner_business_name: string
  owner_personal_name: string
  customer_name: string
  customer_email: string
}

export interface PaymentsResponse {
  stats: PaymentStats
  data: Payment[]
}

const API_URL = 'https://api.eatmeat.live'

export const paymentsService = {
  getPayments: async (): Promise<PaymentsResponse> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
      if (!token) throw new Error("No authorization token found")

      const response = await axios.get(`${API_URL}/admin/payments`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data && response.data.success) {
        return {
          stats: response.data.stats,
          data: response.data.data
        }
      }
      return { stats: { total_revenue: 0, successful_payments: 0, total_transactions: 0 }, data: [] }
    } catch (error) {
      console.error('Error fetching payments:', error)
      throw error
    }
  },

  processRefund: async (id: string): Promise<Payment> => {
    throw new Error("Refund functionality not supported by API yet")
  }
}

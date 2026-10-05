import axios from '@/lib/axios'

export interface DashboardRecentBooking {
  booking_id: string;
  booking_date: string;
  start_time: string;
  status: string;
  total_price: string;
  turf_name: string;
  sport_name: string;
  customer_name: string;
}

export interface DashboardMetrics {
  total_earnings: number;
  totalEarnings?: number;
  total_bookings: number;
  totalBookings?: number;
  total_turfs: number;
  totalTurfs?: number;
  occupancy_rate: number;
  occupancyRate?: number;
  recent_bookings: DashboardRecentBooking[];
  weekly_earnings: { label: string, value: number }[];
}

export interface AdminDashboardMetrics {
  totalCustomers: number;
  total_customers?: number;
  totalOwners: number;
  total_owners?: number;
  activeTurfs: number;
  active_turfs?: number;
  pendingTurfs: number;
  pending_turfs?: number;
  totalBookings: number;
  total_bookings?: number;
  todaysActivity: number;
  todays_activity?: number;
  totalRevenue: number;
  total_revenue?: number;
  successfulPayments: number;
  successful_payments?: number;
  recentBookings: any[];
  recent_bookings?: any[];
  recentTransactions: any[];
  recent_transactions?: any[];
}

export const dashboardService = {
  getAdminDashboard: async (): Promise<AdminDashboardMetrics> => {
    // Relying on baseURL and interceptors for Authorization token
    const response = await axios.get('/admin/dashboard')
    if (response.data && response.data.success) {
      return response.data.data
    }
    throw new Error(response.data?.message || "Failed to fetch admin dashboard")
  },

  getOwnerDashboard: async (): Promise<DashboardMetrics> => {
    const response = await axios.get('/owner/dashboard')
    if (response.data && response.data.success) {
      return response.data.data
    }
    throw new Error(response.data?.message || "Failed to fetch owner dashboard")
  }
}

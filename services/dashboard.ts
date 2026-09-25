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
  total_bookings: number;
  total_turfs: number;
  occupancy_rate: number;
  recent_bookings: DashboardRecentBooking[];
  weekly_earnings: { label: string, value: number }[];
}

export interface AdminDashboardMetrics {
  totalCustomers: number;
  totalOwners: number;
  activeTurfs: number;
  pendingTurfs: number;
  totalBookings: number;
  todaysActivity: number;
  totalRevenue: number;
  successfulPayments: number;
  recentBookings: any[];
  recentTransactions: any[];
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

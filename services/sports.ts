import axios from '@/lib/axios'

export interface TurfReference {
  id: string
  name: string
}

export interface SportStat {
  sport_name: string
  turf_count: string
  turfs: TurfReference[]
}

export const sportsService = {
  getSports: async (): Promise<SportStat[]> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
    if (!token) throw new Error("No authorization token found")

    const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + '/admin/sports-stats', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (response.data && response.data.success) {
      return response.data.data
    } else {
      throw new Error(response.data?.message || "Failed to fetch sports stats")
    }
  }
}

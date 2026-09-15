import axios from 'axios'

export interface Sport {
  id: string
  name: string
}

export interface Turf {
  id: string
  owner_id: string
  name: string
  description: string
  address: string
  city: string
  state: string
  pincode: string
  latitude: string
  longitude: string
  price_per_hour: string
  opening_time: string
  closing_time: string
  status: string
  created_at: string
  updated_at: string
  business_name: string
  is_open?: boolean
  image?: string
  images?: unknown[]
  sports: (Sport | string)[]
  amenities?: { id: string; name: string }[]
}

export const turfsService = {
  getTurfs: async (): Promise<Turf[]> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
    if (!token) throw new Error("No authorization token found")

    const response = await axios.get('https://api.eatmeat.live/admin/turfs', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (response.data && response.data.success) {
      return response.data.data
    } else {
      throw new Error(response.data?.message || "Failed to fetch turfs")
    }
  },

  approveTurf: async (id: string): Promise<void> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
    if (!token) throw new Error("No authorization token found")

    const response = await axios.patch(`https://api.eatmeat.live/admin/turfs/${id}/approve`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || "Failed to approve turf")
    }
  },

  rejectTurf: async (id: string): Promise<void> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
    if (!token) throw new Error("No authorization token found")

    const response = await axios.patch(`https://api.eatmeat.live/admin/turfs/${id}/reject`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || "Failed to reject turf")
    }
  },

  // Stub for edit/update until provided
  updateTurf: async (_id: string, _updates: Partial<Turf>): Promise<Turf> => {
    console.warn("Update API not yet implemented")
    await new Promise(resolve => setTimeout(resolve, 600))
    return {} as Turf
  },

  deleteTurf: async (id: string): Promise<void> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
    if (!token) throw new Error("No authorization token found")

    const response = await axios.delete(`https://api.eatmeat.live/admin/turfs/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || "Failed to delete turf")
    }
  }
}

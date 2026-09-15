import axios from 'axios'

export interface Owner {
  owner_id: string
  business_name: string
  owner_created_at: string
  user_id: string
  name: string
  email: string
  phone: string
  turf_count: string
}

export const ownersService = {
  getOwners: async (): Promise<Owner[]> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null

    if (!token) throw new Error("No authorization token found")

    const response = await axios.get('https://api.eatmeat.live/admin/owners', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    if (response.data && response.data.success) {
      return response.data.data
    } else {
      throw new Error(response.data.message || "Failed to fetch owners")
    }
  },

  deleteOwner: async (owner_id: string): Promise<void> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
    if (!token) throw new Error("No authorization token found")

    const response = await axios.delete(`https://api.eatmeat.live/admin/owners/${owner_id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || "Failed to delete owner")
    }
  }
}

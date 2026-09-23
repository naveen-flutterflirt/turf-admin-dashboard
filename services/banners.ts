import axios from '@/lib/axios'

export interface Banner {
  id?: string
  _id?: string
  promo_id?: string
  image_url: string
  status: string
  created_at: string
  updated_at: string
}

export interface BannersResponse {
  success: boolean
  data: Banner[]
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const bannersService = {
  getBanners: async (): Promise<Banner[]> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
      if (!token) throw new Error("No authorization token found")

      const response = await axios.get(`${API_URL}/admin/promos`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data && response.data.success) {
        return response.data.data
      }
      return []
    } catch (error) {
      console.error('Error fetching banners:', error)
      return []
    }
  },

  uploadBanner: async (payload: { image_url: string }): Promise<Banner> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
      if (!token) throw new Error("No authorization token found")

      const response = await axios.post(`${API_URL}/admin/promos`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.data && response.data.success) {
        return response.data.data || {}
      }
      throw new Error(response.data?.message || 'Failed to upload banner')
    } catch (error) {
      console.error('Error uploading banner:', error)
      throw error
    }
  },

  updateBannerStatus: async (id: string, status: string): Promise<boolean> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
      if (!token) throw new Error("No authorization token found")

      if (!id || id === 'undefined') {
        throw new Error("Cannot update status: Banner ID is undefined or missing!")
      }

      console.log(`Sending PATCH to: ${API_URL}/admin/promos/${id}/status with payload:`, { status })

      const response = await axios.patch(`${API_URL}/admin/promos/${id}/status`, { status }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      return response.data && response.data.success
    } catch (error) {
      console.error('Error updating banner status:', error)
      throw error
    }
  },

  deleteBanner: async (id: string): Promise<boolean> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
      if (!token) throw new Error("No authorization token found")

      const response = await axios.delete(`${API_URL}/admin/promos/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      return response.data && response.data.success
    } catch (error) {
      console.error('Error deleting banner:', error)
      throw error
    }
  }
}

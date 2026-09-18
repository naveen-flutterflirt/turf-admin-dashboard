import axios from 'axios'

export interface QueryType {
  id: string
  owner_id: string
  subject: string
  message: string
  admin_reply?: string
  status: string
  created_at: string
  updated_at: string
}

const API_URL = 'https://api.eatmeat.live'

export const queriesService = {
  getQueries: async (): Promise<QueryType[]> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null

    if (!token) throw new Error("No authorization token found")

    const response = await axios.get(`${API_URL}/admin/queries`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (response.data && response.data.success) {
      return response.data.data
    } else if (Array.isArray(response.data)) {
      return response.data // just in case it returns an array directly
    } else {
      throw new Error(response.data?.message || "Failed to fetch queries")
    }
  },

  replyQuery: async (id: string, admin_reply: string, status: string): Promise<QueryType> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
    if (!token) throw new Error("No authorization token found")

    try {
      const response = await axios.patch(`${API_URL}/admin/queries/${id}/reply`, {
        admin_reply,
        status
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data && response.data.success) {
        return response.data.data
      } else {
        throw new Error(response.data.message || "Failed to reply to query")
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "Failed to reply to query")
    }
  }
}

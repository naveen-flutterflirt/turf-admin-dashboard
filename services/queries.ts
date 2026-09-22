import axios from '@/lib/axios'

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

const API_URL = process.env.NEXT_PUBLIC_API_URL

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
       
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "Failed to reply to query")
    }
  },

  getOwnerQueries: async (): Promise<QueryType[]> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('owner_token') : null

    if (!token) throw new Error("No authorization token found")

    const response = await axios.get(`${API_URL}/owner/queries`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (response.data && response.data.success) {
      return response.data.data
    } else if (Array.isArray(response.data)) {
      return response.data
    } else {
      throw new Error(response.data?.message || "Failed to fetch queries")
    }
  },

  sendOwnerQuery: async (subject: string, message: string): Promise<QueryType> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('owner_token') : null
    if (!token) throw new Error("No authorization token found")

    try {
      const response = await axios.post(`${API_URL}/owner/queries`, {
        subject,
        message
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data && response.data.success) {
        return response.data.data
      } else {
        throw new Error(response.data.message || "Failed to submit query")
      }
       
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "Failed to submit query")
    }
  }
}

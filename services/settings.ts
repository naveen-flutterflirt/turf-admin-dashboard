import axios from '@/lib/axios'

export interface AppSettings {
  latest_android_version: string
  latest_ios_version: string
  force_update: boolean
  normal_update: boolean
  update_message: string
  play_store_url: string
  app_store_url: string
}

export const settingsService = {
  getSettings: async (): Promise<AppSettings> => {
    // The user provided GET http://api.eatmeat.live/customer/app-settings
    // Using relative URL leverages the securely configured baseURL
    const response = await axios.get('/customer/app-settings')
    if (response.data && response.data.success) {
      return response.data.data
    }
    throw new Error(response.data?.message || "Failed to fetch settings")
  },

  updateSettings: async (settings: AppSettings): Promise<AppSettings> => {
    // The user provided PUT http://api.eatmeat.live/admin/app-settings
    const response = await axios.put('/admin/app-settings', settings)
    
    // Sometimes PUT returns the updated object directly or wrapped in success/data
    if (response.data) {
      return response.data.data || settings
    }
    throw new Error(response.data?.message || "Failed to update settings")
  }
}

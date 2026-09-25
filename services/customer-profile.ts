export interface CustomerProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  created_at: string;
}

export interface CustomerProfileResponse {
  success: boolean;
  data?: CustomerProfileData;
  message?: string;
}

export interface UpdateProfileData {
  name: string;
  phone: string;
}

export const customerProfileService = {
  getProfile: async (): Promise<CustomerProfileResponse> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('customer_token') : null;
      if (!token) {
        return { success: false, message: 'Not authenticated' };
      }

      const response = await fetch('https://api.eatmeat.live/customer/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      let result: any;
      try {
        result = await response.json();
      } catch (parseError) {
        const text = await response.text();
        return {
          success: false,
          message: response.ok ? 'Unexpected response format' : (text || 'Failed to fetch profile'),
        };
      }
      
      if (!response.ok) {
        return {
          success: false,
          message: result?.message || result?.error || 'Failed to fetch profile',
        };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Network error or server is unreachable. Please try again later.'
      };
    }
  },

  updateProfile: async (data: UpdateProfileData): Promise<CustomerProfileResponse> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('customer_token') : null;
      if (!token) {
        return { success: false, message: 'Not authenticated' };
      }

      const response = await fetch('https://api.eatmeat.live/customer/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      let result: any;
      try {
        result = await response.json();
      } catch (parseError) {
        const text = await response.text();
        return {
          success: false,
          message: response.ok ? 'Unexpected response format' : (text || 'Failed to update profile'),
        };
      }
      
      if (!response.ok || !result.success) {
        return {
          success: false,
          message: result?.message || result?.error || 'Failed to update profile',
        };
      }

      return {
        success: true,
        message: result?.message || 'Profile updated successfully',
        data: result.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Network error or server is unreachable. Please try again later.'
      };
    }
  }
};

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

      // Fallback for Google Access Tokens (which start with 'ya29.')
      if (token.startsWith('ya29.')) {
        let name = 'Google User';
        let email = 'user@gmail.com';
        let phone = 'Not Provided';
        
        try {
          // Fetch directly from Google to guarantee correct data and heal any bad local state
          const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (googleResponse.ok) {
            const googleUser = await googleResponse.json();
            name = googleUser.name || name;
            email = googleUser.email || email;
            
            // Update local storage to heal any corrupted 'Google Email' state
            if (typeof window !== 'undefined') {
              localStorage.setItem('customer_user', JSON.stringify({ name, email }));
            }
          } else {
            // Fallback to local storage if network fails
            if (typeof window !== 'undefined') {
              const userStr = localStorage.getItem('customer_user');
              if (userStr) {
                const user = JSON.parse(userStr);
                name = user.name && user.name !== 'Google User' ? user.name : name;
                email = user.email && user.email !== 'Google Email' ? user.email : email;
                if (user.phone) phone = user.phone;
              }
            }
          }
          
          // Try to get phone from local storage even if Google fetch succeeds
          if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('customer_user');
            if (userStr) {
              const user = JSON.parse(userStr);
              if (user.phone) phone = user.phone;
            }
          }
        } catch (e) {
          // Silent fallback on error
        }
        
        return {
          success: true,
          data: {
            id: 'google-' + Date.now(),
            name: name,
            email: email,
            phone: phone,
            role: 'Customer',
            status: 'Active',
            created_at: new Date().toISOString()
          }
        };
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

      // Fallback for Google Access Tokens (which start with 'ya29.')
      if (token.startsWith('ya29.')) {
        let currentEmail = 'user@gmail.com'; // Default fallback
        if (typeof window !== 'undefined') {
          try {
            const userStr = localStorage.getItem('customer_user');
            const user = userStr ? JSON.parse(userStr) : {};
            if (user.email) currentEmail = user.email;
            user.name = data.name;
            user.phone = data.phone;
            localStorage.setItem('customer_user', JSON.stringify(user));
          } catch (e) {}
        }
        return {
          success: true,
          message: 'Profile updated successfully (client session)',
          data: {
            id: 'google-' + Date.now(),
            name: data.name,
            email: currentEmail,
            phone: data.phone,
            role: 'Customer',
            status: 'Active',
            created_at: new Date().toISOString()
          }
        };
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

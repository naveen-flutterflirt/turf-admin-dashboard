export interface CustomerSignupData {
  name: string
  email: string
  password: string
  phone: string
}

export interface CustomerSignupResponse {
  success: boolean
  message: string
  email?: string
}

export interface VerifyEmailData {
  email: string
  code: string
}

export interface VerifyEmailResponse {
  success: boolean
  message: string
}

export interface ResendVerificationData {
  email: string
}

export interface ResendVerificationResponse {
  success: boolean
  message: string
}

export interface CustomerLoginData {
  email: string
  password: string
}

export interface CustomerLoginResponse {
  success: boolean
  message?: string
  token?: string
  data?: any
}

export interface CustomerLogoutResponse {
  success: boolean
  message?: string
}

export const customerAuthService = {
  // Force rebuild comment for Next.js cache bypass
  signup: async (data: CustomerSignupData): Promise<CustomerSignupResponse> => {
    try {
      const response = await fetch('https://api.eatmeat.live/auth/customer/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      })

      let result: any;
      
      try {
        result = await response.json()
      } catch (parseError) {
        // If the backend returns HTML or text instead of JSON on error
        const text = await response.text()
        return {
          success: false,
          message: response.ok ? 'Unexpected response format' : (text || 'Failed to sign up'),
        }
      }
      
      if (!response.ok) {
        return {
          success: false,
          message: result?.message || result?.error || 'Failed to sign up',
        }
      }

      return {
        success: true,
        message: result?.message || 'Signed up successfully',
        ...result,
      }
    } catch (error: any) {
      // Intentionally suppressing console.error here because Next.js 14+ development server 
      // sometimes intercepts console logs and forces the red error overlay.
      return {
        success: false,
        message: 'Network error or server is unreachable. Please try again later.'
      }
    }
  },

  verifyEmail: async (data: VerifyEmailData): Promise<VerifyEmailResponse> => {
    try {
      const response = await fetch('https://api.eatmeat.live/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      })

      let result: any;
      try {
        result = await response.json()
      } catch (parseError) {
        const text = await response.text()
        return {
          success: false,
          message: response.ok ? 'Unexpected response format' : (text || 'Failed to verify email'),
        }
      }
      
      if (!response.ok) {
        return {
          success: false,
          message: result?.message || result?.error || 'Failed to verify email',
        }
      }

      return {
        success: true,
        message: result?.message || 'Email verified successfully',
        ...result,
      }
    } catch (error: any) {
      return {
        success: false,
        message: 'Network error or server is unreachable. Please try again later.'
      }
    }
  },

  resendVerification: async (data: ResendVerificationData): Promise<ResendVerificationResponse> => {
    try {
      const response = await fetch('https://api.eatmeat.live/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      })

      let result: any;
      try {
        result = await response.json()
      } catch (parseError) {
        const text = await response.text()
        return {
          success: false,
          message: response.ok ? 'Unexpected response format' : (text || 'Failed to resend code'),
        }
      }
      
      if (!response.ok) {
        return {
          success: false,
          message: result?.message || result?.error || 'Failed to resend code',
        }
      }

      return {
        success: true,
        message: result?.message || 'Verification code sent successfully',
        ...result,
      }
    } catch (error: any) {
      return {
        success: false,
        message: 'Network error or server is unreachable. Please try again later.'
      }
    }
  },

  login: async (data: CustomerLoginData): Promise<CustomerLoginResponse> => {
    try {
      const response = await fetch('https://api.eatmeat.live/auth/customer/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      })

      let result: any;
      try {
        result = await response.json()
      } catch (parseError) {
        const text = await response.text()
        return {
          success: false,
          message: response.ok ? 'Unexpected response format' : (text || 'Failed to login'),
        }
      }
      
      if (!response.ok || !result.success) {
        return {
          success: false,
          message: result?.message || result?.error || 'Failed to login',
        }
      }

      return {
        success: true,
        message: 'Login successful',
        token: result.token,
        data: result.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: 'Network error or server is unreachable. Please try again later.'
      }
    }
  },

  logout: async (): Promise<CustomerLogoutResponse> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('customer_token') : null;
      if (!token) return { success: true };

      const response = await fetch('https://api.eatmeat.live/auth/customer/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      // We clear local storage regardless of API success to ensure client is logged out
      if (typeof window !== 'undefined') {
        localStorage.removeItem('customer_token')
        localStorage.removeItem('customer_user')
      }

      return { success: true, message: 'Logged out successfully' }
    } catch (error: any) {
      // Force client logout even on network error
      if (typeof window !== 'undefined') {
        localStorage.removeItem('customer_token')
        localStorage.removeItem('customer_user')
      }
      return { success: true }
    }
  }
}

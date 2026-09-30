export interface TimeSlot {
  start_time: string;
  end_time: string;
}

export interface CreateBookingPayload {
  turf_id: string;
  sport_id: string;
  date: string;
  time_slots: TimeSlot[];
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface BookingResponse {
  success: boolean;
  message: string;
  data?: any;
}

export const customerBookingsService = {
  createBooking: async (payload: CreateBookingPayload): Promise<BookingResponse> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('customer_token') : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`https://api.eatmeat.live/customer/bookings`, { 
        method: 'POST', 
        headers,
        body: JSON.stringify(payload)
      });

      let result: any;
      try {
        result = await response.json();
      } catch (parseError) {
        const text = await response.text();
        return {
          success: false,
          message: response.ok ? 'Unexpected response format' : (text || 'Failed to create booking'),
        };
      }
      
      if (!response.ok || !result.success) {
        return {
          success: false,
          message: result?.message || result?.error || 'Failed to create booking',
        };
      }

      return {
        success: true,
        message: result.message || 'Booking created successfully',
        data: result.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Network error or server is unreachable. Please try again later.'
      };
    }
  },

  verifyPayment: async (payload: VerifyPaymentPayload): Promise<BookingResponse> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('customer_token') : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`https://api.eatmeat.live/customer/bookings/verify-payment`, { 
        method: 'POST', 
        headers,
        body: JSON.stringify(payload)
      });

      let result: any;
      try {
        result = await response.json();
      } catch (parseError) {
        return { success: false, message: 'Unexpected response format' };
      }
      
      if (!response.ok || !result.success) {
        return { success: false, message: result?.message || result?.error || 'Payment verification failed' };
      }

      return {
        success: true,
        message: result.message || 'Payment verified successfully',
        data: result.data,
      };
    } catch (error: any) {
      return { success: false, message: 'Network error or server is unreachable.' };
    }
  },

  getBookings: async (): Promise<BookingResponse> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('customer_token') : null;
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`https://api.eatmeat.live/customer/bookings`, { 
        method: 'GET', 
        headers 
      });

      let result: any;
      try {
        result = await response.json();
      } catch (parseError) {
        return { success: false, message: 'Unexpected response format' };
      }
      
      if (!response.ok || !result.success) {
        return { success: false, message: result?.message || result?.error || 'Failed to fetch bookings' };
      }

      return {
        success: true,
        message: 'Bookings fetched successfully',
        data: result.data,
      };
    } catch (error: any) {
      return { success: false, message: 'Network error or server is unreachable.' };
    }
  },

  cancelBooking: async (bookingId: string): Promise<BookingResponse> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('customer_token') : null;
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`https://api.eatmeat.live/customer/bookings/${bookingId}/cancel`, { 
        method: 'PATCH', 
        headers 
      });

      let result: any;
      try {
        result = await response.json();
      } catch (parseError) {
        return { success: false, message: 'Unexpected response format' };
      }
      
      if (!response.ok || !result.success) {
        return { success: false, message: result?.message || result?.error || 'Failed to cancel booking' };
      }

      return {
        success: true,
        message: result.message || 'Booking cancelled successfully',
        data: result.data,
      };
    } catch (error: any) {
      return { success: false, message: 'Network error or server is unreachable.' };
    }
  }
};

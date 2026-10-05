import { customerBookingsService } from "./customer-bookings"; // You might not need this if you just fetch

const API_BASE_URL = 'https://api.eatmeat.live'

export interface CreateFeedbackPayload {
  turf_id: string
  booking_id: string
  rating: number
  comment: string
}

export interface UpdateFeedbackPayload {
  rating: number
  comment: string
}

export const customerFeedbackService = {
  getFeedbacks: async (): Promise<{ success: boolean, message: string, data?: any }> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('customer_token') : null;
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      if (token && !token.startsWith('ya29.')) headers['Authorization'] = `Bearer ${token}`;

      // Mock for Google session
      if (token && token.startsWith('ya29.')) {
        return { success: true, message: 'Action simulated (client session)' };
      }

      const response = await fetch(`${API_BASE_URL}/customer/feedback`, {
        method: 'GET',
        headers
      });

      let result: any;
      try { result = await response.json(); } catch(e) {}
      
      if (!response.ok || (result && result.success === false)) {
        return { success: false, message: result?.message || result?.error || 'Failed to fetch feedbacks' };
      }

      return { success: true, message: result?.message || 'Feedbacks fetched', data: result?.data };
    } catch (error: any) {
      return { success: false, message: 'Network error or server is unreachable.' };
    }
  },
  createFeedback: async (payload: CreateFeedbackPayload): Promise<{ success: boolean, message: string, data?: any }> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('customer_token') : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      if (token && !token.startsWith('ya29.')) headers['Authorization'] = `Bearer ${token}`;

      // Mock for Google session
      if (token && token.startsWith('ya29.')) {
        return { success: true, message: 'Action simulated (client session)' };
      }

      const response = await fetch(`${API_BASE_URL}/customer/feedback`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      let result: any;
      try { result = await response.json(); } catch(e) {}
      
      if (!response.ok || (result && result.success === false)) {
        return { success: false, message: result?.message || result?.error || 'Failed to submit feedback' };
      }

      return { success: true, message: result?.message || 'Feedback submitted successfully', data: result?.data };
    } catch (error: any) {
      return { success: false, message: 'Network error or server is unreachable.' };
    }
  },

  updateFeedback: async (feedbackId: string, payload: UpdateFeedbackPayload): Promise<{ success: boolean, message: string, data?: any }> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('customer_token') : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      if (token && !token.startsWith('ya29.')) headers['Authorization'] = `Bearer ${token}`;

      // Mock for Google session
      if (token && token.startsWith('ya29.')) {
        return { success: true, message: 'Action simulated (client session)' };
      }

      const response = await fetch(`${API_BASE_URL}/customer/feedback/${feedbackId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });

      let result: any;
      try { result = await response.json(); } catch(e) {}
      
      if (!response.ok || (result && result.success === false)) {
        return { success: false, message: result?.message || result?.error || 'Failed to update feedback' };
      }

      return { success: true, message: result?.message || 'Feedback updated successfully', data: result?.data };
    } catch (error: any) {
      return { success: false, message: 'Network error or server is unreachable.' };
    }
  },

  deleteFeedback: async (feedbackId: string): Promise<{ success: boolean, message: string }> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('customer_token') : null;
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      if (token && !token.startsWith('ya29.')) headers['Authorization'] = `Bearer ${token}`;

      // Mock for Google session
      if (token && token.startsWith('ya29.')) {
        return { success: true, message: 'Action simulated (client session)' };
      }

      const response = await fetch(`${API_BASE_URL}/customer/feedback/${feedbackId}`, {
        method: 'DELETE',
        headers
      });

      let result: any;
      try { result = await response.json(); } catch(e) {}
      
      if (!response.ok || (result && result.success === false)) {
        return { success: false, message: result?.message || result?.error || 'Failed to delete feedback' };
      }

      return { success: true, message: result?.message || 'Feedback deleted successfully' };
    } catch (error: any) {
      return { success: false, message: 'Network error or server is unreachable.' };
    }
  }
}

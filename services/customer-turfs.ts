export interface Sport {
  id: string;
  name: string;
}

export interface TurfImage {
  id: string;
  image_url: string;
  s3_key: string | null;
  sort_order: number;
}

export interface TurfData {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: string;
  longitude: string;
  price_per_hour: string;
  opening_time: string;
  closing_time: string;
  status: string;
  is_open: boolean;
  is_featured: boolean;
  distance_km: string;
  average_rating: string;
  total_reviews: string;
  sports: Sport[];
  images: TurfImage[];
}

export interface GetTurfsParams {
  is_featured?: boolean;
  lat?: number;
  lng?: number;
  radius?: number;
  page?: number;
  limit?: number;
}

export interface CustomerTurfsResponse {
  success: boolean;
  data?: TurfData[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
  message?: string;
}

export const customerTurfsService = {
  getTurfs: async (params?: GetTurfsParams): Promise<CustomerTurfsResponse> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('customer_token') : null;
      // Note: If authentication is strictly required, keep this. If this API is public, we can remove it.
      // Based on previous requests, the user needs to be logged in to view the dashboard.
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Build Query String
      const urlParams = new URLSearchParams();
      if (params?.is_featured !== undefined) urlParams.append('is_featured', String(params.is_featured));
      if (params?.lat !== undefined) urlParams.append('lat', String(params.lat));
      if (params?.lng !== undefined) urlParams.append('lng', String(params.lng));
      if (params?.radius !== undefined) urlParams.append('radius', String(params.radius));
      if (params?.page !== undefined) urlParams.append('page', String(params.page));
      if (params?.limit !== undefined) urlParams.append('limit', String(params.limit));

      const queryString = urlParams.toString();
      const url = `https://api.eatmeat.live/customer/turfs${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, { method: 'GET', headers });

      let result: any;
      try {
        result = await response.json();
      } catch (parseError) {
        const text = await response.text();
        return {
          success: false,
          message: response.ok ? 'Unexpected response format' : (text || 'Failed to fetch turfs'),
        };
      }
      
      if (!response.ok || !result.success) {
        return {
          success: false,
          message: result?.message || result?.error || 'Failed to fetch turfs',
        };
      }

      return {
        success: true,
        data: result.data || [],
        meta: result.meta,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Network error or server is unreachable. Please try again later.'
      };
    }
  }
};

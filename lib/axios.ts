import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      let token = null;

      // Automatically attach the correct token based on the route
      if (path.startsWith('/admin')) {
        token = localStorage.getItem('admin_token');
      } else if (path.startsWith('/owner')) {
        token = localStorage.getItem('owner_token');
      } else {
        // Fallback: check which one exists if not in a specific route
        token = localStorage.getItem('owner_token') || localStorage.getItem('admin_token');
      }

      if (token) {
        if (config.headers) {
          // Use type assertion to avoid TS errors and runtime crashes on plain objects
          (config.headers as any).Authorization = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (path.startsWith('/admin')) {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          window.location.href = '/admin/login';
        } else if (path.startsWith('/owner')) {
          localStorage.removeItem('owner_token');
          localStorage.removeItem('owner_user');
          window.location.href = '/owner/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

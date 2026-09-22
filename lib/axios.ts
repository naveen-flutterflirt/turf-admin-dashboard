import axios from 'axios';

const axiosInstance = axios.create();

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

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add JWT token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle JWT expiration and errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized (token expired or invalid)
    if (error.response?.status === 401) {
      // Clear auth data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Determine correct login portal based on current route
      const pathname = window.location.pathname;
      const isAdminRoute = pathname.startsWith('/admin');
      const targetLogin = isAdminRoute ? '/admin/login' : '/login';

      // Redirect only if not already on the correct login page
      if (pathname !== targetLogin) {
        window.location.href = targetLogin;
      }
    }

    // Handle 403 Forbidden (insufficient permissions)
    if (error.response?.status === 403) {
      console.error('Access denied:', error.response.data.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;

import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Request interceptor: attach bearer token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rcr_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor: handle 401 unauthenticated
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('rcr_token');
      localStorage.removeItem('rcr_user');
      if (window.location.pathname !== '/login' && !window.location.pathname.startsWith('/admin/login')) {
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

import axios from 'axios';

// In production on Vercel, use VITE_API_URL or VITE_BACKEND_URL pointing to Render backend. In local dev, use relative /api with Vite proxy.
const rawBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || '';
const baseURL = rawBaseUrl 
  ? (rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl.replace(/\/$/, '')}/api`) 
  : '/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sws_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sws_token');
      localStorage.removeItem('sws_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;


import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://simnikah-api-production.up.railway.app';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token from localStorage for client requests
api.interceptors.request.use((config) => {
  try {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
    }
  } catch (e) {
    // ignore in SSR
  }
  return config;
});

export default api;

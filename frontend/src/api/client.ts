import axios from 'axios';
import { APP_CONFIG } from '@/config/app.config';

/**
 * Global Axios instance configured with base URL.
 * Interceptors can be added here for auth tokens or global error handling.
 */
export const apiClient = axios.create({
  baseURL: APP_CONFIG.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error handler could hook into a toast store here if needed
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

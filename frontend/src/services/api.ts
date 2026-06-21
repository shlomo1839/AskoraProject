import axios from 'axios';
import { AuthStorage } from './authStorage';

const API_URL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 *  runs before every outgoing HTTP request.
 * and it checks for a saved authentication token and, if found,
 * injects it into the Authorization header to authenticate the user.
 */
api.interceptors.request.use((config) => {
  const token = AuthStorage.getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**ss
 * Response Interceptor:
 * Passes successful responses through, but catches server errors
 * to extract a clean error message for the frontend to use.
 */
export interface ApiError extends Error {
  status?: number;
  code?: string;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'שגיאה בשרת';
    const apiError: ApiError = new Error(message);
    apiError.status = error.response?.status;
    apiError.code = error.response?.data?.code;
    throw apiError;
  }
);

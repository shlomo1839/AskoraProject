import axios from 'axios';
import { AuthStorage } from './authStorage';
import { cacheLogStore, type CacheLogEvent } from './cacheLogStore';

const API_URL = import.meta.env.VITE_API_URL || '';
const CACHE_EVENTS_HEADER = 'x-cache-events';

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

function ingestCacheEvents(headers: Record<string, unknown> | undefined): void {
  if (!headers) return;

  const raw =
    headers[CACHE_EVENTS_HEADER] ??
    headers['X-Cache-Events'] ??
    (typeof (headers as { get?: (name: string) => unknown }).get === 'function'
      ? (headers as { get: (name: string) => unknown }).get(CACHE_EVENTS_HEADER)
      : undefined);

  const headerValue = Array.isArray(raw) ? raw[0] : raw;
  if (typeof headerValue !== 'string' || !headerValue) return;

  try {
    const parsed = JSON.parse(headerValue) as Array<Omit<CacheLogEvent, 'at'>>;
    if (!Array.isArray(parsed) || parsed.length === 0) return;
    cacheLogStore.push(parsed);
  } catch {
    // Ignore malformed cache headers
  }
}

/**
 * Response Interceptor:
 * Surfaces cache events to the UI, and maps server errors to ApiError.
 */
export interface ApiError extends Error {
  status?: number;
  code?: string;
}

api.interceptors.response.use(
  (response) => {
    ingestCacheEvents(response.headers as Record<string, unknown>);
    return response;
  },
  (error) => {
    ingestCacheEvents(error.response?.headers as Record<string, unknown> | undefined);

    const message = error.response?.data?.message || 'שגיאה בשרת';
    const apiError: ApiError = new Error(message);
    apiError.status = error.response?.status;
    apiError.code = error.response?.data?.code;
    throw apiError;
  }
);

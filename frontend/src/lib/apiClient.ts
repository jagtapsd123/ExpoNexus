import { config } from '@/config/env';

/**
 * Centralized API client with retry logic, error handling, and loading state support.
 */

interface ApiRequestOptions extends RequestInit {
  /** Number of retries on failure (default: 2) */
  retries?: number;
  /** Delay between retries in ms (default: 1000) */
  retryDelay?: number;
  /** Timeout in ms (default: 15000) */
  timeout?: number;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const {
    retries = 2,
    retryDelay = 1000,
    timeout = 15000,
    headers,
    ...fetchOptions
  } = options;

  const url = `${config.apiBaseUrl}${endpoint}`;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add auth token if available
  const token = localStorage.getItem('amrut_auth_token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: { ...defaultHeaders, ...headers },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new ApiError(
          errorData?.message || `Request failed with status ${response.status}`,
          response.status,
          errorData
        );
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return undefined as T;
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError = error as Error;

      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        if (error.status === 403 && localStorage.getItem('amrut_auth_token')) {
          window.dispatchEvent(new CustomEvent('auth:session-expired'));
        }
        throw error;
      }

      if (attempt < retries) {
        if (!config.isProd) {
          console.warn(`API retry ${attempt + 1}/${retries} for ${endpoint}`);
        }
        await delay(retryDelay * (attempt + 1)); // Exponential backoff
      }
    }
  }

  clearTimeout(timeoutId);
  throw lastError || new Error('Request failed');
}

export const api = {
  get: <T>(endpoint: string, options?: ApiRequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),

  put: <T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),

  patch: <T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T>(endpoint: string, options?: ApiRequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};

import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '@/lib/apiClient';

interface UseApiQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook for GET requests with loading/error states.
 * When your Spring Boot backend is ready, replace mock data calls with this.
 *
 * Usage:
 *   const { data, isLoading, error } = useApiQuery<Exhibition[]>('/exhibitions');
 */
export function useApiQuery<T>(
  endpoint: string,
  options?: { enabled?: boolean; fallback?: T }
): UseApiQueryResult<T> {
  const [data, setData] = useState<T | null>(options?.fallback ?? null);
  const [isLoading, setIsLoading] = useState(options?.enabled !== false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.get<T>(endpoint);
      setData(result);
    } catch (err) {
      const message = err instanceof ApiError
        ? err.message
        : 'Something went wrong. Please try again.';
      setError(message);
      console.error(`API Error [${endpoint}]:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    if (options?.enabled === false) return;
    fetchData();
  }, [fetchData, options?.enabled]);

  return { data, isLoading, error, refetch: fetchData };
}

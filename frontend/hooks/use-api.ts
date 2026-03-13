/**
 * React hooks for API calls
 */

import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { ApiError } from '@/lib/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

/**
 * Hook for making API calls with loading and error states
 */
export function useApi<T>(
  apiCall: (...args: any[]) => Promise<T>,
  immediate = false
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const data = await apiCall(...args);
        setState({ data, loading: false, error: null });
        return data;
      } catch (error) {
        const apiError = error as ApiError;
        setState({ data: null, loading: false, error: apiError });
        return null;
      }
    },
    [apiCall]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  // Execute immediately if requested
  if (immediate && !state.data && !state.loading && !state.error) {
    execute();
  }

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Hook for making GET requests
 */
export function useGet<T>(endpoint: string, immediate = false) {
  return useApi<T>(
    () => api.get<T>(endpoint),
    immediate
  );
}

/**
 * Hook for making POST requests
 */
export function usePost<T, D = unknown>(endpoint: string) {
  return useApi<T>(
    (data: D) => api.post<T>(endpoint, data),
    false
  );
}

/**
 * Hook for making PUT requests
 */
export function usePut<T, D = unknown>(endpoint: string) {
  return useApi<T>(
    (data: D) => api.put<T>(endpoint, data),
    false
  );
}

/**
 * Hook for making DELETE requests
 */
export function useDelete<T>(endpoint: string) {
  return useApi<T>(
    () => api.delete<T>(endpoint),
    false
  );
}

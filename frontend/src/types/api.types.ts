import { AxiosError } from 'axios';

export interface ApiErrorResponse {
  message: string;
  status?: number;
  code?: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: ApiErrorResponse;
  status: number;
}

export const isApiError = (error: unknown): error is AxiosError<ApiErrorResponse> => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError
  );
};

export const getErrorMessage = (error: unknown, defaultMessage = 'An error occurred'): string => {
  if (isApiError(error)) {
    return error.response?.data?.message || error.message || defaultMessage;
  }
  return error instanceof Error ? error.message : defaultMessage;
};

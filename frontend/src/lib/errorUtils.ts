import { logger } from '../utils/logger';

/**
 * Error handling utilities for consistent error management across the application
 */

export interface AppError extends Error {
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
  isRetryable?: boolean;
  retryAfter?: number; // in milliseconds
}

/**
 * Options for retryable operations
 */
export interface RetryOptions {
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Initial delay before first retry in ms */
  initialDelay?: number;
  /** Maximum delay between retries in ms */
  maxDelay?: number;
  /** Whether to use exponential backoff */
  exponentialBackoff?: boolean;
  /** Factor to multiply delay by for exponential backoff */
  backoffFactor?: number;
  /** Callback to determine if an error is retryable */
  isRetryable?: (error: unknown) => boolean;
  /** Callback before each retry */
  onRetry?: (error: unknown, attempt: number, delay: number) => void;
}

/**
 * Default retry options
 */
const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  exponentialBackoff: true,
  backoffFactor: 2,
  isRetryable: (error) => {
    // By default, only retry network errors and 5xx server errors
    if (error instanceof Error) {
      const status = (error as AppError)?.status;
      return (
        error.message.includes('network') ||
        error.message.includes('Network Error') ||
        (status && status >= 500 && status < 600)
      );
    }
    return false;
  },
  onRetry: () => {},
};

/**
 * Creates a standardized error object
 */
export function createError(
  message: string,
  code?: string,
  status: number = 500,
  details?: Record<string, unknown>,
  isRetryable: boolean = false,
  retryAfter?: number
): AppError {
  const error = new Error(message) as AppError;
  error.code = code || 'UNKNOWN_ERROR';
  error.status = status;
  error.isRetryable = isRetryable;
  
  if (retryAfter) {
    error.retryAfter = retryAfter;
  }
  
  if (details) {
    error.details = details;
  }
  
  return error;
}

/**
 * Logs an error with context
 */
export function logError(
  error: unknown,
  context: string = 'Application',
  additionalInfo: Record<string, unknown> = {}
): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  const errorCode = (error as AppError)?.code || 'UNKNOWN_ERROR';
  const isRetryable = (error as AppError)?.isRetryable;
  
  logger.error(`[${context}] ${errorMessage}`, {
    error: {
      message: errorMessage,
      stack: errorStack,
      code: errorCode,
      isRetryable,
      ...(error && typeof error === 'object' ? error : {}),
      ...additionalInfo
    }
  });
}

/**
 * Handles API errors consistently
 */
export function handleApiError(
  error: unknown,
  context: string = 'API',
  options: {
    isRetryable?: boolean;
    retryAfter?: number;
  } = {}
): { error: AppError } {
  let appError: AppError;
  
  if (error instanceof Error) {
    appError = error as AppError;
    
    // Enhance error with retry information if provided
    if (options.isRetryable !== undefined) {
      appError.isRetryable = options.isRetryable;
    }
    
    if (options.retryAfter !== undefined) {
      appError.retryAfter = options.retryAfter;
    }
  } else {
    appError = createError(
      'An unexpected error occurred',
      'UNEXPECTED_ERROR',
      500,
      { originalError: error },
      options.isRetryable,
      options.retryAfter
    );
  }
  
  logError(appError, context);
  
  return { error: appError };
}

/**
 * Creates a user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (!error) return 'An unknown error occurred';
  
  if (typeof error === 'string') return error;
  
  if (error instanceof Error) {
    // Handle specific error codes with user-friendly messages
    const code = (error as AppError)?.code;
    
    switch (code) {
      case 'NETWORK_ERROR':
        return 'Unable to connect to the server. Please check your internet connection.';
      case 'UNAUTHORIZED':
        return 'You need to be logged in to perform this action.';
      case 'FORBIDDEN':
        return 'You do not have permission to perform this action.';
      case 'NOT_FOUND':
        return 'The requested resource was not found.';
      case 'VALIDATION_ERROR':
        return 'Validation failed. Please check your input and try again.';
      case 'RATE_LIMIT_EXCEEDED':
        return 'You are making too many requests. Please try again later.';
      case 'SERVICE_UNAVAILABLE':
        return 'The service is temporarily unavailable. Please try again later.';
      case 'TIMEOUT':
        return 'The request timed out. Please check your connection and try again.';
      default:
        return error.message || 'An unexpected error occurred';
    }
  }
  
  return 'An unexpected error occurred';
}

/**
 * Handles promise rejections and logs them
 */
export function handleRejection(
  reason: unknown,
  context: string = 'Unhandled Promise Rejection'
): void {
  logError(reason, context);
}

/**
 * Executes an async function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = DEFAULT_RETRY_OPTIONS.maxRetries,
    initialDelay = DEFAULT_RETRY_OPTIONS.initialDelay,
    maxDelay = DEFAULT_RETRY_OPTIONS.maxDelay,
    exponentialBackoff = DEFAULT_RETRY_OPTIONS.exponentialBackoff,
    backoffFactor = DEFAULT_RETRY_OPTIONS.backoffFactor,
    isRetryable = DEFAULT_RETRY_OPTIONS.isRetryable,
    onRetry = DEFAULT_RETRY_OPTIONS.onRetry,
  } = options;

  let lastError: unknown;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // If this is the last attempt or the error is not retryable, break the loop
      if (attempt >= maxRetries || !isRetryable(error)) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelay * Math.pow(backoffFactor, attempt),
        maxDelay
      );

      // Call onRetry callback
      onRetry(error, attempt + 1, delay);

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
      
      attempt++;
    }
  }

  // If we get here, all retries failed
  throw lastError;
}

/**
 * Creates a timeout promise that rejects after the specified time
 */
export function timeout<T>(
  promise: Promise<T>,
  ms: number,
  errorMessage: string = 'Request timed out'
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      const error = createError(errorMessage, 'TIMEOUT', 408, {}, true);
      reject(error);
    }, ms);

    promise
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

// Set up global error handlers
if (typeof window !== 'undefined') {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    handleRejection(event.reason, 'Unhandled Promise Rejection');
    // Prevent the default handler (which logs to console.error)
    event.preventDefault();
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    logError(event.error || event.message, 'Uncaught Error');
    // Prevent the default handler (which logs to console.error)
    event.preventDefault();
  });
}

/**
 * Get a user-friendly error message from an error object
 * @deprecated Use getUserFriendlyMessage instead
 */
export function getErrorMessage(error: unknown): string {
  return getUserFriendlyMessage(error);
}

export default {
  createError,
  logError,
  handleApiError,
  getUserFriendlyMessage,
  getErrorMessage,
  handleRejection,
  withRetry,
  timeout,
  DEFAULT_RETRY_OPTIONS,
};

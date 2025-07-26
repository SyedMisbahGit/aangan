import { logger } from '../utils/logger';

/**
 * Error handling utilities for consistent error management across the application
 */

export interface AppError extends Error {
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
}

/**
 * Creates a standardized error object
 */
export function createError(
  message: string,
  code?: string,
  status: number = 500,
  details?: Record<string, unknown>
): AppError {
  const error = new Error(message) as AppError;
  error.code = code || 'UNKNOWN_ERROR';
  error.status = status;
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
  
  logger.error(`[${context}] ${errorMessage}`, {
    error: {
      message: errorMessage,
      stack: errorStack,
      code: errorCode,
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
  context: string = 'API'
): { error: AppError } {
  let appError: AppError;
  
  if (error instanceof Error) {
    appError = error as AppError;
  } else {
    appError = createError(
      'An unexpected error occurred',
      'UNEXPECTED_ERROR',
      500,
      { originalError: error }
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
        return 'Please check your input and try again.';
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

// Set up global error handlers
if (typeof window !== 'undefined') {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    handleRejection(event.reason, 'Unhandled Promise Rejection');
  });
  
  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    const error = event.error || new Error(event.message || 'Unknown error');
    logError(error, 'Uncaught Error', {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });  
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
  handleRejection
};

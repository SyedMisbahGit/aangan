import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { getErrorMessage } from '@/lib/errorUtils';

interface ErrorHandlerOptions {
  /**
   * Whether to show a toast notification for the error
   * @default true
   */
  showToast?: boolean;
  /**
   * Custom error message to display
   */
  errorMessage?: string;
  /**
   * Whether to log the error to the console
   * @default true
   */
  logError?: boolean;
  /**
   * Whether to redirect to an error page
   */
  redirectTo?: string;
  /**
   * Additional context to include in error logs
   */
  context?: Record<string, unknown>;
}

/**
 * A custom hook for handling errors in a consistent way
 */
export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null);
  const [isHandling, setIsHandling] = useState(false);
  const navigate = useNavigate();

  /**
   * Handle an error with the specified options
   */
  const handleError = useCallback(
    (
      error: unknown,
      options: ErrorHandlerOptions = {}
    ): void => {
      const {
        showToast = true,
        errorMessage,
        logError = true,
        redirectTo,
        context = {},
      } = options;

      const errorObj = error instanceof Error ? error : new Error(String(error));
      const message = errorMessage || getErrorMessage(errorObj);
      
      setError(errorObj);
      setIsHandling(true);

      // Log the error
      if (logError) {
        logger.error(message, {
          error: errorObj,
          stack: errorObj.stack,
          ...context,
        });
      }

      // Show toast notification
      if (showToast) {
        toast.error(message);
      }

      // Redirect if specified
      if (redirectTo) {
        navigate(redirectTo, { replace: true });
      }

      return undefined;
    },
    [navigate]
  );

  /**
   * Reset the error state
   */
  const resetError = useCallback(() => {
    setError(null);
    setIsHandling(false);
  }, []);

  /**
   * Execute an async function and handle any errors that occur
   */
  const withErrorHandling = useCallback(
    async <T,>(
      fn: () => Promise<T>,
      options: ErrorHandlerOptions = {}
    ): Promise<T | undefined> => {
      try {
        return await fn();
      } catch (error) {
        handleError(error, options);
        return undefined;
      }
    },
    [handleError]
  );

  return {
    error,
    isHandling,
    handleError,
    resetError,
    withErrorHandling,
  };
}

/**
 * A higher-order component that provides error handling to a component
 */
export function withErrorHandler<P extends object>(
  Component: React.ComponentType<P & { onError?: (error: unknown) => void }>,
  options: ErrorHandlerOptions = {}
): React.FC<P> {
  return function WithErrorHandler(props: P) {
    const { handleError } = useErrorHandler();
    return <Component {...props} onError={handleError} />;
  };
}

export default useErrorHandler;

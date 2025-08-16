import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { renderHook, act, render, screen } from '@testing-library/react';
import { useErrorHandler, ErrorHandlerProvider } from '../useErrorHandler';
import { toast } from 'sonner';

// Mock the toast notification
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock the logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

// Mock the navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Test component that uses the error handler
const TestComponent: React.FC = () => {
  const { handleError, resetError, error, isHandling } = useErrorHandler();
  
  return (
    <div>
      <div data-testid="error-state">
        {error ? `Error: ${error.message}` : 'No error'}
      </div>
      <div data-testid="is-handling">
        {isHandling ? 'Handling error' : 'Not handling error'}
      </div>
      <button 
        onClick={() => handleError(new Error('Test error'))}
        data-testid="trigger-error"
      >
        Trigger Error
      </button>
      <button 
        onClick={resetError}
        data-testid="reset-error"
      >
        Reset Error
      </button>
    </div>
  );
};

describe('useErrorHandler', () => {
  // Wrapper component to provide the error handler context
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ErrorHandlerProvider>
      {children}
    </ErrorHandlerProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides initial context values', () => {
    const { result } = renderHook(() => useErrorHandler(), { wrapper });
    
    expect(result.current.error).toBeNull();
    expect(result.current.isHandling).toBe(false);
    expect(typeof result.current.handleError).toBe('function');
    expect(typeof result.current.resetError).toBe('function');
    expect(typeof result.current.withErrorHandling).toBe('function');
  });

  it('handles errors with default options', () => {
    const { result } = renderHook(() => useErrorHandler(), { wrapper });
    const testError = new Error('Test error');
    
    act(() => {
      result.current.handleError(testError);
    });
    
    expect(result.current.error).toBe(testError);
    expect(result.current.isHandling).toBe(true);
    expect(toast.error).toHaveBeenCalledWith('Test error');
  });

  it('handles errors with custom options', () => {
    const { result } = renderHook(() => useErrorHandler(), { wrapper });
    const testError = new Error('Test error');
    
    act(() => {
      result.current.handleError(testError, {
        showToast: false,
        logError: false,
        redirectTo: '/error',
      });
    });
    
    expect(result.current.error).toBe(testError);
    expect(toast.error).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/error', { replace: true });
  });

  it('resets error state', () => {
    const { result } = renderHook(() => useErrorHandler(), { wrapper });
    
    // First set an error
    act(() => {
      result.current.handleError(new Error('Test error'));
    });
    
    expect(result.current.error).not.toBeNull();
    
    // Then reset it
    act(() => {
      result.current.resetError();
    });
    
    expect(result.current.error).toBeNull();
    expect(result.current.isHandling).toBe(false);
  });

  it('handles errors with withErrorHandling', async () => {
    const { result } = renderHook(() => useErrorHandler(), { wrapper });
    const error = new Error('Async error');
    
    // Test with a failing async function
    const failingFn = vi.fn().mockRejectedValueOnce(error);
    
    await act(async () => {
      const result = await result.current.withErrorHandling(failingFn());
      expect(result).toBeUndefined();
    });
    
    expect(failingFn).toHaveBeenCalled();
    expect(result.current.error).toBe(error);
    expect(toast.error).toHaveBeenCalledWith('Async error');
  });

  it('works with the TestComponent', () => {
    render(<TestComponent />, { wrapper });
    
    // Initial state
    expect(screen.getByTestId('error-state')).toHaveTextContent('No error');
    expect(screen.getByTestId('is-handling')).toHaveTextContent('Not handling error');
    
    // Trigger an error
    act(() => {
      screen.getByTestId('trigger-error').click();
    });
    
    expect(screen.getByTestId('error-state')).toHaveTextContent('Error: Test error');
    expect(screen.getByTestId('is-handling')).toHaveTextContent('Handling error');
    
    // Reset the error
    act(() => {
      screen.getByTestId('reset-error').click();
    });
    
    expect(screen.getByTestId('error-state')).toHaveTextContent('No error');
    expect(screen.getByTestId('is-handling')).toHaveTextContent('Not handling error');
  });

  it('handles non-Error objects', () => {
    const { result } = renderHook(() => useErrorHandler(), { wrapper });
    
    act(() => {
      result.current.handleError('A string error');
    });
    
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('A string error');
  });

  it('handles null/undefined errors', () => {
    const { result } = renderHook(() => useErrorHandler(), { wrapper });
    
    act(() => {
      result.current.handleError(null);
    });
    
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('An unknown error occurred');
  });
});

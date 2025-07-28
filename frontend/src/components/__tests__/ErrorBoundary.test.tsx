import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';
import { Button } from '../ui/button';

// A component that throws an error
const ErrorComponent = () => {
  throw new Error('Test error');
};

// Define proper type for fallback component props
interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

describe('ErrorBoundary', () => {
  // Mock console.error to avoid error logs in test output
  const originalConsoleError = console.error;
  
  beforeAll(() => {
    // Mock console.error but don't show the error in test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterAll(() => {
    // Restore original console.error
    (console.error as jest.Mock).mockRestore();
  });
  
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Child component</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Child component')).toBeInTheDocument();
  });
  
  it('displays error message when a child component throws an error', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
  
  it('calls onReset when reset button is clicked', () => {
    const onReset = jest.fn();
    
    render(
      <ErrorBoundary onReset={onReset}>
        <ErrorComponent />
      </ErrorBoundary>
    );
    
    const resetButton = screen.getByRole('button', { name: /try again/i });
    resetButton.click();
    
    expect(onReset).toHaveBeenCalledTimes(1);
  });
  
  it('renders custom fallback component when provided', () => {
    const CustomFallback = ({ error, resetErrorBoundary }: FallbackProps) => (
      <div>
        <h2>Custom Error</h2>
        <p>{error.message}</p>
        <button onClick={resetErrorBoundary}>Retry</button>
      </div>
    );
    
    render(
      <ErrorBoundary FallbackComponent={CustomFallback}>
        <ErrorComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Custom Error')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });
});

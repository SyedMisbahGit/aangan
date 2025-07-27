import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';
import { Button } from '../ui/button';

// A component that throws an error
const ErrorComponent = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary', () => {
  // Mock console.error to avoid error logs in test output
  const originalConsoleError = console.error;
  
  beforeAll(() => {
    console.error = jest.fn();
  });
  
  afterAll(() => {
    console.error = originalConsoleError;
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
  
  it('displays custom fallback UI when provided', () => {
    const CustomFallback = ({ error, resetErrorBoundary }: any) => (
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

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { motion } from 'framer-motion';
import { LoadingWrapper } from '../shared/LoadingWrapper';

// Mock framer-motion for testing
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    motion: {
      ...(actual as any).motion,
      div: ({ 
        children, 
        className, 
        'data-testid': testId, 
        ...props 
      }: { 
        children: React.ReactNode; 
        className?: string; 
        'data-testid'?: string;
        [key: string]: any;
      }) => (
        <div 
          className={className} 
          data-testid={testId}
          data-props={JSON.stringify(props)}
        >
          {children}
        </div>
      ),
    },
  };
});

describe('LoadingWrapper Component', () => {
  const TestContent = () => <div data-testid="test-content">Test Content</div>;

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('renders children when not loading', () => {
    render(
      <LoadingWrapper isLoading={false}>
        <TestContent />
      </LoadingWrapper>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows loading overlay when loading', () => {
    render(
      <LoadingWrapper isLoading={true}>
        <TestContent />
      </LoadingWrapper>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('applies custom loading message', () => {
    const loadingMessage = 'Custom loading message';
    render(
      <LoadingWrapper isLoading={true} message={loadingMessage}>
        <TestContent />
      </LoadingWrapper>
    );

    expect(screen.getByText(loadingMessage)).toBeInTheDocument();
  });

  it('hides content when fullScreen is true', () => {
    render(
      <LoadingWrapper isLoading={true} fullScreen>
        <TestContent />
      </LoadingWrapper>
    );

    const content = screen.getByTestId('test-content');
    expect(content).toHaveStyle('filter: blur(2px)');
  });

  it('applies custom class names', () => {
    const wrapperClass = 'custom-wrapper';
    const overlayClass = 'custom-overlay';
    
    render(
      <LoadingWrapper 
        isLoading={true} 
        className={wrapperClass}
        overlayClassName={overlayClass}
      >
        <TestContent />
      </LoadingWrapper>
    );

    const wrapper = screen.getByRole('status').closest('div[class*="relative"]');
    expect(wrapper).toHaveClass(wrapperClass);
    
    const overlay = screen.getByRole('status');
    expect(overlay).toHaveClass(overlayClass);
  });

  it('renders custom loader when provided', () => {
    const CustomLoader = () => <div data-testid="custom-loader">Loading...</div>;
    
    render(
      <LoadingWrapper isLoading={true} customLoader={<CustomLoader />}>
        <TestContent />
      </LoadingWrapper>
    );

    expect(screen.getByTestId('custom-loader')).toBeInTheDocument();
  });

  it('disables spinner when disableSpinner is true', () => {
    render(
      <LoadingWrapper isLoading={true} disableSpinner>
        <TestContent />
      </LoadingWrapper>
    );

    const spinner = screen.getByRole('status').querySelector('svg');
    expect(spinner).not.toBeInTheDocument();
  });

  it('applies blur effect to content when blurContent is true', () => {
    render(
      <LoadingWrapper isLoading={true} blurContent>
        <TestContent />
      </LoadingWrapper>
    );

    const content = screen.getByTestId('test-content');
    expect(content).toHaveStyle('filter: blur(2px)');
  });

  it('applies custom duration for animations', () => {
    const duration = 0.5;
    
    render(
      <LoadingWrapper isLoading={true} duration={duration}>
        <TestContent />
      </LoadingWrapper>
    );

    const motionDiv = screen.getByRole('status').firstChild as HTMLElement;
    const props = JSON.parse(motionDiv.dataset.props || '{}');
    
    // Check if the duration is applied to the animation
    expect(props.animate.transition.duration).toBe(duration);
  });
});

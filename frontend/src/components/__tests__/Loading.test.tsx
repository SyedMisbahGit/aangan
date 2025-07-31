import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Loading } from '../ui/loading';

describe('Loading Component', () => {
  // Clean up after each test
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<Loading />);
    
    // Check that the loading spinner is rendered
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-busy', 'true');
    
    // Default text should be "Loading..."
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom text', () => {
    const customText = 'Please wait...';
    render(<Loading text={customText} />);
    
    expect(screen.getByText(customText)).toBeInTheDocument();
  });

  it('hides text when showText is false', () => {
    render(<Loading showText={false} />);
    
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const customClass = 'custom-loading-class';
    render(<Loading className={customClass} />);
    
    const container = screen.getByRole('status').parentElement;
    expect(container).toHaveClass(customClass);
  });

  it('renders with different variants', () => {
    const variants = ['default', 'primary', 'secondary', 'destructive', 'success'] as const;
    
    variants.forEach((variant) => {
      render(<Loading variant={variant} key={variant} />);
      const spinner = screen.getByRole('status').firstChild;
      expect(spinner).toHaveClass(`text-${variant === 'default' ? 'foreground' : variant}`);
      cleanup();
    });
  });

  it('renders with different sizes', () => {
    const sizes = ['sm', 'default', 'lg', 'xl', '2xl'] as const;
    const sizeMap = {
      'sm': 'h-4 w-4',
      'default': 'h-5 w-5',
      'lg': 'h-6 w-6',
      'xl': 'h-8 w-8',
      '2xl': 'h-10 w-10',
    };
    
    sizes.forEach((size) => {
      render(<Loading size={size} key={size} />);
      const spinner = screen.getByRole('status').firstChild;
      expect(spinner).toHaveClass(sizeMap[size]);
      cleanup();
    });
  });

  it('renders full screen when fullScreen is true', () => {
    render(<Loading fullScreen />);
    
    const container = screen.getByRole('status').parentElement;
    expect(container).toHaveClass('fixed inset-0');
    expect(container).toHaveClass('flex items-center justify-center');
  });

  it('applies custom text class name', () => {
    const textClass = 'custom-text-class';
    render(<Loading textClassName={textClass} />);
    
    const textElement = screen.getByText('Loading...');
    expect(textElement).toHaveClass(textClass);
  });

  it('renders with custom loader component', () => {
    const customLoader = <div data-testid="custom-loader">Custom Loader</div>;
    render(<Loading customLoader={customLoader} />);
    
    expect(screen.getByTestId('custom-loader')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('disables spinner when disableSpinner is true', () => {
    render(<Loading disableSpinner />);
    
    const spinner = screen.getByRole('status').firstChild;
    expect(spinner).toHaveClass('hidden');
  });
});

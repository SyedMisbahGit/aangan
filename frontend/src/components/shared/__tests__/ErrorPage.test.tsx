import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '../../test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import ErrorPage from '../ErrorPage';

type MockStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  clear: () => void;
  removeItem: (key: string) => void;
  key: (index: number) => string | null;
  length: number;
};

// Mock window.matchMedia which is not available in JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock the fetch API
const mockFetch = vi.fn();
const originalFetch = global.fetch;
global.fetch = mockFetch as typeof global.fetch;

// Create a proper mock for localStorage
let store: Record<string, string> = {};

const localStorageMock: MockStorage = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, value: string) => {
    store[key] = String(value);
  },
  clear: () => {
    store = {};
  },
  removeItem: (key: string) => {
    delete store[key];
  },
  key: (index: number) => Object.keys(store)[index] || null,
  length: 0,
};

// Spy on the methods
const getItemSpy = vi.spyOn(localStorageMock, 'getItem');
const setItemSpy = vi.spyOn(localStorageMock, 'setItem');
const clearSpy = vi.spyOn(localStorageMock, 'clear');
const removeItemSpy = vi.spyOn(localStorageMock, 'removeItem');
const keySpy = vi.spyOn(localStorageMock, 'key');

// Override the global localStorage with our mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  configurable: true,
  enumerable: true,
  writable: false,
});

// Clean up after tests
afterEach(() => {
  // Clear all mocks
  vi.clearAllMocks();
  store = {};
  
  // Reset fetch mock
  mockFetch.mockReset();
  
  // Reset localStorage mock
  localStorageMock.clear();
  
  // Restore original fetch
  global.fetch = originalFetch;
});

describe('ErrorPage', () => {
  const mockError = {
    name: 'Test Error',
    message: 'This is a test error',
    stack: 'Error: Test error\n    at test (test.js:1:1)',
  };
  
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Setup fetch mock
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    
    // Setup localStorage mock
    getItemSpy.mockImplementation((key: string) => {
      if (key === 'sessionId') return 'test-session-id';
      return null;
    });
  });

  it('renders error message when message is provided', () => {
    render(<ErrorPage message={mockError.message} />);
    
    // Check for main error elements
    const heading = screen.getByRole('heading', { 
      name: /the winds have paused/i,
      level: 1
    });
    
    expect(heading).toBeInTheDocument();
    expect(screen.getByText(mockError.message)).toBeInTheDocument();
    
    // Check for action buttons
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send feedback/i })).toBeInTheDocument();
  });

  it('calls onRetry when Try Again button is clicked', async () => {
    const handleRetry = vi.fn();
    const user = userEvent.setup();
    
    render(<ErrorPage message={mockError.message} onRetry={handleRetry} />);
    
    const retryButton = screen.getByRole('button', { name: /try again/i });
    await user.click(retryButton);
    
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
  
  it('navigates home when Return Home button is clicked', async () => {
    const user = userEvent.setup();
    const mockHref = vi.fn();
    
    // Mock window.location
    const originalLocation = window.location;
    delete (window as any).location;
    window.location = { ...originalLocation, href: mockHref } as any;
    
    render(<ErrorPage message={mockError.message} showHome={true} />);
    
    const homeButton = screen.getByRole('button', { name: /return home/i });
    await user.click(homeButton);
    
    // Check if navigation occurred
    expect(mockHref).toHaveBeenCalledWith('/');
    
    // Restore original location
    window.location = originalLocation;
  });

  it('shows feedback form when Send Feedback button is clicked', async () => {
    const user = userEvent.setup();
    render(<ErrorPage message={mockError.message} />);
    
    const feedbackButton = screen.getByRole('button', { name: /send feedback/i });
    await user.click(feedbackButton);
    
    // Check if feedback form is shown
    const textbox = screen.getByRole('textbox', { 
      name: /describe what you were doing/i 
    });
    
    expect(textbox).toBeInTheDocument();
    expect(screen.getByRole('button', { 
      name: /submit report/i 
    })).toBeInTheDocument();
    
    // Test form submission
    await user.type(textbox, 'Test feedback');
    
    const submitButton = screen.getByRole('button', { name: /submit report/i });
    await user.click(submitButton);
    
    // Check if feedback was submitted
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/logs/feedback',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });
    
    // Check if success message is shown
    expect(await screen.findByText(/thank you for your feedback/i)).toBeInTheDocument();
  });

  it('handles error object as message', () => {
    const errorObj = new Error('Error object message');
    render(<ErrorPage message={errorObj} />);
    
    expect(screen.getByText('Error object message')).toBeInTheDocument();
  });
  
  it('displays error details when provided', () => {
    render(<ErrorPage 
      message={mockError.message} 
      errorDetails="Additional error details" 
    />);
    
    const detailsButton = screen.getByText(/technical details/i);
    expect(detailsButton).toBeInTheDocument();
  });
  
  it('applies custom className when provided', () => {
    const { container } = render(
      <ErrorPage message={mockError.message} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
  
  it('shows loading state when sending feedback', async () => {
    const user = userEvent.setup();
    render(<ErrorPage message={mockError.message} />);
    
    // Open feedback form
    const feedbackButton = screen.getByRole('button', { name: /send feedback/i });
    await user.click(feedbackButton);
    
    // Type feedback
    const textbox = screen.getByRole('textbox');
    await user.type(textbox, 'Test feedback');
    
    // Mock a slow response
    let resolveFetch: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    mockFetch.mockReturnValueOnce(promise);
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit report/i });
    await user.click(submitButton);
    
    // Check if loading state is shown
    expect(screen.getByText(/sending.../i)).toBeInTheDocument();
    
    // Resolve the promise
    resolveFetch!({ ok: true });
    await waitFor(() => {
      expect(screen.queryByText(/sending.../i)).not.toBeInTheDocument();
    });
  });
});

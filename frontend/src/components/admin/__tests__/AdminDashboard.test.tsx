import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminDashboard } from '../AdminDashboard';
import axios from 'axios';
import { AnalyticsResponse, ZoneStat } from '../../../types/analytics';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the entire react-query module
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: vi.fn().mockImplementation(({ queryKey }) => {
      // Handle different query keys
      if (queryKey.includes('analytics')) {
        return {
          data: mockAnalytics,
          isLoading: false,
          isError: false,
          error: null,
          refetch: vi.fn(),
        };
      }
      if (queryKey.includes('zones')) {
        return {
          data: mockZones,
          isLoading: false,
          isError: false,
          error: null,
          refetch: vi.fn(),
        };
      }
      return {
        data: null,
        isLoading: false,
        isError: true,
        error: new Error('Unknown query key'),
        refetch: vi.fn(),
      };
    }),
  };
});

// Mock axios
vi.mock('axios');
const mockedAxios = axios as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  // Add other methods as needed
};

// Mock data
const mockAnalytics: AnalyticsResponse = {
  total: 150,
  byEmotion: {
    happy: 50,
    sad: 30,
    excited: 40,
    angry: 20,
    neutral: 10,
  },
  byZone: {
    'campus-center': 70,
    library: 50,
    'student-union': 30,
  },
  recentActivity: [
    {
      id: '1',
      content: 'This is a test whisper...',
      emotion: 'happy',
      zone: 'campus-center',
      created_at: '2025-08-03T12:00:00Z',
    },
  ],
};

const mockZones: ZoneStat[] = [
  { zone: 'campus-center', whisper_count: 70, activity_level: 'high' },
  { zone: 'library', whisper_count: 50, activity_level: 'medium' },
  { zone: 'student-union', whisper_count: 30, activity_level: 'low' },
];

// Create a test-utils file to wrap components with providers
const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return {
    ...render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>),
    queryClient,
  };
};

describe('AdminDashboard', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn((key: string) => {
        if (key === 'admin_jwt') return 'test-jwt-token';
        return null;
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0,
    };
    
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    // Mock axios responses
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/api/analytics/whispers')) {
        return Promise.resolve({ data: mockAnalytics });
      }
      if (url.includes('/api/analytics/zones')) {
        return Promise.resolve({ data: mockZones });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  it('renders loading state initially', () => {
    render(<AdminDashboard />);
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('renders dashboard with data', async () => {
    // Mock the API responses
    const mockAnalytics: AnalyticsResponse = {
      total: 100,
      byEmotion: {
        happy: 50,
        neutral: 30,
        sad: 20
      },
      byZone: {
        'campus-center': 40,
        'library': 35,
        'cafeteria': 25
      },
      recentActivity: [
        { 
          id: '1', 
          content: 'Test whisper 1', 
          created_at: new Date().toISOString(),
          emotion: 'happy',
          zone: 'campus-center'
        },
        { 
          id: '2', 
          content: 'Test whisper 2', 
          created_at: new Date().toISOString(),
          emotion: 'neutral',
          zone: 'library'
        },
      ],
    };
    
    const mockZones: ZoneStat[] = [
      { zone: 'campus-center', whisper_count: 40, activity_level: 'high' },
      { zone: 'library', whisper_count: 35, activity_level: 'medium' },
      { zone: 'cafeteria', whisper_count: 25, activity_level: 'low' },
    ];
    
    // Mock the two API calls the component makes
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('whispers')) {
        return Promise.resolve({ data: mockAnalytics });
      } else if (url.includes('zones')) {
        return Promise.resolve({ data: mockZones });
      }
      return Promise.reject(new Error('Unexpected API call'));
    });
    
    await act(async () => {
      renderWithProviders(<AdminDashboard />);
    });
    
    // Wait for data to be loaded
    await waitFor(() => {
      expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
    });
    
    // Check if the data is displayed
    expect(screen.getByText('100')).toBeInTheDocument(); // Total whispers
    expect(screen.getByText('50')).toBeInTheDocument(); // happy emotion count
    expect(screen.getByText('campus-center')).toBeInTheDocument();
    expect(screen.getByText('library')).toBeInTheDocument();
    expect(screen.getByText('Test whisper 1')).toBeInTheDocument();
  });

  it('renders loading state initially', async () => {
    // Mock the API call to return a promise that never resolves
    const promise = new Promise(() => {});
    mockedAxios.get.mockReturnValue(promise);
    
    await act(async () => {
      renderWithProviders(<AdminDashboard />);
    });
    
    // Check if loading state is shown
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    
    // Cleanup
    await act(async () => {
      jest.runAllTimers();
    });
  });

  it('handles API errors gracefully', async () => {
    // Mock a failed API call
    mockedAxios.get.mockRejectedValueOnce({
      response: { status: 500, data: { message: 'Server error' } },
      config: { url: '/api/analytics/whispers' },
      isAxiosError: true,
      toJSON: () => ({}),
      name: 'AxiosError',
      message: 'Request failed with status code 500'
    });
    
    await act(async () => {
      renderWithProviders(<AdminDashboard />);
    });
    
    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch analytics data. Please try again.')).toBeInTheDocument();
    });
    
    // Check if retry button is shown
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    
    // Test retry functionality
    mockedAxios.get.mockClear();
    mockedAxios.get.mockResolvedValueOnce({ 
      data: { 
        total: 0, 
        byEmotion: {}, 
        byZone: {}, 
        recentActivity: [] 
      } 
    });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Try Again'));
    });
    
    // Should make new API calls on retry
    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
  });

  it('displays error when not authenticated', async () => {
    // Clear the JWT token
    window.localStorage.clear();
    
    render(<AdminDashboard />);
    
    // Check if the component doesn't render when not authenticated
    await waitFor(() => {
      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
    });
    
    // The component should still be in loading state as it won't receive data
    // due to missing authentication
    expect(screen.queryByText('Total Whispers')).not.toBeInTheDocument();
  });
});

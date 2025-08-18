import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FlaggedContent } from '../FlaggedContent.new';
import { ModerationErrorBoundary } from '../ModerationErrorBoundary';

// Mock the API calls
jest.mock('../../../services/moderation.service', () => ({
  getFlaggedContent: jest.fn(),
  reviewFlaggedContent: jest.fn(),
}));

import * as moderationService from '../../../services/moderation.service';

// Create a test query client
const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries for tests
      },
    },
  });
};

const renderWithProviders = (ui: React.ReactElement) => {
  const testQueryClient = createTestQueryClient();
  return {
    ...render(
      <QueryClientProvider client={testQueryClient}>
        <ModerationErrorBoundary>
          {ui}
        </ModerationErrorBoundary>
      </QueryClientProvider>
    ),
    testQueryClient,
  };
};

describe('FlaggedContent', () => {
  const mockFlaggedContent = {
    data: [
      {
        id: 'flag-1',
        content_id: 'content-1',
        content_type: 'whisper',
        reason: 'Inappropriate content',
        status: 'pending',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        content: {
          id: 'content-1',
          text: 'This is a flagged whisper',
          author: {
            id: 'user-1',
            username: 'testuser',
          },
        },
      },
    ],
    total: 1,
    page: 1,
    limit: 10,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementation
    (moderationService.getFlaggedContent as jest.Mock).mockResolvedValue(mockFlaggedContent);
    (moderationService.reviewFlaggedContent as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Review submitted successfully',
      data: { ...mockFlaggedContent.data[0], status: 'resolved' },
    });
  });

  it('renders loading state initially', () => {
    renderWithProviders(<FlaggedContent />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays flagged content after loading', async () => {
    renderWithProviders(<FlaggedContent />);
    
    await waitFor(() => {
      expect(screen.getByText('Flagged Content')).toBeInTheDocument();
      expect(screen.getByText('This is a flagged whisper')).toBeInTheDocument();
      expect(screen.getByText('Inappropriate content')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });
  });

  it('shows error message when content fails to load', async () => {
    const errorMessage = 'Failed to load flagged content';
    (moderationService.getFlaggedContent as jest.Mock).mockRejectedValue(new Error(errorMessage));
    
    renderWithProviders(<FlaggedContent />);
    
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
      expect(screen.getByText(/retry/i)).toBeInTheDocument();
    });
  });

  it('opens review modal when action is clicked', async () => {
    renderWithProviders(<FlaggedContent />);
    
    await waitFor(() => {
      expect(screen.getByText('This is a flagged whisper')).toBeInTheDocument();
    });

    // Click the action button (ellipsis)
    fireEvent.click(screen.getAllByRole('button', { name: /more/i })[0]);
    
    // Click the Approve action
    fireEvent.click(screen.getByText('Approve'));
    
    // Verify the modal is shown
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to approve this content?')).toBeInTheDocument();
  });

  it('submits review when confirmed', async () => {
    renderWithProviders(<FlaggedContent />);
    
    await waitFor(() => {
      expect(screen.getByText('This is a flagged whisper')).toBeInTheDocument();
    });

    // Open action menu and click Approve
    fireEvent.click(screen.getAllByRole('button', { name: /more/i })[0]);
    fireEvent.click(screen.getByText('Approve'));
    
    // Add a note and submit
    const noteInput = screen.getByPlaceholderText('Add a note (optional)');
    fireEvent.change(noteInput, { target: { value: 'Looks good' } });
    fireEvent.click(screen.getByText('Confirm'));
    
    // Verify the API was called with correct parameters
    await waitFor(() => {
      expect(moderationService.reviewFlaggedContent).toHaveBeenCalledWith('flag-1', {
        action: 'approve',
        note: 'Looks good',
      });
    });
  });

  it('handles pagination', async () => {
    const { testQueryClient } = renderWithProviders(<FlaggedContent />);
    
    await waitFor(() => {
      expect(screen.getByText('This is a flagged whisper')).toBeInTheDocument();
    });
    
    // Mock the second page response
    const secondPageData = {
      data: [
        {
          id: 'flag-2',
          content_id: 'content-2',
          content_type: 'comment',
          reason: 'Spam',
          status: 'pending',
          created_at: '2023-01-02T00:00:00Z',
          updated_at: '2023-01-02T00:00:00Z',
          content: {
            id: 'content-2',
            text: 'This is another flagged item',
            author: {
              id: 'user-2',
              username: 'anotheruser',
            },
          },
        },
      ],
      total: 2,
      page: 2,
      limit: 10,
    };
    
    (moderationService.getFlaggedContent as jest.Mock).mockResolvedValueOnce(secondPageData);
    
    // Click next page
    fireEvent.click(screen.getByTitle('2'));
    
    await waitFor(() => {
      expect(moderationService.getFlaggedContent).toHaveBeenCalledWith({
        status: 'pending',
        page: 2,
        limit: 10,
      });
      
      // Verify the new data is displayed
      expect(screen.getByText('This is another flagged item')).toBeInTheDocument();
    });
  });

  it('filters content by status', async () => {
    renderWithProviders(<FlaggedContent />);
    
    await waitFor(() => {
      expect(screen.getByText('This is a flagged whisper')).toBeInTheDocument();
    });
    
    // Change the status filter to 'resolved'
    const statusFilter = screen.getByLabelText('Status');
    fireEvent.mouseDown(statusFilter);
    fireEvent.click(screen.getByText('Resolved'));
    
    // Mock the resolved items response
    const resolvedData = {
      ...mockFlaggedContent,
      data: [
        {
          ...mockFlaggedContent.data[0],
          id: 'flag-3',
          status: 'resolved',
          content: {
            ...mockFlaggedContent.data[0].content,
            text: 'This is a resolved item',
          },
        },
      ],
    };
    
    (moderationService.getFlaggedContent as jest.Mock).mockResolvedValueOnce(resolvedData);
    
    // Click the filter button
    fireEvent.click(screen.getByText('Apply Filters'));
    
    await waitFor(() => {
      expect(moderationService.getFlaggedContent).toHaveBeenCalledWith({
        status: 'resolved',
        page: 1,
        limit: 10,
      });
      
      // Verify the filtered data is displayed
      expect(screen.getByText('This is a resolved item')).toBeInTheDocument();
    });
  });
});

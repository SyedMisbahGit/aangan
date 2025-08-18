import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ContentPreview } from '../ContentPreview';
import * as contentService from '../../../../services/content.service';
import * as userService from '../../../../services/user.service';

// Mock the services
jest.mock('../../../../services/content.service');
jest.mock('../../../../services/user.service');

const mockWhisperContent = {
  id: 'whisper-1',
  text: 'This is a test whisper content that is longer than the max length',
  is_anonymous: false,
  likes_count: 10,
  comments_count: 5,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  author: {
    id: 'user-1',
    username: 'testuser',
    avatar_url: 'https://example.com/avatar.jpg'
  }
};

const mockCommentContent = {
  id: 'comment-1',
  text: 'This is a test comment',
  whisper_id: 'whisper-1',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  author: {
    id: 'user-1',
    username: 'testuser'
  }
};

const mockUserContent = {
  id: 'user-1',
  username: 'testuser',
  email: 'test@example.com',
  bio: 'Test bio',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  avatar_url: 'https://example.com/avatar.jpg'
};

describe('ContentPreview', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(
      <ContentPreview 
        contentId="whisper-1" 
        contentType="whisper" 
      />
    );
    
    expect(screen.getByTestId('content-skeleton')).toBeInTheDocument();
  });

  it('displays whisper content correctly', async () => {
    (contentService.getContentById as jest.Mock).mockResolvedValue(mockWhisperContent);
    
    render(
      <ContentPreview 
        contentId="whisper-1" 
        contentType="whisper" 
        maxLength={20}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('This is a test whisper...')).toBeInTheDocument();
      expect(screen.getByText('Show more')).toBeInTheDocument();
      expect(screen.getByText('10')).toHaveAttribute('aria-label', 'like');
      expect(screen.getByText('5')).toHaveAttribute('aria-label', 'comment');
    });
  });

  it('displays comment content correctly', async () => {
    (contentService.getContentById as jest.Mock).mockResolvedValue(mockCommentContent);
    
    render(
      <ContentPreview 
        contentId="comment-1" 
        contentType="comment" 
      />
    );

    await waitFor(() => {
      expect(screen.getByText('This is a test comment')).toBeInTheDocument();
      expect(screen.getByText(/in response to whisper/i)).toBeInTheDocument();
    });
  });

  it('displays user content correctly', async () => {
    (userService.getUserById as jest.Mock).mockResolvedValue(mockUserContent);
    
    render(
      <ContentPreview 
        contentId="user-1" 
        contentType="user" 
      />
    );

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('Test bio')).toBeInTheDocument();
      expect(screen.getByAltText('testuser')).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });
  });

  it('handles error state', async () => {
    const errorMessage = 'Failed to load content';
    (contentService.getContentById as jest.Mock).mockRejectedValue(new Error(errorMessage));
    
    render(
      <ContentPreview 
        contentId="whisper-1" 
        contentType="whisper" 
      />
    );

    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });
  });

  it('toggles show more/less for long content', async () => {
    (contentService.getContentById as jest.Mock).mockResolvedValue({
      ...mockWhisperContent,
      text: 'This is a very long whisper content that should be truncated and have a show more button.'
    });
    
    render(
      <ContentPreview 
        contentId="whisper-1" 
        contentType="whisper"
        maxLength={20}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('This is a very long...')).toBeInTheDocument();
      const showMoreButton = screen.getByText('Show more');
      expect(showMoreButton).toBeInTheDocument();
      
      // Click show more
      showMoreButton.click();
      
      expect(screen.getByText('This is a very long whisper content that should be truncated and have a show more button.')).toBeInTheDocument();
      expect(screen.getByText('Show less')).toBeInTheDocument();
    });
  });

  it('does not fetch when contentId is not provided', () => {
    render(
      <ContentPreview 
        contentId="" 
        contentType="whisper" 
      />
    );
    
    expect(contentService.getContentById).not.toHaveBeenCalled();
    expect(userService.getUserById).not.toHaveBeenCalled();
  });
});

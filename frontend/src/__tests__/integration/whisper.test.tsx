import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Home } from '../../pages/Home';
import * as whispersApi from '../../api/whispers';
import { CreateWhisper } from '../../pages/CreateWhisper';
import { ViewWhisper } from '../../pages/ViewWhisper';

// Mock the API functions
jest.mock('../../api/whispers', () => ({
  createWhisper: jest.fn().mockResolvedValue({
    id: '1',
    content: 'Test whisper content',
    isAnonymous: true,
    userId: '1',
    createdAt: new Date().toISOString(),
  }),
  getWhisper: jest.fn().mockResolvedValue({
    id: '1',
    content: 'Test whisper content',
    isAnonymous: true,
    userId: '1',
    user: { username: 'testuser' },
    createdAt: new Date().toISOString(),
  }),
  getWhispers: jest.fn().mockResolvedValue([
    {
      id: '1',
      content: 'Test whisper 1',
      isAnonymous: true,
      userId: '1',
      user: { username: 'testuser' },
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      content: 'Test whisper 2',
      isAnonymous: false,
      userId: '2',
      user: { username: 'anotheruser' },
      createdAt: new Date().toISOString(),
    },
  ]),
  likeWhisper: jest.fn().mockResolvedValue({ success: true }),
  unlikeWhisper: jest.fn().mockResolvedValue({ success: true }),
  addComment: jest.fn().mockResolvedValue({
    id: '1',
    content: 'Test comment',
    userId: '1',
    user: { username: 'testuser' },
    createdAt: new Date().toISOString(),
  }),
}));

// Mock the auth context
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', username: 'testuser', email: 'test@example.com' },
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
    signUp: jest.fn(),
  }),
}));

describe('Whisper Flow', () => {
  let queryClient: QueryClient;
  
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    
    // Clear all mocks and localStorage before each test
    jest.clearAllMocks();
    window.localStorage.clear();
  });
  
  const renderWithRouter = (initialRoute = '/') => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialRoute]}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateWhisper />} />
            <Route path="/whisper/:id" element={<ViewWhisper />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };
  
  it('should display a list of whispers on the home page', async () => {
    renderWithRouter('/');
    
    // Wait for whispers to load
    await waitFor(() => {
      expect(screen.getByText('Test whisper 1')).toBeInTheDocument();
      expect(screen.getByText('Test whisper 2')).toBeInTheDocument();
    });
    
    // Check if the anonymous whisper shows 'Anonymous' as the author
    const whisper1 = screen.getByText('Test whisper 1').closest('article');
    expect(within(whisper1!).getByText('Anonymous')).toBeInTheDocument();
    
    // Check if the non-anonymous whisper shows the username
    const whisper2 = screen.getByText('Test whisper 2').closest('article');
    expect(within(whisper2!).getByText('@anotheruser')).toBeInTheDocument();
  });
  
  it('should allow creating a new whisper', async () => {
    renderWithRouter('/create');
    
    // Fill in the whisper form
    const contentInput = screen.getByLabelText(/what's on your mind/i);
    const anonymousCheckbox = screen.getByLabelText(/post anonymously/i);
    const submitButton = screen.getByRole('button', { name: /post whisper/i });
    
    await userEvent.type(contentInput, 'This is a test whisper');
    await userEvent.click(anonymousCheckbox);
    
    // Submit the form
    await userEvent.click(submitButton);
    
    // Check if the createWhisper API was called with the correct data
    expect(whispersApi.createWhisper).toHaveBeenCalledWith({
      content: 'This is a test whisper',
      isAnonymous: true,
    });
    
    // Should redirect to home after successful submission
    await waitFor(() => {
      expect(screen.getByText('Your whisper has been posted!')).toBeInTheDocument();
    });
  });
  
  it('should allow viewing a whisper and its comments', async () => {
    renderWithRouter('/whisper/1');
    
    // Wait for the whisper to load
    await waitFor(() => {
      expect(screen.getByText('Test whisper content')).toBeInTheDocument();
    });
    
    // Check if the whisper content is displayed
    expect(screen.getByText('Posted by Anonymous')).toBeInTheDocument();
    
    // Check if the comment form is present
    expect(screen.getByPlaceholderText('Add a comment...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /comment/i })).toBeInTheDocument();
    
    // Check if like button is present
    expect(screen.getByRole('button', { name: /like/i })).toBeInTheDocument();
  });
  
  it('should allow liking a whisper', async () => {
    renderWithRouter('/whisper/1');
    
    // Wait for the whisper to load
    await waitFor(() => {
      expect(screen.getByText('Test whisper content')).toBeInTheDocument();
    });
    
    // Click the like button
    const likeButton = screen.getByRole('button', { name: /like/i });
    await userEvent.click(likeButton);
    
    // Check if the like API was called
    expect(whispersApi.likeWhisper).toHaveBeenCalledWith('1');
    
    // Check if the button text changes to 'Unlike'
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /unlike/i })).toBeInTheDocument();
    });
  });
  
  it('should allow adding a comment to a whisper', async () => {
    renderWithRouter('/whisper/1');
    
    // Wait for the whisper to load
    await waitFor(() => {
      expect(screen.getByText('Test whisper content')).toBeInTheDocument();
    });
    
    // Fill in the comment form
    const commentInput = screen.getByPlaceholderText('Add a comment...');
    const submitButton = screen.getByRole('button', { name: /comment/i });
    
    await userEvent.type(commentInput, 'This is a test comment');
    await userEvent.click(submitButton);
    
    // Check if the addComment API was called with the correct data
    expect(whispersApi.addComment).toHaveBeenCalledWith('1', 'This is a test comment');
    
    // The comment input should be cleared after submission
    await waitFor(() => {
      expect(commentInput).toHaveValue('');
    });
  });
});

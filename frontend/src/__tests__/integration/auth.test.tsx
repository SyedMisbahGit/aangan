import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from '../../pages/Login';
import Whispers from '../../pages/HomeFeed';

// Mock the API module
const mockLogin = jest.fn().mockResolvedValue({
  user: { id: '1', username: 'testuser', email: 'test@example.com' },
  token: 'test-token',
});

const mockRegister = jest.fn().mockResolvedValue({
  user: { id: '1', username: 'testuser', email: 'test@example.com' },
  token: 'test-token',
});

const mockGetCurrentUser = jest.fn().mockResolvedValue({
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
});

jest.mock('../../api/auth', () => ({
  __esModule: true,
  login: mockLogin,
  register: mockRegister,
  getCurrentUser: mockGetCurrentUser,
}));

describe('Authentication Flow', () => {
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
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Whispers />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };
  
  it('should allow a user to login', async () => {
    renderWithRouter('/login');
    
    // Fill in the login form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password');
    
    // Submit the form
    await userEvent.click(submitButton);
    
    // Check if the login API was called with the correct data
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password');
    
    // Wait for the navigation to complete
    await waitFor(() => {
      // Update this selector to match actual content in your HomeFeed component
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
    
    // Check if token is stored in localStorage
    expect(localStorage.getItem('token')).toBe('test-token');
  });
  
  it('should show validation errors for invalid login form', async () => {
    renderWithRouter('/login');
    
    const submitButton = screen.getByRole('button', { name: /log in/i });
    
    // Submit the form without filling in any fields
    await userEvent.click(submitButton);
    
    // Check for validation errors
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    
    // The login API should not have been called
    expect(mockLogin).not.toHaveBeenCalled();
  });
  
  it('should allow a user to sign up', async () => {
    renderWithRouter('/signup');
    
    // Fill in the signup form
    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    
    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(confirmPasswordInput, 'password123');
    
    // Submit the form
    await userEvent.click(submitButton);
    
    // Check if the register API was called with the correct data
    expect(mockRegister).toHaveBeenCalledWith(
      'testuser',
      'test@example.com',
      'password123'
    );
    
    // Wait for the navigation to complete
    await waitFor(() => {
      // Update this selector to match actual content in your HomeFeed component
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
    
    // Check if token is stored in localStorage
    expect(localStorage.getItem('token')).toBe('test-token');
  });
  
  it('should show password mismatch error', async () => {
    renderWithRouter('/signup');
    
    // Fill in the signup form with mismatched passwords
    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    
    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(confirmPasswordInput, 'differentpassword');
    
    // Submit the form
    await userEvent.click(submitButton);
    
    // Check for password mismatch error
    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
    
    // The register API should not have been called
    expect(mockRegister).not.toHaveBeenCalled();
  });
  
  it('should redirect to home if user is already authenticated', async () => {
    // Set a token in localStorage to simulate an authenticated user
    localStorage.setItem('token', 'existing-token');
    
    // Mock the getCurrentUser function to return a user
    mockGetCurrentUser.mockResolvedValueOnce({
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
    });
    
    renderWithRouter('/login');
    
    // The app should redirect to the home page
    await waitFor(() => {
      // Update this selector to match actual content in your HomeFeed component
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
    
    // The login form should not be visible
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
  });
});

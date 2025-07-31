import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../../test-utils/testing-library-utils';
import LoginForm from './LoginForm';
import { login } from '../authSlice';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { API_BASE_URL } from '../../../../app/config';

// Mock the login action
jest.mock('../authSlice', () => ({
  ...jest.requireActual('../authSlice'),
  login: jest.fn((credentials) => ({
    type: 'auth/login/pending',
    payload: credentials,
  })),
}));

// Create MSW server for API mocking
const server = setupServer(
  rest.post(`${API_BASE_URL}/auth/login`, (req, res, ctx) => {
    return res(
      ctx.json({
        user: { id: '1', email: 'test@example.com', username: 'testuser' },
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      })
    );
  })
);

// Enable API mocking before tests
beforeAll(() => server.listen());

// Reset any runtime request handlers we may add during the tests
afterEach(() => {
  server.resetHandlers();
  jest.clearAllMocks();
});

// Clean up after all tests are done
afterAll(() => server.close());

describe('LoginForm', () => {
  const mockOnSuccess = jest.fn();
  const mockOnForgotPassword = jest.fn();
  
  beforeEach(() => {
    render(
      <LoginForm 
        onSuccess={mockOnSuccess} 
        onForgotPassword={mockOnForgotPassword} 
      />
    );
  });
  
  it('renders the login form', () => {
    // Check form elements
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /forgot password/i })).toBeInTheDocument();
  });
  
  it('validates form inputs', async () => {
    // Submit empty form
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);
    
    // Check for validation errors
    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(await screen.findByText('Password is required')).toBeInTheDocument();
    
    // Test invalid email
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);
    
    expect(await screen.findByText('Please enter a valid email')).toBeInTheDocument();
    
    // Test short password
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);
    
    expect(await screen.findByText('Password must be at least 6 characters')).toBeInTheDocument();
  });
  
  it('submits the form with valid data', async () => {
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check that the login action was called with the right data
    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
  
  it('calls onSuccess after successful login', async () => {
    // Mock a successful login response
    server.use(
      rest.post(`${API_BASE_URL}/auth/login`, (req, res, ctx) => {
        return res(
          ctx.json({
            user: { id: '1', email: 'test@example.com', username: 'testuser' },
            accessToken: 'test-access-token',
            refreshToken: 'test-refresh-token',
          })
        );
      })
    );
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check that onSuccess was called
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
  
  it('shows an error message on login failure', async () => {
    // Mock a failed login response
    server.use(
      rest.post(`${API_BASE_URL}/auth/login`, (req, res, ctx) => {
        return res(
          ctx.status(401),
          ctx.json({
            message: 'Invalid credentials',
          })
        );
      })
    );
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check that the error message is displayed
    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
  });
  
  it('toggles password visibility', () => {
    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });
    
    // Password should be hidden by default
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click to show password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Click to hide password again
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
  
  it('calls onForgotPassword when Forgot Password is clicked', () => {
    const forgotPasswordButton = screen.getByRole('button', { name: /forgot password/i });
    fireEvent.click(forgotPasswordButton);
    
    expect(mockOnForgotPassword).toHaveBeenCalled();
  });
  
  it('shows loading state while submitting', async () => {
    // Mock a slow API response
    server.use(
      rest.post(`${API_BASE_URL}/auth/login`, async (req, res, ctx) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return res(
          ctx.json({
            user: { id: '1', email: 'test@example.com', username: 'testuser' },
            accessToken: 'test-access-token',
            refreshToken: 'test-refresh-token',
          })
        );
      })
    );
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);
    
    // Check that the button is in loading state
    expect(submitButton).toHaveAttribute('aria-busy', 'true');
    expect(submitButton).toBeDisabled();
    
    // Wait for the form submission to complete
    await waitFor(() => {
      expect(submitButton).not.toHaveAttribute('aria-busy', 'true');
    });
  });
  
  it('handles network errors gracefully', async () => {
    // Mock a network error
    server.use(
      rest.post(`${API_BASE_URL}/auth/login`, (req, res) => {
        return res.networkError('Failed to connect');
      })
    );
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check that an error message is displayed
    expect(await screen.findByText(/network error/i)).toBeInTheDocument();
  });
});

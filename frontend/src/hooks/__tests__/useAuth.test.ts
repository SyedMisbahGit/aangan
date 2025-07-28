import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../useAuth';

// Mock the API functions
jest.mock('../../api/auth', () => ({
  login: jest.fn().mockResolvedValue({
    user: { id: '1', username: 'testuser', email: 'test@example.com' },
    token: 'test-token',
  }),
  register: jest.fn().mockResolvedValue({
    user: { id: '1', username: 'testuser', email: 'test@example.com' },
    token: 'test-token',
  }),
  logout: jest.fn().mockResolvedValue({}),
  getCurrentUser: jest.fn().mockResolvedValue({
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
  }),
}));

describe('useAuth', () => {
  let queryClient: QueryClient;
  
  beforeEach(() => {
    queryClient = new QueryClient();
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Clear localStorage
    window.localStorage.clear();
  });
  
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
  
  it('should initially have no user and not be loading', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
  
  it('should login a user', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });
    
    // Call login
    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });
    
    // Wait for state updates
    await waitForNextUpdate();
    
    // Check if user is set
    expect(result.current.user).toEqual({
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
    });
    
    // Check if token is stored in localStorage
    expect(localStorage.getItem('token')).toBe('test-token');
  });
  
  it('should register a new user', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });
    
    // Call register
    await act(async () => {
      await result.current.register('testuser', 'test@example.com', 'password');
    });
    
    // Wait for state updates
    await waitForNextUpdate();
    
    // Check if user is set
    expect(result.current.user).toEqual({
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
    });
    
    // Check if token is stored in localStorage
    expect(localStorage.getItem('token')).toBe('test-token');
  });
  
  it('should logout a user', async () => {
    // First, login a user
    const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });
    await waitForNextUpdate();
    
    // Now logout
    await act(async () => {
      await result.current.logout();
    });
    
    // Check if user is cleared
    expect(result.current.user).toBeNull();
    
    // Check if token is removed from localStorage
    expect(localStorage.getItem('token')).toBeNull();
  });
  
  it('should load user from token on mount', async () => {
    // Set a token in localStorage
    localStorage.setItem('token', 'existing-token');
    
    const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });
    
    // Initially loading should be true
    expect(result.current.isLoading).toBe(true);
    
    // Wait for the effect to complete
    await waitForNextUpdate();
    
    // Loading should be false and user should be set
    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toEqual({
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
    });
  });
  
  it('should handle login error', async () => {
    // Mock a rejected login
    const error = new Error('Invalid credentials');
    require('../../api/auth').login.mockRejectedValueOnce(error);
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Call login with invalid credentials
    await act(async () => {
      await expect(result.current.login('wrong@example.com', 'wrong')).rejects.toThrow('Invalid credentials');
    });
    
    // User should still be null
    expect(result.current.user).toBeNull();
  });
});

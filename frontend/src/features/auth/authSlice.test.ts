import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  login,
  logout,
  register,
  forgotPassword,
  resetPassword,
  verifyEmail,
  refreshToken,
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthStatus,
  selectAuthError,
  AuthState,
} from './authSlice';
import { RootState } from '../../app/store';
import { mockUser } from '../../test-utils/testing-library-utils';

describe('authSlice', () => {
  let store: ReturnType<typeof configureStore>;
  
  const initialState: AuthState = {
    user: null,
    token: null,
    refreshToken: null,
    status: 'idle',
    error: null,
  };
  
  const testUser = mockUser();
  const testToken = 'test-access-token';
  const testRefreshToken = 'test-refresh-token';
  
  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
    
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });
  
  describe('initial state', () => {
    it('should have initial state', () => {
      const state = store.getState().auth;
      expect(state).toEqual(initialState);
    });
    
    it('should load user from localStorage on init', () => {
      // Mock localStorage data
      const storedAuth = {
        user: testUser,
        token: testToken,
        refreshToken: testRefreshToken,
      };
      localStorage.setItem('auth', JSON.stringify(storedAuth));
      
      // Create a new store to trigger the localStorage check
      const newStore = configureStore({
        reducer: {
          auth: authReducer,
        },
      });
      
      const state = newStore.getState().auth;
      expect(state.user).toEqual(testUser);
      expect(state.token).toBe(testToken);
      expect(state.refreshToken).toBe(testRefreshToken);
    });
  });
  
  describe('login', () => {
    it('should handle login success', async () => {
      // Mock the API response
      const mockApiResponse = {
        user: testUser,
        accessToken: testToken,
        refreshToken: testRefreshToken,
      };
      
      // Mock the API call
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);
      
      // Dispatch the login action
      const result = await store.dispatch(
        login({ email: 'test@example.com', password: 'password123' })
      );
      
      // Check the action result
      expect(result.type).toBe('auth/login/fulfilled');
      expect(result.payload).toEqual({
        user: testUser,
        token: testToken,
        refreshToken: testRefreshToken,
      });
      
      // Check the state
      const state = store.getState().auth;
      expect(state.user).toEqual(testUser);
      expect(state.token).toBe(testToken);
      expect(state.refreshToken).toBe(testRefreshToken);
      expect(state.status).toBe('succeeded');
      
      // Check localStorage
      const storedAuth = JSON.parse(localStorage.getItem('auth') || '{}');
      expect(storedAuth.user).toEqual(testUser);
      expect(storedAuth.token).toBe(testToken);
      expect(storedAuth.refreshToken).toBe(testRefreshToken);
    });
    
    it('should handle login failure', async () => {
      // Mock a failed API response
      const errorMessage = 'Invalid credentials';
      
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          message: errorMessage,
        }),
      } as Response);
      
      // Dispatch the login action
      const result = await store.dispatch(
        login({ email: 'wrong@example.com', password: 'wrongpassword' })
      );
      
      // Check the action result
      expect(result.type).toBe('auth/login/rejected');
      expect(result.payload).toBe(errorMessage);
      
      // Check the state
      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.status).toBe('failed');
      expect(state.error).toBe(errorMessage);
    });
  });
  
  describe('logout', () => {
    it('should clear auth state and localStorage', async () => {
      // Set initial state with a logged-in user
      store = configureStore({
        reducer: {
          auth: authReducer,
        },
        preloadedState: {
          auth: {
            ...initialState,
            user: testUser,
            token: testToken,
            refreshToken: testRefreshToken,
          },
        },
      });
      
      // Mock the API call for logout
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
      } as Response);
      
      // Set some data in localStorage
      localStorage.setItem('auth', JSON.stringify({
        user: testUser,
        token: testToken,
        refreshToken: testRefreshToken,
      }));
      
      // Dispatch the logout action
      await store.dispatch(logout());
      
      // Check the state
      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.status).toBe('idle');
      
      // Check localStorage
      expect(localStorage.getItem('auth')).toBeNull();
    });
  });
  
  describe('register', () => {
    it('should handle registration success', async () => {
      const registerData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
      };
      
      // Mock the API response
      const mockApiResponse = {
        message: 'Registration successful. Please check your email to verify your account.',
        user: {
          ...registerData,
          id: 'user-456',
          isVerified: false,
        },
      };
      
      // Mock the API call
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);
      
      // Dispatch the register action
      const result = await store.dispatch(register(registerData));
      
      // Check the action result
      expect(result.type).toBe('auth/register/fulfilled');
      expect(result.payload).toEqual(mockApiResponse);
      
      // Check the state
      const state = store.getState().auth;
      expect(state.status).toBe('succeeded');
      expect(state.error).toBeNull();
    });
  });
  
  describe('selectors', () => {
    const testState: { auth: AuthState } = {
      auth: {
        user: testUser,
        token: testToken,
        refreshToken: testRefreshToken,
        status: 'succeeded',
        error: null,
      },
    } as RootState;
    
    it('should select the current user', () => {
      const result = selectCurrentUser(testState);
      expect(result).toEqual(testUser);
    });
    
    it('should select the authentication status', () => {
      const result = selectAuthStatus(testState);
      expect(result).toBe('succeeded');
    });
    
    it('should check if user is authenticated', () => {
      const result = selectIsAuthenticated(testState);
      expect(result).toBe(true);
      
      // Test not authenticated
      const notAuthState = { ...testState, auth: { ...testState.auth, token: null } };
      expect(selectIsAuthenticated(notAuthState)).toBe(false);
    });
    
    it('should select authentication error', () => {
      const errorState = { ...testState, auth: { ...testState.auth, error: 'Test error' } };
      const result = selectAuthError(errorState);
      expect(result).toBe('Test error');
    });
  });
  
  describe('refreshToken', () => {
    it('should refresh the access token', async () => {
      const newToken = 'new-access-token';
      const newRefreshToken = 'new-refresh-token';
      
      // Mock the API response
      const mockApiResponse = {
        accessToken: newToken,
        refreshToken: newRefreshToken,
      };
      
      // Mock the API call
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);
      
      // Set initial state with a refresh token
      store = configureStore({
        reducer: {
          auth: authReducer,
        },
        preloadedState: {
          auth: {
            ...initialState,
            refreshToken: testRefreshToken,
          },
        },
      });
      
      // Dispatch the refreshToken action
      const result = await store.dispatch(refreshToken());
      
      // Check the action result
      expect(result.type).toBe('auth/refreshToken/fulfilled');
      expect(result.payload).toEqual({
        token: newToken,
        refreshToken: newRefreshToken,
      });
      
      // Check the state
      const state = store.getState().auth;
      expect(state.token).toBe(newToken);
      expect(state.refreshToken).toBe(newRefreshToken);
      
      // Check localStorage
      const storedAuth = JSON.parse(localStorage.getItem('auth') || '{}');
      expect(storedAuth.token).toBe(newToken);
      expect(storedAuth.refreshToken).toBe(newRefreshToken);
    });
  });
  
  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const token = 'email-verification-token';
      
      // Mock the API response
      const mockApiResponse = {
        message: 'Email verified successfully',
        user: {
          ...testUser,
          isVerified: true,
        },
      };
      
      // Mock the API call
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);
      
      // Set initial state with an unverified user
      store = configureStore({
        reducer: {
          auth: authReducer,
        },
        preloadedState: {
          auth: {
            ...initialState,
            user: { ...testUser, isVerified: false },
          },
        },
      });
      
      // Dispatch the verifyEmail action
      const result = await store.dispatch(verifyEmail(token));
      
      // Check the action result
      expect(result.type).toBe('auth/verifyEmail/fulfilled');
      expect(result.payload).toEqual(mockApiResponse);
      
      // Check the state
      const state = store.getState().auth;
      expect(state.user?.isVerified).toBe(true);
      expect(state.status).toBe('succeeded');
    });
  });
  
  describe('forgotPassword', () => {
    it('should handle forgot password request', async () => {
      const email = 'user@example.com';
      const mockResponse = { message: 'Password reset email sent' };
      
      // Mock the API call
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);
      
      // Dispatch the forgotPassword action
      const result = await store.dispatch(forgotPassword(email));
      
      // Check the action result
      expect(result.type).toBe('auth/forgotPassword/fulfilled');
      expect(result.payload).toEqual(mockResponse);
      
      // Check the state
      const state = store.getState().auth;
      expect(state.status).toBe('succeeded');
      expect(state.error).toBeNull();
    });
  });
  
  describe('resetPassword', () => {
    it('should handle password reset', async () => {
      const resetData = {
        token: 'reset-token',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      };
      
      const mockResponse = { message: 'Password reset successful' };
      
      // Mock the API call
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);
      
      // Dispatch the resetPassword action
      const result = await store.dispatch(resetPassword(resetData));
      
      // Check the action result
      expect(result.type).toBe('auth/resetPassword/fulfilled');
      expect(result.payload).toEqual(mockResponse);
      
      // Check the state
      const state = store.getState().auth;
      expect(state.status).toBe('succeeded');
      expect(state.error).toBeNull();
    });
  });
});

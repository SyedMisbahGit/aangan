import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { User, AuthContextType, AuthProviderProps, Tokens } from './AuthContext.types';
import { isApiError } from '@/types/api.types';
import { AuthContext } from './AuthContext.helpers';
import { logger } from '@/utils/logger';

// Constants
const TOKEN_KEY = 'auth_tokens';
const USER_KEY = 'user_data';
const REFRESH_THRESHOLD = 300; // 5 minutes in seconds
const MAX_REFRESH_ATTEMPTS = 3;
const REFRESH_RETRY_DELAY = 1000; // 1 second

// API client with interceptors
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to check if token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<{ exp: number }>(token);
    return decoded.exp < Date.now() / 1000;
  } catch (error) {
    return true;
  }
};

// Default token values
const DEFAULT_TOKENS: Omit<Tokens, 'accessToken' | 'refreshToken'> = {
  expiresIn: 3600, // 1 hour
  tokenType: 'Bearer'
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const navigate = useNavigate();

  // Setup axios interceptors
  const setupAxiosInterceptors = useCallback((token: string) => {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, []);

  // Clear auth data from storage
  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setTokens(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  }, []);

  // Store auth data in storage
  const storeAuthData = useCallback((newTokens: Tokens, userData: User) => {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(newTokens));
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setTokens(newTokens);
    setUser(userData);
    setupAxiosInterceptors(newTokens.accessToken);
  }, [setupAxiosInterceptors]);

    // Track refresh attempts
  const refreshAttempts = useRef(0);
  const isRefreshing = useRef(false);
  const refreshQueue = useRef<Array<() => void>>([]);

  // Process queued requests after successful refresh
  const processQueue = (error: Error | null) => {
    refreshQueue.current.forEach(promise => {
      if (error) {
        promise();
      } else {
        promise();
      }
    });
    refreshQueue.current = [];
  };

  // Add request to queue
  const addToQueue = (resolve: (value: boolean) => void) => {
    refreshQueue.current.push(() => resolve(!isRefreshing.current));
  };

  // Refresh access token with rate limiting and retry logic
  const refreshToken = useCallback(async (): Promise<boolean> => {
    // If already refreshing, add to queue
    if (isRefreshing.current) {
      return new Promise(resolve => {
        addToQueue(resolve);
      });
    }

    // Check rate limits
    if (refreshAttempts.current >= MAX_REFRESH_ATTEMPTS) {
      logger.warn('Maximum refresh attempts reached');
      clearAuth();
      return false;
    }

    isRefreshing.current = true;
    refreshAttempts.current += 1;

    try {
      const storedTokens = localStorage.getItem(TOKEN_KEY);
      if (!storedTokens) {
        throw new Error('No stored tokens found');
      }
      
      const { refreshToken } = JSON.parse(storedTokens) as Tokens;
      const response = await api.post<Partial<Tokens>>('/auth/refresh', { refreshToken });
      
      if (response.data?.accessToken) {
        const newTokens: Tokens = {
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken || refreshToken,
          ...DEFAULT_TOKENS
        };
        const userData = JSON.parse(localStorage.getItem(USER_KEY) || '{}') as User;
        storeAuthData(newTokens, userData);
        refreshAttempts.current = 0; // Reset attempts on success
        processQueue(null);
        return true;
      }
      throw new Error('Invalid token response');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error refreshing token', { 
        error: errorMessage,
        attempt: refreshAttempts.current,
        maxAttempts: MAX_REFRESH_ATTEMPTS 
      });
      
      // If not the last attempt, wait before retrying
      if (refreshAttempts.current < MAX_REFRESH_ATTEMPTS) {
        await new Promise(resolve => setTimeout(resolve, REFRESH_RETRY_DELAY));
        return refreshToken();
      }
      
      // If all attempts failed, clear auth and process queue with error
      processQueue(new Error('Refresh failed'));
      clearAuth();
      return false;
    } finally {
      isRefreshing.current = false;
    }
  }, [clearAuth, storeAuthData]);

  // Initialize auth state from storage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedTokens = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);
        
        if (storedTokens && storedUser) {
          const parsedTokens = JSON.parse(storedTokens) as Tokens;
          const userData = JSON.parse(storedUser) as User;
          
          // Verify token is not expired
          if (!isTokenExpired(parsedTokens.accessToken)) {
            setTokens(parsedTokens);
            setUser(userData);
            setupAxiosInterceptors(parsedTokens.accessToken);
          } else {
            // Try to refresh token if expired
            const refreshed = await refreshToken();
            if (!refreshed) {
              clearAuth();
            }
          }
        } else {
          clearAuth();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [clearAuth, refreshToken, setupAxiosInterceptors]);
  // Get access token with auto-refresh
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (!tokens) return null;
    
    const decoded = jwtDecode<{ exp: number }>(tokens.accessToken);
    const now = Date.now() / 1000;
    
    // If token is expired or will expire soon, refresh it
    if (decoded.exp < now + REFRESH_THRESHOLD) {
      const refreshed = await refreshToken();
      if (!refreshed) {
        clearAuth();
        return null;
      }
      const newTokens = JSON.parse(localStorage.getItem(TOKEN_KEY) || '{}');
      return newTokens.accessToken;
    }
    
    return tokens.accessToken;
  }, [tokens, refreshToken, clearAuth]);

  // Login with email and password
  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await api.post<{
        accessToken: string;
        refreshToken: string;
        user: User;
      }>('/auth/login', { email, password });
      
      if (response.data.accessToken) {
        const newTokens: Tokens = {
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          ...DEFAULT_TOKENS
        };
        const userData = response.data.user;
        storeAuthData(newTokens, userData);
        return { error: null };
      }
      return { error: 'Login failed. Please try again.' };
    } catch (error) {
      console.error('Login failed:', error);
      return { error: isApiError(error) ? error.response?.data?.message || 'Login failed. Please try again.' : 'Login failed. Please try again.' };
    }
  }, [storeAuthData]);

  // Register new user
  const register = async (email: string, password: string, name: string) => {
    try {
      await api.post('/auth/register', { email, password, name });
      return { error: null };
    } catch (error) {
      return { 
        error: isApiError(error)
          ? error.response?.data?.message || 'Registration failed. Please try again.'
          : 'Registration failed. Please try again.'
      };
    }
  };

  // Update user password
  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const token = await getAccessToken();
      if (!token) {
        return { error: 'Not authenticated' };
      }
      
      await api.put(
        '/users/update-password',
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      return { error: null };
    } catch (error) {
      return { 
        error: isApiError(error)
          ? error.response?.data?.message || 'Failed to update password. Please try again.'
          : 'Failed to update password. Please try again.'
      };
    }
  };

  // Social login methods
  const signInWithGoogle = async (idToken: string) => {
    try {
      const response = await api.post('/auth/google', { idToken });
      const { accessToken, refreshToken, expiresIn, tokenType } = response.data;
      
      const profileResponse = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      const userData = {
        ...profileResponse.data,
        isGuest: false,
      };
      
      storeAuthData({ accessToken, refreshToken, expiresIn, tokenType }, userData);
      return { error: null };
    } catch (error) {
      return { 
        error: isApiError(error)
          ? error.response?.data?.message || 'Google sign in failed. Please try again.'
          : 'Google sign in failed. Please try again.'
      };
    }
  };

  const signInWithFacebook = async () => {
    // This would be handled by the OAuth flow redirect
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/facebook?returnTo=${encodeURIComponent(window.location.pathname)}`;
    return { error: null };
  };

  const signInWithApple = async () => {
    // This would be handled by the OAuth flow redirect
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/apple?returnTo=${encodeURIComponent(window.location.pathname)}`;
    return { error: null };
  };

  // Password reset
  const requestPasswordReset = async (email: string) => {
    try {
      await api.post('/auth/forgot-password', { email });
      return { error: null };
    } catch (error) {
      return { 
        error: isApiError(error)
          ? error.response?.data?.message || 'Failed to send password reset email.'
          : 'Failed to send password reset email.'
      };
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      return { error: null };
    } catch (error) {
      return { 
        error: isApiError(error)
          ? error.response?.data?.message || 'Failed to reset password.'
          : 'Failed to reset password.'
      };
    }
  };

  // Email verification
  const verifyEmail = async (token: string) => {
    try {
      await api.post('/auth/verify-email', { token });
      if (user) {
        setUser({ ...user, emailVerified: true });
      }
      return { error: null };
    } catch (error) {
      return { 
        error: isApiError(error)
          ? error.response?.data?.message || 'Failed to verify email.'
          : 'Failed to verify email.'
      };
    }
  };

  const resendVerificationEmail = async (email: string) => {
    try {
      await api.post('/auth/resend-verification', { email });
      return { error: null };
    } catch (error) {
      return { 
        error: isApiError(error)
          ? error.response?.data?.message || 'Failed to resend verification email.'
          : 'Failed to resend verification email.'
      };
    }
  };

  // User management
  const setOnboardingComplete = () => {
    if (user) {
      const updatedUser = { ...user, isOnboarded: true };
      setUser(updatedUser);
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      if (tokens?.refreshToken) {
        await api.post('/auth/logout', { refreshToken: tokens.refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
      localStorage.removeItem('guestId');
      navigate('/login');
    }
  };

  const value: AuthContextType = {
    // Auth state
    user,
    loading,
    isAuthenticated: !!user && !user.isGuest,
    
    // Auth methods
    login,
    register,
    signInWithMagicLink: async () => {
      // TODO: Implement magic link logic
      return { error: 'Magic link login not implemented' };
    },
    signInWithGoogle,
    signInWithFacebook,
    signInWithApple,
    signOut,
    refreshToken,
    
    // User management
    requestPasswordReset,
    resetPassword,
    updatePassword,
    verifyEmail,
    resendVerificationEmail,
    
    // User state
    setOnboardingComplete,
    updateUser,
    
    // Token management
    getAccessToken,
    isTokenExpired: () => tokens ? isTokenExpired(tokens.accessToken) : true,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
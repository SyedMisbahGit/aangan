import { renderHook, act } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { useAuth } from '../useAuth';

// Create mock functions
const mockSignInWithMagicLink = jest.fn();
const mockSignOut = jest.fn();
const mockSetOnboardingComplete = jest.fn();

// Create a simple mock context value
const mockAuthContext = {
  user: null,
  loading: false,
  signInWithMagicLink: mockSignInWithMagicLink,
  signOut: mockSignOut,
  setOnboardingComplete: mockSetOnboardingComplete,
};

// Mock the AuthContext module
jest.mock('../../contexts/AuthContext.helpers', () => ({
  AuthContext: {
    Consumer: ({ children }: { children: (value: typeof mockAuthContext) => ReactNode }) => 
      children(mockAuthContext),
    Provider: ({ children }: { children: ReactNode }) => 
      React.createElement(React.Fragment, {}, children),
  },
}));

// Import the actual AuthContext for testing
import { AuthContext as ActualAuthContext } from '../../contexts/AuthContext.helpers';

describe('useAuth', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Reset the mock context values
    mockAuthContext.user = null;
    mockAuthContext.loading = false;
    mockSignInWithMagicLink.mockResolvedValue({ error: null });
    mockSignOut.mockResolvedValue({ error: null });
    mockSetOnboardingComplete.mockResolvedValue({ error: null });
  });
  
  it('should provide auth context with default values', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current).toMatchObject({
      user: null,
      loading: false,
      signInWithMagicLink: expect.any(Function),
      signOut: expect.any(Function),
      setOnboardingComplete: expect.any(Function),
    });
  });

  it('should allow signing in with magic link', async () => {
    const email = 'test@example.com';
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      const response = await result.current.signInWithMagicLink(email);
      expect(response.error).toBeNull();
    });
    
    expect(mockSignInWithMagicLink).toHaveBeenCalledWith(email);
  });

  it('should handle sign out', async () => {
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      result.current.signOut();
    });
    
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('should set onboarding as complete', async () => {
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      result.current.setOnboardingComplete();
    });
    
    expect(mockSetOnboardingComplete).toHaveBeenCalled();
  });

  it('should throw an error when used outside of AuthProvider', () => {
    // Mock console.error to avoid test output
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Test that the hook throws when used outside of AuthProvider
    let error: Error | undefined;
    
    // Mock the useContext hook to return undefined for AuthContext
    const { useContext: originalUseContext } = jest.requireActual('react');
    const useContextSpy = jest.spyOn(React, 'useContext');
    
    useContextSpy.mockImplementation((context) => {
      if (context === ActualAuthContext) {
        return undefined;
      }
      return originalUseContext(context);
    });
    
    try {
      renderHook(() => useAuth());
    } catch (err) {
      error = err as Error;
    } finally {
      // Always restore the original implementation
      useContextSpy.mockRestore();
    }
    
    // The hook should have thrown an error
    expect(error).toBeDefined();
    expect(error?.message).toContain('useAuth must be used within an AuthProvider');
    
    // Clean up
    errorSpy.mockRestore();
  });
});

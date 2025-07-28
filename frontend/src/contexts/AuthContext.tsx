import React, { useState, useEffect } from 'react';
import { User, AuthContextType, AuthProviderProps } from './AuthContext.types';
import { AuthContext } from './AuthContext.helpers';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing user session
    const guestId = localStorage.getItem('guestId');
    if (guestId) {
      setUser({ id: guestId, isGuest: true });
    }
    setLoading(false);
  }, []);

  const signInWithMagicLink = async (_email: string): Promise<{ error: string | null }> => {
    // The _email parameter is intentionally unused in this mock implementation
    // In a real implementation, this would be used to send a magic link
    try {
      // For now, just simulate the magic link process
      // In a real implementation, you'd call your Railway backend
      
      // Simulate success (you can replace this with actual API call)
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  };

  const signOut = () => {
    localStorage.removeItem('guestId');
    setUser(null);
  };

  const setOnboardingComplete = () => {
    // Mark onboarding as complete
    localStorage.setItem('onboardingComplete', 'true');
  };

  const value: AuthContextType = {
    user,
    loading,
    signInWithMagicLink,
    signOut,
    setOnboardingComplete,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
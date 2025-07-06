import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email?: string;
  isGuest?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithMagicLink: (email: string) => Promise<{ error: string | null }>;
  signOut: () => void;
  setOnboardingComplete: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

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

  const signInWithMagicLink = async (email: string): Promise<{ error: string | null }> => {
    try {
      // For now, just simulate the magic link process
      // In a real implementation, you'd call your Railway backend
      console.log('Magic link requested for:', email);
      
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
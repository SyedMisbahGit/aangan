export interface User {
  id: string;
  email?: string;
  isGuest?: boolean;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithMagicLink: (email: string) => Promise<{ error: string | null }>;
  signOut: () => void;
  setOnboardingComplete: () => void;
}

export interface AuthProviderProps {
  children: React.ReactNode;
} 
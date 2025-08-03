export interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'moderator';
  isGuest: boolean;
  isOnboarded: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  avatarUrl?: string;
}

export interface AuthContextType {
  // Auth state
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  
  // Auth methods
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  register: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: string | null }>;
  signInWithGoogle: (idToken: string) => Promise<{ error: string | null }>;
  signInWithFacebook: () => Promise<{ error: string | null }>;
  signInWithApple: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  
  // User management
  requestPasswordReset: (email: string) => Promise<{ error: string | null }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ error: string | null }>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ error: string | null }>;
  verifyEmail: (token: string) => Promise<{ error: string | null }>;
  resendVerificationEmail: (email: string) => Promise<{ error: string | null }>;
  
  // User state
  setOnboardingComplete: () => void;
  updateUser: (updates: Partial<User>) => void;
  
  // Token management
  getAccessToken: () => Promise<string | null>;
  isTokenExpired: () => boolean;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient, Session, User } from '@supabase/supabase-js';
import { DreamLoadingScreen } from '../App';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface SupabaseAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithMagicLink: (email: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  isOnboardingComplete: boolean;
  setOnboardingComplete: () => Promise<void>;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

export const useSupabaseAuth = () => {
  const ctx = useContext(SupabaseAuthContext);
  if (!ctx) throw new Error('useSupabaseAuth must be used within SupabaseAuthProvider');
  return ctx;
};

// Loading fallback for UI components
export const SupabaseAuthLoadingFallback = () => (
  <DreamLoadingScreen 
    message="Authenticating your presence in the WhisperVerse..."
    narratorLine="A magic link is being conjured for your journey."
    variant="shimmer"
  />
);

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentSession = supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
      console.log('SupabaseAuthContext ready:', { user: data.session?.user, session: data.session });
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      console.log('SupabaseAuthContext updated:', { user: session?.user, session });
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signInWithMagicLink = async (email: string) => {
    if (!email.endsWith('@cujammu.ac.in')) {
      return { error: 'Only @cujammu.ac.in emails are allowed.' };
    }
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) return { error: error.message };
    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const isOnboardingComplete = !!user?.user_metadata?.onboarding_complete;

  const setOnboardingComplete = async () => {
    if (!user) return;
    await supabase.auth.updateUser({ data: { onboarding_complete: true } });
    // Refresh user
    const { data } = await supabase.auth.getUser();
    setUser(data.user ?? null);
  };

  return (
    <SupabaseAuthContext.Provider value={{ user, session, loading, signInWithMagicLink, signOut, isOnboardingComplete, setOnboardingComplete }}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

export { supabase }; 
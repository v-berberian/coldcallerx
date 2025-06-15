
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (initialized.current) return;
    initialized.current = true;

    console.log('AuthProvider: Initializing auth with session persistence');

    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('AuthProvider: Auth state change:', event, session?.user?.email);
        
        // Update state immediately for all events
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Store session persistence flag
        if (session) {
          localStorage.setItem('coldcaller-has-session', 'true');
          // Ensure we maintain standalone mode after auth
          if (window.navigator && 'standalone' in window.navigator) {
            document.documentElement.classList.add('standalone-mode');
          }
        } else {
          localStorage.removeItem('coldcaller-has-session');
        }
      }
    );

    // Check for existing session on startup
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        console.log('AuthProvider: Initial session check:', session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Update persistence flag
        if (session) {
          localStorage.setItem('coldcaller-has-session', 'true');
          // Ensure we maintain standalone mode
          if (window.navigator && 'standalone' in window.navigator) {
            document.documentElement.classList.add('standalone-mode');
          }
        } else {
          localStorage.removeItem('coldcaller-has-session');
        }
      } catch (error) {
        console.error('AuthProvider: Error checking session:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      console.log('AuthProvider: Cleaning up');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('AuthProvider: Attempting sign in for:', email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    console.log('AuthProvider: Attempting sign up for:', email);
    // Use current origin without redirect to avoid breaking standalone mode
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    return { error };
  };

  const signOut = async () => {
    console.log('AuthProvider: Signing out user');
    localStorage.removeItem('coldcaller-has-session');
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

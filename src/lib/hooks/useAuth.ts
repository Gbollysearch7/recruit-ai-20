'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured, type Profile } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: { full_name?: string; company?: string; role?: string; avatar_url?: string }) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function useAuthState(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);

  const supabase = getSupabase();

  const fetchProfile = useCallback(async (userId: string) => {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      // Profile doesn't exist yet, will be created by trigger
      return null;
    }
    return data;
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  }, [user, fetchProfile]);

  // Single combined effect for configuration check + session initialization
  useEffect(() => {
    const configured = isSupabaseConfigured();
    setIsConfigured(configured);

    if (!configured || !supabase) {
      setIsLoading(false);
      return;
    }

    let mounted = true;
    let initialSessionHandled = false;

    // Listen for auth changes FIRST so we don't miss events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentSession: Session | null) => {
        if (!mounted) return;

        // Skip INITIAL_SESSION event — we handle it via getSession below
        if (event === 'INITIAL_SESSION') {
          return;
        }

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          const profileData = await fetchProfile(currentSession.user.id);
          if (mounted) setProfile(profileData);
        } else {
          setProfile(null);
        }

        setIsLoading(false);
      }
    );

    // Then get the initial session - fetch profile in parallel for speed
    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();

        if (!mounted || initialSessionHandled) return;
        initialSessionHandled = true;

        // Set user immediately so UI can render
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        setIsLoading(false);

        // Fetch profile in background (non-blocking)
        if (initialSession?.user) {
          fetchProfile(initialSession.user.id).then(profileData => {
            if (mounted) setProfile(profileData);
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback`
      : process.env.NEXT_PUBLIC_APP_URL + '/auth/callback';

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  }, [supabase]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  }, [supabase]);

  const signUpWithEmail = useCallback(async (email: string, password: string, fullName?: string) => {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback`
      : process.env.NEXT_PUBLIC_APP_URL + '/auth/callback';

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName || '',
        },
      },
    });

    if (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }, [supabase]);

  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback?next=/auth/reset-password`
      : process.env.NEXT_PUBLIC_APP_URL + '/auth/callback?next=/auth/reset-password';

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }, [supabase]);

  const updatePassword = useCallback(async (newPassword: string) => {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }, [supabase]);

  const updateProfile = useCallback(async (data: { full_name?: string; company?: string; role?: string; avatar_url?: string }) => {
    if (!supabase || !user) {
      throw new Error('Not authenticated');
    }

    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    // Refresh profile data
    const profileData = await fetchProfile(user.id);
    setProfile(profileData);
  }, [supabase, user, fetchProfile]);

  const signOut = useCallback(async () => {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
    setUser(null);
    setProfile(null);
    setSession(null);
  }, [supabase]);

  return {
    user,
    profile,
    session,
    isLoading,
    isAuthenticated: !!user,
    isConfigured,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    updatePassword,
    signOut,
    refreshProfile,
    updateProfile,
  };
}

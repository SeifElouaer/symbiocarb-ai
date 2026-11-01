'use client';

// ==============================================================================
// SymbioCarb AI - Authentication Context
// Supports Supabase Auth (Google OAuth, Email/Password) & Instant Demo Factory Mode
// ==============================================================================

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { PersonaSlug } from '@/lib/i18n/use-translation';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  isDemo?: boolean;
  persona?: PersonaSlug;
  organizationName?: string;
  role?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithEmail: (email: string, pass: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<{ error: Error | null }>;
  signInAsDemo: (persona?: PersonaSlug) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isAuthModalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
  signInWithGoogle: async () => ({ error: null }),
  signInWithEmail: async () => ({ error: null }),
  signUpWithEmail: async () => ({ error: null }),
  signInAsDemo: () => {},
  signOut: async () => {},
});

const DEMO_USERS: Record<PersonaSlug, UserProfile> = {
  benarous: {
    id: 'demo-benarous-01',
    email: 'direction.technique@tunisie-meca.tn',
    fullName: 'Ing. Seif Elouaer (Direction Industrielle)',
    isDemo: true,
    persona: 'benarous',
    organizationName: 'Tunisie Mécanique Précision SA',
    role: 'Directeur Technique & Énergie',
  },
  tozeur: {
    id: 'demo-tozeur-02',
    email: 'contact@dattes-sahara.tn',
    fullName: 'Hadj Mahmoud Ben Salem (Gérant)',
    isDemo: true,
    persona: 'tozeur',
    organizationName: 'Conditionnement Dattes du Djérid',
    role: 'Président Directeur Général',
  },
  sfax: {
    id: 'demo-sfax-03',
    email: 'qualite@huilerie-sfaxienne.com',
    fullName: 'Mme Inès Triki (Responsable QHSE & Énergie)',
    isDemo: true,
    persona: 'sfax',
    organizationName: 'Huilerie Moderne de Sfax',
    role: 'Responsable QHSE & Audit STEG',
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    // 1. Check local storage for persistent demo session
    const storedDemo = localStorage.getItem('symbiocarb-demo-session');
    if (storedDemo) {
      try {
        const parsed = JSON.parse(storedDemo);
        setUser(parsed);
        setIsLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('symbiocarb-demo-session');
      }
    }

    // 2. Check Supabase session
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then((res: any) => {
      const session = res?.data?.session;
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Ingénieur Industriel',
          avatarUrl: session.user.user_metadata?.avatar_url,
          isDemo: false,
          role: 'Auditeur Carbone & Énergie',
        });
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Ingénieur Industriel',
          avatarUrl: session.user.user_metadata?.avatar_url,
          isDemo: false,
          role: 'Auditeur Carbone & Énergie',
        });
        localStorage.removeItem('symbiocarb-demo-session');
      } else if (!localStorage.getItem('symbiocarb-demo-session')) {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  // Real Google Sign In via Supabase OAuth
  const signInWithGoogle = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://symbiocarb.vercel.app';
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      if (error) throw error;
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || email,
          fullName: data.user.user_metadata?.full_name || email.split('@')[0],
          isDemo: false,
          role: 'Ingénieur Industriel',
        });
        closeAuthModal();
      }
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: { full_name: name },
        },
      });
      if (error) throw error;
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || email,
          fullName: name,
          isDemo: false,
          role: 'Responsable Énergie & RSE',
        });
        closeAuthModal();
      }
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signInAsDemo = (persona: PersonaSlug = 'benarous') => {
    const demoProfile = DEMO_USERS[persona];
    setUser(demoProfile);
    localStorage.setItem('symbiocarb-demo-session', JSON.stringify(demoProfile));
    closeAuthModal();
  };

  const signOut = async () => {
    const supabase = getSupabaseBrowserClient();
    localStorage.removeItem('symbiocarb-demo-session');
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInAsDemo,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

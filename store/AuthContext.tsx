import React, { createContext, useState, useContext, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { TierManager, SubscriptionTier } from '../lib/TierManager';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userTier: SubscriptionTier;
  signOut: () => Promise<void>;
  refreshTier: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  userTier: 'Basic',
  signOut: async () => {},
  refreshTier: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userTier, setUserTier] = useState<SubscriptionTier>('Basic');

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        console.log('Logged in user:', session.user);
        const tier = await TierManager.getCurrentTier(session.user.id);
        setUserTier(tier);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        console.log('Auth state changed for user:', session.user);
        const tier = await TierManager.getCurrentTier(session.user.id);
        setUserTier(tier);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
      setUserTier('Basic');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const refreshTier = async () => {
    if (session?.user) {
      const tier = await TierManager.getCurrentTier(session.user.id);
      setUserTier(tier);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user: session?.user || null, 
      session, 
      loading, 
      userTier,
      signOut,
      refreshTier
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
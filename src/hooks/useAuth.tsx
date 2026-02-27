import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { resolvedSupabaseUrl, supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  analyses_used: number;
  is_premium: boolean;
  purchased_at: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  incrementAnalysesUsed: () => Promise<void>;
  canAnalyze: boolean;
  analysesRemaining: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FREE_ANALYSES_LIMIT = 5;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data as Profile;
  };

  const checkAdminRole = async (userId: string) => {
    const { data, error } = await supabase
      .rpc('has_role', { _user_id: userId, _role: 'admin' });

    if (error) {
      console.error('Error checking admin role:', error);
      return false;
    }
    return data || false;
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Defer profile fetch with setTimeout
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id).then(setProfile);
            checkAdminRole(session.user.id).then(setIsAdmin);
          }, 0);
        } else {
          setProfile(null);
          setIsAdmin(false);
        }

        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).then(setProfile);
        checkAdminRole(session.user.id).then(setIsAdmin);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/lens`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error: error as Error | null };
  };

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/lens`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      }
    });

    if (!error) {
      const oauthUrl = data?.url;
      if (!oauthUrl) {
        return { error: new Error('Google OAuth URL not returned') };
      }

      const finalUrl = oauthUrl.startsWith('/')
        ? `${resolvedSupabaseUrl}${oauthUrl}`
        : oauthUrl;

      window.location.assign(finalUrl);
    }

    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setIsAdmin(false);
  };

  const incrementAnalysesUsed = async () => {
    if (!user) return;

    const { error } = await supabase.rpc('increment_analyses_used');
    if (error) {
      // Surface a clean error to calling code (e.g. Lens) to show upgrade UI.
      throw error;
    }

    // Refresh profile to reflect the updated count.
    const updated = await fetchProfile(user.id);
    setProfile(updated);
  };

  // Admins and premium users have unlimited access
  const canAnalyze = isAdmin || profile?.is_premium || (profile?.analyses_used ?? 0) < FREE_ANALYSES_LIMIT;
  const analysesRemaining = (isAdmin || profile?.is_premium)
    ? Infinity
    : Math.max(0, FREE_ANALYSES_LIMIT - (profile?.analyses_used ?? 0));

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      isAdmin,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      incrementAnalysesUsed,
      canAnalyze,
      analysesRemaining,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

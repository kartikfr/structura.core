import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, SupabaseClient } from '@supabase/supabase-js';
import {
  canFallbackToDirectAuth,
  directSupabase,
  resolvedDirectSupabaseUrl,
  resolvedSupabaseUrl,
  supabase,
  supabaseTransportConfigured,
  supabaseTransportEffective,
} from '@/integrations/supabase/client';
import { runAuthDiagnostics } from '@/lib/authDiagnostics';

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

const AUTH_ERROR_MESSAGES = {
  invalidCredentials: 'Invalid email or password.',
  emailNotConfirmed: 'Email not verified. Please confirm your email before signing in.',
  accountExists: 'This email is already registered. Please sign in instead.',
  networkOrProxyFailure: 'Local network/proxy interference detected. Retried direct path.',
  serviceUnavailable: 'Auth service temporarily unavailable.',
} as const;

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

const toError = (error: unknown): Error => {
  if (error instanceof Error) return error;
  return new Error(String(error ?? 'Unknown authentication error'));
};

const getErrorStatus = (error: unknown): number | null => {
  if (typeof error !== 'object' || error === null) return null;
  if (!('status' in error)) return null;
  const value = (error as { status?: unknown }).status;
  return typeof value === 'number' ? value : null;
};

const isInvalidCredentialsError = (error: unknown): boolean => {
  const message = toError(error).message.toLowerCase();
  return message.includes('invalid login credentials');
};

const isEmailNotConfirmedError = (error: unknown): boolean => {
  const message = toError(error).message.toLowerCase();
  return message.includes('email not confirmed') || message.includes('email not verified');
};

const isAccountExistsError = (error: unknown): boolean => {
  const message = toError(error).message.toLowerCase();
  return message.includes('already registered') || message.includes('already been registered');
};

const isNetworkOrProxyFailure = (error: unknown): boolean => {
  const message = toError(error).message.toLowerCase();
  return message.includes('failed to fetch') || message.includes('networkerror') || message.includes('fetch failed');
};

const isRetryableAuthFailure = (error: unknown): boolean => {
  const status = getErrorStatus(error);
  return isNetworkOrProxyFailure(error) || (status !== null && status >= 500);
};

const classifyAuthError = (error: unknown, fallbackAttempted: boolean): Error => {
  if (isInvalidCredentialsError(error)) {
    return new Error(AUTH_ERROR_MESSAGES.invalidCredentials);
  }
  if (isEmailNotConfirmedError(error)) {
    return new Error(AUTH_ERROR_MESSAGES.emailNotConfirmed);
  }
  if (isAccountExistsError(error)) {
    return new Error(AUTH_ERROR_MESSAGES.accountExists);
  }

  const status = getErrorStatus(error);
  if (fallbackAttempted && isNetworkOrProxyFailure(error)) {
    return new Error(AUTH_ERROR_MESSAGES.networkOrProxyFailure);
  }
  if (isNetworkOrProxyFailure(error)) {
    return new Error(AUTH_ERROR_MESSAGES.networkOrProxyFailure);
  }
  if (status !== null && status >= 500) {
    return new Error(AUTH_ERROR_MESSAGES.serviceUnavailable);
  }

  return toError(error);
};

const normalizeOAuthUrl = (url: string, baseUrl: string): string => {
  if (url.startsWith('/')) {
    return `${baseUrl.replace(/\/$/, '')}${url}`;
  }
  return url;
};

const requestGoogleOAuthUrl = async (
  client: SupabaseClient,
  baseUrl: string,
  redirectTo: string
): Promise<{ url: string | null; error: Error | null }> => {
  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    }
  });

  if (error) {
    return { url: null, error: toError(error) };
  }
  if (!data?.url) {
    return { url: null, error: new Error(AUTH_ERROR_MESSAGES.serviceUnavailable) };
  }

  const finalUrl = normalizeOAuthUrl(data.url, baseUrl);
  if (!/^https?:\/\//i.test(finalUrl)) {
    return { url: null, error: new Error(AUTH_ERROR_MESSAGES.serviceUnavailable) };
  }

  return { url: finalUrl, error: null };
};

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
    if (import.meta.env.DEV) {
      void runAuthDiagnostics().then((diag) => {
        console.info('[auth-diagnostics]', {
          transportConfigured: supabaseTransportConfigured,
          transportEffective: supabaseTransportEffective,
          ...diag,
        });
      });
    }

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
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

    const { error: primaryError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    if (!primaryError) {
      return { error: null };
    }

    if (canFallbackToDirectAuth && isRetryableAuthFailure(primaryError)) {
      if (import.meta.env.DEV) {
        void runAuthDiagnostics().then((diag) => {
          console.info('[auth-diagnostics][signUp-fallback]', diag);
        });
      }

      const { error: directError } = await directSupabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (!directError) {
        return { error: null };
      }
      return { error: classifyAuthError(directError, true) };
    }

    return { error: classifyAuthError(primaryError, false) };
  };

  const signIn = async (email: string, password: string) => {
    const { error: primaryError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!primaryError) {
      return { error: null };
    }

    if (canFallbackToDirectAuth && isRetryableAuthFailure(primaryError)) {
      if (import.meta.env.DEV) {
        void runAuthDiagnostics().then((diag) => {
          console.info('[auth-diagnostics][signIn-fallback]', diag);
        });
      }

      const { error: directError } = await directSupabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!directError) {
        return { error: null };
      }
      return { error: classifyAuthError(directError, true) };
    }

    return { error: classifyAuthError(primaryError, false) };
  };

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/lens`;

    const primary = await requestGoogleOAuthUrl(supabase, resolvedSupabaseUrl, redirectUrl);
    if (!primary.error && primary.url) {
      window.location.assign(primary.url);
      return { error: null };
    }

    if (canFallbackToDirectAuth && primary.error && isRetryableAuthFailure(primary.error)) {
      if (import.meta.env.DEV) {
        void runAuthDiagnostics().then((diag) => {
          console.info('[auth-diagnostics][oauth-fallback]', diag);
        });
      }

      const fallback = await requestGoogleOAuthUrl(directSupabase, resolvedDirectSupabaseUrl, redirectUrl);
      if (!fallback.error && fallback.url) {
        window.location.assign(fallback.url);
        return { error: null };
      }

      return { error: classifyAuthError(fallback.error ?? primary.error, true) };
    }

    return { error: classifyAuthError(primary.error, false) };
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

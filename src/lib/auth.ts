import { supabase } from './supabase';
import { useState, useEffect, createContext, useContext } from 'react';

// Create Auth Context
const AuthContext = createContext<any>(null);

// Sign in with Google
export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  if (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

// Sign up redirect
export const goToSignUp = () => {
  window.location.href = '/auth/callback?next=/dashboard';
};

// Auth hook
export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Redirect based on auth state
        if (session && window.location.pathname === '/') {
          window.location.href = '/dashboard';
        } else if (!session && window.location.pathname === '/dashboard') {
          window.location.href = '/';
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}

// Auth Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Auth context hook
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

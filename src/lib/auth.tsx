import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { User, UserPreferences } from '@/types';

// Create Auth Context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, role: 'student' | 'researcher' | 'other') => Promise<void>;
  signInAnonymously: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
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
  } catch (error: any) {
    // If Google OAuth is not configured, show a helpful message
    if (error.message?.includes('OAuth provider not enabled')) {
      throw new Error('Google sign-in is not configured. Please use email/password or anonymous sign-in.');
    }
    throw error;
  }
};

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) {
    console.error('Email sign-in error:', error);
    throw error;
  }
};

// Sign up with email and password
export const signUpWithEmail = async (email: string, password: string, role: 'student' | 'researcher' | 'other') => {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: role
      }
    }
  });
  if (error) {
    console.error('Email sign-up error:', error);
    throw error;
  }
};

// Sign in anonymously (for young users)
export const signInAnonymously = async () => {
  const { error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.error('Anonymous sign-in error:', error);
    throw error;
  }
};

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Update user preferences
export const updateUserPreferences = async (preferences: Partial<UserPreferences>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No authenticated user');

  const { error } = await supabase
    .from('users')
    .update({ 
      preferences: preferences,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id);

  if (error) {
    console.error('Update preferences error:', error);
    throw error;
  }
};

// Auth hook
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        // Test Supabase connection first
        console.log('Testing Supabase connection...');
        
        // Test basic auth connection
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }
        
        console.log('Initial session check:', { hasSession: !!session, userId: session?.user?.id });
        
        if (session?.user) {
          console.log('Session found, fetching user profile...');
          
          // Test database connection with a simple query first
          try {
            console.log('Testing database connection...');
            const { error: testError } = await supabase
              .from('users')
              .select('count')
              .limit(1);
            
                         if (testError) {
               console.warn('Database connection test failed:', testError);
               // Create fallback user if database is not accessible
               const fallbackUser = {
                 id: session.user.id,
                 email: session.user.email,
                 role: 'student' as const,
                 preferences: {
                   theme: 'system' as const,
                   language: 'en' as const,
                   notifications: true,
                   accessibility: {
                     highContrast: false,
                     largeText: false,
                     screenReader: false
                   }
                 },
                 created_at: new Date().toISOString(),
                 updated_at: new Date().toISOString()
               };
               console.log('Setting fallback user due to database connection issues:', fallbackUser);
               setUser(fallbackUser);
               setLoading(false);
               console.log('Fallback user set, loading should be false now');
               return;
             }
            
            console.log('Database connection test successful');
            await fetchUserProfile(session.user.id);
                     } catch (dbError) {
             console.error('Database connection test error:', dbError);
             // Create fallback user
             const fallbackUser = {
               id: session.user.id,
               email: session.user.email,
               role: 'student' as const,
               preferences: {
                 theme: 'system' as const,
                 language: 'en' as const,
                 notifications: true,
                 accessibility: {
                   highContrast: false,
                   largeText: false,
                   screenReader: false
                 }
               },
               created_at: new Date().toISOString(),
               updated_at: new Date().toISOString()
             };
             console.log('Setting fallback user due to database error:', fallbackUser);
             setUser(fallbackUser);
             setLoading(false);
             console.log('Fallback user set due to database error, loading should be false now');
             return;
           }
        } else {
          // No session found, set loading to false
          console.log('No session found, setting loading to false');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in initializeAuth:', error);
        setLoading(false);
      }
    };

    // Add a fallback timeout for the entire auth initialization
    const authTimeout = setTimeout(() => {
      console.warn('Auth initialization timeout - forcing loading to false');
      setLoading(false);
    }, 10000); // 10 second timeout

    initializeAuth().finally(() => {
      clearTimeout(authTimeout);
      setIsInitialized(true);
      console.log('Auth initialization completed, isInitialized set to true');
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change event:', event, 'session:', !!session, 'isInitialized:', isInitialized);
        
        // Skip if we're still in initial loading and this is the first auth state change
        if (!isInitialized && event === 'INITIAL_SESSION') {
          console.log('Skipping initial session event, waiting for manual initialization');
          return;
        }
        
        try {
          if (session?.user) {
            // Only fetch user profile if we don't already have a user
            if (!user) {
              await fetchUserProfile(session.user.id);
            }
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          setUser(null);
        } finally {
          setLoading(false);
        }
        
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

  // Monitor user state changes
  useEffect(() => {
    console.log('User state changed:', { user: user?.email, loading, isInitialized });
  }, [user, loading, isInitialized]);

  const fetchUserProfile = async (userId: string) => {
    console.log('Fetching user profile for:', userId);
    try {
      console.log('Making Supabase query...');
      
      // Add timeout to prevent hanging
      const queryPromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout')), 5000); // 5 second timeout
      });
      
      let data, error;
      try {
        const result = await Promise.race([queryPromise, timeoutPromise]) as any;
        data = result.data;
        error = result.error;
      } catch (timeoutError) {
        console.error('Query timed out:', timeoutError);
        error = { message: 'Query timeout', code: 'TIMEOUT' };
      }

      console.log('Supabase query completed:', { data: !!data, error: !!error, errorCode: error?.code });

      if (error) {
        console.error('Error fetching user profile:', error);
        
        // If it's a timeout or connection error, create fallback user immediately
        if (error.code === 'TIMEOUT' || error.message?.includes('timeout') || error.message?.includes('network')) {
          console.log('Database timeout/connection error, creating fallback user');
          const { data: authUser } = await supabase.auth.getUser();
          if (authUser.user) {
            const fallbackUser = {
              id: userId,
              email: authUser.user.email,
              role: 'student' as const,
              preferences: {
                theme: 'system' as const,
                language: 'en' as const,
                notifications: true,
                accessibility: {
                  highContrast: false,
                  largeText: false,
                  screenReader: false
                }
              },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            console.log('Setting fallback user due to timeout:', fallbackUser);
            setUser(fallbackUser);
            setLoading(false); // Ensure loading is set to false
            return;
          } else {
            console.log('No auth user found during timeout, setting user to null');
            setUser(null);
            setLoading(false);
            return;
          }
        }
        
        // If user profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          console.log('User profile not found, creating new profile...');
          const { data: authUser } = await supabase.auth.getUser();
          console.log('Auth user data:', { hasUser: !!authUser.user, email: authUser.user?.email });
          
          if (authUser.user) {
            console.log('Attempting to create user profile...');
            const { data: newUser, error: createError } = await supabase
              .from('users')
              .insert({
                id: userId,
                email: authUser.user.email,
                role: 'student'
              })
              .select()
              .single();
            
            console.log('User creation result:', { newUser: !!newUser, createError: !!createError });
            
            if (createError) {
              console.error('Error creating user profile:', createError);
              // Set a basic user object even if profile creation fails
              const fallbackUser = {
                id: userId,
                email: authUser.user.email,
                role: 'student' as const,
                preferences: {
                  theme: 'system' as const,
                  language: 'en' as const,
                  notifications: true,
                  accessibility: {
                    highContrast: false,
                    largeText: false,
                    screenReader: false
                  }
                },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
              console.log('Setting fallback user:', fallbackUser);
              setUser(fallbackUser);
            } else {
              console.log('Setting new user:', newUser);
              setUser(newUser);
            }
          } else {
            console.log('No auth user found, setting user to null');
            setUser(null);
          }
        } else {
          // For other errors, try to create a fallback user
          console.log('Non-PGRST116 error, attempting fallback user creation');
          const { data: authUser } = await supabase.auth.getUser();
          if (authUser.user) {
            const fallbackUser = {
              id: userId,
              email: authUser.user.email,
              role: 'student' as const,
              preferences: {
                theme: 'system' as const,
                language: 'en' as const,
                notifications: true,
                accessibility: {
                  highContrast: false,
                  largeText: false,
                  screenReader: false
                }
              },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            console.log('Setting fallback user due to database error:', fallbackUser);
            setUser(fallbackUser);
          } else {
            console.log('No auth user found, setting user to null');
            setUser(null);
          }
        }
        return;
      }

      console.log('User profile fetched successfully:', data);
      setUser(data);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setUser(null);
    } finally {
      // Always set loading to false after fetchUserProfile completes
      console.log('Setting loading to false after fetchUserProfile');
      setLoading(false);
    }
  };

  return { user, loading };
}

// Auth Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  
  const authContextValue: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInAnonymously,
    signOut,
    updateUserPreferences
  };
  
  return (
    <AuthContext.Provider value={authContextValue}>
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
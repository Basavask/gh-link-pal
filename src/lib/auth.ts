import { supabase } from './supabase';

// Sign in with Google
export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  if (error) console.error('Google sign-in error:', error);
};

// Sign up redirect
export const goToSignUp = () => {
  window.location.href = '/auth/callback?next=/dashboard'; // This will trigger sign-up flow
};

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();

    useEffect(() => {
    async function handleAuthCallback() {
      try {
        // Handle OAuth callback by getting the session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth error:', error);
          throw error;
        }

        if (session?.user) {
          // Successfully authenticated
          toast({
            title: "Signed in successfully",
            description: "Welcome back! Redirecting to your dashboard...",
          });
          navigate('/dashboard', { replace: true });
        } else {
          // Check if there's a user but no session (OAuth flow)
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            console.error('User error:', userError);
            throw userError;
          }
          
          if (user) {
            // OAuth was successful
            toast({
              title: "Signed in successfully",
              description: "Welcome back! Redirecting to your dashboard...",
            });
            navigate('/dashboard', { replace: true });
          } else {
            // No user found, redirect to home
            navigate('/', { replace: true });
          }
        }
      } catch (error: any) {
        console.error('Auth callback error:', error);
        
        // Provide more specific error messages
        let errorMessage = "Could not complete sign-in. Please try again.";
        
        if (error.message) {
          if (error.message.includes('Invalid login credentials')) {
            errorMessage = "Invalid email or password. Please check your credentials.";
          } else if (error.message.includes('Email not confirmed')) {
            errorMessage = "Please check your email and confirm your account.";
          } else if (error.message.includes('Too many requests')) {
            errorMessage = "Too many sign-in attempts. Please wait a moment and try again.";
          } else if (error.message.includes('OAuth provider not enabled')) {
            errorMessage = "Google sign-in is not configured. Please use email/password or anonymous sign-in.";
          } else {
            errorMessage = error.message;
          }
        }
        
        toast({
          variant: "destructive",
          title: "Authentication failed",
          description: errorMessage,
        });
        navigate('/', { replace: true });
      }
    }

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Completing sign-in...</p>
    </div>
  );
}

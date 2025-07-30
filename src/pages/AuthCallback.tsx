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
        // Extract session from URL hash
        const { error } = await supabase.auth.getSessionFromUrl();
        
        if (error) throw error;

        // Show success
        toast({
          title: "Signed in successfully",
          description: "Welcome back! Redirecting to your dashboard...",
        });

        // Redirect to dashboard or previous page
        navigate('/dashboard', { replace: true });
      } catch (error: any) {
        console.error('Auth callback error:', error);
        toast({
          variant: "destructive",
          title: "Authentication failed",
          description: error.message || "Could not complete sign-in. Please try again.",
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

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthContext } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

export const AuthTest = () => {
  const [loading, setLoading] = useState(false);
  const { user, signInWithEmail, signInAnonymously } = useAuthContext();
  const { toast } = useToast();

  const testEmailSignIn = async () => {
    setLoading(true);
    try {
      // Test with a simple email/password
      await signInWithEmail('test@example.com', 'password123');
      toast({
        title: "Test sign-in successful",
        description: "Email authentication is working!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Test sign-in failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const testAnonymousSignIn = async () => {
    setLoading(true);
    try {
      await signInAnonymously();
      toast({
        title: "Anonymous sign-in successful",
        description: "Anonymous authentication is working!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Anonymous sign-in failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const testSupabaseConnection = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      toast({
        title: "Supabase connection successful",
        description: `Current user: ${data.user ? data.user.email : 'None'}`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Supabase connection failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Authentication Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm">
          <p><strong>Current User:</strong> {user ? user.email : 'Not signed in'}</p>
        </div>
        
        <div className="space-y-2">
          <Button 
            onClick={testSupabaseConnection} 
            disabled={loading}
            className="w-full"
          >
            Test Supabase Connection
          </Button>
          
          <Button 
            onClick={testAnonymousSignIn} 
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            Test Anonymous Sign-in
          </Button>
          
          <Button 
            onClick={testEmailSignIn} 
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            Test Email Sign-in
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 
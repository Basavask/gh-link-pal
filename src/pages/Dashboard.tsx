import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      toast({
        variant: "destructive",
        title: "Unauthorized",
        description: "Please sign in to access the dashboard.",
      });
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate, toast]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome to Your Dashboard</h1>
            <p className="text-muted-foreground">
              Signed in as <span className="font-semibold">{user.email}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Recent Documents */}
            <div className="bg-muted/50 p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Recent Documents</h2>
              <p className="text-muted-foreground mb-4">No documents uploaded yet.</p>
              <button className="text-primary hover:underline text-sm font-medium">
                Upload your first document →
              </button>
            </div>

            {/* Study Stats */}
            <div className="bg-muted/50 p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Study Statistics</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Flashcards Created:</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quizzes Taken:</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Study Time:</span>
                  <span className="font-medium">0 minutes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg border border-primary/20">
            <h2 className="text-xl font-semibold mb-4">Get Started</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button className="p-4 text-left bg-background rounded-md border hover:shadow-md transition-shadow">
                <div className="flex items-center mb-2">
                  <span className="h-8 w-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground text-sm font-bold">1</span>
                  <span className="ml-3 font-medium">Upload Document</span>
                </div>
                <p className="text-sm text-muted-foreground">PDF, DOCX, TXT, or CSV files supported</p>
              </button>
              
              <button className="p-4 text-left bg-background rounded-md border hover:shadow-md transition-shadow">
                <div className="flex items-center mb-2">
                  <span className="h-8 w-8 bg-secondary rounded-md flex items-center justify-center text-secondary-foreground text-sm font-bold">2</span>
                  <span className="ml-3 font-medium">Generate Study Tools</span>
                </div>
                <p className="text-sm text-muted-foreground">AI creates notes, flashcards, and quizzes</p>
              </button>
              
              <button className="p-4 text-left bg-background rounded-md border hover:shadow-md transition-shadow">
                <div className="flex items-center mb-2">
                  <span className="h-8 w-8 bg-accent rounded-md flex items-center justify-center text-accent-foreground text-sm font-bold">3</span>
                  <span className="ml-3 font-medium">Start Learning</span>
                </div>
                <p className="text-sm text-muted-foreground">Use AI-powered tools to master your material</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

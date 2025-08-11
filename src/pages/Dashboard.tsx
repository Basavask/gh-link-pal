import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import { DocumentUpload } from '@/components/DocumentUpload';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Brain, 
  Target, 
  Upload,
  CheckCircle,
  ArrowRight,
  Zap,
  Users,
  Clock,
  TrendingUp,
  Award,
  Sparkles
} from "lucide-react";

export default function Dashboard() {
  const { user, loading, signOut } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'notes' | 'flashcards' | 'quizzes'>('dashboard');
  
  // Move all hooks to the top - before any early returns
  const [processedDocuments, setProcessedDocuments] = useState<any[]>([]);
  const [currentNotes, setCurrentNotes] = useState<string>("");
  const [currentFlashcards, setCurrentFlashcards] = useState<any[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<any[]>([]);

  // Debug logging
  console.log('Dashboard render:', { loading, user: user?.email, userId: user?.id });

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

  // Fallback timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Dashboard loading timeout - forcing loading to false');
        // Force reload the page to reset auth state
        window.location.reload();
      }
    }, 15000); // 15 seconds timeout

    return () => clearTimeout(timeout);
  }, [loading]);



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

  // Handle document processing completion
  const handleDocumentProcessed = (documentData: any) => {
    const newDocument = {
      id: Date.now(),
      name: documentData.name,
      notes: documentData.notes,
      flashcards: documentData.flashcards,
      quizzes: documentData.quizzes,
      date: new Date().toLocaleDateString()
    };
    
    setProcessedDocuments(prev => [...prev, newDocument]);
    setCurrentNotes(documentData.notes);
    setCurrentFlashcards(documentData.flashcards);
    setCurrentQuiz(documentData.quizzes);
    
    toast({
      title: "Document processed successfully!",
      description: "Your study materials are ready.",
    });
  };

  // Handle viewing notes
  const handleViewNotes = () => {
    if (currentNotes) {
      setActiveTab('notes');
    } else {
      toast({
        variant: "destructive",
        title: "No notes available",
        description: "Please process a document first to generate notes.",
      });
    }
  };

  // Handle studying flashcards
  const handleStudyFlashcards = () => {
    if (currentFlashcards.length > 0) {
      setActiveTab('flashcards');
    } else {
      toast({
        variant: "destructive",
        title: "No flashcards available",
        description: "Please process a document first to generate flashcards.",
      });
    }
  };

  // Handle taking quiz
  const handleTakeQuiz = () => {
    if (currentQuiz.length > 0) {
      setActiveTab('quizzes');
      toast({
        title: "Quiz started!",
        description: "Answer the questions to test your knowledge.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "No quiz available",
        description: "Please process a document first to generate a quiz.",
      });
    }
  };

  // Render different tabs
  const renderContent = () => {
    switch (activeTab) {
      case 'notes':
        return (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold flex items-center">
                  <BookOpen className="h-8 w-8 mr-3 text-primary" />
                  Study Notes
                </h2>
                <p className="text-muted-foreground mt-1">AI-generated summaries and key points</p>
              </div>
              <Button 
                variant="outline"
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center"
              >
                <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                Back to Dashboard
              </Button>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-primary" />
                  AI-Generated Summary
                </CardTitle>
                <CardDescription>
                  Key concepts and important points extracted from your document
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  {currentNotes ? (
                    <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-6 rounded-lg border">
                      <p className="text-base leading-relaxed">{currentNotes}</p>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Notes Available</h3>
                      <p className="text-muted-foreground mb-4">
                        Process a document to generate AI-powered study notes.
                      </p>
                      <Button onClick={() => setActiveTab('dashboard')}>
                        Upload Document
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case 'flashcards':
        return (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold flex items-center">
                  <Brain className="h-8 w-8 mr-3 text-secondary" />
                  Smart Flashcards
                </h2>
                <p className="text-muted-foreground mt-1">Spaced repetition learning for better retention</p>
              </div>
              <Button 
                variant="outline"
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center"
              >
                <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                Back to Dashboard
              </Button>
            </div>
            
            <div className="grid gap-6">
              {currentFlashcards.length > 0 ? (
                currentFlashcards.map((card, index) => (
                  <Card key={card.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">Card {index + 1}</Badge>
                          <Badge variant="outline" className="text-primary border-primary">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI Generated
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {index + 1} of {currentFlashcards.length}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="bg-gradient-to-r from-secondary/5 to-accent/5 p-4 rounded-lg border">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                          <Target className="h-4 w-4 mr-2" />
                          Question
                        </h4>
                        <p className="text-lg font-medium">{card.front}</p>
                      </div>
                      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-4 rounded-lg border">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Answer
                        </h4>
                        <p className="text-lg">{card.back}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Flashcards Available</h3>
                    <p className="text-muted-foreground mb-4">
                      Process a document to generate flashcards for spaced repetition learning.
                    </p>
                    <Button onClick={() => setActiveTab('dashboard')}>
                      Upload Document
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );
      
      case 'quizzes':
        return (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold flex items-center">
                  <Target className="h-8 w-8 mr-3 text-accent" />
                  Practice Quiz
                </h2>
                <p className="text-muted-foreground mt-1">Test your knowledge with AI-generated questions</p>
              </div>
              <Button 
                variant="outline"
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center"
              >
                <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                Back to Dashboard
              </Button>
            </div>
            
            <div className="grid gap-6">
              {currentQuiz.length > 0 ? (
                currentQuiz.map((quiz, index) => (
                  <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">Question {index + 1}</Badge>
                          <Badge variant="outline" className="text-accent border-accent">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI Generated
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {index + 1} of {currentQuiz.length}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h3 className="text-lg font-medium mb-6">{quiz.question}</h3>
                      <div className="space-y-3">
                        {quiz.options.map((option: string, optIndex: number) => (
                          <Button
                            key={optIndex}
                            variant="outline"
                            className="w-full justify-start h-auto p-4 text-left hover:bg-accent/5 hover:border-accent transition-colors"
                          >
                            <div className="flex items-center">
                              <div className="h-8 w-8 bg-accent/10 rounded-full flex items-center justify-center mr-3 text-accent font-medium">
                                {String.fromCharCode(65 + optIndex)}
                              </div>
                              <span className="text-base">{option}</span>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Quiz Available</h3>
                    <p className="text-muted-foreground mb-4">
                      Process a document to generate a practice quiz to test your knowledge.
                    </p>
                    <Button onClick={() => setActiveTab('dashboard')}>
                      Upload Document
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );
      
      default:
        return (
          <div className="max-w-6xl mx-auto">
            {/* Welcome Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-between mb-6">
                <div></div>
                <div className="text-center">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                    Welcome to Your Learning Hub
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Ready to transform your study materials into powerful learning tools
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={signOut}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Sign Out
                </Button>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Signed in as <span className="font-semibold text-primary">{user.email}</span></span>
              </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-1">{processedDocuments.length}</h3>
                  <p className="text-sm text-muted-foreground">Documents Processed</p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="h-12 w-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Brain className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="text-2xl font-bold text-secondary mb-1">{currentFlashcards.length}</h3>
                  <p className="text-sm text-muted-foreground">Flashcards Created</p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="h-12 w-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold text-accent mb-1">0</h3>
                  <p className="text-sm text-muted-foreground">Quizzes Completed</p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="h-12 w-12 bg-study/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="h-6 w-6 text-study" />
                  </div>
                  <h3 className="text-2xl font-bold text-study mb-1">0m</h3>
                  <p className="text-sm text-muted-foreground">Study Time</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Upload Section */}
              <div className="lg:col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Upload className="h-5 w-5 mr-2 text-primary" />
                      Upload Study Materials
                    </CardTitle>
                    <CardDescription>
                      Transform your documents into AI-powered study materials
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DocumentUpload onDocumentProcessed={handleDocumentProcessed} />
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-secondary" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-auto p-4"
                      onClick={handleViewNotes}
                    >
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">View Notes</div>
                          <div className="text-xs text-muted-foreground">Review AI-generated summaries</div>
                        </div>
                      </div>
                    </Button>

                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-auto p-4"
                      onClick={handleStudyFlashcards}
                    >
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-secondary/10 rounded-lg flex items-center justify-center mr-3">
                          <Brain className="h-4 w-4 text-secondary" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">Study Flashcards</div>
                          <div className="text-xs text-muted-foreground">Spaced repetition learning</div>
                        </div>
                      </div>
                    </Button>

                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-auto p-4"
                      onClick={handleTakeQuiz}
                    >
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-accent/10 rounded-lg flex items-center justify-center mr-3">
                          <Target className="h-4 w-4 text-accent" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">Take Quiz</div>
                          <div className="text-xs text-muted-foreground">Test your knowledge</div>
                        </div>
                      </div>
                    </Button>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                {processedDocuments.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-accent" />
                        Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {processedDocuments.slice(0, 3).map((doc) => (
                        <div key={doc.id} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                          <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">{doc.date}</p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            Processed
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Tips Card */}
                <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Sparkles className="h-5 w-5 mr-2 text-primary" />
                      Pro Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <p>Upload PDFs for best AI processing results</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <p>Review flashcards regularly for better retention</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <p>Take quizzes to identify knowledge gaps</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {renderContent()}
      </div>
    </div>
  );
}

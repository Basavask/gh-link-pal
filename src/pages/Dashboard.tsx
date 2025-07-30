import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import { DocumentUpload } from '@/components/DocumentUpload';

export default function Dashboard() {
  const { user, loading } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'notes' | 'flashcards' | 'quizzes'>('dashboard');

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

  // Mock data for processed documents
  const [processedDocuments, setProcessedDocuments] = useState<any[]>([]);
  const [currentNotes, setCurrentNotes] = useState<string>("");
  const [currentFlashcards, setCurrentFlashcards] = useState<any[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<any[]>([]);

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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Study Notes</h2>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="text-primary hover:underline"
              >
                ← Back to Dashboard
              </button>
            </div>
            <div className="bg-muted/50 p-6 rounded-lg border min-h-96">
              <h3 className="text-lg font-semibold mb-4">AI-Generated Notes</h3>
              <div className="prose prose-sm max-w-none">
                <p>{currentNotes || "No notes available. Process a document to generate study notes."}</p>
              </div>
            </div>
          </div>
        );
      
      case 'flashcards':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Flashcards</h2>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="text-primary hover:underline"
              >
                ← Back to Dashboard
              </button>
            </div>
            <div className="grid gap-4">
              {currentFlashcards.length > 0 ? (
                currentFlashcards.map((card, index) => (
                  <div key={card.id} className="bg-card p-6 rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-muted-foreground">Flashcard {index + 1} of {currentFlashcards.length}</span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">AI Generated</span>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Question</h4>
                        <p className="text-base">{card.front}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Answer</h4>
                        <p className="text-base">{card.back}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Flashcards Available</h3>
                  <p className="text-muted-foreground mb-4">Process a document to generate flashcards for spaced repetition learning.</p>
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className="text-primary hover:underline"
                  >
                    Go to Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'quizzes':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Practice Quiz</h2>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="text-primary hover:underline"
              >
                ← Back to Dashboard
              </button>
            </div>
            <div className="grid gap-6">
              {currentQuiz.length > 0 ? (
                currentQuiz.map((quiz, index) => (
                  <div key={quiz.id} className="bg-card p-6 rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-muted-foreground">Question {index + 1}</span>
                      <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">AI Generated</span>
                    </div>
                    <h3 className="text-base font-medium mb-4">{quiz.question}</h3>
                    <div className="space-y-2">
                      {quiz.options.map((option: string, optIndex: number) => (
                        <button
                          key={optIndex}
                          className="w-full text-left p-3 border rounded-md hover:bg-muted/50 transition-colors"
                        >
                          <span className="font-medium mr-2">
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Quiz Available</h3>
                  <p className="text-muted-foreground mb-4">Process a document to generate a practice quiz to test your knowledge.</p>
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className="text-primary hover:underline"
                  >
                    Go to Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      
      default:
        return (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Welcome to Your Dashboard</h1>
              <p className="text-muted-foreground">
                Signed in as <span className="font-semibold">{user.email}</span>
              </p>
            </div>

            <DocumentUpload onDocumentProcessed={handleDocumentProcessed} />

            {/* Recent Documents */}
            {processedDocuments.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Recent Documents</h2>
                <div className="grid gap-4">
                  {processedDocuments.map((doc) => (
                    <div key={doc.id} className="bg-muted/50 p-4 rounded-lg border flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{doc.name}</h3>
                        <p className="text-sm text-muted-foreground">Processed on {doc.date}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={handleViewNotes}
                          className="text-sm bg-primary text-primary-foreground px-3 py-1 rounded hover:bg-primary/90 transition-colors"
                        >
                          View Notes
                        </button>
                        <button 
                          onClick={handleStudyFlashcards}
                          className="text-sm bg-secondary text-secondary-foreground px-3 py-1 rounded hover:bg-secondary/90 transition-colors"
                        >
                          Study Flashcards
                        </button>
                        <button 
                          onClick={handleTakeQuiz}
                          className="text-sm bg-accent text-accent-foreground px-3 py-1 rounded hover:bg-accent/90 transition-colors"
                        >
                          Take Quiz
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Study Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-muted/50 p-6 rounded-lg border">
                <h2 className="text-xl font-semibold mb-4">Study Statistics</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Flashcards Created:</span>
                    <span className="font-medium">{currentFlashcards.length}</span>
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
                  
                  <button 
                    onClick={handleViewNotes}
                    className="p-4 text-left bg-background rounded-md border hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center mb-2">
                      <span className="h-8 w-8 bg-secondary rounded-md flex items-center justify-center text-secondary-foreground text-sm font-bold">2</span>
                      <span className="ml-3 font-medium">View Notes</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Review AI-generated study notes</p>
                  </button>
                  
                  <button 
                    onClick={handleStudyFlashcards}
                    className="p-4 text-left bg-background rounded-md border hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center mb-2">
                      <span className="h-8 w-8 bg-accent rounded-md flex items-center justify-center text-accent-foreground text-sm font-bold">3</span>
                      <span className="ml-3 font-medium">Study Flashcards</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Use spaced repetition to master content</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {renderContent()}
      </div>
    </div>
  );
}

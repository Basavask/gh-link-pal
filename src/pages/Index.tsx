import { useState } from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { DocumentUpload } from '@/components/DocumentUpload';
import { StudyTools } from '@/components/StudyTools';
import { HowItWorks } from '@/components/HowItWorks';
import { Pricing } from '@/components/Pricing';
import { About } from '@/components/About';
import { Footer } from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Brain, 
  Target, 
  Upload,
  CheckCircle,
  ArrowRight,
  Zap,
  Users,
  Shield,
  Star
} from "lucide-react";

const Index = () => {
  const [showStudyTools, setShowStudyTools] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {!showStudyTools ? (
        <main>
          <HeroSection />
          
          {/* Upload Section */}
          <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                  Start Learning in <span className="bg-gradient-primary bg-clip-text text-transparent">3 Simple Steps</span>
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Transform your documents into comprehensive study materials with our AI-powered platform
                </p>
              </div>
              
              <DocumentUpload />
              
              <div className="text-center mt-12">
                <Button 
                  onClick={() => setShowStudyTools(true)}
                  className="bg-gradient-primary hover:opacity-90 shadow-glow"
                  size="lg"
                >
                  Try Demo with Sample Document
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="py-20">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                  Everything You Need to <span className="bg-gradient-primary bg-clip-text text-transparent">Study Smarter</span>
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Our AI analyzes your documents and creates personalized study materials tailored to your learning style
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Smart Notes */}
                <Card className="p-8 text-center space-y-4 border-2 hover:shadow-glow transition-all duration-300 group">
                  <div className="h-16 w-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">Smart Notes</h3>
                  <p className="text-muted-foreground">
                    AI extracts key concepts and creates concise, organized summaries from your documents
                  </p>
                  <div className="pt-2">
                    <Badge className="bg-primary/10 text-primary">Instant Generation</Badge>
                  </div>
                </Card>

                {/* Interactive Flashcards */}
                <Card className="p-8 text-center space-y-4 border-2 hover:shadow-glow transition-all duration-300 group">
                  <div className="h-16 w-16 bg-gradient-to-br from-secondary to-secondary/80 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Brain className="h-8 w-8 text-secondary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">Smart Flashcards</h3>
                  <p className="text-muted-foreground">
                    Spaced repetition system that adapts to your learning pace and focuses on weak areas
                  </p>
                  <div className="pt-2">
                    <Badge className="bg-secondary/10 text-secondary">Adaptive Learning</Badge>
                  </div>
                </Card>

                {/* Practice Quizzes */}
                <Card className="p-8 text-center space-y-4 border-2 hover:shadow-glow transition-all duration-300 group">
                  <div className="h-16 w-16 bg-gradient-to-br from-accent to-accent/80 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-8 w-8 text-accent-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">Practice Quizzes</h3>
                  <p className="text-muted-foreground">
                    Personalized quizzes with detailed explanations to test your understanding
                  </p>
                  <div className="pt-2">
                    <Badge className="bg-accent/10 text-accent">Instant Feedback</Badge>
                  </div>
                </Card>

                {/* AI Tutor */}
                <Card className="p-8 text-center space-y-4 border-2 hover:shadow-glow transition-all duration-300 group">
                  <div className="h-16 w-16 bg-gradient-study rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Zap className="h-8 w-8 text-study-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">AI Tutor Chat</h3>
                  <p className="text-muted-foreground">
                    Ask questions and get instant explanations from your personal AI tutor
                  </p>
                  <div className="pt-2">
                    <Badge className="bg-study/10 text-study">24/7 Available</Badge>
                  </div>
                </Card>

                {/* Progress Tracking */}
                <Card className="p-8 text-center space-y-4 border-2 hover:shadow-glow transition-all duration-300 group">
                  <div className="h-16 w-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">Progress Tracking</h3>
                  <p className="text-muted-foreground">
                    Visual analytics show your learning progress and identify areas for improvement
                  </p>
                  <div className="pt-2">
                    <Badge className="bg-primary/10 text-primary">Real-time Analytics</Badge>
                  </div>
                </Card>

                {/* Multi-format Support */}
                <Card className="p-8 text-center space-y-4 border-2 hover:shadow-glow transition-all duration-300 group">
                  <div className="h-16 w-16 bg-gradient-to-br from-secondary to-secondary/80 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Upload className="h-8 w-8 text-secondary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">Multi-format Support</h3>
                  <p className="text-muted-foreground">
                    Upload PDF, DOCX, TXT, and CSV files - we handle all the processing
                  </p>
                  <div className="pt-2">
                    <Badge className="bg-secondary/10 text-secondary">Universal Compatibility</Badge>
                  </div>
                </Card>
              </div>
            </div>
          </section>

          {/* Social Proof Section */}
          <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                  Trusted by <span className="bg-gradient-primary bg-clip-text text-transparent">Students Worldwide</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="p-8 text-center space-y-4">
                  <div className="flex justify-center mb-4">
                    {Array(5).fill(null).map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                <p className="text-muted-foreground italic">
                  "LearnLift helped me improve my grades by 30%. The flashcards are incredibly effective!"
                </p>
                  <p className="font-semibold">Sarah, Computer Science Student</p>
                </Card>

                <Card className="p-8 text-center space-y-4">
                  <div className="flex justify-center mb-4">
                    {Array(5).fill(null).map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic">
                    "The AI tutor is like having a personal study buddy. It answers all my questions instantly."
                  </p>
                  <p className="font-semibold">Mike, Medical Student</p>
                </Card>

                <Card className="p-8 text-center space-y-4">
                  <div className="flex justify-center mb-4">
                    {Array(5).fill(null).map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic">
                    "I save hours of study time. The notes are perfectly organized and easy to understand."
                  </p>
                  <p className="font-semibold">Emma, Business Student</p>
                </Card>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary">10,000+</div>
                  <p className="text-muted-foreground">Active Students</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-secondary">50,000+</div>
                  <p className="text-muted-foreground">Documents Processed</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent">95%</div>
                  <p className="text-muted-foreground">Success Rate</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-study">4.9/5</div>
                  <p className="text-muted-foreground">Average Rating</p>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <HowItWorks />

          {/* Pricing */}
          <Pricing />

          {/* About */}
          <About />

          {/* CTA Section */}
          <section className="py-20 bg-gradient-primary text-primary-foreground">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Ready to Transform Your Learning?
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Join thousands of students who are already studying smarter with AI-powered tools
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                  <Upload className="h-5 w-5 mr-2" />
                  Start Free Trial
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  View Pricing
                </Button>
              </div>
            </div>
          </section>
        </main>
      ) : (
        <main className="py-8">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <Button 
                variant="outline" 
                onClick={() => setShowStudyTools(false)}
                className="mb-4"
              >
                ← Back to Home
              </Button>
            </div>
            <StudyTools />
          </div>
        </main>
      )}
      
      {!showStudyTools && <Footer />}
    </div>
  );
};

export default Index;

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Upload, 
  Brain, 
  Target, 
  BookOpen, 
  ArrowRight,
  Play,
  Sparkles,
  Clock,
  TrendingUp
} from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

export const HeroSection = () => {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                <span>AI-Powered Learning Platform</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-primary bg-clip-text text-transparent">LearnLift:</span>
                <span className="block">Elevate Your Learning Experience</span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Transform any document into AI-powered study materials. Get instant notes, smart flashcards, 
                and adaptive quizzes that help you learn faster and retain more.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-card rounded-lg border">
                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Instant Processing</p>
                  <p className="text-xs text-muted-foreground">Ready in seconds</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-card rounded-lg border">
                <div className="h-10 w-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Brain className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="font-medium text-sm">AI-Powered</p>
                  <p className="text-xs text-muted-foreground">Smart learning</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-card rounded-lg border">
                <div className="h-10 w-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-sm">Track Progress</p>
                  <p className="text-xs text-muted-foreground">See improvement</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 shadow-glow">
                <Upload className="h-5 w-5 mr-2" />
                Upload Your First Document
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <Button variant="outline" size="lg" className="group">
                <Play className="h-4 w-4 mr-2 group-hover:text-primary transition-colors" />
                Watch Demo
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  <div className="h-8 w-8 bg-primary/20 rounded-full border-2 border-background" />
                  <div className="h-8 w-8 bg-secondary/20 rounded-full border-2 border-background" />
                  <div className="h-8 w-8 bg-accent/20 rounded-full border-2 border-background" />
                </div>
                <span>Trusted by 10,000+ students</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="flex text-yellow-400">
                  {Array(5).fill(null).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <span>4.9/5 rating</span>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative z-10">
              <img 
                src={heroImage} 
                alt="AI Study Platform Dashboard" 
                className="w-full rounded-2xl shadow-large"
              />
              
              {/* Floating Cards */}
              <Card className="absolute -top-4 -left-4 p-4 bg-card/90 backdrop-blur-sm border shadow-medium">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Smart Notes</p>
                    <p className="text-xs text-muted-foreground">AI Generated</p>
                  </div>
                </div>
              </Card>
              
              <Card className="absolute -bottom-4 -right-4 p-4 bg-card/90 backdrop-blur-sm border shadow-medium">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Target className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">95% Score</p>
                    <p className="text-xs text-muted-foreground">Latest Quiz</p>
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-primary rounded-2xl blur-3xl opacity-20 scale-110" />
          </div>
        </div>
      </div>
    </section>
  );
};
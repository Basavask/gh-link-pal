import { Upload, Brain, Target, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";

export const HowItWorks = () => {
  const steps = [
    {
      icon: Upload,
      title: "Upload Your Document",
      description: "Simply drag and drop your PDF, DOCX, or TXT files. Our AI instantly analyzes the content.",
      color: "primary"
    },
    {
      icon: Brain,
      title: "AI Processes Content",
      description: "Advanced AI extracts key concepts, creates summaries, and identifies important learning points.",
      color: "secondary"
    },
    {
      icon: Target,
      title: "Generate Study Materials",
      description: "Get personalized notes, flashcards, and quizzes tailored to your learning style.",
      color: "accent"
    },
    {
      icon: Zap,
      title: "Learn & Track Progress",
      description: "Study with interactive tools and track your progress with detailed analytics.",
      color: "study"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            How <span className="bg-gradient-primary bg-clip-text text-transparent">LearnLift</span> Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your documents into powerful study materials in just 4 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className="relative">
                <Card className="p-8 text-center space-y-4 h-full hover:shadow-glow transition-all duration-300 group">
                  <div className="relative">
                    <div className={`h-16 w-16 bg-gradient-${step.color === 'primary' ? 'primary' : step.color === 'secondary' ? 'to-br from-secondary to-secondary/80' : step.color === 'accent' ? 'to-br from-accent to-accent/80' : 'study'} rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className={`h-8 w-8 text-${step.color}-foreground`} />
                    </div>
                    <div className="absolute -top-2 -right-2 h-8 w-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </Card>
                
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <div className="w-8 h-0.5 bg-gradient-primary"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
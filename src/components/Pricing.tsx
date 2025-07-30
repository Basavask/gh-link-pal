import { Check, Zap, Crown, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Pricing = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for trying out LearnLift",
      icon: Zap,
      features: [
        "5 documents per month",
        "Basic AI notes generation",
        "Simple flashcards",
        "Basic quizzes",
        "Email support"
      ],
      buttonText: "Get Started",
      popular: false
    },
    {
      name: "Student",
      price: "$9.99",
      period: "per month",
      description: "Everything you need for academic success",
      icon: Crown,
      features: [
        "Unlimited documents",
        "Advanced AI study tools",
        "Smart flashcards with spaced repetition",
        "Adaptive quizzes with explanations",
        "Progress tracking & analytics",
        "AI tutor chat",
        "Priority support",
        "Mobile app access"
      ],
      buttonText: "Start Free Trial",
      popular: true
    },
    {
      name: "Team",
      price: "$19.99",
      period: "per user/month",
      description: "Collaboration tools for study groups",
      icon: Users,
      features: [
        "Everything in Student",
        "Team collaboration",
        "Shared study materials",
        "Group progress tracking",
        "Admin dashboard",
        "Custom integrations",
        "Dedicated support",
        "Advanced analytics"
      ],
      buttonText: "Contact Sales",
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Simple, <span className="bg-gradient-primary bg-clip-text text-transparent">Transparent</span> Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your learning journey. Upgrade or downgrade at any time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            return (
              <Card key={index} className={`relative p-8 space-y-6 ${plan.popular ? 'border-primary shadow-glow ring-2 ring-primary/20' : ''} hover:shadow-glow transition-all duration-300`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}
                
                <div className="text-center space-y-4">
                  <div className={`h-16 w-16 ${plan.popular ? 'bg-gradient-primary' : 'bg-muted'} rounded-2xl flex items-center justify-center mx-auto`}>
                    <IconComponent className={`h-8 w-8 ${plan.popular ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <p className="text-muted-foreground">{plan.description}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-4xl font-bold">
                      {plan.price}
                      <span className="text-lg text-muted-foreground font-normal">/{plan.period}</span>
                    </div>
                  </div>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-accent flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full ${plan.popular ? 'bg-gradient-primary hover:opacity-90' : ''}`}
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                >
                  {plan.buttonText}
                </Button>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </div>
    </section>
  );
};
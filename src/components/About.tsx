import { GraduationCap, Code, Users, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const About = () => {
  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            About <span className="bg-gradient-primary bg-clip-text text-transparent">LearnLift</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Empowering students worldwide with AI-powered learning tools
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Founder Info */}
          <div className="space-y-6">
            <Card className="p-8 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-gradient-primary rounded-full flex items-center justify-center">
                  <GraduationCap className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Basavaraj S K</h3>
                  <p className="text-muted-foreground">Founder & Creator</p>
                  <Badge className="bg-primary/10 text-primary mt-2">Sr. Application Developer at IBM</Badge>
                </div>
              </div>
              
              <p className="text-muted-foreground leading-relaxed">
                As an experienced Software Engineer with a demonstrated history in the computer software industry, 
                I understand the challenges students face in managing their learning materials. With expertise in 
                web applications, mobile development, and AI technologies, I created LearnLift to revolutionize 
                how students study and retain information.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center space-y-2">
                  <Code className="h-8 w-8 text-primary mx-auto" />
                  <p className="font-semibold">Tech Expertise</p>
                  <p className="text-sm text-muted-foreground">Angular, React, Java, AI/ML</p>
                </div>
                <div className="text-center space-y-2">
                  <Users className="h-8 w-8 text-secondary mx-auto" />
                  <p className="font-semibold">Community</p>
                  <p className="text-sm text-muted-foreground">Speaker at meetups & events</p>
                </div>
              </div>

              <Button variant="outline" className="w-full" asChild>
                <a href="https://www.linkedin.com/in/basavaraj-s-k-798631125/" target="_blank" rel="noopener noreferrer">
                  Connect on LinkedIn
                </a>
              </Button>
            </Card>
          </div>

          {/* Mission & Vision */}
          <div className="space-y-8">
            <Card className="p-8 space-y-4">
              <div className="flex items-center space-x-3">
                <Award className="h-8 w-8 text-accent" />
                <h3 className="text-xl font-bold">Our Mission</h3>
              </div>
              <p className="text-muted-foreground">
                To democratize education by making advanced AI-powered study tools accessible to every student, 
                regardless of their background or financial situation. We believe that with the right tools, 
                every student can achieve academic excellence.
              </p>
            </Card>

            <Card className="p-8 space-y-4">
              <div className="flex items-center space-x-3">
                <GraduationCap className="h-8 w-8 text-primary" />
                <h3 className="text-xl font-bold">Why LearnLift?</h3>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Built by someone who understands student struggles</li>
                <li>• Combines cutting-edge AI with practical learning science</li>
                <li>• Designed for the modern, fast-paced academic environment</li>
                <li>• Continuously evolving based on student feedback</li>
              </ul>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-6 bg-primary/5 rounded-lg">
                <div className="text-2xl font-bold text-primary">10,000+</div>
                <p className="text-sm text-muted-foreground">Students Helped</p>
              </div>
              <div className="text-center p-6 bg-secondary/5 rounded-lg">
                <div className="text-2xl font-bold text-secondary">50,000+</div>
                <p className="text-sm text-muted-foreground">Documents Processed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
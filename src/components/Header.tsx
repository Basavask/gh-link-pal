import { Button } from "@/components/ui/button";
import { GraduationCap, Menu, User, BookOpen, FileText, BrainCircuit } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <GraduationCap className="h-8 w-8 text-primary" />
            <BrainCircuit className="h-4 w-4 text-secondary absolute -top-1 -right-1" />
          </div>
          <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            LearnLift
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
            How It Works
          </a>
          <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </a>
          <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
            About
          </a>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          <Button variant="ghost" size="sm">
            <User className="h-4 w-4 mr-2" />
            Sign In
          </Button>
          <Button variant="default" size="sm" className="bg-gradient-primary hover:opacity-90">
            Get Started
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <a href="#features" className="block text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="block text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="block text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
            <a href="#about" className="block text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
            <div className="pt-4 border-t border-border space-y-2">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
              <Button variant="default" size="sm" className="w-full bg-gradient-primary hover:opacity-90">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
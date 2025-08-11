import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Brain, 
  Target, 
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  CheckCircle,
  XCircle,
  Star
} from "lucide-react";

interface Flashcard {
  id: number;
  front: string;
  back: string;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export const StudyTools = () => {
  const [activeTab, setActiveTab] = useState<'notes' | 'flashcards' | 'quiz'>('notes');
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Sample data
  const notes = `# AI-Generated Study Notes

## Key Concepts

### 1. Machine Learning Fundamentals
Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions without being explicitly programmed.

**Key Points:**
- Supervised vs Unsupervised Learning
- Training Data and Validation
- Model Performance Metrics

### 2. Neural Networks
Neural networks are computational models inspired by biological neural networks.

**Components:**
- Input Layer
- Hidden Layers
- Output Layer
- Activation Functions

### 3. Deep Learning
Deep learning uses multiple layers of neural networks to model complex patterns.

**Applications:**
- Computer Vision
- Natural Language Processing
- Speech Recognition

## Summary
This document covers the fundamental concepts of machine learning, neural networks, and deep learning, providing a solid foundation for understanding AI technologies.`;

  const flashcards: Flashcard[] = [
    {
      id: 1,
      front: "What is Machine Learning?",
      back: "Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions without being explicitly programmed."
    },
    {
      id: 2,
      front: "What are the main types of Machine Learning?",
      back: "The main types are: 1) Supervised Learning, 2) Unsupervised Learning, 3) Reinforcement Learning"
    },
    {
      id: 3,
      front: "What is a Neural Network?",
      back: "A neural network is a computational model inspired by biological neural networks, consisting of interconnected nodes (neurons) that process information."
    },
    {
      id: 4,
      front: "What is Deep Learning?",
      back: "Deep learning is a subset of machine learning that uses multiple layers of neural networks to model complex patterns and relationships in data."
    },
    {
      id: 5,
      front: "What are Activation Functions?",
      back: "Activation functions introduce non-linearity into neural networks, allowing them to learn complex patterns. Common examples include ReLU, Sigmoid, and Tanh."
    }
  ];

  const quizQuestions: QuizQuestion[] = [
    {
      id: 1,
      question: "Which of the following is NOT a type of machine learning?",
      options: ["Supervised Learning", "Unsupervised Learning", "Reinforcement Learning", "Static Learning"],
      correctAnswer: 3
    },
    {
      id: 2,
      question: "What is the primary purpose of activation functions in neural networks?",
      options: ["To increase computational speed", "To introduce non-linearity", "To reduce memory usage", "To simplify the model"],
      correctAnswer: 1
    },
    {
      id: 3,
      question: "Which layer in a neural network receives the input data?",
      options: ["Hidden Layer", "Output Layer", "Input Layer", "Processing Layer"],
      correctAnswer: 2
    },
    {
      id: 4,
      question: "What is the main advantage of deep learning over traditional machine learning?",
      options: ["Faster training time", "Lower computational cost", "Better feature extraction", "Simpler implementation"],
      correctAnswer: 2
    },
    {
      id: 5,
      question: "Which of the following is a common application of deep learning?",
      options: ["Spreadsheet calculations", "Computer vision", "Database management", "File compression"],
      correctAnswer: 1
    }
  ];

  const handleFlashcardNext = () => {
    if (currentFlashcardIndex < flashcards.length - 1) {
      setCurrentFlashcardIndex(currentFlashcardIndex + 1);
      setShowFlashcardAnswer(false);
    }
  };

  const handleFlashcardPrevious = () => {
    if (currentFlashcardIndex > 0) {
      setCurrentFlashcardIndex(currentFlashcardIndex - 1);
      setShowFlashcardAnswer(false);
    }
  };

  const handleQuizAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return; // Prevent multiple selections
    
    setSelectedAnswer(answerIndex);
    
    if (answerIndex === quizQuestions[currentQuizIndex].correctAnswer) {
      setQuizScore(quizScore + 1);
    }
  };

  const handleQuizNext = () => {
    if (currentQuizIndex < quizQuestions.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setSelectedAnswer(null);
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setQuizCompleted(false);
  };

  const renderNotes = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Study Notes</h2>
        <Badge className="bg-primary/10 text-primary">AI Generated</Badge>
      </div>
      <Card className="p-6">
        <div className="prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{notes}</pre>
        </div>
      </Card>
    </div>
  );

  const renderFlashcards = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Flashcards</h2>
        <div className="flex items-center space-x-2">
          <Badge className="bg-secondary/10 text-secondary">Spaced Repetition</Badge>
          <span className="text-sm text-muted-foreground">
            {currentFlashcardIndex + 1} of {flashcards.length}
          </span>
        </div>
      </div>
      
      <Card className="p-8 text-center min-h-64 flex flex-col justify-center">
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Question</h3>
            <p className="text-lg">{flashcards[currentFlashcardIndex].front}</p>
          </div>
          
          {showFlashcardAnswer && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-xl font-semibold text-secondary">Answer</h3>
              <p className="text-lg">{flashcards[currentFlashcardIndex].back}</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-center space-x-4 mt-8">
          <Button
            variant="outline"
            onClick={handleFlashcardPrevious}
            disabled={currentFlashcardIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <Button
            onClick={() => setShowFlashcardAnswer(!showFlashcardAnswer)}
            className="bg-secondary hover:bg-secondary/90"
          >
            {showFlashcardAnswer ? 'Hide Answer' : 'Show Answer'}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleFlashcardNext}
            disabled={currentFlashcardIndex === flashcards.length - 1}
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderQuiz = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Practice Quiz</h2>
        <div className="flex items-center space-x-2">
          <Badge className="bg-accent/10 text-accent">Adaptive Learning</Badge>
          <span className="text-sm text-muted-foreground">
            {currentQuizIndex + 1} of {quizQuestions.length}
          </span>
        </div>
      </div>
      
      {!quizCompleted ? (
        <Card className="p-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Question {currentQuizIndex + 1}</h3>
              <p className="text-lg">{quizQuestions[currentQuizIndex].question}</p>
            </div>
            
            <div className="space-y-3">
              {quizQuestions[currentQuizIndex].options.map((option, index) => (
                <Button
                  key={index}
                  variant={selectedAnswer === index ? "default" : "outline"}
                  className={`w-full justify-start text-left h-auto p-4 ${
                    selectedAnswer !== null && index === quizQuestions[currentQuizIndex].correctAnswer
                      ? 'bg-green-100 border-green-500 text-green-700'
                      : selectedAnswer === index && selectedAnswer !== quizQuestions[currentQuizIndex].correctAnswer
                      ? 'bg-red-100 border-red-500 text-red-700'
                      : ''
                  }`}
                  onClick={() => handleQuizAnswer(index)}
                  disabled={selectedAnswer !== null}
                >
                  <span className="font-medium mr-3">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option}
                  {selectedAnswer !== null && index === quizQuestions[currentQuizIndex].correctAnswer && (
                    <CheckCircle className="h-5 w-5 ml-auto text-green-600" />
                  )}
                  {selectedAnswer === index && selectedAnswer !== quizQuestions[currentQuizIndex].correctAnswer && (
                    <XCircle className="h-5 w-5 ml-auto text-red-600" />
                  )}
                </Button>
              ))}
            </div>
            
            {selectedAnswer !== null && (
              <div className="flex justify-center">
                <Button onClick={handleQuizNext} className="bg-accent hover:bg-accent/90">
                  {currentQuizIndex === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="h-16 w-16 bg-accent/10 rounded-full flex items-center justify-center">
                <Star className="h-8 w-8 text-accent" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Quiz Completed!</h3>
              <p className="text-lg text-muted-foreground">
                You scored {quizScore} out of {quizQuestions.length}
              </p>
              <p className="text-2xl font-bold text-accent">
                {Math.round((quizScore / quizQuestions.length) * 100)}%
              </p>
            </div>
            
            <Button onClick={resetQuiz} className="bg-accent hover:bg-accent/90">
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake Quiz
            </Button>
          </div>
        </Card>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg mb-8">
        <Button
          variant={activeTab === 'notes' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('notes')}
          className="flex-1"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Notes
        </Button>
        <Button
          variant={activeTab === 'flashcards' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('flashcards')}
          className="flex-1"
        >
          <Brain className="h-4 w-4 mr-2" />
          Flashcards
        </Button>
        <Button
          variant={activeTab === 'quiz' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('quiz')}
          className="flex-1"
        >
          <Target className="h-4 w-4 mr-2" />
          Quiz
        </Button>
      </div>

      {/* Content */}
      {activeTab === 'notes' && renderNotes()}
      {activeTab === 'flashcards' && renderFlashcards()}
      {activeTab === 'quiz' && renderQuiz()}
    </div>
  );
}; 
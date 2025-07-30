import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { 
  Upload, 
  FileText, 
  File, 
  CheckCircle, 
  AlertCircle,
  X,
  BookOpen,
  Brain,
  Target
} from "lucide-react";

interface UploadedFile {
  id: string;
  file: File;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  processedData?: {
    notes: string;
    flashcards: any[];
    quizzes: any[];
  };
}

interface DocumentUploadProps {
  onDocumentProcessed?: (data: any) => void;
}

export const DocumentUpload = ({ onDocumentProcessed }: DocumentUploadProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const fileId = Math.random().toString(36).substr(2, 9);
      
      setUploadedFiles(prev => [...prev, {
        id: fileId,
        file,
        status: 'uploading',
        progress: 0
      }]);

      // Simulate file upload and processing
      simulateFileProcessing(fileId, file);
    });
  }, []);

  const simulateFileProcessing = async (fileId: string, file: File) => {
    try {
      // Upload simulation
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadedFiles(prev => 
          prev.map(f => f.id === fileId ? { ...f, progress: i } : f)
        );
      }

      // Processing simulation
      setUploadedFiles(prev => 
        prev.map(f => f.id === fileId ? { ...f, status: 'processing', progress: 0 } : f)
      );

      for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setUploadedFiles(prev => 
          prev.map(f => f.id === fileId ? { ...f, progress: i } : f)
        );
      }

      // Complete processing with realistic AI-generated content
      const processedData = {
        notes: `Based on the document "${file.name}", here are the key points:

1. The document covers fundamental concepts in the subject matter, focusing on core principles and their applications.
2. Key topics include theoretical foundations, practical implementations, and real-world examples.
3. The material is structured to build understanding progressively, starting with basics and advancing to complex applications.
4. Important terminology and definitions are clearly explained throughout the document.
5. Case studies and examples demonstrate how concepts are applied in practice.

This summary captures the essential information needed for effective studying and retention.`,
        flashcards: Array(10).fill(null).map((_, i) => ({ 
          id: i, 
          front: `What is the significance of concept ${i+1} in this context?`, 
          back: `Concept ${i+1} is important because it forms the foundation for understanding more complex topics in this field. It demonstrates the relationship between theoretical principles and practical applications.` 
        })),
        quizzes: Array(5).fill(null).map((_, i) => ({ 
          id: i, 
          question: `What is the primary function of system component ${i+1}?`,
          options: [
            `To process input data and generate appropriate outputs`,
            `To store information for later retrieval`,
            `To coordinate operations between different system elements`, 
            `To provide user interface functionality`
          ],
          correctAnswer: 0
        }))
      };

      // Update file status and data
      setUploadedFiles(prev => 
        prev.map(f => f.id === fileId ? { 
          ...f, 
          status: 'completed', 
          progress: 100,
          processedData: processedData
        } : f)
      );

      // Notify parent component
      if (onDocumentProcessed) {
        onDocumentProcessed({
          name: file.name,
          ...processedData
        });
      }

      toast({
        title: "Document processed successfully!",
        description: "Your study materials are ready.",
      });
    } catch (error) {
      setUploadedFiles(prev => 
        prev.map(f => f.id === fileId ? { ...f, status: 'error', progress: 100 } : f)
      );
      toast({
        variant: "destructive",
        title: "Processing failed",
        description: "Could not process the document. Please try again.",
      });
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'docx':
        return <File className="h-5 w-5 text-blue-500" />;
      case 'txt':
        return <FileText className="h-5 w-5 text-gray-500" />;
      case 'csv':
        return <File className="h-5 w-5 text-green-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-accent" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Upload Area */}
      <Card className="p-8 bg-gradient-card border-2 border-dashed border-border hover:border-primary transition-all duration-300">
        <div
          {...getRootProps()}
          className={`text-center cursor-pointer transition-all duration-300 ${
            isDragActive ? 'scale-105' : ''
          }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow">
              <Upload className="h-8 w-8 text-primary-foreground" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">
                {isDragActive ? 'Drop your documents here' : 'Upload your study materials'}
              </h3>
              <p className="text-muted-foreground">
                Drag & drop files here, or click to browse
              </p>
              <p className="text-sm text-muted-foreground">
                Supports PDF, DOCX, TXT, CSV (max 50MB)
              </p>
            </div>

            <Button variant="outline" className="mt-4">
              <Upload className="h-4 w-4 mr-2" />
              Choose Files
            </Button>
          </div>
        </div>
      </Card>

      {/* Processing Summary */}
      {uploadedFiles.length > 0 && (
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">Smart Notes</p>
              <p className="text-xs text-muted-foreground">AI-generated summaries</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Brain className="h-8 w-8 text-secondary mx-auto mb-2" />
              <p className="text-sm font-medium">Flashcards</p>
              <p className="text-xs text-muted-foreground">Spaced repetition system</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Target className="h-8 w-8 text-accent mx-auto mb-2" />
              <p className="text-sm font-medium">Practice Quizzes</p>
              <p className="text-xs text-muted-foreground">Adaptive learning</p>
            </div>
          </div>

          {/* File List */}
          <div className="space-y-3">
            {uploadedFiles.map((uploadedFile) => (
              <div key={uploadedFile.id} className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3 flex-1">
                  {getFileIcon(uploadedFile.file.name)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{uploadedFile.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(uploadedFile.file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {uploadedFile.status !== 'completed' && uploadedFile.status !== 'error' && (
                    <div className="w-24">
                      <Progress value={uploadedFile.progress} className="h-2" />
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground capitalize">
                      {uploadedFile.status}
                    </span>
                    {getStatusIcon(uploadedFile.status)}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(uploadedFile.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Study Tools Preview */}
      {uploadedFiles.some(f => f.status === 'completed') && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Your Study Materials Are Ready!</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex-col space-y-2"
              onClick={onDocumentProcessed ? () => onDocumentProcessed({
                name: uploadedFiles.find(f => f.status === 'completed')?.file.name || 'Document',
                notes: "AI-generated notes from your document",
                flashcards: Array(10).fill(null).map((_, i) => ({ id: i, front: `Question ${i+1}`, back: `Answer ${i+1}` })),
                quizzes: Array(5).fill(null).map((_, i) => ({ id: i, question: `Quiz question ${i+1}`, options: ['A', 'B', 'C', 'D'] }))
              }) : undefined}
            >
              <BookOpen className="h-6 w-6 text-primary" />
              <span>View Notes</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex-col space-y-2"
              onClick={onDocumentProcessed ? () => onDocumentProcessed({
                name: uploadedFiles.find(f => f.status === 'completed')?.file.name || 'Document',
                notes: "AI-generated notes from your document",
                flashcards: Array(10).fill(null).map((_, i) => ({ id: i, front: `Question ${i+1}`, back: `Answer ${i+1}` })),
                quizzes: Array(5).fill(null).map((_, i) => ({ id: i, question: `Quiz question ${i+1}`, options: ['A', 'B', 'C', 'D'] }))
              }) : undefined}
            >
              <Brain className="h-6 w-6 text-secondary" />
              <span>Study Flashcards</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex-col space-y-2"
              onClick={onDocumentProcessed ? () => onDocumentProcessed({
                name: uploadedFiles.find(f => f.status === 'completed')?.file.name || 'Document',
                notes: "AI-generated notes from your document",
                flashcards: Array(10).fill(null).map((_, i) => ({ id: i, front: `Question ${i+1}`, back: `Answer ${i+1}` })),
                quizzes: Array(5).fill(null).map((_, i) => ({ id: i, question: `Quiz question ${i+1}`, options: ['A', 'B', 'C', 'D'] }))
              }) : undefined}
            >
              <Target className="h-6 w-6 text-accent" />
              <span>Take Quiz</span>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

// User Types
export interface User {
  id: string;
  email?: string;
  role: 'student' | 'researcher' | 'other';
  preferences: UserPreferences;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: boolean;
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    screenReader: boolean;
  };
}

// Document Types
export interface Document {
  id: string;
  user_id: string;
  file_name: string;
  file_type: 'pdf' | 'docx' | 'txt' | 'csv';
  file_size: number;
  uploaded_at: string;
  processed: boolean;
  processing_status: 'pending' | 'processing' | 'completed' | 'error';
  metadata?: DocumentMetadata;
}

export interface DocumentMetadata {
  page_count?: number;
  word_count?: number;
  language?: string;
  topics?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

// Study Material Types
export interface Note {
  id: string;
  document_id: string;
  content: string;
  summary: string;
  key_points: string[];
  created_at: string;
  updated_at: string;
}

export interface Flashcard {
  id: string;
  document_id: string;
  question: string;
  answer: string;
  category?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  repetition_data: SpacedRepetitionData;
  created_at: string;
  last_reviewed?: string;
  next_review?: string;
}

export interface SpacedRepetitionData {
  interval: number;
  repetitions: number;
  ease_factor: number;
  quality: number; // 0-5 rating
  due_date: string;
}

export interface Quiz {
  id: string;
  document_id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  difficulty: 'easy' | 'medium' | 'hard';
  time_limit?: number; // in minutes
  passing_score: number;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
  category?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_taken: number; // in seconds
  answers: QuizAnswer[];
  completed_at: string;
}

export interface QuizAnswer {
  question_id: string;
  selected_answer: number;
  is_correct: boolean;
  time_spent: number; // in seconds
}

// Progress Tracking Types
export interface Progress {
  id: string;
  user_id: string;
  document_id: string;
  quiz_score?: number;
  study_time: number; // in minutes
  retention_rate: number; // 0-100
  flashcards_reviewed: number;
  notes_reviewed: number;
  last_studied: string;
  updated_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  document_id?: string;
  session_type: 'notes' | 'flashcards' | 'quiz' | 'mixed';
  duration: number; // in minutes
  start_time: string;
  end_time: string;
  activities: StudyActivity[];
}

export interface StudyActivity {
  type: 'note_read' | 'flashcard_review' | 'quiz_attempt' | 'ai_chat';
  duration: number;
  metadata?: Record<string, any>;
}

// AI and LLM Types
export interface AIChat {
  id: string;
  user_id: string;
  document_id?: string;
  message: string;
  response: string;
  context?: string;
  created_at: string;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  content: string;
  embedding: number[];
  chunk_index: number;
  metadata?: Record<string, any>;
}

// Gamification Types
export interface Badge {
  id: string;
  user_id: string;
  type: BadgeType;
  earned_at: string;
  metadata?: Record<string, any>;
}

export type BadgeType = 
  | 'first_upload'
  | 'quiz_master'
  | 'flashcard_pro'
  | 'study_streak'
  | 'perfect_score'
  | 'early_bird'
  | 'night_owl'
  | 'collaborator'
  | 'explorer'
  | 'achiever';

export interface Achievement {
  id: string;
  user_id: string;
  type: AchievementType;
  progress: number;
  target: number;
  completed: boolean;
  completed_at?: string;
}

export type AchievementType = 
  | 'upload_10_documents'
  | 'complete_50_quizzes'
  | 'review_100_flashcards'
  | 'study_7_days_streak'
  | 'achieve_90_percent_accuracy'
  | 'spend_10_hours_studying';

// Collaboration Types
export interface StudyGroup {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  members: GroupMember[];
  documents: string[]; // document IDs
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
}

// File Upload Types
export interface UploadedFile {
  id: string;
  file: File;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  processedData?: {
    notes: string;
    flashcards: Flashcard[];
    quizzes: Quiz[];
  };
}

// UI State Types
export interface AppState {
  user: User | null;
  loading: boolean;
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// API Response Types
export interface APIResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm {
  email: string;
  password: string;
  confirmPassword: string;
  role: 'student' | 'researcher' | 'other';
}

export interface DocumentUploadForm {
  file: File;
  title?: string;
  description?: string;
  tags?: string[];
}

// Settings Types
export interface AppSettings {
  general: {
    language: string;
    timezone: string;
    dateFormat: string;
  };
  study: {
    defaultDifficulty: 'easy' | 'medium' | 'hard';
    autoGenerateFlashcards: boolean;
    autoGenerateQuizzes: boolean;
    spacedRepetitionEnabled: boolean;
  };
  notifications: {
    email: boolean;
    push: boolean;
    studyReminders: boolean;
    achievementAlerts: boolean;
  };
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    screenReader: boolean;
    reducedMotion: boolean;
  };
}

// All types are automatically exported above 
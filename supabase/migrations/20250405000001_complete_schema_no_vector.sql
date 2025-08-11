-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('student', 'researcher', 'other');
CREATE TYPE file_type AS ENUM ('pdf', 'docx', 'txt', 'csv');
CREATE TYPE processing_status AS ENUM ('pending', 'processing', 'completed', 'error');
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE session_type AS ENUM ('notes', 'flashcards', 'quiz', 'mixed');
CREATE TYPE activity_type AS ENUM ('note_read', 'flashcard_review', 'quiz_attempt', 'ai_chat');
CREATE TYPE badge_type AS ENUM (
  'first_upload', 'quiz_master', 'flashcard_pro', 'study_streak', 
  'perfect_score', 'early_bird', 'night_owl', 'collaborator', 'explorer', 'achiever'
);
CREATE TYPE achievement_type AS ENUM (
  'upload_10_documents', 'complete_50_quizzes', 'review_100_flashcards',
  'study_7_days_streak', 'achieve_90_percent_accuracy', 'spend_10_hours_studying'
);
CREATE TYPE group_role AS ENUM ('admin', 'moderator', 'member');

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  role user_role DEFAULT 'student',
  preferences JSONB DEFAULT '{
    "theme": "system",
    "language": "en",
    "notifications": true,
    "accessibility": {
      "highContrast": false,
      "largeText": false,
      "screenReader": false
    }
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type file_type NOT NULL,
  file_size BIGINT NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE,
  processing_status processing_status DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document chunks for RAG (without vector embeddings for now)
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  summary TEXT,
  key_points TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flashcards table
CREATE TABLE flashcards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  difficulty difficulty_level DEFAULT 'medium',
  repetition_data JSONB DEFAULT '{
    "interval": 1,
    "repetitions": 0,
    "ease_factor": 2.5,
    "quality": 0,
    "due_date": null
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_reviewed TIMESTAMP WITH TIME ZONE,
  next_review TIMESTAMP WITH TIME ZONE
);

-- Quizzes table
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  difficulty difficulty_level DEFAULT 'medium',
  time_limit INTEGER, -- in minutes
  passing_score INTEGER DEFAULT 70,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz questions table
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_answer INTEGER NOT NULL,
  explanation TEXT,
  category TEXT,
  difficulty difficulty_level DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz attempts table
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  time_taken INTEGER NOT NULL, -- in seconds
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz answers table
CREATE TABLE quiz_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID REFERENCES quiz_questions(id) ON DELETE CASCADE,
  selected_answer INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_spent INTEGER NOT NULL, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress tracking table
CREATE TABLE progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  quiz_score INTEGER,
  study_time INTEGER DEFAULT 0, -- in minutes
  retention_rate INTEGER DEFAULT 0, -- 0-100
  flashcards_reviewed INTEGER DEFAULT 0,
  notes_reviewed INTEGER DEFAULT 0,
  last_studied TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, document_id)
);

-- Study sessions table
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  session_type session_type NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study activities table
CREATE TABLE study_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES study_sessions(id) ON DELETE CASCADE,
  type activity_type NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI chat history table
CREATE TABLE ai_chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  context TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badges table
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type badge_type NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type achievement_type NOT NULL,
  progress INTEGER DEFAULT 0,
  target INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study groups table
CREATE TABLE study_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group members table
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role group_role DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Group documents table
CREATE TABLE group_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  added_by UUID REFERENCES users(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, document_id)
);

-- Create indexes for better performance
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_processed ON documents(processed);
CREATE INDEX idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX idx_notes_document_id ON notes(document_id);
CREATE INDEX idx_flashcards_document_id ON flashcards(document_id);
CREATE INDEX idx_flashcards_next_review ON flashcards(next_review);
CREATE INDEX idx_quizzes_document_id ON quizzes(document_id);
CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX idx_progress_user_id ON progress(user_id);
CREATE INDEX idx_progress_document_id ON progress(document_id);
CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_ai_chats_user_id ON ai_chats(user_id);
CREATE INDEX idx_badges_user_id ON badges(user_id);
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_achievements_updated_at BEFORE UPDATE ON achievements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_groups_updated_at BEFORE UPDATE ON study_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_documents ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Documents policies
CREATE POLICY "Users can view own documents" ON documents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON documents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON documents
    FOR DELETE USING (auth.uid() = user_id);

-- Document chunks policies (same as documents)
CREATE POLICY "Users can view own document chunks" ON document_chunks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM documents 
            WHERE documents.id = document_chunks.document_id 
            AND documents.user_id = auth.uid()
        )
    );

-- Notes policies
CREATE POLICY "Users can view own notes" ON notes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM documents 
            WHERE documents.id = notes.document_id 
            AND documents.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own notes" ON notes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM documents 
            WHERE documents.id = notes.document_id 
            AND documents.user_id = auth.uid()
        )
    );

-- Flashcards policies
CREATE POLICY "Users can view own flashcards" ON flashcards
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM documents 
            WHERE documents.id = flashcards.document_id 
            AND documents.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own flashcards" ON flashcards
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM documents 
            WHERE documents.id = flashcards.document_id 
            AND documents.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own flashcards" ON flashcards
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM documents 
            WHERE documents.id = flashcards.document_id 
            AND documents.user_id = auth.uid()
        )
    );

-- Progress policies
CREATE POLICY "Users can view own progress" ON progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Study sessions policies
CREATE POLICY "Users can view own study sessions" ON study_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study sessions" ON study_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- AI chats policies
CREATE POLICY "Users can view own ai chats" ON ai_chats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ai chats" ON ai_chats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Badges policies
CREATE POLICY "Users can view own badges" ON badges
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges" ON badges
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Achievements policies
CREATE POLICY "Users can view own achievements" ON achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements" ON achievements
    FOR UPDATE USING (auth.uid() = user_id);

-- Study groups policies (members can view)
CREATE POLICY "Group members can view groups" ON study_groups
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_members.group_id = study_groups.id 
            AND group_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create groups" ON study_groups
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Group members policies
CREATE POLICY "Group members can view group members" ON group_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM group_members gm 
            WHERE gm.group_id = group_members.group_id 
            AND gm.user_id = auth.uid()
        )
    );

CREATE POLICY "Group admins can manage members" ON group_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM group_members gm 
            WHERE gm.group_id = group_members.group_id 
            AND gm.user_id = auth.uid() 
            AND gm.role IN ('admin', 'moderator')
        )
    );

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'student');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to calculate retention rate
CREATE OR REPLACE FUNCTION calculate_retention_rate(
  p_user_id UUID,
  p_document_id UUID
) RETURNS INTEGER AS $$
DECLARE
  total_flashcards INTEGER;
  reviewed_flashcards INTEGER;
  retention_rate INTEGER;
BEGIN
  -- Get total flashcards for the document
  SELECT COUNT(*) INTO total_flashcards
  FROM flashcards
  WHERE document_id = p_document_id;
  
  -- Get reviewed flashcards count
  SELECT flashcards_reviewed INTO reviewed_flashcards
  FROM progress
  WHERE user_id = p_user_id AND document_id = p_document_id;
  
  -- Calculate retention rate
  IF total_flashcards > 0 THEN
    retention_rate := (reviewed_flashcards * 100) / total_flashcards;
  ELSE
    retention_rate := 0;
  END IF;
  
  RETURN retention_rate;
END;
$$ LANGUAGE plpgsql;

-- Function to get due flashcards for spaced repetition
CREATE OR REPLACE FUNCTION get_due_flashcards(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  question TEXT,
  answer TEXT,
  category TEXT,
  difficulty difficulty_level,
  repetition_data JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT f.id, f.question, f.answer, f.category, f.difficulty, f.repetition_data
  FROM flashcards f
  JOIN documents d ON f.document_id = d.id
  WHERE d.user_id = p_user_id
    AND (f.next_review IS NULL OR f.next_review <= NOW())
  ORDER BY f.next_review ASC NULLS FIRST;
END;
$$ LANGUAGE plpgsql; 
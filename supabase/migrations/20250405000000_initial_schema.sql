-- Users table (handled by Supabase Auth, but we'll reference it)
-- Ensure you enable Auth: Users in Supabase dashboard

-- Documents
create table documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  file_name text not null,
  file_path text not null,
  file_type text not null,
  uploaded_at timestamp default now(),
  processed boolean default false,
  ai_model_used text,
  unique(user_id, file_name)
);

-- Study Sessions
create table study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  document_id uuid references documents(id),
  started_at timestamp default now(),
  ended_at timestamp,
  notes text,
  flashcards_reviewed int default 0,
  correct_answers int default 0,
  total_answers int default 0
);

-- Concepts extracted from documents
create table concepts (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  title text not null,
  explanation text not null,
  importance text check (importance in ('low', 'medium', 'high')),
  created_at timestamp default now()
);

-- Flashcards
create table flashcards (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  concept_id uuid references concepts(id),
  question text not null,
  answer text not null,
  difficulty float default 1.0,
  last_reviewed timestamp,
  correct_count int default 0,
  incorrect_count int default 0
);

-- Indexes
create index idx_documents_user on documents(user_id);
create index idx_study_sessions_user on study_sessions(user_id);
create index idx_flashcards_document on flashcards(document_id);
create index idx_concepts_document on concepts(document_id);

-- RLS Policies
alter table documents enable row level security;
alter table study_sessions enable row level security;
alter table concepts enable row level security;
alter table flashcards enable row level security;

create policy "Users can view own documents"
  on documents for select
  using (auth.uid() = user_id);

create policy "Users can insert own documents"
  on documents for insert
  with check (auth.uid() = user_id);

create policy "Users can view own study sessions"
  on study_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert study sessions"
  on study_sessions for insert
  with check (auth.uid() = user_id);

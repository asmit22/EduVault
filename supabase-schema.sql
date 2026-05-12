-- ============================================================
-- EduVault — Complete Supabase Schema
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================================

-- ─── Extensions ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Tables ───────────────────────────────────────────────────

-- Profiles (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT,
  full_name     TEXT,
  roll_number   TEXT,
  role          TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Semesters
CREATE TABLE public.semesters (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number     INT  NOT NULL UNIQUE,
  label      TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subjects
CREATE TABLE public.subjects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  semester_id UUID NOT NULL REFERENCES public.semesters(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  code        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (semester_id, code)
);

-- Question Papers
CREATE TABLE public.question_papers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  semester_id  UUID NOT NULL REFERENCES public.semesters(id)  ON DELETE CASCADE,
  subject_id   UUID NOT NULL REFERENCES public.subjects(id)   ON DELETE CASCADE,
  exam_type    TEXT NOT NULL CHECK (exam_type IN ('mid1', 'mid2', 'endsem')),
  year         INT  NOT NULL,
  file_path    TEXT NOT NULL,
  file_size_kb INT,
  uploaded_by  UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Notes
CREATE TABLE public.notes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT,
  semester_id  UUID NOT NULL REFERENCES public.semesters(id)  ON DELETE CASCADE,
  subject_id   UUID NOT NULL REFERENCES public.subjects(id)   ON DELETE CASCADE,
  file_path    TEXT NOT NULL,
  file_size_kb INT,
  uploaded_by  UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────────
CREATE INDEX idx_question_papers_semester ON public.question_papers(semester_id);
CREATE INDEX idx_question_papers_subject  ON public.question_papers(subject_id);
CREATE INDEX idx_question_papers_type     ON public.question_papers(exam_type);
CREATE INDEX idx_notes_semester           ON public.notes(semester_id);
CREATE INDEX idx_notes_subject            ON public.notes(subject_id);
CREATE INDEX idx_subjects_semester        ON public.subjects(semester_id);

-- ─── Auto-create profile on signup ────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, roll_number, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'roll_number',
    'student'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ─── Row Level Security ────────────────────────────────────────
ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes          ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Semesters policies
CREATE POLICY "Authenticated users can view semesters"
  ON public.semesters FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage semesters"
  ON public.semesters FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Subjects policies
CREATE POLICY "Authenticated users can view subjects"
  ON public.subjects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage subjects"
  ON public.subjects FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Question papers policies
CREATE POLICY "Authenticated users can view question papers"
  ON public.question_papers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage question papers"
  ON public.question_papers FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Notes policies
CREATE POLICY "Authenticated users can view notes"
  ON public.notes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage notes"
  ON public.notes FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── Storage Buckets ───────────────────────────────────────────
-- Run these in the Storage section OR via SQL:

INSERT INTO storage.buckets (id, name, public)
VALUES ('question-papers', 'question-papers', false);  -- private; signed URLs only

INSERT INTO storage.buckets (id, name, public)
VALUES ('notes', 'notes', false);  -- private; signed URLs only

-- Storage RLS: only authenticated users can read
CREATE POLICY "Authenticated users can download question papers"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'question-papers');

CREATE POLICY "Admins can upload question papers"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'question-papers' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete question papers"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'question-papers' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Authenticated users can download notes"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'notes');

CREATE POLICY "Admins can upload notes"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'notes' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete notes"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'notes' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── Seed: Initial semesters ───────────────────────────────────
-- Adjust labels to match your college's naming convention
INSERT INTO public.semesters (number, label) VALUES
  (1, 'First Year — First Semester'),
  (2, 'First Year — Second Semester'),
  (3, 'Second Year — First Semester'),
  (4, 'Second Year — Second Semester'),
  (5, 'Third Year — First Semester'),
  (6, 'Third Year — Second Semester'),
  (7, 'Fourth Year — First Semester'),
  (8, 'Fourth Year — Second Semester');

-- ─── Make yourself admin ───────────────────────────────────────
-- After signing up with your email, run this:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';

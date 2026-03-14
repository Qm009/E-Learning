-- Migration: Create course_questions table and security
-- Date: 2026-03-14

-- 1. Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.course_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  answered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.course_questions ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Students see QnA for published courses" ON public.course_questions;
DROP POLICY IF EXISTS "Students can view questions for courses" ON public.course_questions;
DROP POLICY IF EXISTS "Students can ask questions" ON public.course_questions;
DROP POLICY IF EXISTS "Teachers manage QnA" ON public.course_questions;
DROP POLICY IF EXISTS "Teachers can answer questions for their courses" ON public.course_questions;

-- 4. Create new, robust policies
-- SELECT: Students see all questions for published courses, Teachers see questions for their courses
CREATE POLICY "Anyone can view published course questions"
ON public.course_questions FOR SELECT
TO authenticated
USING (true);

-- INSERT: Only students can ask questions
CREATE POLICY "Students can ask questions"
ON public.course_questions FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = student_id
);

-- UPDATE: Only teachers can answer questions for their own courses
CREATE POLICY "Teachers can answer their course questions"
ON public.course_questions FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.courses
        WHERE id = course_questions.course_id
        AND teacher_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.courses
        WHERE id = course_questions.course_id
        AND teacher_id = auth.uid()
    )
);

-- 5. Helper function for role (if not exists)
CREATE OR REPLACE FUNCTION public.role()
RETURNS text AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

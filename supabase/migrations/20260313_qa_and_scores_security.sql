-- ============================================================
-- MIGRATION : Sécurité Q&A et Scores
-- Date: 2026-03-13
-- ============================================================

-- 1. Policies pour course_questions (Q&A)
ALTER TABLE public.course_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can view questions for courses" ON public.course_questions;
CREATE POLICY "Students can view questions for courses"
ON public.course_questions FOR SELECT
USING (true); -- Tout le monde peut lire les Q&A publiques

DROP POLICY IF EXISTS "Students can ask questions" ON public.course_questions;
CREATE POLICY "Students can ask questions"
ON public.course_questions FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = student_id AND
    role() = 'student'
);

DROP POLICY IF EXISTS "Teachers can answer questions for their courses" ON public.course_questions;
CREATE POLICY "Teachers can answer questions for their courses"
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

-- 2. Policies pour scores
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students view own scores" ON public.scores;
CREATE POLICY "Students view own scores"
ON public.scores FOR SELECT
TO authenticated
USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Service role manage scores" ON public.scores;
CREATE POLICY "Service role manage scores"
ON public.scores FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 3. Policies pour certificates
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students view own certificates" ON public.certificates;
CREATE POLICY "Students view own certificates"
ON public.certificates FOR SELECT
TO authenticated
USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Service role manage certificates" ON public.certificates;
CREATE POLICY "Service role manage certificates"
ON public.certificates FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 4. Fonction helper pour obtenir le rôle actuel plus simplement dans SQL
CREATE OR REPLACE FUNCTION public.role()
RETURNS text AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

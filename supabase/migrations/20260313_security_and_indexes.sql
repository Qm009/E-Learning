-- Migration: Correctifs de sécurité et policies manquantes
-- Date: 2026-03-13

-- 1. Ajouter la policy INSERT sur enrollments pour le service_role (Edge Function enroll-course)
CREATE POLICY IF NOT EXISTS "Service role can insert enrollments"
ON public.enrollments
FOR INSERT
TO service_role
WITH CHECK (true);

-- 2. Ajouter la policy UPDATE sur enrollments pour les étudiants (progression)
CREATE POLICY IF NOT EXISTS "Students can update own enrollment progress"
ON public.enrollments
FOR UPDATE
TO authenticated
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);

-- 3. Policy pour les professeurs : voir les inscriptions à leurs cours
CREATE POLICY IF NOT EXISTS "Teachers can view enrollments for their courses"
ON public.enrollments
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.courses
        WHERE id = enrollments.course_id
        AND teacher_id = auth.uid()
    )
);

-- 4. Ajouter index de performances critiques
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_courses_teacher_id ON public.courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);
CREATE INDEX IF NOT EXISTS idx_quizzes_course_id ON public.quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_scores_student_id ON public.scores(student_id);
CREATE INDEX IF NOT EXISTS idx_course_questions_course_id ON public.course_questions(course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_student_id ON public.certificates(student_id);

-- 5. Activer des vues matérialisées pour les statistiques du dashboard (optionnel - amélioration future)
-- CREATE MATERIALIZED VIEW teacher_stats AS
-- SELECT c.teacher_id, COUNT(e.id) as total_students, COUNT(c.id) as total_courses
-- FROM courses c LEFT JOIN enrollments e ON e.course_id = c.id
-- GROUP BY c.teacher_id;

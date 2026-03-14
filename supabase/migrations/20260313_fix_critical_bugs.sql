-- ============================================================
-- MIGRATION CRITIQUE : Fix de tous les bugs identifiés
-- Date: 2026-03-13
-- ============================================================

-- ============================================================
-- BUG 1 : Policy INSERT quizzes manquante (WITH CHECK)
-- La policy "Teachers manage quizzes for their courses" est
-- FOR ALL USING (...) mais l'INSERT nécessite WITH CHECK.
-- Sans WITH CHECK explicite, l'INSERT est bloqué.
-- ============================================================
DROP POLICY IF EXISTS "Teachers manage quizzes for their courses" ON public.quizzes;

CREATE POLICY "Teachers can select quizzes for their courses"
ON public.quizzes FOR SELECT
USING (
    EXISTS (SELECT 1 FROM public.courses WHERE id = quizzes.course_id AND teacher_id = auth.uid())
);

CREATE POLICY "Teachers can insert quizzes for their courses"
ON public.quizzes FOR INSERT
WITH CHECK (
    EXISTS (SELECT 1 FROM public.courses WHERE id = quizzes.course_id AND teacher_id = auth.uid())
);

CREATE POLICY "Teachers can update quizzes for their courses"
ON public.quizzes FOR UPDATE
USING (
    EXISTS (SELECT 1 FROM public.courses WHERE id = quizzes.course_id AND teacher_id = auth.uid())
);

CREATE POLICY "Teachers can delete quizzes for their courses"
ON public.quizzes FOR DELETE
USING (
    EXISTS (SELECT 1 FROM public.courses WHERE id = quizzes.course_id AND teacher_id = auth.uid())
);

-- ============================================================
-- BUG 2 : Policy INSERT enrollments manquante pour les étudiants
-- Les étudiants ne peuvent pas s'inscrire directement car il
-- n'y a pas de policy INSERT pour le rôle 'authenticated'
-- ============================================================
DROP POLICY IF EXISTS "Students manage own enrollments" ON public.enrollments;

-- SELECT: chaque étudiant voit ses propres inscriptions
CREATE POLICY "Students can view own enrollments"
ON public.enrollments FOR SELECT
TO authenticated
USING (auth.uid() = student_id);

-- INSERT: un étudiant peut s'inscrire à un cours publié
CREATE POLICY "Students can enroll in published courses"
ON public.enrollments FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = student_id AND
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND status = 'published')
);

-- UPDATE: un étudiant peut mettre à jour sa progression
CREATE POLICY "Students can update own enrollment progress"
ON public.enrollments FOR UPDATE
TO authenticated
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);

-- DELETE: un étudiant peut se désinscrire
CREATE POLICY "Students can delete own enrollments"
ON public.enrollments FOR DELETE
TO authenticated
USING (auth.uid() = student_id);

-- Professeurs: voir les inscriptions pour leurs cours
CREATE POLICY "Teachers can view enrollments for their courses"
ON public.enrollments FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.courses
        WHERE id = enrollments.course_id
        AND teacher_id = auth.uid()
    )
);

-- Service role: peut tout faire (pour les Edge Functions)
CREATE POLICY "Service role full access on enrollments"
ON public.enrollments
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================
-- BUG 3 : Trigger auto-création de profil à l'inscription
-- Si le profil n'est pas créé lors du sign-up, l'étudiant ne
-- peut pas accéder aux données protégées par RLS.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            (NEW.raw_user_meta_data->>'role')::user_role,
            'student'::user_role
        ),
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            split_part(NEW.email, '@', 1)
        )
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        role = COALESCE(
            (NEW.raw_user_meta_data->>'role')::user_role,
            profiles.role
        ),
        full_name = COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            profiles.full_name
        ),
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- FIX 4 : S'assurer que tous les cours existants sont publiés
-- ============================================================
UPDATE public.courses SET status = 'published' WHERE status IS NULL OR status = 'draft';

-- ============================================================
-- INDEX DE PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_quizzes_course_id ON public.quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_courses_teacher_id ON public.courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);
CREATE INDEX IF NOT EXISTS idx_scores_student_id ON public.scores(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_student_id ON public.certificates(student_id);

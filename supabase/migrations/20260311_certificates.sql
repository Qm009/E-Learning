-- 1. Table des certificats
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
    score_percentage INTEGER NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    certificate_code TEXT UNIQUE NOT NULL DEFAULT 'CERT-' || upper(substring(gen_random_uuid()::text from 1 for 8)),
    
    UNIQUE(student_id, course_id)
);

-- RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own certificates" 
ON public.certificates FOR SELECT 
USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view certificates of their courses" 
ON public.certificates FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.courses 
        WHERE id = public.certificates.course_id 
        AND teacher_id = auth.uid()
    )
);

-- 2. Fonction RPC pour vérifier et générer le certificat si le score est suffisant
CREATE OR REPLACE FUNCTION public.issue_certificate_if_passed(
    p_quiz_id UUID,
    p_score INTEGER
) RETURNS VOID AS $$
DECLARE
    v_course_id UUID;
    v_passing_score INTEGER;
BEGIN
    -- Récupérer le cours et le score de passage
    SELECT course_id, passing_score_percentage INTO v_course_id, v_passing_score
    FROM public.quizzes
    WHERE id = p_quiz_id;

    -- Si le score est supérieur ou égal au score de passage, on crée le certificat
    IF p_score >= v_passing_score THEN
        INSERT INTO public.certificates (student_id, course_id, quiz_id, score_percentage)
        VALUES (auth.uid(), v_course_id, p_quiz_id, p_score)
        ON CONFLICT (student_id, course_id) DO UPDATE 
        SET score_percentage = GREATEST(public.certificates.score_percentage, EXCLUDED.score_percentage),
            issued_at = NOW();
            
        -- Marquer l'inscription comme complétée
        UPDATE public.enrollments 
        SET status = 'completed', progress = 100
        WHERE student_id = auth.uid() AND course_id = v_course_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

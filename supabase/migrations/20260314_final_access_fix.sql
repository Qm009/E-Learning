-- Migration to ensure avatar_url exists and fix RLS for future courses
-- This prevents crashes when querying profile information

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='avatar_url'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- Ensure all current and future teachers have their profiles viewable by students
-- This is critical for the 'teacher' join to work in the course catalog
DROP POLICY IF EXISTS "Public profiles visibility" ON public.profiles;
CREATE POLICY "Public profiles visibility"
ON public.profiles FOR SELECT
TO authenticated
USING (true); -- Allows students to see teacher names/avatars for any course

-- Force all existing courses to published to make them immediately visible
-- (The user requested this for "all saved courses")
UPDATE public.courses SET status = 'published' WHERE status IS NULL OR status = 'draft';

-- Migration to allow all users to view public profile info
-- This is essential for students to see teacher names in the course catalog

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Ensure course_materials are also fully accessible for published courses
DROP POLICY IF EXISTS "Students see materials of published courses" ON course_materials;
CREATE POLICY "Students see materials of published courses"
ON course_materials FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM courses 
    WHERE id = course_materials.course_id 
    AND status = 'published'
  )
);

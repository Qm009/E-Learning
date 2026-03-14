-- Fix for profile updates and materials visibility

-- 1. Allow users to update their own profiles (missing in initial schema!)
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 2. Ensure course materials visibility for teachers (even if course is draft)
DROP POLICY IF EXISTS "Teachers manage materials for their courses" ON course_materials;
CREATE POLICY "Teachers manage materials for their courses"
ON course_materials FOR ALL 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM courses WHERE id = course_materials.course_id AND teacher_id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM courses WHERE id = course_materials.course_id AND teacher_id = auth.uid())
);

-- 3. Final safety check on profiles (ensure students can see teachers)
DROP POLICY IF EXISTS "Anyone can view teacher profiles" ON profiles;
CREATE POLICY "Anyone can view teacher profiles" 
ON profiles FOR SELECT 
TO authenticated
USING (true); -- Simplified to ensure teacher names show up everywhere

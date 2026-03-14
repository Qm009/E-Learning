-- Amélioration de la visibilité pour les étudiants
-- 1. Permettre aux étudiants de voir les profils des professeurs (essentiel pour afficher les noms dans le catalogue)
DROP POLICY IF EXISTS "Anyone can view teacher profiles" ON profiles;
CREATE POLICY "Anyone can view teacher profiles" 
ON profiles FOR SELECT 
USING (role = 'teacher' OR id = auth.uid() OR is_admin());

-- 2. S'assurer que les cours publiés sont visibles par tous les utilisateurs connectés
DROP POLICY IF EXISTS "Students see published courses" ON courses;
CREATE POLICY "Students see published courses" 
ON courses FOR SELECT 
USING (status = 'published');

-- 3. S'assurer que les quiz des cours publiés sont visibles
DROP POLICY IF EXISTS "Students see quizzes of published courses" ON quizzes;
CREATE POLICY "Students see quizzes of published courses"
ON quizzes FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM courses WHERE id = quizzes.course_id AND status = 'published')
);

-- 4. Permettre aux étudiants de voir les documents des cours publiés
DROP POLICY IF EXISTS "Students see materials of published courses" ON course_materials;
CREATE POLICY "Students see materials of published courses"
ON course_materials FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM courses WHERE id = course_materials.course_id AND status = 'published')
);

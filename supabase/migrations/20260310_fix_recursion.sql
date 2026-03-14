-- Fix pour l'erreur "Infinite recursion detected" dans les politiques RLS
-- Ce problème survient quand une politique sur 'profiles' vérifie le rôle en requêtant 'profiles'.

-- 1. Création de fonctions utilitaires avec SECURITY DEFINER
-- Ces fonctions contournent le RLS pour vérifier le rôle sans créer de boucle infinie.

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'teacher'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 2. Mise à jour des politiques de la table 'profiles'
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" 
ON profiles FOR SELECT USING (is_admin());

-- 3. Mise à jour des politiques de la table 'courses' pour l'insertion
DROP POLICY IF EXISTS "Teachers can insert their own courses" ON courses;
CREATE POLICY "Teachers can insert their own courses" 
ON courses FOR INSERT WITH CHECK (
  auth.uid() = teacher_id AND (is_teacher() OR is_admin())
);

DROP POLICY IF EXISTS "Admins have full access on courses" ON courses;
CREATE POLICY "Admins have full access on courses" 
ON courses FOR ALL USING (is_admin());

-- 4. Application du même principe aux autres tables si nécessaire
DROP POLICY IF EXISTS "Teachers manage materials for their courses" ON course_materials;
CREATE POLICY "Teachers manage materials for their courses"
ON course_materials FOR ALL USING (
  EXISTS (SELECT 1 FROM courses WHERE id = course_materials.course_id AND teacher_id = auth.uid())
  OR is_admin()
);

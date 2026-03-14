-- Migrations SQL (Initial Schema & RLS)
-- Stack: Supabase PostgreSQL
-- Auth: Row Level Security (RLS)

-- 1. Custom Types (Roles)
CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student');

-- 2. Profiles Table (étend auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role user_role NOT NULL DEFAULT 'student',
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Active RLS sur profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent lire leur propre profil
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT USING (auth.uid() = id);

-- Seuls les admins peuvent lire tous les profils
CREATE POLICY "Admins can view all profiles" 
ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 3. Courses Table
CREATE TABLE courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Active RLS sur courses
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- 4. Course RLS Policies
-- Les profils "student" voient uniquement les cours publiés
CREATE POLICY "Students see published courses" 
ON courses FOR SELECT USING (status = 'published');

-- Les profils "teacher" voient et modifient LEURS cours
CREATE POLICY "Teachers can view their own courses" 
ON courses FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can insert their own courses" 
ON courses FOR INSERT WITH CHECK (
  auth.uid() = teacher_id AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
);

CREATE POLICY "Teachers can update their own courses" 
ON courses FOR UPDATE USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete their own courses" 
ON courses FOR DELETE USING (teacher_id = auth.uid());

-- Les admins voient tout et modifient tout
CREATE POLICY "Admins have full access on courses" 
ON courses FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 5. Quizzes Table (liés aux cours)
CREATE TABLE quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  questions JSONB NOT NULL, -- Array of questions
  passing_score_percentage INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

-- Étudiants: voient le quiz si le cours associé est publié
CREATE POLICY "Students see quizzes of published courses"
ON quizzes FOR SELECT USING (
  EXISTS (SELECT 1 FROM courses WHERE id = quizzes.course_id AND status = 'published')
);

-- Profs: gérent les quiz de leurs propres cours
CREATE POLICY "Teachers manage quizzes for their courses"
ON quizzes FOR ALL USING (
  EXISTS (SELECT 1 FROM courses WHERE id = quizzes.course_id AND teacher_id = auth.uid())
);

-- 6. Scores Table (Note: l'insertion se fera via Edge Function Supabase pour validation)
CREATE TABLE scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  score_percentage INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Étudiants: voient leurs propres scores
CREATE POLICY "Students see own scores"
ON scores FOR SELECT USING (auth.uid() = student_id);

-- Professeurs: voient les scores des étudiants sur leurs quiz
CREATE POLICY "Teachers see scores for their quizzes"
ON scores FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM quizzes q
    JOIN courses c ON q.course_id = c.id
    WHERE q.id = scores.quiz_id AND c.teacher_id = auth.uid()
  )
);

-- SEULES les Edge Functions (Service Role) gèrent les insertions (sécurité maximale)
-- Aucun insert explicite du client sur la table `scores` n'est autorisé.

-- (Optionnel) Ajout d'une table d'inscriptions simple
CREATE TABLE enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('in_progress', 'completed')) DEFAULT 'in_progress',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students manage own enrollments"
ON enrollments FOR ALL USING (auth.uid() = student_id);

-- 8. Add Avatar to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 9. Q&A Table
CREATE TABLE course_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  answered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE course_questions ENABLE ROW LEVEL SECURITY;

-- Students can read all QnA for a published course, and insert their own questions
CREATE POLICY "Students see QnA for published courses"
ON course_questions FOR SELECT USING (
  EXISTS (SELECT 1 FROM courses WHERE id = course_questions.course_id AND status = 'published')
);

CREATE POLICY "Students can ask questions"
ON course_questions FOR INSERT WITH CHECK (
  auth.uid() = student_id
);

-- Teachers manage QnA for their courses
CREATE POLICY "Teachers manage QnA"
ON course_questions FOR ALL USING (
  EXISTS (SELECT 1 FROM courses WHERE id = course_questions.course_id AND teacher_id = auth.uid())
);

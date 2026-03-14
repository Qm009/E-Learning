-- Extension pour gérer les fichiers du cours
CREATE TABLE course_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  size_bytes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE course_materials ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité
CREATE POLICY "Students see materials of published courses"
ON course_materials FOR SELECT USING (
  EXISTS (SELECT 1 FROM courses WHERE id = course_materials.course_id AND status = 'published')
);

CREATE POLICY "Teachers manage materials for their courses"
ON course_materials FOR ALL USING (
  EXISTS (SELECT 1 FROM courses WHERE id = course_materials.course_id AND teacher_id = auth.uid())
);

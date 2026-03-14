-- Configuration des Buckets de Stockage
-- Note: Ces commandes doivent être exécutées dans l'éditeur SQL de Supabase.

-- 1. Création des buckets (si non existants)
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('course-images', 'course-images', true),
  ('pedagogic-materials', 'pedagogic-materials', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Politiques de sécurité pour 'avatars'
CREATE POLICY "Avatar public access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 3. Politiques de sécurité pour 'course-images'
CREATE POLICY "Course images public access" ON storage.objects FOR SELECT USING (bucket_id = 'course-images');
CREATE POLICY "Teachers can upload course images" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'course-images' AND auth.role() = 'authenticated');

-- 4. Politiques de sécurité pour 'pedagogic-materials'
CREATE POLICY "Materials public access" ON storage.objects FOR SELECT USING (bucket_id = 'pedagogic-materials');
CREATE POLICY "Teachers can upload materials" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'pedagogic-materials' AND auth.role() = 'authenticated');

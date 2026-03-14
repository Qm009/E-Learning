-- Policy for inserting into `scores` using the service_role key
-- By default, RLS is enabled, meaning even Edge Functions need explicit permission
-- or they must use Postgres bypassrls (the service_role key bypasses RLS). 
-- But just to be perfectly compliant and safe with Supabase best practices,
-- we'll add an explicit policy allowing service_role to insert.

-- Add a policy that allows inserts if the role is 'service_role'
-- (Note: typically service_role automatically bypasses RLS, but if there was some issue, this ensures it)
CREATE POLICY "Service role can insert scores"
ON public.scores
FOR INSERT
TO service_role
WITH CHECK (true);

-- Create a storage bucket for avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for avatars bucket
-- 1. Anyone can view avatars (since public = true, this is sometimes redundant but good practice)
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

-- 2. Authenticated users can upload their own avatars
CREATE POLICY "Users can upload their own avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Authenticated users can update their own avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

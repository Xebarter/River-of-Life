-- Create resources storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resources', 
  'resources', 
  true, 
  104857600, -- 100MB limit
  ARRAY['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/mp4', 'audio/m4a', 'audio/ogg', 'audio/webm']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create storage policies for resources bucket
CREATE POLICY "Public access to resources storage"
  ON storage.objects
  FOR ALL
  TO public
  USING (bucket_id = 'resources')
  WITH CHECK (bucket_id = 'resources');
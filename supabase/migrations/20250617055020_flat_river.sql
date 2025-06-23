/*
  # Fix Image Upload Issues

  1. Storage Policies
    - Drop all existing conflicting storage policies
    - Create new simplified policies for gallery bucket
    - Allow authenticated users to upload images
    - Allow public read access to images

  2. Authentication
    - Ensure proper authentication flow for uploads
    - Fix RLS policy conflicts
*/

-- Drop all existing storage policies to start fresh
DROP POLICY IF EXISTS "Public read access to gallery" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to gallery" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update gallery files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete gallery files" ON storage.objects;

-- Ensure gallery bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery', 
  'gallery', 
  true, 
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create simple, working storage policies
CREATE POLICY "Anyone can view gallery images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'gallery');

CREATE POLICY "Authenticated users can upload gallery images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "Authenticated users can update gallery images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'gallery');

CREATE POLICY "Authenticated users can delete gallery images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'gallery');
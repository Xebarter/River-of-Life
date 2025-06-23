/*
  # Fix Gallery Admin Access

  1. Database Functions
    - Create `is_admin()` function to check if current user is an admin
    - This function checks if the authenticated user's email exists in the admins table

  2. Storage Policies
    - Add storage policies for the gallery bucket to allow admin uploads
    - Allow authenticated users (admins) to upload, view, and delete files

  3. Security
    - Maintains existing RLS policies that require admin access
    - Ensures only users in the admins table can manage gallery content
*/

-- Create the is_admin function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the current user's email exists in the admins table
  RETURN EXISTS (
    SELECT 1 
    FROM admins 
    WHERE email = auth.email()
  );
END;
$$;

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for gallery bucket
-- Allow admins to upload files
CREATE POLICY "Admins can upload gallery files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'gallery' AND is_admin()
);

-- Allow anyone to view gallery files (public bucket)
CREATE POLICY "Anyone can view gallery files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'gallery');

-- Allow admins to delete gallery files
CREATE POLICY "Admins can delete gallery files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'gallery' AND is_admin()
);

-- Allow admins to update gallery files
CREATE POLICY "Admins can update gallery files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'gallery' AND is_admin()
)
WITH CHECK (
  bucket_id = 'gallery' AND is_admin()
);
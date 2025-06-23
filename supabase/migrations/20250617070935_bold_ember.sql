/*
  # Disable Authentication Requirements

  1. Remove RLS policies that require authentication
  2. Allow public access to all admin operations
  3. Simplify storage policies for public access
*/

-- Drop all existing RLS policies that require authentication
DROP POLICY IF EXISTS "Only admins can insert devotions" ON devotions;
DROP POLICY IF EXISTS "Only admins can update devotions" ON devotions;
DROP POLICY IF EXISTS "Only admins can delete devotions" ON devotions;

DROP POLICY IF EXISTS "Only admins can insert gallery" ON gallery;
DROP POLICY IF EXISTS "Only admins can update gallery" ON gallery;
DROP POLICY IF EXISTS "Only admins can delete gallery" ON gallery;

DROP POLICY IF EXISTS "Only admins can insert resources" ON resources;
DROP POLICY IF EXISTS "Only admins can update resources" ON resources;
DROP POLICY IF EXISTS "Only admins can delete resources" ON resources;

DROP POLICY IF EXISTS "Only admins can update prayer requests" ON prayer_requests;
DROP POLICY IF EXISTS "Only admins can update donations" ON donations;

DROP POLICY IF EXISTS "Only admins can insert admins" ON admins;
DROP POLICY IF EXISTS "Only admins can read admins" ON admins;
DROP POLICY IF EXISTS "Only admins can update admins" ON admins;

-- Create new public policies for all operations
CREATE POLICY "Anyone can manage devotions"
  ON devotions
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can manage gallery"
  ON gallery
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can manage resources"
  ON resources
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can manage prayer requests"
  ON prayer_requests
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can manage donations"
  ON donations
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can manage admins"
  ON admins
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Drop existing storage policies
DROP POLICY IF EXISTS "Anyone can view gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete gallery images" ON storage.objects;

-- Create public storage policies
CREATE POLICY "Public access to gallery storage"
  ON storage.objects
  FOR ALL
  TO public
  USING (bucket_id = 'gallery')
  WITH CHECK (bucket_id = 'gallery');

-- Drop the is_admin function as it's no longer needed
DROP FUNCTION IF EXISTS is_admin();
/*
  # River of Life Ministries Database Schema

  1. New Tables
    - `devotions` - Daily devotional content with scripture references
    - `gallery` - Church event images with categories and captions  
    - `resources` - YouTube videos and audio files for sermons/worship
    - `donations` - Payment records with Pesapal integration
    - `prayer_requests` - Community prayer submissions
    - `admins` - Secure admin authentication

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access where appropriate
    - Add policies for admin-only write access
    - Add policies for authenticated user access to prayer requests

  3. Storage
    - Create storage buckets for gallery images and resource files
    - Set up storage policies for public access to gallery
    - Set up storage policies for public access to resources
*/

-- Create devotions table
CREATE TABLE IF NOT EXISTS devotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  scripture text NOT NULL,
  author text NOT NULL DEFAULT 'Pastor',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create gallery table
CREATE TABLE IF NOT EXISTS gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  image_url text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  type text NOT NULL CHECK (type IN ('video', 'audio')),
  url text NOT NULL,
  category text NOT NULL DEFAULT 'sermon',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount decimal(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'UGX',
  donor_name text,
  donor_email text,
  donor_phone text,
  payment_method text,
  transaction_id text,
  pesapal_tracking_id text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create prayer_requests table
CREATE TABLE IF NOT EXISTS prayer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text,
  phone text,
  request text NOT NULL,
  is_anonymous boolean DEFAULT false,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'prayed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE devotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policies for devotions (public read access)
CREATE POLICY "Anyone can read devotions"
  ON devotions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only authenticated users can insert devotions"
  ON devotions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update devotions"
  ON devotions
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Only authenticated users can delete devotions"
  ON devotions
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for gallery (public read access)
CREATE POLICY "Anyone can read gallery"
  ON gallery
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only authenticated users can insert gallery"
  ON gallery
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update gallery"
  ON gallery
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Only authenticated users can delete gallery"
  ON gallery
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for resources (public read access)
CREATE POLICY "Anyone can read resources"
  ON resources
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only authenticated users can insert resources"
  ON resources
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update resources"
  ON resources
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Only authenticated users can delete resources"
  ON resources
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for donations (admin access only)
CREATE POLICY "Only authenticated users can read donations"
  ON donations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert donations"
  ON donations
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update donations"
  ON donations
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create policies for prayer_requests (admin access for read, public for insert)
CREATE POLICY "Only authenticated users can read prayer requests"
  ON prayer_requests
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert prayer requests"
  ON prayer_requests
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update prayer requests"
  ON prayer_requests
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create policies for admins (admin access only)
CREATE POLICY "Only authenticated users can read admins"
  ON admins
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only authenticated users can insert admins"
  ON admins
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update admins"
  ON admins
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_devotions_created_at ON devotions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery(category);
CREATE INDEX IF NOT EXISTS idx_gallery_created_at ON gallery(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_status ON prayer_requests(status);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_created_at ON prayer_requests(created_at DESC);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('gallery', 'gallery', true),
  ('resources', 'resources', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for gallery bucket
CREATE POLICY "Public can view gallery images"
  ON storage.objects
  FOR SELECT
  TO public
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

-- Create storage policies for resources bucket
CREATE POLICY "Public can view resource files"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'resources');

CREATE POLICY "Authenticated users can upload resource files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'resources');

CREATE POLICY "Authenticated users can update resource files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'resources');

CREATE POLICY "Authenticated users can delete resource files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'resources');
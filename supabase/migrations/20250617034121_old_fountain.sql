/*
  # Fix Admin RLS Policies

  This migration updates the Row Level Security policies for all tables to properly
  allow admin users (those whose email exists in the admins table) to perform
  CRUD operations.

  ## Changes Made

  1. **Resources Table**
     - Update INSERT policy to allow admins
     - Update UPDATE policy to allow admins
     - Update DELETE policy to allow admins

  2. **Gallery Table**
     - Update INSERT policy to allow admins
     - Update UPDATE policy to allow admins
     - Update DELETE policy to allow admins

  3. **Devotions Table**
     - Update INSERT policy to allow admins
     - Update UPDATE policy to allow admins
     - Update DELETE policy to allow admins

  4. **Prayer Requests Table**
     - Update UPDATE policy to allow admins

  5. **Donations Table**
     - Update UPDATE policy to allow admins

  ## Security
  - All policies check that the user is authenticated AND their email exists in the admins table
  - Public read access is maintained where appropriate
  - Admin-only operations are properly secured
*/

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE email = auth.jwt() ->> 'email'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Resources table policies
DROP POLICY IF EXISTS "Only authenticated users can insert resources" ON resources;
DROP POLICY IF EXISTS "Only authenticated users can update resources" ON resources;
DROP POLICY IF EXISTS "Only authenticated users can delete resources" ON resources;

CREATE POLICY "Only admins can insert resources"
  ON resources
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can update resources"
  ON resources
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete resources"
  ON resources
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Gallery table policies
DROP POLICY IF EXISTS "Only authenticated users can insert gallery" ON gallery;
DROP POLICY IF EXISTS "Only authenticated users can update gallery" ON gallery;
DROP POLICY IF EXISTS "Only authenticated users can delete gallery" ON gallery;

CREATE POLICY "Only admins can insert gallery"
  ON gallery
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can update gallery"
  ON gallery
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete gallery"
  ON gallery
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Devotions table policies
DROP POLICY IF EXISTS "Only authenticated users can insert devotions" ON devotions;
DROP POLICY IF EXISTS "Only authenticated users can update devotions" ON devotions;
DROP POLICY IF EXISTS "Only authenticated users can delete devotions" ON devotions;

CREATE POLICY "Only admins can insert devotions"
  ON devotions
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can update devotions"
  ON devotions
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete devotions"
  ON devotions
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Prayer requests table policies
DROP POLICY IF EXISTS "Only authenticated users can update prayer requests" ON prayer_requests;

CREATE POLICY "Only admins can update prayer requests"
  ON prayer_requests
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Donations table policies
DROP POLICY IF EXISTS "Only authenticated users can update donations" ON donations;

CREATE POLICY "Only admins can update donations"
  ON donations
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Admins table policies (allow admins to manage other admins)
DROP POLICY IF EXISTS "Only authenticated users can insert admins" ON admins;
DROP POLICY IF EXISTS "Only authenticated users can read admins" ON admins;
DROP POLICY IF EXISTS "Only authenticated users can update admins" ON admins;

CREATE POLICY "Only admins can insert admins"
  ON admins
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can read admins"
  ON admins
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Only admins can update admins"
  ON admins
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
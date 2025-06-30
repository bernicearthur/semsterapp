/*
  # Fix Profile Policies

  1. Security Updates
    - Update profile policies to ensure proper access control
    - Fix any potential security issues with profile visibility
    - Ensure users can only access profiles from their school or their own profile

  2. Policy Improvements
    - Consolidate duplicate SELECT policies
    - Ensure consistent policy naming
    - Add proper constraints for profile access
*/

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view profiles from their school" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Anon users can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;

-- Create consolidated and improved policies
CREATE POLICY "Users can view accessible profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    (school = get_my_school()) OR (id = uid())
  );

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (uid() = id)
  WITH CHECK (uid() = id);

-- Allow service role and anon users to insert profiles (needed for user registration)
CREATE POLICY "Service role can insert profiles"
  ON profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Anon users can insert profiles"
  ON profiles
  FOR INSERT
  TO anon
  WITH CHECK (true);
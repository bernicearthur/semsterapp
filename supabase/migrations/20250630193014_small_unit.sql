/*
  # Fix Profile RLS Policies for User Creation

  1. Updates
    - Add policy for anon users to insert profiles during signup
    - Fix authenticated users policy to use WITH CHECK properly
    - Add policy for service role to insert profiles
    - Add policy for users to view profiles from their school
  
  2. Security
    - Ensure proper security context for all functions
    - Fix RLS policies to allow proper profile creation and access
*/

-- Add policy for anon users to insert profiles during signup
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Anon users can insert profiles'
  ) THEN
    CREATE POLICY "Anon users can insert profiles"
      ON profiles
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END $$;

-- Fix the existing policy for authenticated users to insert profiles
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile'
  ) THEN
    DROP POLICY "Users can insert their own profile" ON profiles;
  END IF;
END $$;

-- Create a new policy with the correct WITH CHECK expression
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Add policy for service role to insert profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Service role can insert profiles'
  ) THEN
    CREATE POLICY "Service role can insert profiles"
      ON profiles
      FOR INSERT
      TO service_role
      WITH CHECK (true);
  END IF;
END $$;

-- Add policy for users to view profiles from their school
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can view profiles from their school'
  ) THEN
    CREATE POLICY "Users can view profiles from their school"
      ON profiles
      FOR SELECT
      TO authenticated
      USING (
        school = get_my_school() OR
        id = auth.uid()
      );
  END IF;
END $$;

-- Ensure users can view their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can view their own profile'
  ) THEN
    CREATE POLICY "Users can view their own profile"
      ON profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;
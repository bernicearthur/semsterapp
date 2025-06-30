/*
  # Fix Profiles RLS Policy for User Creation

  1. Updates
    - Fix RLS policies for the profiles table to allow proper user creation
    - Add policy for anon users to insert profiles during signup
    - Fix the WITH CHECK expression in the existing policy
  
  2. Security
    - Maintain proper security context for all functions
    - Ensure both anon and authenticated users can create profiles
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
      USING (true);
  END IF;
END $$;

-- Update the handle_new_user function to better handle profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  full_name text;
  avatar_url text;
  username text;
  school text;
  email text;
  provider text;
BEGIN
  -- Get the user's email
  email := NEW.email;
  
  -- Get the provider if available
  provider := NEW.raw_app_meta_data->>'provider';
  
  -- Extract user data based on provider
  IF provider = 'google' THEN
    -- Google OAuth provides different metadata structure
    full_name := COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'given_name' || ' ' || NEW.raw_user_meta_data->>'family_name',
      ''
    );
    
    avatar_url := COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      NULL
    );
    
    -- Generate username from email for Google users
    username := COALESCE(
      NEW.raw_user_meta_data->>'preferred_username',
      split_part(email, '@', 1),
      ''
    );
    
  ELSIF provider = 'microsoft' THEN
    -- Microsoft OAuth provides different metadata structure
    full_name := COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'display_name',
      ''
    );
    
    avatar_url := COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NULL
    );
    
    -- Generate username from email for Microsoft users
    username := COALESCE(
      NEW.raw_user_meta_data->>'preferred_username',
      split_part(email, '@', 1),
      ''
    );
    
  ELSE
    -- Default for email provider or other providers
    full_name := COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      ''
    );
    
    avatar_url := NEW.raw_user_meta_data->>'avatar_url';
    
    -- For email signup, use username from metadata or generate from email
    username := COALESCE(
      NEW.raw_user_meta_data->>'username',
      split_part(email, '@', 1),
      ''
    );
  END IF;
  
  -- Try to extract school from email domain using the function
  school := COALESCE(
    get_school_from_email(email),
    NEW.raw_user_meta_data->>'school',
    ''
  );

  -- Make sure username is unique if provided
  IF username IS NOT NULL AND username != '' THEN
    -- Check if username exists and append numbers if needed
    WHILE EXISTS (SELECT 1 FROM profiles WHERE profiles.username = username) LOOP
      username := username || floor(random() * 1000)::text;
    END LOOP;
  END IF;

  -- Insert into profiles table with non-null values
  INSERT INTO public.profiles (
    id, 
    full_name, 
    avatar_url, 
    username,
    school
  )
  VALUES (
    NEW.id, 
    COALESCE(full_name, ''),
    avatar_url,
    COALESCE(username, ''),
    COALESCE(school, '')
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
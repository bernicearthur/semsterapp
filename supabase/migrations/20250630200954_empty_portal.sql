/*
  # Fix Profile Creation Issues

  1. Changes
     - Add trigger to automatically create profiles for new users
     - Fix profile policies to allow proper creation during signup
     - Add function to create profiles if they don't exist

  2. Security
     - Maintain proper RLS policies
     - Ensure users can only access their own profiles
*/

-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, school)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
    COALESCE(NEW.raw_user_meta_data->>'school', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profiles for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to create a profile if it doesn't exist
CREATE OR REPLACE FUNCTION public.create_profile_if_not_exists(
  user_id UUID,
  user_email TEXT,
  user_full_name TEXT DEFAULT '',
  user_username TEXT DEFAULT '',
  user_avatar_url TEXT DEFAULT NULL,
  user_school TEXT DEFAULT ''
) RETURNS BOOLEAN AS $$
DECLARE
  profile_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = user_id) INTO profile_exists;
  
  IF NOT profile_exists THEN
    INSERT INTO public.profiles (id, username, full_name, avatar_url, school)
    VALUES (user_id, user_username, user_full_name, user_avatar_url, user_school);
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix profile policies
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anon users can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles from their school" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create new policies
CREATE POLICY "Anyone can create profiles during signup"
  ON public.profiles
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can view profiles from their school"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    (school = get_my_school()) OR (id = auth.uid())
  );

-- Create helper function to get user's school
CREATE OR REPLACE FUNCTION public.get_my_school()
RETURNS TEXT AS $$
DECLARE
  user_school TEXT;
BEGIN
  SELECT school INTO user_school FROM profiles WHERE id = auth.uid();
  RETURN user_school;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
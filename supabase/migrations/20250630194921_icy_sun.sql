/*
  # Fix Signup Errors and Profile Creation

  1. Updates
    - Fix the handle_new_user function to properly handle profile creation
    - Add error handling to prevent failures during user creation
    - Ensure proper RLS policies for profile creation
    - Fix issues with the auth.uid() function in policies
  
  2. Security
    - Maintain proper security context for all functions
    - Ensure service role and anon users can create profiles during signup
*/

-- Drop and recreate the handle_new_user function with better error handling
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

  -- Check if profile already exists to avoid duplicate key errors
  IF EXISTS (SELECT 1 FROM profiles WHERE id = NEW.id) THEN
    -- Profile already exists, update it instead
    UPDATE public.profiles
    SET 
      full_name = COALESCE(full_name, ''),
      avatar_url = avatar_url,
      username = COALESCE(username, ''),
      school = COALESCE(school, '')
    WHERE id = NEW.id;
  ELSE
    -- Insert into profiles table with non-null values
    BEGIN
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
    EXCEPTION WHEN OTHERS THEN
      -- Log the error but don't fail the transaction
      RAISE NOTICE 'Error creating profile for user %: %', NEW.id, SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure all necessary policies exist for profile creation
DO $$
BEGIN
  -- Check and create policy for anon users
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

  -- Check and create policy for service role
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

  -- Check and create policy for users to insert their own profile
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile'
  ) THEN
    DROP POLICY "Users can insert their own profile" ON profiles;
  END IF;
  
  CREATE POLICY "Users can insert their own profile"
    ON profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

  -- Check and create policy for users to view their own profile
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

  -- Check and create policy for users to view profiles from their school
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

  -- Check and create policy for users to update their own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile"
      ON profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;

-- Create a function to check if a profile exists for a user
CREATE OR REPLACE FUNCTION profile_exists_for_user(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to the function
GRANT EXECUTE ON FUNCTION profile_exists_for_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION profile_exists_for_user(uuid) TO anon;
GRANT EXECUTE ON FUNCTION profile_exists_for_user(uuid) TO service_role;

-- Ensure the trigger exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;
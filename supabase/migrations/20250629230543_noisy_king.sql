/*
  # Update user handling and authentication

  1. Updates
    - Modify the handle_new_user function to support social logins
    - Add support for username-based authentication through RPC function
  2. Security
    - Use security definer for functions
    - Avoid direct auth schema manipulation
*/

-- Update the handle_new_user function to handle social logins
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  full_name text;
  avatar_url text;
  username text;
  school text;
BEGIN
  -- Extract user data based on provider
  IF NEW.raw_app_meta_data->>'provider' = 'google' THEN
    full_name := NEW.raw_user_meta_data->>'full_name';
    avatar_url := NEW.raw_user_meta_data->>'avatar_url';
    -- Generate username from email for Google users
    username := split_part(NEW.email, '@', 1);
    -- Try to extract school from email domain
    school := split_part(split_part(NEW.email, '@', 2), '.', 1);
    IF school = 'ashesi' THEN
      school := 'Ashesi University';
    END IF;
  ELSIF NEW.raw_app_meta_data->>'provider' = 'microsoft' THEN
    full_name := NEW.raw_user_meta_data->>'name';
    avatar_url := NEW.raw_user_meta_data->>'avatar_url';
    -- Generate username from email for Microsoft users
    username := split_part(NEW.email, '@', 1);
    -- Try to extract school from email domain
    school := split_part(split_part(NEW.email, '@', 2), '.', 1);
    IF school = 'ashesi' THEN
      school := 'Ashesi University';
    END IF;
  ELSE
    -- Default for email provider
    full_name := NEW.raw_user_meta_data->>'full_name';
    avatar_url := NEW.raw_user_meta_data->>'avatar_url';
    username := NULL; -- Will be set during profile setup
    school := NEW.raw_user_meta_data->>'school';
  END IF;

  -- Insert into profiles table
  INSERT INTO public.profiles (id, full_name, avatar_url, username, school)
  VALUES (NEW.id, full_name, avatar_url, username, school);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to find user by username
CREATE OR REPLACE FUNCTION public.get_user_email_by_username(username text)
RETURNS TABLE (email text) AS $$
BEGIN
  RETURN QUERY
  SELECT u.email
  FROM auth.users u
  JOIN public.profiles p ON u.id = p.id
  WHERE p.username = get_user_email_by_username.username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to authenticate by username (as an RPC function)
CREATE OR REPLACE FUNCTION public.authenticate_by_username(
  username text,
  password text
) RETURNS json AS $$
DECLARE
  user_email text;
BEGIN
  -- Find the email associated with the username
  SELECT email INTO user_email FROM public.get_user_email_by_username(username);
  
  -- If no email found, return error
  IF user_email IS NULL THEN
    RETURN json_build_object(
      'error', 'Invalid username or password'
    );
  END IF;
  
  -- Return the email to be used for authentication on the client side
  RETURN json_build_object(
    'email', user_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a default user for Andrew Sem Tetteh if not exists
DO $$
DECLARE
  user_id uuid;
  user_exists boolean;
  profile_exists boolean;
BEGIN
  -- Check if the profile already exists
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE username = 'sem'
  ) INTO profile_exists;

  -- If profile already exists, we don't need to do anything
  IF profile_exists THEN
    RETURN;
  END IF;

  -- Check if the user already exists in auth.users
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'andrew.tetteh@ashesi.edu.gh'
  ) INTO user_exists;

  IF user_exists THEN
    -- Get the existing user's ID
    SELECT id INTO user_id FROM auth.users 
    WHERE email = 'andrew.tetteh@ashesi.edu.gh' LIMIT 1;
    
    -- Check if this user already has a profile
    SELECT EXISTS (
      SELECT 1 FROM profiles WHERE id = user_id
    ) INTO profile_exists;
    
    -- Only create profile if it doesn't exist
    IF NOT profile_exists THEN
      -- Create profile for existing user
      INSERT INTO profiles (
        id,
        username,
        full_name,
        school,
        created_at,
        updated_at
      )
      VALUES (
        user_id,
        'sem',
        'Andrew Sem Tetteh',
        'Ashesi University',
        now(),
        now()
      );
    END IF;
  END IF;
END $$;
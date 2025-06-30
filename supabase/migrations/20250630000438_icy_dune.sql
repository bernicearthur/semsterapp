/*
  # Add school domain validation and improve school-based access

  1. New Functions
    - `validate_school_email_domain` - Validates that an email belongs to a school domain
    - `get_school_from_email` - Extracts school name from email domain
    - `get_users_from_same_school` - Gets users from the same school
  
  2. Updates
    - Improve the handle_new_user function to better extract school from email
    - Add more comprehensive school domain mapping
*/

-- Function to validate if an email belongs to a recognized school domain
CREATE OR REPLACE FUNCTION validate_school_email_domain(email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  domain TEXT;
BEGIN
  domain := split_part(email, '@', 2);
  
  -- Check if domain is a recognized school domain
  RETURN domain LIKE '%.edu' 
      OR domain LIKE '%.edu.%' 
      OR domain LIKE '%.ac.%'
      OR domain = 'ashesi.edu.gh'
      OR domain = 'ug.edu.gh'
      OR domain = 'knust.edu.gh'
      OR domain = 'ucc.edu.gh'
      OR domain = 'gimpa.edu.gh';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to extract school name from email domain
CREATE OR REPLACE FUNCTION get_school_from_email(email TEXT)
RETURNS TEXT AS $$
DECLARE
  domain TEXT;
BEGIN
  domain := split_part(email, '@', 2);
  
  -- Map domains to school names
  IF domain = 'ashesi.edu.gh' THEN
    RETURN 'Ashesi University';
  ELSIF domain = 'ug.edu.gh' THEN
    RETURN 'University of Ghana';
  ELSIF domain = 'knust.edu.gh' THEN
    RETURN 'Kwame Nkrumah University of Science and Technology';
  ELSIF domain = 'ucc.edu.gh' THEN
    RETURN 'University of Cape Coast';
  ELSIF domain = 'gimpa.edu.gh' THEN
    RETURN 'Ghana Institute of Management and Public Administration';
  ELSIF domain LIKE '%.edu' OR domain LIKE '%.edu.%' OR domain LIKE '%.ac.%' THEN
    -- For other educational domains, extract the institution name
    RETURN initcap(replace(split_part(domain, '.', 1), '-', ' ')) || ' University';
  ELSE
    -- Default case
    RETURN NULL;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get users from the same school
CREATE OR REPLACE FUNCTION get_users_from_same_school(limit_param INTEGER DEFAULT 10, offset_param INTEGER DEFAULT 0)
RETURNS SETOF profiles AS $$
DECLARE
  user_school TEXT;
BEGIN
  -- Get the current user's school
  SELECT school INTO user_school FROM profiles WHERE id = auth.uid();
  
  -- Return users from the same school
  RETURN QUERY
  SELECT p.*
  FROM profiles p
  WHERE p.school = user_school
  AND p.id != auth.uid()
  ORDER BY p.created_at DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Improve the handle_new_user function to better extract school from email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  full_name text;
  avatar_url text;
  username text;
  school text;
  email text;
BEGIN
  -- Get the user's email
  email := NEW.email;
  
  -- Extract user data based on provider
  IF NEW.raw_app_meta_data->>'provider' = 'google' THEN
    full_name := NEW.raw_user_meta_data->>'full_name';
    avatar_url := NEW.raw_user_meta_data->>'avatar_url';
    -- Generate username from email for Google users
    username := split_part(email, '@', 1);
  ELSIF NEW.raw_app_meta_data->>'provider' = 'microsoft' THEN
    full_name := NEW.raw_user_meta_data->>'name';
    avatar_url := NEW.raw_user_meta_data->>'avatar_url';
    -- Generate username from email for Microsoft users
    username := split_part(email, '@', 1);
  ELSE
    -- Default for email provider
    full_name := NEW.raw_user_meta_data->>'full_name';
    avatar_url := NEW.raw_user_meta_data->>'avatar_url';
    username := NULL; -- Will be set during profile setup
  END IF;
  
  -- Try to extract school from email domain using the function
  school := get_school_from_email(email);
  
  -- If school is provided in metadata, use that instead
  IF NEW.raw_user_meta_data->>'school' IS NOT NULL THEN
    school := NEW.raw_user_meta_data->>'school';
  END IF;

  -- Insert into profiles table
  INSERT INTO public.profiles (id, full_name, avatar_url, username, school)
  VALUES (NEW.id, full_name, avatar_url, username, school);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if a user can access a specific school's data
CREATE OR REPLACE FUNCTION can_access_school_data(school_param TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_school TEXT;
BEGIN
  -- Get the current user's school
  SELECT school INTO user_school FROM profiles WHERE id = auth.uid();
  
  -- Return true if the schools match
  RETURN user_school = school_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
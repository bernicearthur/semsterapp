/*
  # Improve Social Authentication Support

  1. Updates
    - Enhance the handle_new_user function to better handle social login data
    - Add support for extracting profile information from various OAuth providers
    - Improve school detection from email domains
  
  2. Security
    - Ensure proper security context for all functions
    - Add validation for social auth providers
*/

-- Update the handle_new_user function to better handle social logins
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
      NEW.raw_user_meta_data->>'given_name' || ' ' || NEW.raw_user_meta_data->>'family_name'
    );
    
    avatar_url := COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    );
    
    -- Generate username from email or name for Google users
    username := COALESCE(
      NEW.raw_user_meta_data->>'preferred_username',
      split_part(email, '@', 1)
    );
    
  ELSIF provider = 'microsoft' THEN
    -- Microsoft OAuth provides different metadata structure
    full_name := COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'display_name'
    );
    
    avatar_url := NEW.raw_user_meta_data->>'avatar_url';
    
    -- Generate username from email or name for Microsoft users
    username := COALESCE(
      NEW.raw_user_meta_data->>'preferred_username',
      split_part(email, '@', 1)
    );
    
  ELSIF provider = 'apple' THEN
    -- Apple OAuth provides different metadata structure
    full_name := COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'given_name' || ' ' || NEW.raw_user_meta_data->>'family_name'
    );
    
    -- Apple doesn't provide avatar URLs
    avatar_url := NULL;
    
    -- Generate username from email for Apple users
    username := split_part(email, '@', 1);
    
  ELSE
    -- Default for email provider or other providers
    full_name := COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name'
    );
    
    avatar_url := NEW.raw_user_meta_data->>'avatar_url';
    
    -- For email signup, username will be set during profile setup
    username := NULL;
  END IF;
  
  -- Try to extract school from email domain using the function
  school := get_school_from_email(email);
  
  -- If school is provided in metadata, use that instead
  IF NEW.raw_user_meta_data->>'school' IS NOT NULL THEN
    school := NEW.raw_user_meta_data->>'school';
  END IF;

  -- Make sure username is unique if provided
  IF username IS NOT NULL THEN
    -- Check if username exists and append numbers if needed
    WHILE EXISTS (SELECT 1 FROM profiles WHERE profiles.username = username) LOOP
      username := username || floor(random() * 1000)::text;
    END LOOP;
  END IF;

  -- Insert into profiles table
  INSERT INTO public.profiles (id, full_name, avatar_url, username, school)
  VALUES (NEW.id, full_name, avatar_url, username, school);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to validate social auth providers
CREATE OR REPLACE FUNCTION validate_auth_provider(provider text)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN provider IN ('google', 'microsoft', 'apple', 'github', 'gitlab', 'bitbucket', 'twitter', 'discord', 'twitch', 'spotify');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to the functions
GRANT EXECUTE ON FUNCTION validate_auth_provider(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_auth_provider(TEXT) TO anon;
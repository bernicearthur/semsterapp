/*
  # Add support for social login and username authentication

  1. Changes
    - Add trigger to handle social login profiles
    - Update handle_new_user function to support social logins
    - Add function to find user by username
*/

-- Update the handle_new_user function to better handle social logins
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  full_name text;
  avatar_url text;
  school text;
  username text;
BEGIN
  -- Get user information from metadata
  full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'preferred_username',
    split_part(NEW.email, '@', 1)
  );
  
  avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture'
  );
  
  -- Extract school from email domain if available
  IF NEW.email LIKE '%@ashesi.edu.gh' THEN
    school := 'Ashesi University';
  ELSIF NEW.email LIKE '%@ug.edu.gh' THEN
    school := 'University of Ghana';
  ELSIF NEW.email LIKE '%@knust.edu.gh' THEN
    school := 'Kwame Nkrumah University of Science and Technology';
  ELSE
    school := NULL;
  END IF;
  
  -- Generate username from email if not provided
  username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'preferred_username',
    split_part(NEW.email, '@', 1)
  );
  
  -- Check if username exists and append numbers if needed
  WHILE EXISTS (SELECT 1 FROM profiles WHERE profiles.username = username) LOOP
    username := username || floor(random() * 1000)::text;
  END LOOP;
  
  -- Insert into profiles
  INSERT INTO public.profiles (
    id, 
    full_name, 
    avatar_url, 
    username,
    school
  )
  VALUES (
    NEW.id, 
    full_name, 
    avatar_url, 
    username,
    school
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to find a user by username
CREATE OR REPLACE FUNCTION public.get_user_by_username(username_param TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT au.id, au.email
  FROM auth.users au
  JOIN public.profiles p ON au.id = p.id
  WHERE p.username = username_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
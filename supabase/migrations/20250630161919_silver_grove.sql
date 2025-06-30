/*
  # Add school email validation functions

  1. New Functions
    - `validate_school_email_domain(email text)` - Validates if an email domain belongs to a recognized school
    - `get_school_from_email(email text)` - Extracts school name from email domain
    - `can_access_school_data(school_param text)` - Checks if user can access school data
    - `get_my_school()` - Gets current user's school from their profile

  2. Security
    - Functions are accessible to authenticated users
    - School validation is based on the school_domains table
*/

-- Function to validate if an email domain belongs to a recognized school
CREATE OR REPLACE FUNCTION validate_school_email_domain(email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  domain_part text;
BEGIN
  -- Extract domain from email
  domain_part := split_part(email, '@', 2);
  
  -- Check if domain exists in school_domains table
  RETURN EXISTS (
    SELECT 1 FROM school_domains 
    WHERE domain = domain_part
  );
END;
$$;

-- Function to get school name from email domain
CREATE OR REPLACE FUNCTION get_school_from_email(email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  domain_part text;
  school_name text;
BEGIN
  -- Extract domain from email
  domain_part := split_part(email, '@', 2);
  
  -- Get school name from school_domains table
  SELECT sd.school_name INTO school_name
  FROM school_domains sd
  WHERE sd.domain = domain_part;
  
  RETURN school_name;
END;
$$;

-- Function to check if user can access school data
CREATE OR REPLACE FUNCTION can_access_school_data(school_param text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_school text;
BEGIN
  -- Get current user's school
  SELECT school INTO user_school
  FROM profiles
  WHERE id = auth.uid();
  
  -- Return true if user's school matches the requested school
  RETURN user_school = school_param;
END;
$$;

-- Function to get current user's school (if not already exists)
CREATE OR REPLACE FUNCTION get_my_school()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_school text;
BEGIN
  -- Get current user's school from profiles
  SELECT school INTO user_school
  FROM profiles
  WHERE id = auth.uid();
  
  RETURN user_school;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION validate_school_email_domain(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_school_from_email(text) TO authenticated;
GRANT EXECUTE ON FUNCTION can_access_school_data(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_my_school() TO authenticated;

-- Also grant to anon for email validation during signup
GRANT EXECUTE ON FUNCTION validate_school_email_domain(text) TO anon;
GRANT EXECUTE ON FUNCTION get_school_from_email(text) TO anon;
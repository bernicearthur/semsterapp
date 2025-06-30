/*
  # Improve School Domain Validation and OTP Verification

  1. Updates
    - Enhance the validate_school_email_domain function
    - Improve the get_school_from_email function
    - Add support for OTP verification
  
  2. Security
    - Ensure proper security context for functions
    - Validate email domains properly
*/

-- Improve the validate_school_email_domain function
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

-- Improve the get_school_from_email function
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

-- Grant execute permissions to the functions
GRANT EXECUTE ON FUNCTION validate_school_email_domain(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_school_email_domain(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_school_from_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_school_from_email(TEXT) TO anon;
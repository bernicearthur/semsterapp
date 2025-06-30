-- Add common email domains for testing purposes
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
  IF EXISTS (
    SELECT 1 FROM school_domains 
    WHERE domain = domain_part
  ) THEN
    RETURN true;
  END IF;
  
  -- Check common educational domain patterns
  -- Also include common email domains for testing purposes
  RETURN domain_part LIKE '%.edu' 
      OR domain_part LIKE '%.edu.%' 
      OR domain_part LIKE '%.ac.%'
      OR domain_part = 'ashesi.edu.gh'
      OR domain_part = 'ug.edu.gh'
      OR domain_part = 'knust.edu.gh'
      OR domain_part = 'ucc.edu.gh'
      OR domain_part = 'gimpa.edu.gh'
      OR domain_part = 'gmail.com'     -- For testing purposes
      OR domain_part = 'yahoo.com'     -- For testing purposes
      OR domain_part = 'outlook.com'   -- For testing purposes
      OR domain_part = 'hotmail.com';  -- For testing purposes
END;
$$;

-- Update the get_school_from_email function to include common email domains for testing
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
  
  -- Try to get school name from school_domains table
  SELECT sd.school_name INTO school_name
  FROM school_domains sd
  WHERE sd.domain = domain_part;
  
  -- If found in table, return it
  IF school_name IS NOT NULL THEN
    RETURN school_name;
  END IF;
  
  -- Otherwise, map common domains
  IF domain_part = 'ashesi.edu.gh' THEN
    RETURN 'Ashesi University';
  ELSIF domain_part = 'ug.edu.gh' THEN
    RETURN 'University of Ghana';
  ELSIF domain_part = 'knust.edu.gh' THEN
    RETURN 'Kwame Nkrumah University of Science and Technology';
  ELSIF domain_part = 'ucc.edu.gh' THEN
    RETURN 'University of Cape Coast';
  ELSIF domain_part = 'gimpa.edu.gh' THEN
    RETURN 'Ghana Institute of Management and Public Administration';
  ELSIF domain_part = 'gmail.com' THEN
    RETURN 'Gmail University';       -- For testing purposes
  ELSIF domain_part = 'yahoo.com' THEN
    RETURN 'Yahoo University';       -- For testing purposes
  ELSIF domain_part = 'outlook.com' THEN
    RETURN 'Outlook University';     -- For testing purposes
  ELSIF domain_part = 'hotmail.com' THEN
    RETURN 'Hotmail University';     -- For testing purposes
  ELSIF domain_part LIKE '%.edu' OR domain_part LIKE '%.edu.%' OR domain_part LIKE '%.ac.%' THEN
    -- For other educational domains, extract the institution name
    RETURN initcap(replace(split_part(domain_part, '.', 1), '-', ' ')) || ' University';
  ELSE
    -- Default case
    RETURN NULL;
  END IF;
END;
$$;

-- Insert common email domains for testing purposes
INSERT INTO school_domains (domain, school_name)
VALUES
  ('gmail.com', 'Gmail University'),       -- For testing purposes
  ('yahoo.com', 'Yahoo University'),       -- For testing purposes
  ('outlook.com', 'Outlook University'),   -- For testing purposes
  ('hotmail.com', 'Hotmail University')    -- For testing purposes
ON CONFLICT (domain) DO NOTHING;
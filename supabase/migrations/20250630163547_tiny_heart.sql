/*
  # Create school domains table and validation functions

  1. New Tables
    - `school_domains` - Maps email domains to school names
  
  2. New Functions
    - `validate_school_email_domain` - Validates if an email domain belongs to a recognized school
    - `get_school_from_email` - Extracts school name from email domain
*/

-- Create school domains table
CREATE TABLE IF NOT EXISTS school_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT UNIQUE NOT NULL,
  school_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_school_domains_domain ON school_domains(domain);
CREATE INDEX IF NOT EXISTS idx_school_domains_school_name ON school_domains USING gin(to_tsvector('english', school_name));

-- Enable RLS on the table
ALTER TABLE school_domains ENABLE ROW LEVEL SECURITY;

-- Create policies for the school_domains table
CREATE POLICY "Anyone can read school domains" 
  ON school_domains
  FOR SELECT 
  TO public
  USING (true);

CREATE POLICY "Authenticated users can read school domains" 
  ON school_domains
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Public can read school domains" 
  ON school_domains
  FOR SELECT 
  TO anon
  USING (true);

-- Create trigger to update updated_at column
CREATE TRIGGER update_school_domains_updated_at
  BEFORE UPDATE ON school_domains
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to validate if an email belongs to a recognized school domain
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
  RETURN domain_part LIKE '%.edu' 
      OR domain_part LIKE '%.edu.%' 
      OR domain_part LIKE '%.ac.%'
      OR domain_part = 'ashesi.edu.gh'
      OR domain_part = 'ug.edu.gh'
      OR domain_part = 'knust.edu.gh'
      OR domain_part = 'ucc.edu.gh'
      OR domain_part = 'gimpa.edu.gh';
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
  ELSIF domain_part LIKE '%.edu' OR domain_part LIKE '%.edu.%' OR domain_part LIKE '%.ac.%' THEN
    -- For other educational domains, extract the institution name
    RETURN initcap(replace(split_part(domain_part, '.', 1), '-', ' ')) || ' University';
  ELSE
    -- Default case
    RETURN NULL;
  END IF;
END;
$$;

-- Insert some common school domains
INSERT INTO school_domains (domain, school_name)
VALUES
  ('ashesi.edu.gh', 'Ashesi University'),
  ('ug.edu.gh', 'University of Ghana'),
  ('knust.edu.gh', 'Kwame Nkrumah University of Science and Technology'),
  ('ucc.edu.gh', 'University of Cape Coast'),
  ('gimpa.edu.gh', 'Ghana Institute of Management and Public Administration')
ON CONFLICT (domain) DO NOTHING;

-- Grant execute permissions to the functions
GRANT EXECUTE ON FUNCTION validate_school_email_domain(text) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_school_email_domain(text) TO anon;
GRANT EXECUTE ON FUNCTION get_school_from_email(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_school_from_email(text) TO anon;
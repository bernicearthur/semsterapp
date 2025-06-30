-- Create school domains table if it doesn't exist
CREATE TABLE IF NOT EXISTS school_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT UNIQUE NOT NULL,
  school_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for faster lookups if they don't exist
CREATE INDEX IF NOT EXISTS idx_school_domains_domain ON school_domains(domain);
CREATE INDEX IF NOT EXISTS idx_school_domains_school_name ON school_domains USING gin(to_tsvector('english', school_name));

-- Enable RLS on the table
ALTER TABLE school_domains ENABLE ROW LEVEL SECURITY;

-- Create policies for the school_domains table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'school_domains' AND policyname = 'Anyone can read school domains'
  ) THEN
    CREATE POLICY "Anyone can read school domains" 
      ON school_domains
      FOR SELECT 
      TO public
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'school_domains' AND policyname = 'Authenticated users can read school domains'
  ) THEN
    CREATE POLICY "Authenticated users can read school domains" 
      ON school_domains
      FOR SELECT 
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'school_domains' AND policyname = 'Public can read school domains'
  ) THEN
    CREATE POLICY "Public can read school domains" 
      ON school_domains
      FOR SELECT 
      TO anon
      USING (true);
  END IF;
END $$;

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_school_domains_updated_at'
  ) THEN
    CREATE TRIGGER update_school_domains_updated_at
      BEFORE UPDATE ON school_domains
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

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
      OR domain_part = 'gimpa.edu.gh'
      OR domain_part = 'gmail.com'     -- For testing purposes
      OR domain_part = 'yahoo.com'     -- For testing purposes
      OR domain_part = 'outlook.com'   -- For testing purposes
      OR domain_part = 'hotmail.com';  -- For testing purposes
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

-- Insert some common school domains (with conflict handling)
INSERT INTO school_domains (domain, school_name)
VALUES
  ('ashesi.edu.gh', 'Ashesi University'),
  ('ug.edu.gh', 'University of Ghana'),
  ('knust.edu.gh', 'Kwame Nkrumah University of Science and Technology'),
  ('ucc.edu.gh', 'University of Cape Coast'),
  ('gimpa.edu.gh', 'Ghana Institute of Management and Public Administration'),
  ('gmail.com', 'Gmail University'),       -- For testing purposes
  ('yahoo.com', 'Yahoo University'),       -- For testing purposes
  ('outlook.com', 'Outlook University'),   -- For testing purposes
  ('hotmail.com', 'Hotmail University')    -- For testing purposes
ON CONFLICT (domain) DO NOTHING;

-- Grant execute permissions to the functions
GRANT EXECUTE ON FUNCTION validate_school_email_domain(text) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_school_email_domain(text) TO anon;
GRANT EXECUTE ON FUNCTION get_school_from_email(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_school_from_email(text) TO anon;
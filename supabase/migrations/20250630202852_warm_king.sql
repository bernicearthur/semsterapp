/*
  # Add Top Schools and Test User

  1. New Data
    - Add more school domains to the school_domains table
    - Create a test user with university affiliation
  
  2. Updates
    - Ensure proper school domain validation
    - Add more comprehensive school domain mapping
*/

-- Insert more top schools into the school_domains table
INSERT INTO school_domains (domain, school_name)
VALUES
  -- Top US Universities
  ('harvard.edu', 'Harvard University'),
  ('stanford.edu', 'Stanford University'),
  ('mit.edu', 'Massachusetts Institute of Technology'),
  ('princeton.edu', 'Princeton University'),
  ('yale.edu', 'Yale University'),
  ('columbia.edu', 'Columbia University'),
  ('berkeley.edu', 'University of California, Berkeley'),
  ('cornell.edu', 'Cornell University'),
  ('upenn.edu', 'University of Pennsylvania'),
  ('caltech.edu', 'California Institute of Technology'),
  ('uchicago.edu', 'University of Chicago'),
  ('jhu.edu', 'Johns Hopkins University'),
  ('duke.edu', 'Duke University'),
  ('northwestern.edu', 'Northwestern University'),
  ('umich.edu', 'University of Michigan'),
  ('nyu.edu', 'New York University'),
  
  -- Top UK Universities
  ('ox.ac.uk', 'University of Oxford'),
  ('cam.ac.uk', 'University of Cambridge'),
  ('imperial.ac.uk', 'Imperial College London'),
  ('ucl.ac.uk', 'University College London'),
  ('lse.ac.uk', 'London School of Economics'),
  ('ed.ac.uk', 'University of Edinburgh'),
  ('manchester.ac.uk', 'University of Manchester'),
  ('bristol.ac.uk', 'University of Bristol'),
  
  -- Top African Universities
  ('uct.ac.za', 'University of Cape Town'),
  ('wits.ac.za', 'University of the Witwatersrand'),
  ('unilag.edu.ng', 'University of Lagos'),
  ('uonbi.ac.ke', 'University of Nairobi'),
  ('aucegypt.edu', 'American University in Cairo'),
  ('usthb.dz', 'University of Science and Technology Houari Boumediene'),
  ('um5.ac.ma', 'Mohammed V University'),
  ('uam.edu.ng', 'University of Abuja'),
  
  -- Top Asian Universities
  ('u-tokyo.ac.jp', 'University of Tokyo'),
  ('nus.edu.sg', 'National University of Singapore'),
  ('tsinghua.edu.cn', 'Tsinghua University'),
  ('pku.edu.cn', 'Peking University'),
  ('hku.hk', 'University of Hong Kong'),
  ('kaist.ac.kr', 'KAIST'),
  ('iitd.ac.in', 'Indian Institute of Technology Delhi'),
  ('iitb.ac.in', 'Indian Institute of Technology Bombay')
ON CONFLICT (domain) DO NOTHING;

-- Create a test user if it doesn't exist
DO $$
DECLARE
  test_user_id uuid;
  test_user_exists boolean;
  test_profile_exists boolean;
BEGIN
  -- Check if the user already exists in auth.users
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'test@stanford.edu'
  ) INTO test_user_exists;

  IF NOT test_user_exists THEN
    -- Create the test user in auth.users
    -- Note: In a real environment, this would be done through the auth API
    -- This is a simplified version for demonstration purposes
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_user_meta_data,
      raw_app_meta_data
    )
    VALUES (
      gen_random_uuid(),
      'test@stanford.edu',
      crypt('password123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"full_name": "Test User", "username": "testuser", "school": "Stanford University"}',
      '{"provider": "email"}'
    )
    RETURNING id INTO test_user_id;
    
    -- Create profile for the test user
    INSERT INTO profiles (
      id,
      username,
      full_name,
      avatar_url,
      school,
      created_at,
      updated_at
    )
    VALUES (
      test_user_id,
      'testuser',
      'Test User',
      NULL,
      'Stanford University',
      now(),
      now()
    );
  END IF;
END $$;
/*
  # Create test user with complete profile

  1. New Content
    - Creates a test user with email test@stanford.edu and password password123
    - Adds complete profile information for the test user
    - Ensures the user is properly linked to Stanford University

  2. Security
    - Uses secure methods to create the user
*/

-- Create a test user with a known password
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Check if the user already exists
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'test@stanford.edu';
  
  -- If user doesn't exist, create it
  IF test_user_id IS NULL THEN
    -- Insert the user into auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'test@stanford.edu',
      crypt('password123', gen_salt('bf')), -- Encrypts the password
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Test User","username":"testuser","school":"Stanford University"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    ) RETURNING id INTO test_user_id;
    
    -- Insert the user into the profiles table
    INSERT INTO public.profiles (
      id,
      username,
      full_name,
      avatar_url,
      school,
      created_at,
      updated_at
    ) VALUES (
      test_user_id,
      'testuser',
      'Test User',
      'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
      'Stanford University',
      now(),
      now()
    );
    
    -- Make sure the school domain exists
    INSERT INTO public.school_domains (domain, school_name)
    VALUES ('stanford.edu', 'Stanford University')
    ON CONFLICT (domain) DO NOTHING;
    
    RAISE NOTICE 'Test user created with ID: %', test_user_id;
  ELSE
    RAISE NOTICE 'Test user already exists with ID: %', test_user_id;
  END IF;
END $$;
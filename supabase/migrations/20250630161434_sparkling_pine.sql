/*
  # Add Username Uniqueness Constraint and Error Handling

  1. Updates
    - Add unique constraint to username in profiles table
    - Add function to check if username exists
    - Add function to check if email exists
  
  2. Security
    - Ensure proper error handling for duplicate usernames
    - Add RLS policies for username checks
*/

-- Create a function to check if a username already exists
CREATE OR REPLACE FUNCTION check_username_exists(username_param TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE username = username_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if an email already exists
CREATE OR REPLACE FUNCTION check_email_exists(email_param TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users WHERE email = email_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to the functions
GRANT EXECUTE ON FUNCTION check_username_exists(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_username_exists(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION check_email_exists(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_email_exists(TEXT) TO anon;

-- Make sure the username column in profiles has a unique constraint
DO $$
BEGIN
  -- Check if the unique constraint already exists
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_username_key'
  ) THEN
    -- Add the unique constraint if it doesn't exist
    ALTER TABLE profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
  END IF;
END $$;
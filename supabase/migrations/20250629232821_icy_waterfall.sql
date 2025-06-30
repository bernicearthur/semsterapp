/*
  # Fix authenticate_by_username function type mismatch

  1. Function Updates
    - Drop and recreate the `authenticate_by_username` function
    - Fix return type from character varying(255) to text for email column
    - Ensure proper authentication logic with username lookup

  2. Security
    - Function executes with proper security context
    - Returns email for successful authentication, error message for failures
*/

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS authenticate_by_username(text, text);

-- Create the corrected function with proper return types
CREATE OR REPLACE FUNCTION authenticate_by_username(
  username text,
  password text
)
RETURNS TABLE(email text, error text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email text;
  user_id uuid;
BEGIN
  -- Look up the user by username to get their email
  SELECT auth.users.email, auth.users.id
  INTO user_email, user_id
  FROM profiles
  JOIN auth.users ON profiles.id = auth.users.id
  WHERE profiles.username = authenticate_by_username.username;

  -- If user not found
  IF user_email IS NULL THEN
    RETURN QUERY SELECT NULL::text, 'Invalid username or password'::text;
    RETURN;
  END IF;

  -- Return the email for successful lookup
  -- The actual password verification will be handled by the auth.signInWithPassword call
  RETURN QUERY SELECT user_email, NULL::text;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION authenticate_by_username(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION authenticate_by_username(text, text) TO anon;
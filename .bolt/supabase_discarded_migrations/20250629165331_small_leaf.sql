/*
  # Fix group_members table issue

  1. Changes
    - Ensures the group_members table exists
    - Recreates policies for the group_members table
    - Fixes any references to group_members in other tables
  
  This migration addresses the error: "relation group_members does not exist"
*/

-- First, check if group_members table exists and create it if not
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view group members" ON group_members;
DROP POLICY IF EXISTS "Users can join groups" ON group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON group_members;

-- Recreate policies
CREATE POLICY "Users can view group members"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join groups"
  ON group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
  ON group_members
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix any functions or triggers that reference group_members
DO $$
BEGIN
  -- Check if the handle_notification function exists and recreate it
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_notification') THEN
    -- Recreate the function with proper references to group_members
    CREATE OR REPLACE FUNCTION handle_notification()
    RETURNS TRIGGER AS $$
    DECLARE
      notification_type TEXT;
      notification_content TEXT;
      related_user_id UUID;
    BEGIN
      -- Determine notification type and content based on the table and operation
      IF TG_TABLE_NAME = 'likes' AND TG_OP = 'INSERT' THEN
        IF NEW.post_id IS NOT NULL THEN
          notification_type := 'like_post';
          notification_content := 'liked your post';
          related_user_id := NEW.user_id;
          
          -- Insert notification for post owner
          INSERT INTO notifications (user_id, type, content, related_user_id, post_id)
          SELECT user_id, notification_type, notification_content, related_user_id, NEW.post_id
          FROM posts
          WHERE id = NEW.post_id AND user_id != NEW.user_id;
        ELSIF NEW.comment_id IS NOT NULL THEN
          notification_type := 'like_comment';
          notification_content := 'liked your comment';
          related_user_id := NEW.user_id;
          
          -- Insert notification for comment owner
          INSERT INTO notifications (user_id, type, content, related_user_id, comment_id)
          SELECT user_id, notification_type, notification_content, related_user_id, NEW.comment_id
          FROM comments
          WHERE id = NEW.comment_id AND user_id != NEW.user_id;
        END IF;
      ELSIF TG_TABLE_NAME = 'comments' AND TG_OP = 'INSERT' THEN
        notification_type := 'comment';
        notification_content := 'commented on your post';
        related_user_id := NEW.user_id;
        
        -- Insert notification for post owner
        INSERT INTO notifications (user_id, type, content, related_user_id, post_id, comment_id)
        SELECT user_id, notification_type, notification_content, related_user_id, NEW.post_id, NEW.id
        FROM posts
        WHERE id = NEW.post_id AND user_id != NEW.user_id;
      ELSIF TG_TABLE_NAME = 'connections' AND TG_OP = 'INSERT' THEN
        notification_type := 'connection_request';
        notification_content := 'sent you a connection request';
        related_user_id := NEW.user_id;
        
        -- Insert notification for connection recipient
        INSERT INTO notifications (user_id, type, content, related_user_id)
        VALUES (NEW.connected_user_id, notification_type, notification_content, related_user_id);
      ELSIF TG_TABLE_NAME = 'connections' AND TG_OP = 'UPDATE' AND NEW.status = 'accepted' AND OLD.status = 'pending' THEN
        notification_type := 'connection_accepted';
        notification_content := 'accepted your connection request';
        related_user_id := NEW.connected_user_id;
        
        -- Insert notification for connection requester
        INSERT INTO notifications (user_id, type, content, related_user_id)
        VALUES (NEW.user_id, notification_type, notification_content, related_user_id);
      ELSIF TG_TABLE_NAME = 'mentions' AND TG_OP = 'INSERT' THEN
        notification_type := 'mention';
        notification_content := 'mentioned you in a post';
        related_user_id := NEW.mentioner_id;
        
        -- Insert notification for mentioned user
        INSERT INTO notifications (user_id, type, content, related_user_id, post_id, comment_id)
        VALUES (
          NEW.mentioned_user_id, 
          notification_type, 
          notification_content, 
          related_user_id,
          NEW.post_id,
          NEW.comment_id
        );
      END IF;
      
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  END IF;
END
$$;

-- Ensure the updated_at trigger is applied to group_members
DROP TRIGGER IF EXISTS update_group_members_updated_at ON group_members;
CREATE TRIGGER update_group_members_updated_at
BEFORE UPDATE ON group_members
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
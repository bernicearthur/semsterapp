/*
  # Implement School-Based Access Control

  1. New Tables
    - `posts` - User posts with school-based access control
    - `comments` - Comments on posts with school-based access control
    - `connections` - User connections within the same school
    - `events` - School events with access control
    - `marketplace_listings` - Marketplace items with school-based access control
    - `lost_found_items` - Lost and found items with school-based access control
  
  2. Security
    - Enable RLS on all tables
    - Add policies to restrict access to users from the same school
    - Create helper functions for school-based queries
*/

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  images TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  school TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  reposts_count INTEGER DEFAULT 0
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0
);

-- Create connections table (for user connections within same school)
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  connected_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, connected_user_id)
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT,
  is_online BOOLEAN DEFAULT false,
  online_link TEXT,
  organizer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  image TEXT,
  category TEXT NOT NULL,
  is_free BOOLEAN DEFAULT true,
  price DECIMAL(10,2),
  max_attendees INTEGER,
  school TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create event attendees table
CREATE TABLE IF NOT EXISTS event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Create marketplace listings table
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  condition TEXT,
  location TEXT NOT NULL,
  images TEXT[] NOT NULL,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  school TEXT NOT NULL,
  is_sold BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create lost and found items table
CREATE TABLE IF NOT EXISTS lost_found_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  date TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('lost', 'found')),
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  reward TEXT,
  image TEXT,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  school TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create study rooms table
CREATE TABLE IF NOT EXISTS study_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  host_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  is_private BOOLEAN DEFAULT false,
  password TEXT,
  max_participants INTEGER,
  status TEXT NOT NULL CHECK (status IN ('live', 'scheduled')),
  start_time TEXT,
  end_time TEXT,
  school TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create study room participants table
CREATE TABLE IF NOT EXISTS study_room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES study_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Create job listings table
CREATE TABLE IF NOT EXISTS job_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  type TEXT NOT NULL,
  location TEXT NOT NULL,
  salary TEXT,
  deadline TEXT,
  description TEXT NOT NULL,
  requirements TEXT[] NOT NULL,
  benefits TEXT[] NOT NULL,
  image TEXT,
  is_remote BOOLEAN DEFAULT false,
  experience_level TEXT NOT NULL,
  department TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  company_website TEXT,
  poster_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  school TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create job applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES job_listings(id) ON DELETE CASCADE NOT NULL,
  applicant_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  cover_letter TEXT,
  resume_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(job_id, applicant_id)
);

-- Create likes table for posts
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create likes table for comments
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Create bookmarks table for posts
CREATE TABLE IF NOT EXISTS post_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create bookmarks table for events
CREATE TABLE IF NOT EXISTS event_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Create bookmarks table for job listings
CREATE TABLE IF NOT EXISTS job_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES job_listings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(job_id, user_id)
);

-- Create reposts table
CREATE TABLE IF NOT EXISTS reposts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create calendar events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT,
  description TEXT,
  type TEXT NOT NULL,
  is_all_day BOOLEAN DEFAULT false,
  has_reminder BOOLEAN DEFAULT false,
  reminder_time TEXT,
  color TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  school TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create helper function to check if users are from the same school
CREATE OR REPLACE FUNCTION users_from_same_school(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  school1 TEXT;
  school2 TEXT;
BEGIN
  SELECT school INTO school1 FROM profiles WHERE id = user1_id;
  SELECT school INTO school2 FROM profiles WHERE id = user2_id;
  
  -- If either school is NULL, return false
  IF school1 IS NULL OR school2 IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN school1 = school2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to get current user's school
CREATE OR REPLACE FUNCTION get_my_school()
RETURNS TEXT AS $$
DECLARE
  user_school TEXT;
BEGIN
  SELECT school INTO user_school FROM profiles WHERE id = auth.uid();
  RETURN user_school;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security on all tables
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_found_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reposts ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for posts
CREATE POLICY "Users can view posts from their school"
  ON posts
  FOR SELECT
  TO authenticated
  USING (school = get_my_school());

CREATE POLICY "Users can create posts for their school"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (school = get_my_school() AND user_id = auth.uid());

CREATE POLICY "Users can update their own posts"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own posts"
  ON posts
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create RLS policies for comments
CREATE POLICY "Users can view comments on posts from their school"
  ON comments
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM posts
    WHERE posts.id = comments.post_id
    AND posts.school = get_my_school()
  ));

CREATE POLICY "Users can create comments on posts from their school"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = comments.post_id
      AND posts.school = get_my_school()
    )
  );

CREATE POLICY "Users can update their own comments"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
  ON comments
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create RLS policies for connections
CREATE POLICY "Users can view their own connections"
  ON connections
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR connected_user_id = auth.uid());

CREATE POLICY "Users can create connections with users from same school"
  ON connections
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    users_from_same_school(user_id, connected_user_id)
  );

CREATE POLICY "Users can update their own connection requests"
  ON connections
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR connected_user_id = auth.uid());

CREATE POLICY "Users can delete their own connections"
  ON connections
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR connected_user_id = auth.uid());

-- Create RLS policies for events
CREATE POLICY "Users can view events from their school"
  ON events
  FOR SELECT
  TO authenticated
  USING (school = get_my_school());

CREATE POLICY "Users can create events for their school"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (school = get_my_school() AND organizer_id = auth.uid());

CREATE POLICY "Organizers can update their own events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (organizer_id = auth.uid());

CREATE POLICY "Organizers can delete their own events"
  ON events
  FOR DELETE
  TO authenticated
  USING (organizer_id = auth.uid());

-- Create RLS policies for event attendees
CREATE POLICY "Users can view event attendees for events from their school"
  ON event_attendees
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM events
    WHERE events.id = event_attendees.event_id
    AND events.school = get_my_school()
  ));

CREATE POLICY "Users can attend events from their school"
  ON event_attendees
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_attendees.event_id
      AND events.school = get_my_school()
    )
  );

CREATE POLICY "Users can remove themselves from events"
  ON event_attendees
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create RLS policies for marketplace listings
CREATE POLICY "Users can view marketplace listings from their school"
  ON marketplace_listings
  FOR SELECT
  TO authenticated
  USING (school = get_my_school());

CREATE POLICY "Users can create marketplace listings for their school"
  ON marketplace_listings
  FOR INSERT
  TO authenticated
  WITH CHECK (school = get_my_school() AND seller_id = auth.uid());

CREATE POLICY "Sellers can update their own listings"
  ON marketplace_listings
  FOR UPDATE
  TO authenticated
  USING (seller_id = auth.uid());

CREATE POLICY "Sellers can delete their own listings"
  ON marketplace_listings
  FOR DELETE
  TO authenticated
  USING (seller_id = auth.uid());

-- Create RLS policies for lost and found items
CREATE POLICY "Users can view lost and found items from their school"
  ON lost_found_items
  FOR SELECT
  TO authenticated
  USING (school = get_my_school());

CREATE POLICY "Users can create lost and found items for their school"
  ON lost_found_items
  FOR INSERT
  TO authenticated
  WITH CHECK (school = get_my_school() AND user_id = auth.uid());

CREATE POLICY "Users can update their own lost and found items"
  ON lost_found_items
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own lost and found items"
  ON lost_found_items
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create RLS policies for study rooms
CREATE POLICY "Users can view study rooms from their school"
  ON study_rooms
  FOR SELECT
  TO authenticated
  USING (school = get_my_school());

CREATE POLICY "Users can create study rooms for their school"
  ON study_rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (school = get_my_school() AND host_id = auth.uid());

CREATE POLICY "Hosts can update their own study rooms"
  ON study_rooms
  FOR UPDATE
  TO authenticated
  USING (host_id = auth.uid());

CREATE POLICY "Hosts can delete their own study rooms"
  ON study_rooms
  FOR DELETE
  TO authenticated
  USING (host_id = auth.uid());

-- Create RLS policies for study room participants
CREATE POLICY "Users can view study room participants for rooms from their school"
  ON study_room_participants
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM study_rooms
    WHERE study_rooms.id = study_room_participants.room_id
    AND study_rooms.school = get_my_school()
  ));

CREATE POLICY "Users can join study rooms from their school"
  ON study_room_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM study_rooms
      WHERE study_rooms.id = study_room_participants.room_id
      AND study_rooms.school = get_my_school()
    )
  );

CREATE POLICY "Users can leave study rooms"
  ON study_room_participants
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create RLS policies for job listings
CREATE POLICY "Users can view job listings from their school"
  ON job_listings
  FOR SELECT
  TO authenticated
  USING (school = get_my_school());

CREATE POLICY "Users can create job listings for their school"
  ON job_listings
  FOR INSERT
  TO authenticated
  WITH CHECK (school = get_my_school() AND poster_id = auth.uid());

CREATE POLICY "Posters can update their own job listings"
  ON job_listings
  FOR UPDATE
  TO authenticated
  USING (poster_id = auth.uid());

CREATE POLICY "Posters can delete their own job listings"
  ON job_listings
  FOR DELETE
  TO authenticated
  USING (poster_id = auth.uid());

-- Create RLS policies for job applications
CREATE POLICY "Users can view their own job applications"
  ON job_applications
  FOR SELECT
  TO authenticated
  USING (applicant_id = auth.uid() OR EXISTS (
    SELECT 1 FROM job_listings
    WHERE job_listings.id = job_applications.job_id
    AND job_listings.poster_id = auth.uid()
  ));

CREATE POLICY "Users can apply to jobs from their school"
  ON job_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    applicant_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM job_listings
      WHERE job_listings.id = job_applications.job_id
      AND job_listings.school = get_my_school()
    )
  );

CREATE POLICY "Users can update their own job applications"
  ON job_applications
  FOR UPDATE
  TO authenticated
  USING (applicant_id = auth.uid() OR EXISTS (
    SELECT 1 FROM job_listings
    WHERE job_listings.id = job_applications.job_id
    AND job_listings.poster_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own job applications"
  ON job_applications
  FOR DELETE
  TO authenticated
  USING (applicant_id = auth.uid());

-- Create RLS policies for post likes
CREATE POLICY "Users can view post likes"
  ON post_likes
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM posts
    WHERE posts.id = post_likes.post_id
    AND posts.school = get_my_school()
  ));

CREATE POLICY "Users can like posts from their school"
  ON post_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_likes.post_id
      AND posts.school = get_my_school()
    )
  );

CREATE POLICY "Users can unlike posts"
  ON post_likes
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create RLS policies for comment likes
CREATE POLICY "Users can view comment likes"
  ON comment_likes
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM comments
    JOIN posts ON comments.post_id = posts.id
    WHERE comments.id = comment_likes.comment_id
    AND posts.school = get_my_school()
  ));

CREATE POLICY "Users can like comments on posts from their school"
  ON comment_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM comments
      JOIN posts ON comments.post_id = posts.id
      WHERE comments.id = comment_likes.comment_id
      AND posts.school = get_my_school()
    )
  );

CREATE POLICY "Users can unlike comments"
  ON comment_likes
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create RLS policies for post bookmarks
CREATE POLICY "Users can view their own post bookmarks"
  ON post_bookmarks
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can bookmark posts from their school"
  ON post_bookmarks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_bookmarks.post_id
      AND posts.school = get_my_school()
    )
  );

CREATE POLICY "Users can remove their own post bookmarks"
  ON post_bookmarks
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create RLS policies for event bookmarks
CREATE POLICY "Users can view their own event bookmarks"
  ON event_bookmarks
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can bookmark events from their school"
  ON event_bookmarks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_bookmarks.event_id
      AND events.school = get_my_school()
    )
  );

CREATE POLICY "Users can remove their own event bookmarks"
  ON event_bookmarks
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create RLS policies for job bookmarks
CREATE POLICY "Users can view their own job bookmarks"
  ON job_bookmarks
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can bookmark jobs from their school"
  ON job_bookmarks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM job_listings
      WHERE job_listings.id = job_bookmarks.job_id
      AND job_listings.school = get_my_school()
    )
  );

CREATE POLICY "Users can remove their own job bookmarks"
  ON job_bookmarks
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create RLS policies for reposts
CREATE POLICY "Users can view reposts"
  ON reposts
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM posts
    WHERE posts.id = reposts.post_id
    AND posts.school = get_my_school()
  ));

CREATE POLICY "Users can repost posts from their school"
  ON reposts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = reposts.post_id
      AND posts.school = get_my_school()
    )
  );

CREATE POLICY "Users can remove their own reposts"
  ON reposts
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create RLS policies for calendar events
CREATE POLICY "Users can view their own calendar events"
  ON calendar_events
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create calendar events for their school"
  ON calendar_events
  FOR INSERT
  TO authenticated
  WITH CHECK (school = get_my_school() AND user_id = auth.uid());

CREATE POLICY "Users can update their own calendar events"
  ON calendar_events
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own calendar events"
  ON calendar_events
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create triggers to update counts
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_likes_count_trigger
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW
EXECUTE FUNCTION update_post_likes_count();

CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Only increment if it's a top-level comment (not a reply)
    IF NEW.parent_id IS NULL THEN
      UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    -- Only decrement if it's a top-level comment (not a reply)
    IF OLD.parent_id IS NULL THEN
      UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_comments_count_trigger
AFTER INSERT OR DELETE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_post_comments_count();

CREATE OR REPLACE FUNCTION update_post_reposts_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET reposts_count = reposts_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET reposts_count = reposts_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_reposts_count_trigger
AFTER INSERT OR DELETE ON reposts
FOR EACH ROW
EXECUTE FUNCTION update_post_reposts_count();

CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE comments SET likes_count = likes_count - 1 WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comment_likes_count_trigger
AFTER INSERT OR DELETE ON comment_likes
FOR EACH ROW
EXECUTE FUNCTION update_comment_likes_count();
import { supabase } from './supabase';

// Posts
export async function createPost(content: string, images?: string[]) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('school')
    .eq('id', supabase.auth.getUser().then(res => res.data.user?.id))
    .single();

  if (!profile?.school) {
    throw new Error('User school not found');
  }

  return supabase.from('posts').insert({
    content,
    images,
    user_id: (await supabase.auth.getUser()).data.user?.id,
    school: profile.school
  });
}

export async function getPosts(limit = 10, offset = 0) {
  return supabase
    .from('posts')
    .select(`
      *,
      profiles:user_id (username, full_name, avatar_url),
      likes:post_likes!post_id(user_id),
      bookmarks:post_bookmarks!post_id(user_id),
      reposts:reposts!post_id(user_id)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
}

export async function getPostById(postId: string) {
  return supabase
    .from('posts')
    .select(`
      *,
      profiles:user_id (username, full_name, avatar_url),
      likes:post_likes!post_id(user_id),
      bookmarks:post_bookmarks!post_id(user_id),
      reposts:reposts!post_id(user_id)
    `)
    .eq('id', postId)
    .single();
}

export async function likePost(postId: string) {
  return supabase.from('post_likes').insert({
    post_id: postId,
    user_id: (await supabase.auth.getUser()).data.user?.id
  });
}

export async function unlikePost(postId: string) {
  return supabase
    .from('post_likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
}

export async function bookmarkPost(postId: string) {
  return supabase.from('post_bookmarks').insert({
    post_id: postId,
    user_id: (await supabase.auth.getUser()).data.user?.id
  });
}

export async function unbookmarkPost(postId: string) {
  return supabase
    .from('post_bookmarks')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
}

export async function repostPost(postId: string) {
  return supabase.from('reposts').insert({
    post_id: postId,
    user_id: (await supabase.auth.getUser()).data.user?.id
  });
}

export async function unrepostPost(postId: string) {
  return supabase
    .from('reposts')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
}

// Comments
export async function getComments(postId: string) {
  return supabase
    .from('comments')
    .select(`
      *,
      profiles:user_id (username, full_name, avatar_url),
      likes:comment_likes!comment_id(user_id)
    `)
    .eq('post_id', postId)
    .is('parent_id', null)
    .order('created_at', { ascending: true });
}

export async function getReplies(commentId: string) {
  return supabase
    .from('comments')
    .select(`
      *,
      profiles:user_id (username, full_name, avatar_url),
      likes:comment_likes!comment_id(user_id)
    `)
    .eq('parent_id', commentId)
    .order('created_at', { ascending: true });
}

export async function createComment(postId: string, content: string, parentId?: string) {
  return supabase.from('comments').insert({
    post_id: postId,
    content,
    parent_id: parentId,
    user_id: (await supabase.auth.getUser()).data.user?.id
  });
}

export async function likeComment(commentId: string) {
  return supabase.from('comment_likes').insert({
    comment_id: commentId,
    user_id: (await supabase.auth.getUser()).data.user?.id
  });
}

export async function unlikeComment(commentId: string) {
  return supabase
    .from('comment_likes')
    .delete()
    .eq('comment_id', commentId)
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
}

// Events
export async function createEvent(eventData: {
  title: string;
  description: string;
  date: string;
  time: string;
  location?: string;
  is_online: boolean;
  online_link?: string;
  image: string;
  category: string;
  is_free: boolean;
  price?: number;
  max_attendees?: number;
}) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('school')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.school) {
    throw new Error('User school not found');
  }

  return supabase.from('events').insert({
    ...eventData,
    organizer_id: (await supabase.auth.getUser()).data.user?.id,
    school: profile.school
  });
}

export async function getEvents(limit = 10, offset = 0) {
  return supabase
    .from('events')
    .select(`
      *,
      organizer:profiles!organizer_id (username, full_name, avatar_url),
      attendees:event_attendees!event_id(user_id),
      bookmarks:event_bookmarks!event_id(user_id)
    `)
    .order('date', { ascending: true })
    .range(offset, offset + limit - 1);
}

export async function attendEvent(eventId: string) {
  return supabase.from('event_attendees').insert({
    event_id: eventId,
    user_id: (await supabase.auth.getUser()).data.user?.id
  });
}

export async function unattendEvent(eventId: string) {
  return supabase
    .from('event_attendees')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
}

export async function bookmarkEvent(eventId: string) {
  return supabase.from('event_bookmarks').insert({
    event_id: eventId,
    user_id: (await supabase.auth.getUser()).data.user?.id
  });
}

export async function unbookmarkEvent(eventId: string) {
  return supabase
    .from('event_bookmarks')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
}

// Marketplace
export async function createListing(listingData: {
  title: string;
  description: string;
  price: number;
  category: string;
  condition?: string;
  location: string;
  images: string[];
}) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('school')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.school) {
    throw new Error('User school not found');
  }

  return supabase.from('marketplace_listings').insert({
    ...listingData,
    seller_id: (await supabase.auth.getUser()).data.user?.id,
    school: profile.school
  });
}

export async function getListings(limit = 10, offset = 0) {
  return supabase
    .from('marketplace_listings')
    .select(`
      *,
      seller:profiles!seller_id (username, full_name, avatar_url)
    `)
    .eq('is_sold', false)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
}

// Lost and Found
export async function reportLostFoundItem(itemData: {
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  type: 'lost' | 'found';
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  reward?: string;
  image: string;
}) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('school')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.school) {
    throw new Error('User school not found');
  }

  return supabase.from('lost_found_items').insert({
    ...itemData,
    user_id: (await supabase.auth.getUser()).data.user?.id,
    school: profile.school
  });
}

export async function getLostFoundItems(limit = 10, offset = 0) {
  return supabase
    .from('lost_found_items')
    .select('*')
    .eq('is_resolved', false)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
}

// Study Rooms
export async function createStudyRoom(roomData: {
  name: string;
  description: string;
  is_private: boolean;
  password?: string;
  max_participants?: number;
  status: 'live' | 'scheduled';
  start_time?: string;
  end_time?: string;
}) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('school')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.school) {
    throw new Error('User school not found');
  }

  return supabase.from('study_rooms').insert({
    ...roomData,
    host_id: (await supabase.auth.getUser()).data.user?.id,
    school: profile.school
  });
}

export async function getStudyRooms(limit = 10, offset = 0) {
  return supabase
    .from('study_rooms')
    .select(`
      *,
      host:profiles!host_id (username, full_name, avatar_url),
      participants:study_room_participants!room_id(user_id)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
}

export async function joinStudyRoom(roomId: string) {
  return supabase.from('study_room_participants').insert({
    room_id: roomId,
    user_id: (await supabase.auth.getUser()).data.user?.id
  });
}

export async function leaveStudyRoom(roomId: string) {
  return supabase
    .from('study_room_participants')
    .delete()
    .eq('room_id', roomId)
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
}

// Job Board
export async function createJobListing(jobData: {
  title: string;
  company: string;
  type: string;
  location: string;
  salary?: string;
  deadline?: string;
  description: string;
  requirements: string[];
  benefits: string[];
  image: string;
  is_remote: boolean;
  experience_level: string;
  department: string;
  contact_email: string;
  company_website?: string;
}) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('school')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.school) {
    throw new Error('User school not found');
  }

  return supabase.from('job_listings').insert({
    ...jobData,
    poster_id: (await supabase.auth.getUser()).data.user?.id,
    school: profile.school
  });
}

export async function getJobListings(limit = 10, offset = 0) {
  return supabase
    .from('job_listings')
    .select(`
      *,
      poster:profiles!poster_id (username, full_name, avatar_url),
      applications:job_applications!job_id(applicant_id),
      bookmarks:job_bookmarks!job_id(user_id)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
}

export async function applyForJob(jobId: string, applicationData: {
  full_name: string;
  email: string;
  phone?: string;
  cover_letter?: string;
  resume_url?: string;
}) {
  return supabase.from('job_applications').insert({
    ...applicationData,
    job_id: jobId,
    applicant_id: (await supabase.auth.getUser()).data.user?.id
  });
}

export async function bookmarkJob(jobId: string) {
  return supabase.from('job_bookmarks').insert({
    job_id: jobId,
    user_id: (await supabase.auth.getUser()).data.user?.id
  });
}

export async function unbookmarkJob(jobId: string) {
  return supabase
    .from('job_bookmarks')
    .delete()
    .eq('job_id', jobId)
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
}

// Calendar Events
export async function createCalendarEvent(eventData: {
  title: string;
  date: string;
  time: string;
  location?: string;
  description?: string;
  type: string;
  is_all_day: boolean;
  has_reminder: boolean;
  reminder_time?: string;
  color: string;
}) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('school')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.school) {
    throw new Error('User school not found');
  }

  return supabase.from('calendar_events').insert({
    ...eventData,
    user_id: (await supabase.auth.getUser()).data.user?.id,
    school: profile.school
  });
}

export async function getCalendarEvents() {
  return supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
    .order('date', { ascending: true });
}

// User Connections
export async function sendConnectionRequest(userId: string) {
  return supabase.from('connections').insert({
    user_id: (await supabase.auth.getUser()).data.user?.id,
    connected_user_id: userId,
    status: 'pending'
  });
}

export async function acceptConnectionRequest(connectionId: string) {
  return supabase
    .from('connections')
    .update({ status: 'accepted' })
    .eq('id', connectionId)
    .eq('connected_user_id', (await supabase.auth.getUser()).data.user?.id);
}

export async function rejectConnectionRequest(connectionId: string) {
  return supabase
    .from('connections')
    .update({ status: 'rejected' })
    .eq('id', connectionId)
    .eq('connected_user_id', (await supabase.auth.getUser()).data.user?.id);
}

export async function removeConnection(userId: string) {
  return supabase
    .from('connections')
    .delete()
    .or(`user_id.eq.${(await supabase.auth.getUser()).data.user?.id},connected_user_id.eq.${(await supabase.auth.getUser()).data.user?.id}`)
    .or(`user_id.eq.${userId},connected_user_id.eq.${userId}`);
}

export async function getConnections() {
  return supabase
    .from('connections')
    .select(`
      *,
      user:profiles!user_id (id, username, full_name, avatar_url),
      connected_user:profiles!connected_user_id (id, username, full_name, avatar_url)
    `)
    .or(`user_id.eq.${(await supabase.auth.getUser()).data.user?.id},connected_user_id.eq.${(await supabase.auth.getUser()).data.user?.id}`)
    .eq('status', 'accepted');
}

export async function getPendingConnectionRequests() {
  return supabase
    .from('connections')
    .select(`
      *,
      user:profiles!user_id (id, username, full_name, avatar_url)
    `)
    .eq('connected_user_id', (await supabase.auth.getUser()).data.user?.id)
    .eq('status', 'pending');
}

// User Profiles
export async function getUserProfile(userId: string) {
  return supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
}

export async function updateUserProfile(profileData: {
  username?: string;
  full_name?: string;
  avatar_url?: string;
  school?: string;
}) {
  return supabase
    .from('profiles')
    .update(profileData)
    .eq('id', (await supabase.auth.getUser()).data.user?.id);
}

export async function searchUsers(query: string, limit = 10) {
  // Get current user's school
  const { data: profile } = await supabase
    .from('profiles')
    .select('school')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.school) {
    throw new Error('User school not found');
  }

  return supabase
    .from('profiles')
    .select('*')
    .eq('school', profile.school)
    .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
    .neq('id', (await supabase.auth.getUser()).data.user?.id)
    .limit(limit);
}

// Get users from same school
export async function getUsersFromSameSchool(limit = 10, offset = 0) {
  // Get current user's school
  const { data: profile } = await supabase
    .from('profiles')
    .select('school')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.school) {
    throw new Error('User school not found');
  }

  return supabase
    .from('profiles')
    .select('*')
    .eq('school', profile.school)
    .neq('id', (await supabase.auth.getUser()).data.user?.id)
    .range(offset, offset + limit - 1);
}
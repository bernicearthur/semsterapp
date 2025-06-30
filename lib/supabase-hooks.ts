import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { useAuth } from '@/context/AuthContext';

// Hook to get posts with real-time updates
export function usePosts(limit = 10) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    
    // Get initial posts
    const fetchPosts = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('school')
          .eq('id', user.id)
          .single();

        if (!profile?.school) {
          throw new Error('User school not found');
        }

        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            profiles:user_id (username, full_name, avatar_url),
            likes:post_likes!post_id(user_id),
            bookmarks:post_bookmarks!post_id(user_id),
            reposts:reposts!post_id(user_id)
          `)
          .eq('school', profile.school)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;
        
        // Transform data to include user interactions
        const transformedPosts = data.map(post => ({
          ...post,
          isLiked: post.likes.some((like: any) => like.user_id === user.id),
          isBookmarked: post.bookmarks.some((bookmark: any) => bookmark.user_id === user.id),
          isReposted: post.reposts.some((repost: any) => repost.user_id === user.id)
        }));
        
        setPosts(transformedPosts);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();

    // Set up real-time subscription
    const subscription = supabase
      .channel('public:posts')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'posts',
        filter: `school=eq.${user.id}` // Only listen to posts from user's school
      }, async (payload) => {
        // Refresh posts when changes occur
        fetchPosts();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, limit]);

  return { posts, loading, error };
}

// Hook to get events with real-time updates
export function useEvents(limit = 10) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    
    // Get initial events
    const fetchEvents = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('school')
          .eq('id', user.id)
          .single();

        if (!profile?.school) {
          throw new Error('User school not found');
        }

        const { data, error } = await supabase
          .from('events')
          .select(`
            *,
            organizer:profiles!organizer_id (username, full_name, avatar_url),
            attendees:event_attendees!event_id(user_id),
            bookmarks:event_bookmarks!event_id(user_id)
          `)
          .eq('school', profile.school)
          .order('date', { ascending: true })
          .limit(limit);

        if (error) throw error;
        
        // Transform data to include user interactions
        const transformedEvents = data.map(event => ({
          ...event,
          isAttending: event.attendees.some((attendee: any) => attendee.user_id === user.id),
          isSaved: event.bookmarks.some((bookmark: any) => bookmark.user_id === user.id),
          attendeesCount: event.attendees.length
        }));
        
        setEvents(transformedEvents);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();

    // Set up real-time subscription
    const subscription = supabase
      .channel('public:events')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'events',
        filter: `school=eq.${user.id}` // Only listen to events from user's school
      }, async (payload) => {
        // Refresh events when changes occur
        fetchEvents();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, limit]);

  return { events, loading, error };
}

// Hook to get marketplace listings with real-time updates
export function useMarketplaceListings(limit = 10) {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    
    // Get initial listings
    const fetchListings = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('school')
          .eq('id', user.id)
          .single();

        if (!profile?.school) {
          throw new Error('User school not found');
        }

        const { data, error } = await supabase
          .from('marketplace_listings')
          .select(`
            *,
            seller:profiles!seller_id (username, full_name, avatar_url)
          `)
          .eq('school', profile.school)
          .eq('is_sold', false)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;
        
        setListings(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchListings();

    // Set up real-time subscription
    const subscription = supabase
      .channel('public:marketplace_listings')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'marketplace_listings',
        filter: `school=eq.${user.id}` // Only listen to listings from user's school
      }, async (payload) => {
        // Refresh listings when changes occur
        fetchListings();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, limit]);

  return { listings, loading, error };
}

// Hook to get lost and found items with real-time updates
export function useLostFoundItems(limit = 10) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    
    // Get initial items
    const fetchItems = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('school')
          .eq('id', user.id)
          .single();

        if (!profile?.school) {
          throw new Error('User school not found');
        }

        const { data, error } = await supabase
          .from('lost_found_items')
          .select('*')
          .eq('school', profile.school)
          .eq('is_resolved', false)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;
        
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchItems();

    // Set up real-time subscription
    const subscription = supabase
      .channel('public:lost_found_items')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'lost_found_items',
        filter: `school=eq.${user.id}` // Only listen to items from user's school
      }, async (payload) => {
        // Refresh items when changes occur
        fetchItems();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, limit]);

  return { items, loading, error };
}

// Hook to get job listings with real-time updates
export function useJobListings(limit = 10) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    
    // Get initial jobs
    const fetchJobs = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('school')
          .eq('id', user.id)
          .single();

        if (!profile?.school) {
          throw new Error('User school not found');
        }

        const { data, error } = await supabase
          .from('job_listings')
          .select(`
            *,
            poster:profiles!poster_id (username, full_name, avatar_url),
            applications:job_applications!job_id(applicant_id),
            bookmarks:job_bookmarks!job_id(user_id)
          `)
          .eq('school', profile.school)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;
        
        // Transform data to include user interactions
        const transformedJobs = data.map(job => ({
          ...job,
          isApplied: job.applications.some((application: any) => application.applicant_id === user.id),
          isSaved: job.bookmarks.some((bookmark: any) => bookmark.user_id === user.id),
          applicantsCount: job.applications.length
        }));
        
        setJobs(transformedJobs);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();

    // Set up real-time subscription
    const subscription = supabase
      .channel('public:job_listings')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'job_listings',
        filter: `school=eq.${user.id}` // Only listen to jobs from user's school
      }, async (payload) => {
        // Refresh jobs when changes occur
        fetchJobs();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, limit]);

  return { jobs, loading, error };
}

// Hook to get study rooms with real-time updates
export function useStudyRooms(limit = 10) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    
    // Get initial rooms
    const fetchRooms = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('school')
          .eq('id', user.id)
          .single();

        if (!profile?.school) {
          throw new Error('User school not found');
        }

        const { data, error } = await supabase
          .from('study_rooms')
          .select(`
            *,
            host:profiles!host_id (username, full_name, avatar_url),
            participants:study_room_participants!room_id(user_id)
          `)
          .eq('school', profile.school)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;
        
        // Transform data to include user interactions
        const transformedRooms = data.map(room => ({
          ...room,
          isJoined: room.participants.some((participant: any) => participant.user_id === user.id),
          participantsCount: room.participants.length
        }));
        
        setRooms(transformedRooms);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();

    // Set up real-time subscription
    const subscription = supabase
      .channel('public:study_rooms')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'study_rooms',
        filter: `school=eq.${user.id}` // Only listen to rooms from user's school
      }, async (payload) => {
        // Refresh rooms when changes occur
        fetchRooms();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, limit]);

  return { rooms, loading, error };
}

// Hook to get calendar events
export function useCalendarEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    
    // Get calendar events
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('calendar_events')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: true });

        if (error) throw error;
        
        setEvents(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();

    // Set up real-time subscription
    const subscription = supabase
      .channel('public:calendar_events')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'calendar_events',
        filter: `user_id=eq.${user.id}` // Only listen to user's own events
      }, async (payload) => {
        // Refresh events when changes occur
        fetchEvents();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return { events, loading, error };
}

// Hook to get user connections
export function useConnections() {
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    
    // Get connections
    const fetchConnections = async () => {
      try {
        const { data, error } = await supabase
          .from('connections')
          .select(`
            *,
            user:profiles!user_id (id, username, full_name, avatar_url),
            connected_user:profiles!connected_user_id (id, username, full_name, avatar_url)
          `)
          .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`)
          .eq('status', 'accepted');

        if (error) throw error;
        
        // Transform data to get the other user in each connection
        const transformedConnections = data.map(connection => {
          const otherUser = connection.user_id === user.id ? 
            connection.connected_user : connection.user;
          
          return {
            id: connection.id,
            user: otherUser,
            status: connection.status,
            created_at: connection.created_at
          };
        });
        
        setConnections(transformedConnections);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();

    // Set up real-time subscription
    const subscription = supabase
      .channel('public:connections')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'connections',
        filter: `or(user_id.eq.${user.id},connected_user_id.eq.${user.id})` // Listen to user's connections
      }, async (payload) => {
        // Refresh connections when changes occur
        fetchConnections();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return { connections, loading, error };
}

// Hook to get pending connection requests
export function usePendingRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    
    // Get pending requests
    const fetchRequests = async () => {
      try {
        const { data, error } = await supabase
          .from('connections')
          .select(`
            *,
            user:profiles!user_id (id, username, full_name, avatar_url)
          `)
          .eq('connected_user_id', user.id)
          .eq('status', 'pending');

        if (error) throw error;
        
        setRequests(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();

    // Set up real-time subscription
    const subscription = supabase
      .channel('public:connections')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'connections',
        filter: `connected_user_id=eq.${user.id}` // Listen to requests sent to user
      }, async (payload) => {
        // Refresh requests when changes occur
        fetchRequests();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return { requests, loading, error };
}

// Hook to get users from same school
export function useSchoolUsers(limit = 10) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    
    // Get users from same school
    const fetchUsers = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('school')
          .eq('id', user.id)
          .single();

        if (!profile?.school) {
          throw new Error('User school not found');
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('school', profile.school)
          .neq('id', user.id)
          .limit(limit);

        if (error) throw error;
        
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user, limit]);

  return { users, loading, error };
}
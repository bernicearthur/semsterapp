import { useState, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, TextInput, Alert, Modal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, MapPin, Users, Filter, Search, Plus, X, Link, Globe, Bookmark, Share2, MoreVertical, ChevronDown, ChevronUp } from 'lucide-react-native';
import { SwipeGestureWrapper } from '@/components/SwipeGestureWrapper';
import { useTheme } from '@/context/ThemeContext';
import Animated, { FadeIn, FadeInDown, SlideInRight } from 'react-native-reanimated';
import { EventDetailsDrawer } from '@/components/drawers/EventDetailsDrawer';
import { CreateEventDrawer } from '@/components/drawers/CreateEventDrawer';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location?: string;
  isOnline: boolean;
  onlineLink?: string;
  organizer: {
    name: string;
    avatar: string;
    verified?: boolean;
  };
  attendees: number;
  maxAttendees?: number;
  image: string;
  category: string;
  isAttending: boolean;
  isSaved: boolean;
  price?: number;
  isFree: boolean;
  featured?: boolean;
}

const initialEvents: Event[] = [
  {
    id: '1',
    title: 'End of Semester Party',
    description: 'Join us for an amazing celebration as we wrap up another successful semester! Music, food, and great company await.',
    date: 'Fri, Dec 15',
    time: '8:00 PM',
    location: 'Student Center Main Hall',
    isOnline: false,
    organizer: {
      name: 'Student Council',
      avatar: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=100',
      verified: true,
    },
    attendees: 143,
    maxAttendees: 200,
    image: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Social',
    isAttending: true,
    isSaved: true,
    isFree: true,
    featured: true,
  },
  {
    id: '2',
    title: 'AI & Machine Learning Workshop',
    description: 'Deep dive into the latest AI technologies and machine learning algorithms. Perfect for beginners and advanced students.',
    date: 'Mon, Dec 18',
    time: '2:00 PM',
    isOnline: true,
    onlineLink: 'https://zoom.us/j/123456789',
    organizer: {
      name: 'Dr. Sarah Chen',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100',
      verified: true,
    },
    attendees: 47,
    maxAttendees: 50,
    image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Academic',
    isAttending: false,
    isSaved: false,
    isFree: true,
  },
  {
    id: '3',
    title: 'Campus Career Fair 2024',
    description: 'Meet with top employers and explore career opportunities. Bring your resume and dress professionally.',
    date: 'Wed, Dec 20',
    time: '10:00 AM - 4:00 PM',
    location: 'Main Quad',
    isOnline: false,
    organizer: {
      name: 'Career Services',
      avatar: 'https://images.pexels.com/photos/1181622/pexels-photo-1181622.jpeg?auto=compress&cs=tinysrgb&w=100',
      verified: true,
    },
    attendees: 312,
    image: 'https://images.pexels.com/photos/1181622/pexels-photo-1181622.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Career',
    isAttending: true,
    isSaved: true,
    isFree: true,
    featured: true,
  },
  {
    id: '4',
    title: 'Open Mic Night',
    description: 'Showcase your talent! Poetry, music, comedy - all forms of expression welcome. Sign up at the venue.',
    date: 'Sat, Dec 23',
    time: '7:00 PM',
    location: 'Coffee House',
    isOnline: false,
    organizer: {
      name: 'Arts Society',
      avatar: 'https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
    attendees: 89,
    maxAttendees: 100,
    image: 'https://images.pexels.com/photos/1540319/pexels-photo-1540319.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Arts',
    isAttending: false,
    isSaved: true,
    isFree: true,
  },
  {
    id: '5',
    title: 'Startup Pitch Competition',
    description: 'Present your innovative ideas to a panel of investors and industry experts. Cash prizes for winners!',
    date: 'Thu, Dec 21',
    time: '6:00 PM',
    location: 'Business School Auditorium',
    isOnline: false,
    organizer: {
      name: 'Entrepreneurship Club',
      avatar: 'https://images.pexels.com/photos/3183183/pexels-photo-3183183.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
    attendees: 156,
    image: 'https://images.pexels.com/photos/3183183/pexels-photo-3183183.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Business',
    isAttending: false,
    isSaved: false,
    price: 10,
    isFree: false,
  },
  {
    id: '6',
    title: 'Virtual Study Group: Finals Prep',
    description: 'Join fellow students for collaborative study sessions. We\'ll cover major subjects and share study strategies.',
    date: 'Sun, Dec 17',
    time: '3:00 PM',
    isOnline: true,
    onlineLink: 'https://meet.google.com/abc-defg-hij',
    organizer: {
      name: 'Study Buddies',
      avatar: 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
    attendees: 234,
    image: 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Academic',
    isAttending: true,
    isSaved: false,
    isFree: true,
  },
];

const categories = [
  'All', 'Academic', 'Social', 'Sports', 'Arts', 'Career', 'Business', 'Online'
];

const timeFilters = [
  'All Time', 'Today', 'This Week', 'This Month', 'Next Week'
];

export default function EventsScreen() {
  const { isDark } = useTheme();
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('All Time');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [showAttendingOnly, setShowAttendingOnly] = useState(false);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const handleTimeFilterSelect = (filter: string) => {
    setSelectedTimeFilter(filter);
  };

  const toggleEventAttendance = (eventId: string) => {
    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === eventId
          ? {
              ...event,
              isAttending: !event.isAttending,
              attendees: event.isAttending ? event.attendees - 1 : event.attendees + 1
            }
          : event
      )
    );
  };

  const toggleEventSaved = (eventId: string) => {
    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === eventId
          ? { ...event, isSaved: !event.isSaved }
          : event
      )
    );
  };

  const handleEventPress = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleCreateEvent = (newEvent: Omit<Event, 'id' | 'attendees' | 'isAttending' | 'isSaved'>) => {
    const event: Event = {
      ...newEvent,
      id: Date.now().toString(),
      attendees: 0,
      isAttending: false,
      isSaved: false,
    };
    setEvents(prevEvents => [event, ...prevEvents]);
    setIsCreateEventOpen(false);
    Alert.alert('Success', 'Event created successfully!');
  };

  const filteredEvents = events.filter(event => {
    // Category filter
    if (selectedCategory !== 'All') {
      if (selectedCategory === 'Online' && !event.isOnline) return false;
      if (selectedCategory !== 'Online' && event.category !== selectedCategory) return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!event.title.toLowerCase().includes(query) &&
          !event.description.toLowerCase().includes(query) &&
          !event.organizer.name.toLowerCase().includes(query)) {
        return false;
      }
    }

    // Saved filter
    if (showSavedOnly && !event.isSaved) return false;

    // Attending filter
    if (showAttendingOnly && !event.isAttending) return false;

    return true;
  });

  const featuredEvents = filteredEvents.filter(event => event.featured);
  const upcomingEvents = filteredEvents.filter(event => !event.featured);

  const renderEventCard = (event: Event, isFeatured = false) => (
    <TouchableOpacity
      key={event.id}
      style={[
        styles.eventCard,
        { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' },
        isFeatured && styles.featuredEventCard
      ]}
      onPress={() => handleEventPress(event)}
    >
      <View style={styles.eventImageContainer}>
        <Image source={{ uri: event.image }} style={styles.eventImage} />
        
        {/* Event Type Badge */}
        <View style={[
          styles.eventTypeBadge,
          { backgroundColor: event.isOnline ? '#10B981' : '#3B82F6' }
        ]}>
          {event.isOnline ? (
            <Globe size={12} color="#FFFFFF" />
          ) : (
            <MapPin size={12} color="#FFFFFF" />
          )}
          <Text style={styles.eventTypeText}>
            {event.isOnline ? 'Online' : 'In-Person'}
          </Text>
        </View>

        {/* Price Badge */}
        {!event.isFree && (
          <View style={[styles.priceBadge, { backgroundColor: '#F59E0B' }]}>
            <Text style={styles.priceText}>${event.price}</Text>
          </View>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => toggleEventSaved(event.id)}
        >
          <Bookmark
            size={20}
            color={event.isSaved ? '#F59E0B' : '#FFFFFF'}
            fill={event.isSaved ? '#F59E0B' : 'none'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <Text style={[styles.eventTitle, { color: isDark ? '#FFFFFF' : '#111827' }]} numberOfLines={2}>
            {event.title}
          </Text>
          <TouchableOpacity>
            <MoreVertical size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.eventDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]} numberOfLines={2}>
          {event.description}
        </Text>

        <View style={styles.eventDetails}>
          <View style={styles.eventDetail}>
            <Calendar size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
            <Text style={[styles.eventDetailText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
              {event.date}
            </Text>
          </View>

          <View style={styles.eventDetail}>
            <Clock size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
            <Text style={[styles.eventDetailText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
              {event.time}
            </Text>
          </View>

          {event.location && (
            <View style={styles.eventDetail}>
              <MapPin size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
              <Text style={[styles.eventDetailText, { color: isDark ? '#E5E7EB' : '#4B5563' }]} numberOfLines={1}>
                {event.location}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.eventFooter}>
          <View style={styles.organizerInfo}>
            <Image source={{ uri: event.organizer.avatar }} style={styles.organizerAvatar} />
            <View style={styles.organizerDetails}>
              <View style={styles.organizerNameRow}>
                <Text style={[styles.organizerName, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                  {event.organizer.name}
                </Text>
                {event.organizer.verified && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>✓</Text>
                  </View>
                )}
              </View>
              <View style={styles.attendeesInfo}>
                <Users size={14} color={isDark ? '#60A5FA' : '#3B82F6'} />
                <Text style={[styles.attendeesText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  {event.attendees} {event.maxAttendees ? `/ ${event.maxAttendees}` : ''} attending
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.attendButton,
              { backgroundColor: event.isAttending ? '#10B981' : '#3B82F6' }
            ]}
            onPress={() => toggleEventAttendance(event.id)}
          >
            <Text style={styles.attendButtonText}>
              {event.isAttending ? 'Attending' : 'Attend'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SwipeGestureWrapper>
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={[styles.header, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
            <View style={styles.headerTop}>
              <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Events
              </Text>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <View style={[styles.searchBar, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
                <Search size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                <TextInput
                  style={[styles.searchInput, { color: isDark ? '#E5E7EB' : '#1F2937' }]}
                  placeholder="Search events"
                  placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              
              <TouchableOpacity 
                style={[
                  styles.filterButton,
                  { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' },
                  showFilters && { backgroundColor: '#3B82F6' }
                ]}
                onPress={() => setShowFilters(!showFilters)}
              >
                <Filter size={20} color={showFilters ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#6B7280')} />
              </TouchableOpacity>
            </View>

            {/* Filters */}
            {showFilters && (
              <Animated.View entering={FadeInDown} style={styles.filtersContainer}>
                <View style={styles.filterRow}>
                  <Text style={[styles.filterLabel, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    Quick Filters:
                  </Text>
                  <View style={styles.quickFilters}>
                    <TouchableOpacity
                      style={[
                        styles.quickFilterButton,
                        { backgroundColor: showSavedOnly ? '#3B82F6' : (isDark ? '#374151' : '#F3F4F6') }
                      ]}
                      onPress={() => setShowSavedOnly(!showSavedOnly)}
                    >
                      <Text style={[
                        styles.quickFilterText,
                        { color: showSavedOnly ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#4B5563') }
                      ]}>
                        Saved
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.quickFilterButton,
                        { backgroundColor: showAttendingOnly ? '#3B82F6' : (isDark ? '#374151' : '#F3F4F6') }
                      ]}
                      onPress={() => setShowAttendingOnly(!showAttendingOnly)}
                    >
                      <Text style={[
                        styles.quickFilterText,
                        { color: showAttendingOnly ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#4B5563') }
                      ]}>
                        Attending
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            )}

            {/* Categories */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    { backgroundColor: selectedCategory === category ? '#3B82F6' : (isDark ? '#374151' : '#F3F4F6') }
                  ]}
                  onPress={() => handleCategorySelect(category)}
                >
                  <Text style={[
                    styles.categoryText,
                    { color: selectedCategory === category ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#4B5563') }
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Featured Events */}
          {featuredEvents.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Featured Events
              </Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.featuredEventsContainer}
              >
                {featuredEvents.map(event => (
                  <View key={event.id} style={styles.featuredEventWrapper}>
                    {renderEventCard(event, true)}
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Upcoming Events */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
              {featuredEvents.length > 0 ? 'More Events' : 'Upcoming Events'}
            </Text>
            
            <View style={styles.eventsGrid}>
              {upcomingEvents.map(event => renderEventCard(event))}
            </View>

            {filteredEvents.length === 0 && (
              <View style={styles.emptyState}>
                <Calendar size={48} color={isDark ? '#9CA3AF' : '#6B7280'} />
                <Text style={[styles.emptyStateTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  No events found
                </Text>
                <Text style={[styles.emptyStateText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  Try adjusting your filters or search terms
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Floating Action Button */}
        <TouchableOpacity 
          style={[styles.fab, { backgroundColor: '#3B82F6' }]}
          onPress={() => setIsCreateEventOpen(true)}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Event Details Drawer */}
        <EventDetailsDrawer
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          event={selectedEvent}
          onToggleAttendance={toggleEventAttendance}
          onToggleSaved={toggleEventSaved}
        />

        {/* Create Event Drawer */}
        <CreateEventDrawer
          isOpen={isCreateEventOpen}
          onClose={() => setIsCreateEventOpen(false)}
          onCreateEvent={handleCreateEvent}
        />
      </SafeAreaView>
    </SwipeGestureWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    padding: 16,
    borderRadius: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  filterButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  quickFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  quickFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  quickFilterText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  categoriesContainer: {
    paddingBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  featuredEventsContainer: {
    paddingBottom: 8,
  },
  featuredEventWrapper: {
    width: 320,
    marginRight: 16,
  },
  eventsGrid: {
    gap: 16,
  },
  eventCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  featuredEventCard: {
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  eventImageContainer: {
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: 200,
  },
  eventTypeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  eventTypeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  priceBadge: {
    position: 'absolute',
    top: 12,
    right: 52,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  saveButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventContent: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
    marginRight: 8,
  },
  eventDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 12,
  },
  eventDetails: {
    gap: 8,
    marginBottom: 16,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventDetailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  organizerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  organizerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  organizerDetails: {
    marginLeft: 8,
    flex: 1,
  },
  organizerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  organizerName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  verifiedBadge: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  attendeesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  attendeesText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  attendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 12,
  },
  attendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
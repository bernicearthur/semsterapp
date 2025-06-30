import { useState, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, MapPin, Users, Filter, Plus, X, Link, Globe, Bookmark, Share2, MoveVertical as MoreVertical, ChevronLeft, ChevronRight, Tag, Bell } from 'lucide-react-native';
import { SwipeGestureWrapper } from '@/components/SwipeGestureWrapper';
import { useTheme } from '@/context/ThemeContext';
import { CreateCalendarEventDrawer } from '@/components/drawers/CreateCalendarEventDrawer';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
  description?: string;
  type: 'exam' | 'academic' | 'holiday' | 'registration' | 'other';
  isAllDay: boolean;
  hasReminder: boolean;
  reminderTime?: string;
  color: string;
}

const initialEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Final Exams Begin',
    date: 'Dec 15, 2024',
    time: '8:00 AM',
    type: 'exam',
    location: 'Various Locations',
    description: 'Final examination period begins for all courses',
    color: '#EF4444',
    isAllDay: false,
    hasReminder: true,
    reminderTime: '1 day before',
  },
  {
    id: '2',
    title: 'Research Symposium',
    date: 'Dec 18, 2024',
    time: '10:00 AM',
    type: 'academic',
    location: 'Main Auditorium',
    description: 'Annual undergraduate research presentation',
    color: '#3B82F6',
    isAllDay: false,
    hasReminder: false,
  },
  {
    id: '3',
    title: 'Winter Break Begins',
    date: 'Dec 22, 2024',
    time: 'All Day',
    type: 'holiday',
    location: 'Campus Wide',
    description: 'Winter break period starts',
    color: '#10B981',
    isAllDay: true,
    hasReminder: false,
  },
  {
    id: '4',
    title: 'Spring Registration Opens',
    date: 'Jan 8, 2025',
    time: '9:00 AM',
    type: 'registration',
    location: 'Online Portal',
    description: 'Course registration for Spring semester',
    color: '#F59E0B',
    isAllDay: false,
    hasReminder: true,
    reminderTime: '1 week before',
  },
];

const currentMonth = 'December 2024';
const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);

export default function AcademicCalendarScreen() {
  const { isDark } = useTheme();
  const [selectedDate, setSelectedDate] = useState(15);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);

  const filters = ['all', 'exam', 'academic', 'holiday', 'registration'];

  const filteredEvents = events.filter(event => 
    selectedFilter === 'all' || event.type === selectedFilter
  );

  const getEventsForDate = (date: number) => {
    return events.filter(event => {
      const eventDate = parseInt(event.date.split(' ')[1].replace(',', ''));
      return eventDate === date;
    });
  };

  const handleCreateEvent = (newEvent: CalendarEvent) => {
    setEvents(prev => [...prev, newEvent]);
    setIsCreateEventOpen(false);
    Alert.alert('Success', 'Event added to calendar');
  };

  const handleToggleReminder = (eventId: string) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === eventId 
          ? { ...event, hasReminder: !event.hasReminder }
          : event
      )
    );
  };

  return (
    <SwipeGestureWrapper>
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={[styles.header, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
            <View style={styles.headerTop}>
              <TouchableOpacity style={styles.navButton}>
                <ChevronLeft size={24} color={isDark ? '#E5E7EB' : '#4B5563'} />
              </TouchableOpacity>
              
              <Text style={[styles.monthTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                {currentMonth}
              </Text>
              
              <TouchableOpacity style={styles.navButton}>
                <ChevronRight size={24} color={isDark ? '#E5E7EB' : '#4B5563'} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersContainer}
            >
              {filters.map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterButton,
                    { 
                      backgroundColor: selectedFilter === filter ? 
                        '#3B82F6' : 
                        (isDark ? '#374151' : '#F3F4F6')
                    }
                  ]}
                  onPress={() => setSelectedFilter(filter)}
                >
                  <Text style={[
                    styles.filterText,
                    { 
                      color: selectedFilter === filter ? 
                        '#FFFFFF' : 
                        (isDark ? '#E5E7EB' : '#4B5563')
                    }
                  ]}>
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={[styles.calendarGrid, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
            <View style={styles.weekDays}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <Text key={day} style={[styles.weekDay, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  {day}
                </Text>
              ))}
            </View>
            
            <View style={styles.daysGrid}>
              {calendarDays.map((day) => {
                const hasEvents = getEventsForDate(day).length > 0;
                const isSelected = selectedDate === day;
                
                return (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayButton,
                      isSelected && { backgroundColor: '#3B82F6' },
                      hasEvents && !isSelected && { backgroundColor: isDark ? '#374151' : '#F3F4F6' }
                    ]}
                    onPress={() => setSelectedDate(day)}
                  >
                    <Text style={[
                      styles.dayText,
                      { color: isSelected ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#1F2937') }
                    ]}>
                      {day}
                    </Text>
                    {hasEvents && (
                      <View style={[
                        styles.eventDot,
                        { backgroundColor: isSelected ? '#FFFFFF' : '#3B82F6' }
                      ]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.eventsSection}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
              Upcoming Events
            </Text>
            
            {filteredEvents.map((event) => (
              <View
                key={event.id}
                style={[styles.eventCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}
              >
                <View style={[styles.eventColorBar, { backgroundColor: event.color }]} />
                
                <View style={styles.eventContent}>
                  <View style={styles.eventHeader}>
                    <Text style={[styles.eventTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                      {event.title}
                    </Text>
                    <View style={[
                      styles.eventType,
                      { backgroundColor: `${event.color}20` }
                    ]}>
                      <Text style={[styles.eventTypeText, { color: event.color }]}>
                        {event.type}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={[styles.eventDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
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
                        <Text style={[styles.eventDetailText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                          {event.location}
                        </Text>
                      </View>
                    )}

                    <TouchableOpacity 
                      style={styles.reminderToggle}
                      onPress={() => handleToggleReminder(event.id)}
                    >
                      <Bell 
                        size={16} 
                        color={event.hasReminder ? (isDark ? '#60A5FA' : '#3B82F6') : (isDark ? '#9CA3AF' : '#6B7280')}
                        fill={event.hasReminder ? (isDark ? '#60A5FA' : '#3B82F6') : 'none'}
                      />
                      <Text 
                        style={[
                          styles.reminderText, 
                          { 
                            color: event.hasReminder ? 
                              (isDark ? '#60A5FA' : '#3B82F6') : 
                              (isDark ? '#9CA3AF' : '#6B7280') 
                          }
                        ]}
                      >
                        {event.hasReminder ? event.reminderTime : 'Add reminder'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

            {filteredEvents.length === 0 && (
              <View style={styles.emptyState}>
                <Calendar size={48} color={isDark ? '#9CA3AF' : '#6B7280'} />
                <Text style={[styles.emptyStateTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  No events found
                </Text>
                <Text style={[styles.emptyStateText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  Try adjusting your filters or add a new event
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        <TouchableOpacity 
          style={[styles.fab, { backgroundColor: '#3B82F6' }]}
          onPress={() => setIsCreateEventOpen(true)}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <CreateCalendarEventDrawer
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
    paddingBottom: 80,
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
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  filtersContainer: {
    paddingBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  calendarGrid: {
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  weekDay: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    textAlign: 'center',
    width: 40,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  dayText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  eventDot: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  eventsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  eventCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    flexDirection: 'row',
  },
  eventColorBar: {
    width: 4,
  },
  eventContent: {
    flex: 1,
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  eventType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  eventTypeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  eventDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
  },
  eventDetails: {
    gap: 8,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventDetailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  reminderToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  reminderText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
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
});
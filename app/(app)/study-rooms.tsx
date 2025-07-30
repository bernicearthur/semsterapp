import { useState, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SwipeGestureWrapper } from '@/components/SwipeGestureWrapper';
import { useTheme } from '@/context/ThemeContext';
import { Search, Filter, Users, Video, Clock, Plus, MapPin, Lock, Calendar, Play, Pause, VolumeX, Volume2, Settings, UserPlus, MessageCircle } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { JoinStudyRoomDrawer } from '@/components/drawers/JoinStudyRoomDrawer';
import { CreateStudyRoomDrawer } from '@/components/drawers/CreateStudyRoomDrawer';

interface StudyRoom {
  id: string;
  name: string;
  host: {
    name: string;
    avatar: string;
  };
  participants: {
    current: number;
    max?: number;
    avatars: string[];
  };
  isPrivate: boolean;
  status: 'live' | 'scheduled';
  startTime?: string;
  endTime?: string;
  description: string;
  subject?: string;
}

const initialRooms: StudyRoom[] = [
  {
    id: '1',
    name: 'CS301 Final Exam Prep',
    host: {
      name: 'Sarah Chen',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
    participants: {
      current: 8,
      max: 15,
      avatars: [
        'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
        'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100',
        'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
      ],
    },
    isPrivate: false,
    status: 'live',
    description: 'Collaborative study session for Computer Science 301 final exam. We\'ll cover algorithms, data structures, and practice problems.',
    subject: 'Computer Science',
  },
  {
    id: '2',
    name: 'Calculus Study Group',
    host: {
      name: 'Michael Brown',
      avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
    participants: {
      current: 5,
      max: 10,
      avatars: [
        'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100',
        'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100',
      ],
    },
    isPrivate: true,
    status: 'live',
    description: 'Working through calculus problems and helping each other understand complex concepts.',
    subject: 'Mathematics',
  },
  {
    id: '3',
    name: 'Biology Lab Review',
    host: {
      name: 'Emma Wilson',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
    participants: {
      current: 12,
      avatars: [
        'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
        'https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=100',
        'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100',
      ],
    },
    isPrivate: false,
    status: 'scheduled',
    startTime: 'Today, 3:00 PM',
    endTime: 'Today, 5:00 PM',
    description: 'Reviewing lab procedures and discussing upcoming biology experiments.',
    subject: 'Biology',
  },
  {
    id: '4',
    name: 'Physics Problem Solving',
    host: {
      name: 'David Kim',
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
    participants: {
      current: 6,
      max: 12,
      avatars: [
        'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100',
        'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
      ],
    },
    isPrivate: false,
    status: 'live',
    description: 'Tackling challenging physics problems together and sharing solution strategies.',
    subject: 'Physics',
  },
  {
    id: '5',
    name: 'Essay Writing Workshop',
    host: {
      name: 'Lisa Wang',
      avatar: 'https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
    participants: {
      current: 4,
      max: 8,
      avatars: [
        'https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=100',
        'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100',
      ],
    },
    isPrivate: true,
    status: 'scheduled',
    startTime: 'Tomorrow, 10:00 AM',
    endTime: 'Tomorrow, 12:00 PM',
    description: 'Peer review and feedback session for academic essays and research papers.',
    subject: 'English',
  },
];

const subjects = [
  'All', 'Computer Science', 'Mathematics', 'Biology', 'Physics', 'Chemistry', 'English', 'History', 'Other'
];

const statusFilters = [
  'All', 'Live Now', 'Scheduled', 'Available'
];

export default function StudyRoomsScreen() {
  const { isDark } = useTheme();
  const [rooms, setRooms] = useState<StudyRoom[]>(initialRooms);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [isJoinRoomOpen, setIsJoinRoomOpen] = useState(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);

  const handleJoinRoom = (roomId: string, password?: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      Alert.alert('Joining Room', `Joining "${room.name}"...`);
      setIsJoinRoomOpen(false);
    } else {
      Alert.alert('Joining Room', `Joining room with ID: ${roomId}`);
      setIsJoinRoomOpen(false);
    }
  };

  const handleCreateRoom = (roomData: any) => {
    const newRoom: StudyRoom = {
      ...roomData,
      id: Date.now().toString(),
    };
    
    setRooms(prev => [newRoom, ...prev]);
    setIsCreateRoomOpen(false);
    Alert.alert('Room Created', `"${roomData.name}" has been created successfully!`);
  };

  const handleQuickJoin = (room: StudyRoom) => {
    if (room.isPrivate) {
      Alert.prompt(
        'Private Room',
        'This room requires a password:',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Join', 
            onPress: (password) => {
              if (password) {
                handleJoinRoom(room.id, password);
              }
            }
          }
        ],
        'secure-text'
      );
    } else {
      handleJoinRoom(room.id);
    }
  };

  const filteredRooms = rooms.filter(room => {
    // Subject filter
    if (selectedSubject !== 'All' && room.subject !== selectedSubject) {
      return false;
    }

    // Status filter
    if (selectedStatus !== 'All') {
      if (selectedStatus === 'Live Now' && room.status !== 'live') return false;
      if (selectedStatus === 'Scheduled' && room.status !== 'scheduled') return false;
      if (selectedStatus === 'Available' && room.participants.max && room.participants.current >= room.participants.max) return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!room.name.toLowerCase().includes(query) &&
          !room.description.toLowerCase().includes(query) &&
          !room.host.name.toLowerCase().includes(query) &&
          !(room.subject && room.subject.toLowerCase().includes(query))) {
        return false;
      }
    }

    return true;
  });

  const liveRooms = filteredRooms.filter(room => room.status === 'live');
  const scheduledRooms = filteredRooms.filter(room => room.status === 'scheduled');

  const renderRoom = (room: StudyRoom) => (
    <TouchableOpacity
      key={room.id}
      style={[styles.roomCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}
      onPress={() => handleQuickJoin(room)}
      activeOpacity={0.9}
    >
      {/* Status Badge */}
      <View style={[
        styles.statusBadge,
        { backgroundColor: room.status === 'live' ? '#10B981' : '#F59E0B' }
      ]}>
        <View style={[
          styles.statusDot,
          { backgroundColor: room.status === 'live' ? '#FFFFFF' : '#FFFFFF' }
        ]} />
        <Text style={styles.statusText}>
          {room.status === 'live' ? 'LIVE' : 'SCHEDULED'}
        </Text>
      </View>

      {/* Privacy Badge */}
      {room.isPrivate && (
        <View style={[styles.privacyBadge, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}>
          <Lock size={12} color="#FFFFFF" />
          <Text style={styles.privacyText}>Private</Text>
        </View>
      )}

      <View style={styles.roomContent}>
        <View style={styles.roomHeader}>
          <Text style={[styles.roomName, { color: isDark ? '#FFFFFF' : '#111827' }]} numberOfLines={2}>
            {room.name}
          </Text>
          
          <View style={styles.participantsInfo}>
            <View style={styles.participantAvatars}>
              {room.participants.avatars.slice(0, 3).map((avatar, index) => (
                <Image 
                  key={index}
                  source={{ uri: avatar }} 
                  style={[
                    styles.participantAvatar,
                    { marginLeft: index > 0 ? -8 : 0 }
                  ]} 
                />
              ))}
              {room.participants.current > 3 && (
                <View style={[styles.moreParticipants, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]}>
                  <Text style={[styles.moreParticipantsText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    +{room.participants.current - 3}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.participantCount, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {room.participants.current} {room.participants.max ? `/ ${room.participants.max}` : ''} online
            </Text>
          </View>
        </View>

        <Text style={[styles.roomDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]} numberOfLines={2}>
          {room.description}
        </Text>

        <View style={styles.roomDetails}>
          <View style={styles.hostInfo}>
            <Image source={{ uri: room.host.avatar }} style={styles.hostAvatar} />
            <View style={styles.hostDetails}>
              <Text style={[styles.hostName, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                Hosted by {room.host.name}
              </Text>
              {room.subject && (
                <View style={styles.subjectInfo}>
                  <Text style={[styles.subjectText, { color: isDark ? '#60A5FA' : '#3B82F6' }]}>
                    {room.subject}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {room.status === 'scheduled' && room.startTime && (
            <View style={styles.timeInfo}>
              <Calendar size={14} color={isDark ? '#60A5FA' : '#3B82F6'} />
              <Text style={[styles.timeText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                {room.startTime}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.roomActions}>
          <TouchableOpacity 
            style={[
              styles.joinButton,
              { backgroundColor: room.status === 'live' ? '#10B981' : '#3B82F6' }
            ]}
            onPress={() => handleQuickJoin(room)}
          >
            <Video size={18} color="#FFFFFF" />
            <Text style={styles.joinButtonText}>
              {room.status === 'live' ? 'Join Now' : 'Schedule Join'}
            </Text>
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
            <TouchableOpacity style={styles.actionButton}>
              <MessageCircle size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <UserPlus size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          </View>
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
                Study Rooms
              </Text>
              <Text style={[styles.headerSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                {filteredRooms.length} rooms available
              </Text>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <View style={[styles.searchBar, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
                <Search size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                <TextInput
                  style={[styles.searchInput, { color: isDark ? '#E5E7EB' : '#1F2937' }]}
                  placeholder="Search rooms, subjects, or hosts"
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
                <View style={styles.filterSection}>
                  <Text style={[styles.filterLabel, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    Subject
                  </Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterOptions}
                  >
                    {subjects.map((subject) => (
                      <TouchableOpacity
                        key={subject}
                        style={[
                          styles.filterOption,
                          { 
                            backgroundColor: selectedSubject === subject ? 
                              '#3B82F6' : 
                              (isDark ? '#374151' : '#F3F4F6')
                          }
                        ]}
                        onPress={() => setSelectedSubject(subject)}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          { 
                            color: selectedSubject === subject ? 
                              '#FFFFFF' : 
                              (isDark ? '#E5E7EB' : '#4B5563')
                          }
                        ]}>
                          {subject}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.filterSection}>
                  <Text style={[styles.filterLabel, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    Status
                  </Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterOptions}
                  >
                    {statusFilters.map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.filterOption,
                          { 
                            backgroundColor: selectedStatus === status ? 
                              '#3B82F6' : 
                              (isDark ? '#374151' : '#F3F4F6')
                          }
                        ]}
                        onPress={() => setSelectedStatus(status)}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          { 
                            color: selectedStatus === status ? 
                              '#FFFFFF' : 
                              (isDark ? '#E5E7EB' : '#4B5563')
                          }
                        ]}>
                          {status}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </Animated.View>
            )}
          </View>

          {/* Live Rooms */}
          {liveRooms.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Live Now ({liveRooms.length})
              </Text>
              <View style={styles.roomsContainer}>
                {liveRooms.map(renderRoom)}
              </View>
            </View>
          )}

          {/* Scheduled Rooms */}
          {scheduledRooms.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Scheduled ({scheduledRooms.length})
              </Text>
              <View style={styles.roomsContainer}>
                {scheduledRooms.map(renderRoom)}
              </View>
            </View>
          )}

          {/* Empty State */}
          {filteredRooms.length === 0 && (
            <View style={styles.emptyState}>
              <Video size={48} color={isDark ? '#9CA3AF' : '#6B7280'} />
              <Text style={[styles.emptyStateTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                No study rooms found
              </Text>
              <Text style={[styles.emptyStateText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Try adjusting your filters or create a new room
              </Text>
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.quickActionButton, { backgroundColor: '#3B82F6' }]}
              onPress={() => setIsCreateRoomOpen(true)}
            >
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.quickActionText}>Create Room</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionButton, { backgroundColor: '#10B981' }]}
              onPress={() => setIsJoinRoomOpen(true)}
            >
              <Video size={20} color="#FFFFFF" />
              <Text style={styles.quickActionText}>Join with Code</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Join Room Drawer */}
        <JoinStudyRoomDrawer
          isOpen={isJoinRoomOpen}
          onClose={() => setIsJoinRoomOpen(false)}
          onJoinRoom={handleJoinRoom}
        />

        {/* Create Room Drawer */}
        <CreateStudyRoomDrawer
          isOpen={isCreateRoomOpen}
          onClose={() => setIsCreateRoomOpen(false)}
          onCreateRoom={handleCreateRoom}
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
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
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
    outlineStyle: 'none',
    outlineStyle: 'none',
  },
  filterButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  filtersContainer: {
    gap: 16,
  },
  filterSection: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  filterOptions: {
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterOptionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
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
  roomsContainer: {
    gap: 16,
  },
  roomCard: {
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
    position: 'relative',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    zIndex: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
  },
  privacyBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    zIndex: 1,
  },
  privacyText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  roomContent: {
    padding: 16,
    paddingTop: 48,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  roomName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
    marginRight: 12,
  },
  participantsInfo: {
    alignItems: 'flex-end',
  },
  participantAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  moreParticipants: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  moreParticipantsText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  participantCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  roomDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 16,
  },
  roomDetails: {
    gap: 12,
    marginBottom: 16,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  hostDetails: {
    marginLeft: 8,
    flex: 1,
  },
  hostName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  subjectInfo: {
    marginTop: 2,
  },
  subjectText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  roomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
    flex: 1,
    justifyContent: 'center',
    marginRight: 12,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 16,
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
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});
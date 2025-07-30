import { useState, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SwipeGestureWrapper } from '@/components/SwipeGestureWrapper';
import { useTheme } from '@/context/ThemeContext';
import { Search, Filter, Users, Video, Mic, MicOff, VideoOff, Clock, MapPin, Lock, Plus, Calendar, User, Settings, Phone, MessageCircle } from 'lucide-react-native';
import { ChevronRight } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { JoinStudyRoomDrawer } from '@/components/drawers/JoinStudyRoomDrawer';
import { CreateStudyRoomDrawer } from '@/components/drawers/CreateStudyRoomDrawer';
import { CameraPreviewDrawer } from '@/components/drawers/CameraPreviewDrawer';

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
        'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100',
      ],
    },
    isPrivate: false,
    status: 'live',
    description: 'Going over data structures and algorithms for the final exam. All welcome!',
  },
  {
    id: '2',
    name: 'Calculus II Study Group',
    host: {
      name: 'Michael Brown',
      avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
    participants: {
      current: 5,
      max: 10,
      avatars: [
        'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100',
        'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
        'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100',
      ],
    },
    isPrivate: true,
    status: 'live',
    description: 'Working through integration problems and preparing for midterm.',
  },
  {
    id: '3',
    name: 'Physics Lab Discussion',
    host: {
      name: 'Emma Wilson',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
    participants: {
      current: 3,
      max: 8,
      avatars: [
        'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
        'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100',
      ],
    },
    isPrivate: false,
    status: 'live',
    description: 'Discussing lab results and preparing lab reports.',
  },
  {
    id: '4',
    name: 'Essay Writing Workshop',
    host: {
      name: 'David Kim',
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
    participants: {
      current: 12,
      avatars: [
        'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100',
        'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
        'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100',
        'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
      ],
    },
    isPrivate: false,
    status: 'scheduled',
    startTime: 'Today, 3:00 PM',
    endTime: 'Today, 5:00 PM',
    description: 'Collaborative essay writing and peer review session.',
  },
  {
    id: '5',
    name: 'Organic Chemistry Review',
    host: {
      name: 'Lisa Wang',
      avatar: 'https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
    participants: {
      current: 6,
      max: 12,
      avatars: [
        'https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=100',
        'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
        'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100',
      ],
    },
    isPrivate: true,
    status: 'scheduled',
    startTime: 'Tomorrow, 10:00 AM',
    endTime: 'Tomorrow, 12:00 PM',
    description: 'Review session for upcoming organic chemistry exam.',
  },
];

const subjects = [
  'All', 'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Other'
];

const statusFilters = [
  'All', 'Live Now', 'Scheduled', 'Public', 'Private'
];

export default function StudyRoomsScreen() {
  const { isDark } = useTheme();
  const [rooms, setRooms] = useState<StudyRoom[]>(initialRooms);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [isJoinRoomOpen, setIsJoinRoomOpen] = useState(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isCameraPreviewOpen, setIsCameraPreviewOpen] = useState(false);
  const [isUsePasscodeOpen, setIsUsePasscodeOpen] = useState(false);
  const [selectedRoomForJoin, setSelectedRoomForJoin] = useState<StudyRoom | null>(null);
  const [joinRoomData, setJoinRoomData] = useState<{ roomId: string; roomName?: string; password?: string } | null>(null);

  const handleJoinRoom = (password: string) => {
    Alert.alert('Joining Room', `Joining room with password: ${password}`);
    setIsJoinRoomOpen(false);
  };

  const handleCreateRoom = (roomData: any) => {
    setRooms(prevRooms => [roomData, ...prevRooms]);
    Alert.alert('Room Created', `"${roomData.name}" has been created successfully!`);
  };

  const handleRoomPress = (room: StudyRoom) => {
    setSelectedRoomForJoin(room);
    setIsCameraPreviewOpen(true);
  };

  const handleJoinFromCamera = () => {
    if (selectedRoomForJoin) {
      Alert.alert('Joining Room', `Joining "${selectedRoomForJoin.name}"...`);
    }
    setIsCameraPreviewOpen(false);
    setSelectedRoomForJoin(null);
  };

  const filteredRooms = rooms.filter(room => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!room.name.toLowerCase().includes(query) &&
          !room.description.toLowerCase().includes(query) &&
          !room.host.name.toLowerCase().includes(query)) {
        return false;
      }
    }

    // Status filter
    if (selectedStatus !== 'All') {
      if (selectedStatus === 'Live Now' && room.status !== 'live') return false;
      if (selectedStatus === 'Scheduled' && room.status !== 'scheduled') return false;
      if (selectedStatus === 'Public' && room.isPrivate) return false;
      if (selectedStatus === 'Private' && !room.isPrivate) return false;
    }

    return true;
  });

  const liveRooms = filteredRooms.filter(room => room.status === 'live');
  const scheduledRooms = filteredRooms.filter(room => room.status === 'scheduled');

  const renderRoom = (room: StudyRoom) => (
    <TouchableOpacity
      key={room.id}
      style={[
        styles.roomCard,
        { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' },
        room.status === 'live' && styles.liveRoomCard
      ]}
      onPress={() => handleRoomPress(room)}
    >
      <View style={styles.roomHeader}>
        <View style={styles.roomInfo}>
          <View style={styles.roomTitleRow}>
            <Text style={[styles.roomName, { color: isDark ? '#FFFFFF' : '#111827' }]} numberOfLines={1}>
              {room.name}
            </Text>
            {room.isPrivate && (
              <Lock size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
            )}
          </View>
          
          <View style={styles.roomMeta}>
            <View style={styles.hostInfo}>
              <Image source={{ uri: room.host.avatar }} style={styles.hostAvatar} />
              <Text style={[styles.hostName, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                {room.host.name}
              </Text>
            </View>
            
            {room.subject && (
              <View style={styles.subjectBadge}>
                <Text style={[styles.subjectText, { color: isDark ? '#60A5FA' : '#3B82F6' }]}>
                  {room.subject}
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.roomStatus}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: room.status === 'live' ? '#EF4444' : '#F59E0B' }
          ]}>
            <View style={[
              styles.statusDot,
              { backgroundColor: '#FFFFFF' }
            ]} />
            <Text style={styles.statusText}>
              {room.status === 'live' ? 'LIVE' : 'SCHEDULED'}
            </Text>
          </View>
        </View>
      </View>

      <Text style={[styles.roomDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]} numberOfLines={2}>
        {room.description}
      </Text>

      {room.status === 'scheduled' && room.startTime && (
        <View style={styles.scheduleInfo}>
          <View style={styles.scheduleItem}>
            <Calendar size={14} color={isDark ? '#60A5FA' : '#3B82F6'} />
            <Text style={[styles.scheduleText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
              {room.startTime}
            </Text>
          </View>
          {room.endTime && (
            <View style={styles.scheduleItem}>
              <Clock size={14} color={isDark ? '#60A5FA' : '#3B82F6'} />
              <Text style={[styles.scheduleText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                Until {room.endTime.split(', ')[1]}
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.roomFooter}>
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
            {room.participants.avatars.length > 3 && (
              <View style={[
                styles.moreParticipants,
                { backgroundColor: isDark ? '#374151' : '#F3F4F6' }
              ]}>
                <Text style={[styles.moreParticipantsText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                  +{room.participants.avatars.length - 3}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.participantCount}>
            <Users size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
            <Text style={[styles.participantCountText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
              {room.participants.current} {room.participants.max ? `/ ${room.participants.max}` : ''} online
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[
            styles.joinButton,
            { backgroundColor: room.status === 'live' ? '#EF4444' : '#3B82F6' }
          ]}
          onPress={() => handleRoomPress(room)}
        >
          <Text style={styles.joinButtonText}>
            {room.isPrivate && room.status === 'live' ? 'Request' : room.status === 'live' ? 'Join' : 'Schedule'}
          </Text>
        </TouchableOpacity>
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
                  placeholder="Search rooms or hosts"
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
              <View style={styles.filtersContainer}>
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
              </View>
            )}
          </View>

          {/* Live Rooms */}
          {liveRooms.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Live Now ({liveRooms.length})
              </Text>
              <View style={styles.roomsGrid}>
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
              <View style={styles.roomsGrid}>
                {scheduledRooms.map(renderRoom)}
              </View>
            </View>
          )}

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
        </ScrollView>

        {/* Join with Code Button */}
        {/* Join with Code Button */}
        <View style={styles.joinCodeContainer}>
          <TouchableOpacity 
            style={[styles.joinCodeButton, { backgroundColor: '#3B82F6' }]}
            onPress={() => setIsJoinRoomOpen(true)}
          >
            <Text style={styles.joinCodeText}>Join with Code</Text>
            <ChevronRight size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Join Room Drawer */}
        <JoinStudyRoomDrawer
          isOpen={isJoinRoomOpen}
          onClose={() => setIsJoinRoomOpen(false)}
          onJoinRoom={handleJoinRoom}
        />

        {/* Camera Preview Drawer */}
        <CameraPreviewDrawer
          isOpen={isCameraPreviewOpen}
          onClose={() => {
            setIsCameraPreviewOpen(false);
            setSelectedRoomForJoin(null);
            setJoinRoomData(null);
          }}
          onJoinRoom={handleJoinFromCamera}
          roomName={selectedRoomForJoin?.name || joinRoomData?.roomName}
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
  roomsGrid: {
    gap: 16,
  },
  roomCard: {
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
  liveRoomCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  roomInfo: {
    flex: 1,
    marginRight: 12,
  },
  roomTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  roomName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  roomMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hostAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  hostName: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  subjectBadge: {
    // Subject badge styles
  },
  subjectText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  roomStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
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
  roomDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 12,
  },
  scheduleInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scheduleText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  roomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantsInfo: {
    flex: 1,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  participantCountText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
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
  joinCodeContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  joinCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 5,
  },
  joinCodeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});
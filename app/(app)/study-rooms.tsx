import { useState, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SwipeGestureWrapper } from '@/components/SwipeGestureWrapper';
import { useTheme } from '@/context/ThemeContext';
import { Search, Filter, Users, Clock, Plus, Send, Play, Pause, X, Lock, ChevronRight, BookOpen, User, Settings, Video, Mic, MicOff, VideoOff } from 'lucide-react-native';
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
    avatars?: string[];
  };
  isPrivate: boolean;
  status: 'live' | 'scheduled';
  startTime?: string;
  endTime?: string;
  description: string;
  onlineLink?: string;
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
      current: 12,
      max: 20,
      avatars: [
        'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
        'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100',
        'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
        'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100'
      ]
    },
    isPrivate: false,
    status: 'live',
    description: 'Join us to study advanced algorithms and data structures. We\'re focusing on graph algorithms today.',
  },
  {
    id: '2',
    name: 'Organic Chemistry Study Group',
    host: {
      name: 'Michael Brown',
      avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
    participants: {
      current: 8,
      max: 15,
      avatars: [
        'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100',
        'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
        'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100'
      ]
    },
    isPrivate: true,
    status: 'live',
    description: 'Reviewing organic chemistry reactions and mechanisms for the midterm exam.',
  },
  {
    id: '3',
    name: 'Calculus II Problem Solving',
    host: {
      name: 'Emma Wilson',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
    participants: {
      current: 5,
      max: 10,
      avatars: [
        'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
        'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100'
      ]
    },
    isPrivate: false,
    status: 'live',
    description: 'Working through practice problems for integration techniques and applications.',
  },
  {
    id: '4',
    name: 'Psychology Research Methods',
    host: {
      name: 'David Kim',
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
    participants: {
      current: 7,
      max: 12,
      avatars: [
        'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100',
        'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100'
      ]
    },
    isPrivate: false,
    status: 'scheduled',
    startTime: 'Today, 3:00 PM',
    endTime: 'Today, 5:00 PM',
    description: 'Discussion of experimental design, statistical analysis, and research ethics.',
  },
  {
    id: '5',
    name: 'Spanish Conversation Practice',
    host: {
      name: 'Lisa Wang',
      avatar: 'https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
    participants: {
      current: 6,
      avatars: [
        'https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=100',
        'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100'
      ]
    },
    isPrivate: true,
    status: 'scheduled',
    startTime: 'Tomorrow, 10:00 AM',
    endTime: 'Tomorrow, 11:30 AM',
    description: 'Practice Spanish conversation skills with fellow students. All levels welcome!',
  },
  {
    id: '6',
    name: 'Machine Learning Study Group',
    host: {
      name: 'Alex Johnson',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
    participants: {
      current: 9,
      max: 15,
      avatars: [
        'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
        'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
        'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100'
      ]
    },
    isPrivate: false,
    status: 'scheduled',
    startTime: 'Dec 15, 4:00 PM',
    endTime: 'Dec 15, 6:00 PM',
    description: 'Deep dive into neural networks and supervised learning algorithms.',
  },
  {
    id: '7',
    name: 'Literature Analysis Group',
    host: {
      name: 'Emily Parker',
      avatar: 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
    participants: {
      current: 4,
      max: 8,
      avatars: [
        'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=100',
        'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100'
      ]
    },
    isPrivate: true,
    status: 'scheduled',
    startTime: 'Dec 16, 2:00 PM',
    endTime: 'Dec 16, 3:30 PM',
    description: 'Discussing themes and symbolism in modern literature.',
  }
];

export default function StudyRoomsScreen() {
  const { isDark } = useTheme();
  const [rooms, setRooms] = useState<StudyRoom[]>(initialRooms);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLiveOnly, setShowLiveOnly] = useState(false);
  const [showPublicOnly, setShowPublicOnly] = useState(false);
  const [showPrivateOnly, setShowPrivateOnly] = useState(false);
  const [showScheduledOnly, setShowScheduledOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<StudyRoom | null>(null);
  const [isJoinDrawerOpen, setIsJoinDrawerOpen] = useState(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isStudying, setIsStudying] = useState(false);
  const [studyTimer, setStudyTimer] = useState(0);
  const [remindedRooms, setRemindedRooms] = useState<string[]>([]);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [participants, setParticipants] = useState<{name: string, avatar: string}[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleJoinRoom = (room: StudyRoom) => {
    if (room.isPrivate) {
      Alert.alert(
        'Private Room',
        `"${room.name}" requires approval to join.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Request to Join', 
            onPress: () => {
              Alert.alert('Request Sent', 'Your request to join has been sent to the room host.');
            }
          }
        ]
      );
    } else {
      // Simulate joining a public room
      setSelectedRoom(room);
      setIsStudying(true);
      startStudyTimer();
      
      // Simulate other participants
      const randomParticipants = [
        { name: 'Sarah Chen', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100' },
        { name: 'Michael Brown', avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100' },
        { name: 'Emma Wilson', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100' },
        { name: 'David Kim', avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100' },
      ];
      
      // Randomly select 2-4 participants
      const numParticipants = Math.floor(Math.random() * 3) + 2;
      setParticipants(randomParticipants.slice(0, numParticipants));
    }
  };

  const handleRemindMe = (room: StudyRoom) => {
    // Add room ID to reminded rooms list
    setRemindedRooms(prev => [...prev, room.id]);
    
    // Show confirmation alert
    Alert.alert(
      'Reminder Set',
      `We'll notify you when "${room.name}" goes live at ${room.startTime}.`,
      [{ text: 'OK' }]
    );
    
    // In a real app, this would set up a notification
    // For this demo, we'll simulate a notification after a short delay
    setTimeout(() => {
      if (remindedRooms.includes(room.id)) {
        Alert.alert(
          'Study Room Reminder',
          `"${room.name}" is starting now! Would you like to join?`,
          [
            { text: 'Not Now', style: 'cancel' },
            { 
              text: 'Join Now', 
              onPress: () => handleJoinRoom(room)
            }
          ]
        );
      }
    }, 10000); // Simulate a notification after 10 seconds for demo purposes
  };

  const handleJoinWithCode = (roomId: string, password?: string) => {
    // In a real app, this would validate the room ID and password
    const room = rooms.find(r => r.id === roomId);
    
    if (!room) {
      Alert.alert('Error', 'Room not found. Please check the room ID and try again.');
      return;
    }
    
    if (room.isPrivate && !password) {
      Alert.alert('Error', 'This room requires a password.');
      return;
    }
    
    // Simulate password validation
    if (room.isPrivate && password !== '1234') {
      Alert.alert('Error', 'Incorrect password. Please try again.');
      return;
    }
    
    setSelectedRoom(room);
    setIsStudying(true);
    startStudyTimer();
    
    // Simulate other participants
    const randomParticipants = [
      { name: 'Sarah Chen', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100' },
      { name: 'Michael Brown', avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100' },
      { name: 'Emma Wilson', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100' },
    ];
    
    // Randomly select 1-3 participants
    const numParticipants = Math.floor(Math.random() * 3) + 1;
    setParticipants(randomParticipants.slice(0, numParticipants));
  };

  const handleCreateRoom = (roomData: StudyRoom) => {
    setRooms(prevRooms => [roomData, ...prevRooms]);
    setIsCreateRoomOpen(false);
    
    if (roomData.status === 'live') {
      // If it's a live room, join it immediately
      setSelectedRoom(roomData);
      setIsStudying(true);
      startStudyTimer();
      setParticipants([]); // No other participants yet
    } else {
      Alert.alert('Room Created', `Your study room "${roomData.name}" has been scheduled for ${roomData.startTime}.`);
    }
  };

  const handleLeaveRoom = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsStudying(false);
    setStudyTimer(0);
    setSelectedRoom(null);
    setParticipants([]);
  };

  const handleSendMessage = () => {
    // In a real app, this would send the message to the room
    Alert.alert('Message Sent', `Your message has been sent to the room.`);
  };

  const startStudyTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setStudyTimer(prev => prev + 1);
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredRooms = rooms.filter(room => {
    // Live only filter
    if (showLiveOnly && room.status !== 'live') {
      return false;
    }
    
    // Scheduled only filter
    if (showScheduledOnly && room.status !== 'scheduled') {
      return false;
    }
    
    // Private only filter
    if (showPrivateOnly && !room.isPrivate) {
      return false;
    }
    
    // Public only filter
    if (showPublicOnly && room.isPrivate) {
      return false;
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        room.name.toLowerCase().includes(query) ||
        room.description.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Separate live and scheduled rooms
  const liveRooms = filteredRooms.filter(room => room.status === 'live');
  const scheduledRooms = filteredRooms.filter(room => room.status === 'scheduled');

  return (
    <SwipeGestureWrapper>
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}>
        {!isStudying ? (
          <>
            <ScrollView>
              <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Study Rooms
                </Text>
                <Text style={[styles.headerSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  Join a virtual study space
                </Text>
              </View>

              <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
                  <Search size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  <TextInput
                    style={[styles.searchInput, { color: isDark ? '#E5E7EB' : '#1F2937' }]}
                    placeholder="Search by name or description"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>
                
                <TouchableOpacity 
                  style={[
                    styles.filterButton, 
                    { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' },
                    showFilters && { backgroundColor: '#3B82F6' }
                  ]}
                  onPress={() => setShowFilters(!showFilters)}
                >
                  <Filter size={20} color={showFilters ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#6B7280')} />
                </TouchableOpacity>
              </View>

              {showFilters && (
                <View style={styles.filtersContainer}>
                  <View style={styles.filterRow}>
                    <Text style={[styles.filterLabel, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                      Quick Filters:
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.quickFilters}
                    >
                      <TouchableOpacity
                        style={[
                          styles.quickFilterButton,
                          { backgroundColor: showLiveOnly ? '#3B82F6' : (isDark ? '#374151' : '#F3F4F6') }
                        ]}
                        onPress={() => {
                          setShowLiveOnly(!showLiveOnly);
                          if (!showLiveOnly) {
                            setShowScheduledOnly(false);
                          }
                        }}
                      >
                        <Text style={[
                          styles.quickFilterText,
                          { color: showLiveOnly ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#4B5563') }
                        ]}>
                          Live Now
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[
                          styles.quickFilterButton,
                          { backgroundColor: showScheduledOnly ? '#3B82F6' : (isDark ? '#374151' : '#F3F4F6') }
                        ]}
                        onPress={() => {
                          setShowScheduledOnly(!showScheduledOnly);
                          if (!showScheduledOnly) {
                            setShowLiveOnly(false);
                          }
                        }}
                      >
                        <Text style={[
                          styles.quickFilterText,
                          { color: showScheduledOnly ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#4B5563') }
                        ]}>
                          Scheduled
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[
                          styles.quickFilterButton,
                          { backgroundColor: showPublicOnly ? '#3B82F6' : (isDark ? '#374151' : '#F3F4F6') }
                        ]}
                        onPress={() => {
                          setShowPublicOnly(!showPublicOnly);
                          if (!showPublicOnly) {
                            setShowPrivateOnly(false);
                          }
                        }}
                      >
                        <Text style={[
                          styles.quickFilterText,
                          { color: showPublicOnly ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#4B5563') }
                        ]}>
                          Public
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[
                          styles.quickFilterButton,
                          { backgroundColor: showPrivateOnly ? '#3B82F6' : (isDark ? '#374151' : '#F3F4F6') }
                        ]}
                        onPress={() => {
                          setShowPrivateOnly(!showPrivateOnly);
                          if (!showPrivateOnly) {
                            setShowPublicOnly(false);
                          }
                        }}
                      >
                        <Text style={[
                          styles.quickFilterText,
                          { color: showPrivateOnly ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#4B5563') }
                        ]}>
                          Private
                        </Text>
                      </TouchableOpacity>
                    </ScrollView>
                  </View>
                </View>
              )}

              <View style={styles.roomsListContainer}>
                {/* Live Rooms Section */}
                {liveRooms.length > 0 && (
                  <View style={styles.roomsSection}>
                    <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                      Live Now
                    </Text>
                    
                    {liveRooms.map((room) => (
                      <View 
                        key={room.id}
                        style={[styles.roomCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}
                      >
                        <View style={styles.roomHeader}>
                          <View style={styles.roomTitleContainer}>
                            <Text style={[styles.roomTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                              {room.name}
                              {room.isPrivate && (
                                <Text style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}> <Lock size={16} color={isDark ? '#9CA3AF' : '#6B7280'} /></Text>
                              )}
                            </Text>
                          </View>
                          <View style={[
                            styles.statusBadge,
                            { backgroundColor: '#EF4444' }
                          ]}>
                            <Text style={styles.statusBadgeText}>Live</Text>
                          </View>
                        </View>

                        <Text style={[styles.roomDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                          {room.description}
                        </Text>

                        <View style={styles.roomDetails}>
                          <View style={styles.hostInfo}>
                            <Image source={{ uri: room.host.avatar }} style={styles.hostAvatar} />
                            <Text style={[styles.hostName, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                              {room.host.name}
                            </Text>
                          </View>
                          
                          <View style={styles.roomStats}>
                            <View style={styles.statItem}>
                              <Users size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
                              <Text style={[styles.statText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                                {room.participants.current}{room.participants.max ? `/${room.participants.max}` : ''}
                              </Text>
                            </View>
                          </View>
                        </View>
                        
                        {/* Participants Avatars */}
                        {room.participants.avatars && room.participants.avatars.length > 0 && (
                          <View style={styles.participantsAvatars}>
                            {room.participants.avatars.slice(0, 4).map((avatar, index) => (
                              <Image 
                                key={index} 
                                source={{ uri: avatar }} 
                                style={[
                                  styles.participantAvatar,
                                  { marginLeft: index > 0 ? -10 : 0 }
                                ]} 
                              />
                            ))}
                            {room.participants.current > 4 && (
                              <View style={styles.moreParticipants}>
                                <Text style={styles.moreParticipantsText}>
                                  +{room.participants.current - 4}
                                </Text>
                              </View>
                            )}
                          </View>
                        )}

                        <TouchableOpacity 
                          style={[styles.joinRoomButton, { backgroundColor: '#3B82F6' }]}
                          onPress={() => handleJoinRoom(room)}
                        >
                          <Video size={20} color="#FFFFFF" />
                          <Text style={styles.joinRoomButtonText}>
                            {room.isPrivate ? 'Request to Join' : 'Join Video Chat'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {/* Scheduled Rooms Section */}
                {scheduledRooms.length > 0 && (
                  <View style={styles.roomsSection}>
                    <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                      Scheduled
                    </Text>
                    
                    {scheduledRooms.map((room) => (
                      <View 
                        key={room.id}
                        style={[styles.roomCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}
                      >
                        <View style={styles.roomHeader}>
                          <View style={styles.roomTitleContainer}>
                            <Text style={[styles.roomTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                              {room.name}
                              {room.isPrivate && (
                                <Text style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}> <Lock size={16} color={isDark ? '#9CA3AF' : '#6B7280'} /></Text>
                              )}
                            </Text>
                          </View>
                          <View style={[
                            styles.statusBadge,
                            { backgroundColor: '#F59E0B' }
                          ]}>
                            <Text style={styles.statusBadgeText}>Scheduled</Text>
                          </View>
                        </View>

                        <Text style={[styles.roomDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                          {room.description}
                        </Text>

                        <View style={styles.roomDetails}>
                          <View style={styles.hostInfo}>
                            <Image source={{ uri: room.host.avatar }} style={styles.hostAvatar} />
                            <Text style={[styles.hostName, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                              {room.host.name}
                            </Text>
                          </View>
                        </View>
                        
                        <View style={styles.scheduledDetails}>
                          <View style={styles.scheduledItem}>
                            <Clock size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
                            <Text style={[styles.scheduledText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                              {room.startTime}
                            </Text>
                          </View>
                        </View>

                        <TouchableOpacity 
                          style={[styles.joinRoomButton, { backgroundColor: '#10B981' }]}
                          onPress={() => handleRemindMe(room)}
                        >
                          <Text style={styles.joinRoomButtonText}>
                            {remindedRooms.includes(room.id) ? 'Reminder Set' : 'Remind Me'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {filteredRooms.length === 0 && (
                  <View style={styles.emptyState}>
                    <BookOpen size={48} color={isDark ? '#9CA3AF' : '#6B7280'} />
                    <Text style={[styles.emptyStateTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                      No study rooms found
                    </Text>
                    <Text style={[styles.emptyStateText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                      Try adjusting your filters or create a new room
                    </Text>
                  </View>
                )}
                
                {/* Add padding at the bottom to ensure content is visible above the action buttons */}
                <View style={{ height: 100 }} />
              </View>
            </ScrollView>

            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity 
                style={[styles.createRoomButton, { backgroundColor: '#3B82F6' }]}
                onPress={() => setIsCreateRoomOpen(true)}
              >
                <Plus size={20} color="#FFFFFF" />
                <Text style={styles.createRoomButtonText}>Create Room</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.joinWithCodeButton, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}
                onPress={() => setIsJoinDrawerOpen(true)}
              >
                <Text style={[styles.joinWithCodeButtonText, { color: isDark ? '#60A5FA' : '#3B82F6' }]}>
                  Join with Code
                </Text>
                <ChevronRight size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          // Active Study Session View
          <View style={styles.studySessionContainer}>
            <View style={[styles.studyHeader, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
              <View style={styles.studyRoomInfo}>
                <Text style={[styles.studyRoomName, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  {selectedRoom?.name}
                </Text>
                <View style={styles.studyRoomDetails}>
                  <View style={styles.hostInfo}>
                    <Image source={{ uri: selectedRoom?.host.avatar }} style={styles.hostAvatarSmall} />
                    <Text style={[styles.hostNameSmall, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                      {selectedRoom?.host.name}
                    </Text>
                  </View>
                </View>
                <View style={styles.participantsInfo}>
                  <Users size={14} color={isDark ? '#60A5FA' : '#3B82F6'} />
                  <Text style={[styles.participantsText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                    {selectedRoom?.participants.current}{selectedRoom?.participants.max ? `/${selectedRoom?.participants.max}` : ''} participants
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={[styles.leaveButton, { backgroundColor: '#EF4444' }]}
                onPress={handleLeaveRoom}
              >
                <X size={16} color="#FFFFFF" />
                <Text style={styles.leaveButtonText}>Leave</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.studyContent}>
              {/* Video Grid */}
              <View style={[styles.videoGrid, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
                <Text style={[styles.videoSectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Video Chat
                </Text>
                
                <View style={styles.videoParticipantsGrid}>
                  {/* Your video */}
                  <View style={styles.videoParticipant}>
                    <View style={[
                      styles.videoFeed,
                      !isCameraOn && { backgroundColor: isDark ? '#0F172A' : '#E5E7EB' }
                    ]}>
                      {isCameraOn ? (
                        <View style={styles.videoPlaceholder}>
                          <Text style={styles.videoPlaceholderText}>You</Text>
                        </View>
                      ) : (
                        <View style={styles.videoOffIndicator}>
                          <VideoOff size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
                          <Text style={[styles.videoOffText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                            Camera Off
                          </Text>
                        </View>
                      )}
                      <View style={styles.videoParticipantInfo}>
                        <Text style={styles.videoParticipantName}>You</Text>
                        {!isMicOn && <MicOff size={12} color="#FFFFFF" />}
                      </View>
                    </View>
                  </View>
                  
                  {/* Other participants */}
                  {participants.map((participant, index) => (
                    <View key={index} style={styles.videoParticipant}>
                      <View style={styles.videoFeed}>
                        <View style={styles.videoPlaceholder}>
                          <Text style={styles.videoPlaceholderText}>{participant.name.charAt(0)}</Text>
                        </View>
                        <View style={styles.videoParticipantInfo}>
                          <Text style={styles.videoParticipantName}>{participant.name}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
                
                <View style={styles.videoControls}>
                  <TouchableOpacity 
                    style={[
                      styles.videoControlButton,
                      { backgroundColor: isCameraOn ? (isDark ? '#374151' : '#E5E7EB') : '#EF4444' }
                    ]}
                    onPress={() => setIsCameraOn(!isCameraOn)}
                  >
                    {isCameraOn ? (
                      <Video size={24} color={isDark ? '#E5E7EB' : '#4B5563'} />
                    ) : (
                      <VideoOff size={24} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.videoControlButton,
                      { backgroundColor: isMicOn ? (isDark ? '#374151' : '#E5E7EB') : '#EF4444' }
                    ]}
                    onPress={() => setIsMicOn(!isMicOn)}
                  >
                    {isMicOn ? (
                      <Mic size={24} color={isDark ? '#E5E7EB' : '#4B5563'} />
                    ) : (
                      <MicOff size={24} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.videoControlButton, { backgroundColor: '#EF4444' }]}
                    onPress={handleLeaveRoom}
                  >
                    <X size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.timerCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
                <Text style={[styles.timerLabel, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Study Time
                </Text>
                <Text style={[styles.timerValue, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  {formatTime(studyTimer)}
                </Text>
                <View style={styles.timerControls}>
                  <TouchableOpacity 
                    style={[styles.timerButton, { backgroundColor: '#3B82F6' }]}
                    onPress={() => {
                      if (timerRef.current) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                      } else {
                        startStudyTimer();
                      }
                    }}
                  >
                    {timerRef.current ? (
                      <Pause size={20} color="#FFFFFF" />
                    ) : (
                      <Play size={20} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.timerButton, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}
                    onPress={() => {
                      if (timerRef.current) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                      }
                      setStudyTimer(0);
                    }}
                  >
                    <X size={20} color={isDark ? '#E5E7EB' : '#4B5563'} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.chatCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    Chat
                  </Text>
                </View>
                
                <ScrollView 
                  style={styles.chatMessages}
                  contentContainerStyle={styles.chatMessagesContent}
                >
                  <View style={styles.chatMessage}>
                    <Image 
                      source={{ uri: selectedRoom?.host.avatar }} 
                      style={styles.chatAvatar} 
                    />
                    <View style={styles.messageContent}>
                      <View style={styles.messageHeader}>
                        <Text style={[styles.messageSender, { color: isDark ? '#60A5FA' : '#3B82F6' }]}>
                          {selectedRoom?.host.name}
                        </Text>
                        <Text style={[styles.messageTime, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                          2m ago
                        </Text>
                      </View>
                      <Text style={[styles.messageText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                        Welcome to the study room! Let me know if you have any questions.
                      </Text>
                    </View>
                  </View>
                  
                  {participants.length > 0 && (
                    <View style={styles.chatMessage}>
                      <Image 
                        source={{ uri: participants[0].avatar }} 
                        style={styles.chatAvatar} 
                      />
                      <View style={styles.messageContent}>
                        <View style={styles.messageHeader}>
                          <Text style={[styles.messageSender, { color: isDark ? '#60A5FA' : '#3B82F6' }]}>
                            {participants[0].name}
                          </Text>
                          <Text style={[styles.messageTime, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                            1m ago
                          </Text>
                        </View>
                        <Text style={[styles.messageText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                          I'm stuck on problem 3. Can someone help?
                        </Text>
                      </View>
                    </View>
                  )}
                  
                  <View style={styles.systemMessage}>
                    <Text style={[styles.systemMessageText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                      You joined the room
                    </Text>
                  </View>
                </ScrollView>
                
                <View style={styles.chatInputContainer}>
                  <View style={[
                    styles.chatInput, 
                    { backgroundColor: isDark ? '#0F172A' : '#F3F4F6' }
                  ]}>
                    <TextInput
                      style={[styles.chatInputText, { color: isDark ? '#E5E7EB' : '#1F2937' }]}
                      placeholder="Type a message..."
                      placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    />
                    <TouchableOpacity 
                      style={styles.sendButton}
                      onPress={handleSendMessage}
                    >
                      <Send size={20} color="#3B82F6" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        <JoinStudyRoomDrawer
          isOpen={isJoinDrawerOpen}
          onClose={() => setIsJoinDrawerOpen(false)}
          onJoinRoom={handleJoinWithCode}
        />

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
  header: {
    padding: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filtersContainer: {
    paddingHorizontal: 16,
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
    flexWrap: 'wrap',
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
  roomsListContainer: {
    flex: 1,
  },
  roomsSection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  roomCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  roomTitleContainer: {
    flex: 1,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  roomDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 12,
  },
  roomDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  hostName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  roomStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  scheduledDetails: {
    marginBottom: 12,
    gap: 8,
  },
  scheduledItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scheduledText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  participantsAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  participantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  moreParticipants: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  moreParticipantsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  joinRoomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  joinRoomButtonText: {
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
  actionButtonsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  createRoomButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  createRoomButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  joinWithCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  joinWithCodeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginRight: 4,
  },
  // Study Session Styles
  studySessionContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  studyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    margin: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  studyRoomInfo: {
    flex: 1,
  },
  studyRoomName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  studyRoomDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  hostAvatarSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 4,
  },
  hostNameSmall: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  participantsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  participantsText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 4,
  },
  leaveButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  studyContent: {
    flex: 1,
    padding: 16,
    paddingTop: 8,
    gap: 16,
  },
  videoGrid: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  videoSectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  videoParticipantsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  videoParticipant: {
    width: '48%',
    aspectRatio: 16/9,
  },
  videoFeed: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  videoPlaceholderText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  videoOffIndicator: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  videoOffText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  videoParticipantInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  videoParticipantName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  videoControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
  },
  videoControlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerCard: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timerLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  timerValue: {
    fontSize: 36,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  timerControls: {
    flexDirection: 'row',
    gap: 16,
  },
  timerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  chatMessages: {
    flex: 1,
  },
  chatMessagesContent: {
    paddingBottom: 8,
  },
  chatMessage: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  chatAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  messageSender: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  messageTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  messageText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  systemMessage: {
    alignItems: 'center',
    marginVertical: 8,
  },
  systemMessageText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    fontStyle: 'italic',
  },
  chatInputContainer: {
    marginTop: 12,
  },
  chatInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chatInputText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  sendButton: {
    padding: 8,
  },
});
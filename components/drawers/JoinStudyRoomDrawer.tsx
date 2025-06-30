import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, Dimensions, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Search, Users, Video, Mic, MicOff, VideoOff, Camera, Key, Lock, UserPlus, MessageCircle, BookOpen } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  runOnJS
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface JoinStudyRoomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinRoom: (roomId: string, password?: string) => void;
}

interface ActiveRoom {
  id: string;
  name: string;
  participants: number;
  maxParticipants?: number;
  isPrivate: boolean;
  subject?: string;
}

const activeRooms: ActiveRoom[] = [
  {
    id: 'cs101',
    name: 'CS101 Study Group',
    participants: 5,
    maxParticipants: 10,
    isPrivate: false,
    subject: 'Computer Science'
  },
  {
    id: 'math202',
    name: 'Calculus II Help',
    participants: 3,
    maxParticipants: 8,
    isPrivate: true,
    subject: 'Mathematics'
  },
  {
    id: 'bio303',
    name: 'Biology Lab Prep',
    participants: 2,
    maxParticipants: 6,
    isPrivate: false,
    subject: 'Biology'
  },
  {
    id: 'eng101',
    name: 'Essay Writing Workshop',
    participants: 4,
    isPrivate: false,
    subject: 'English'
  },
  {
    id: 'chem404',
    name: 'Organic Chemistry',
    participants: 6,
    maxParticipants: 12,
    isPrivate: true,
    subject: 'Chemistry'
  }
];

export function JoinStudyRoomDrawer({ isOpen, onClose, onJoinRoom }: JoinStudyRoomDrawerProps) {
  const { isDark } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  
  const translateX = useSharedValue(screenWidth);
  const videoRef = useRef<View>(null);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const gesture = Gesture.Pan()
    .activeOffsetX([0, 15])
    .onUpdate((event) => {
      if (event.translationX > 0) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      if (event.translationX > screenWidth * 0.3 || event.velocityX > 500) {
        translateX.value = withSpring(screenWidth, {
          damping: 20,
          stiffness: 90,
          mass: 0.4,
        }, () => {
          runOnJS(onClose)();
        });
      } else {
        translateX.value = withSpring(0, {
          damping: 20,
          stiffness: 90,
          mass: 0.4,
        });
      }
    });

  React.useEffect(() => {
    translateX.value = withSpring(isOpen ? 0 : screenWidth, {
      damping: 20,
      stiffness: 90,
      mass: 0.4,
    });
    
    // Reset form when drawer opens
    if (isOpen) {
      setRoomId('');
      setPassword('');
      setSearchQuery('');
      setSelectedRoom(null);
      setIsCameraOn(true);
      setIsMicOn(true);
    }
  }, [isOpen]);

  const handleJoinRoom = () => {
    if (selectedRoom) {
      const room = activeRooms.find(r => r.id === selectedRoom);
      if (room) {
        if (room.isPrivate && !password.trim()) {
          Alert.alert('Password Required', 'Please enter the password for this private room');
          return;
        }
        onJoinRoom(room.id, room.isPrivate ? password : undefined);
      }
    } else if (roomId.trim()) {
      onJoinRoom(roomId.trim(), password.trim() || undefined);
    } else {
      Alert.alert('Room ID Required', 'Please enter a room ID or select an active room');
    }
  };

  const filteredRooms = activeRooms.filter(room => {
    if (searchQuery) {
      return room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             (room.subject && room.subject.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return true;
  });

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
  };

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
  };

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoom(roomId === selectedRoom ? null : roomId);
    setPassword(''); // Clear password when selecting a new room
    
    // If the room is private, show password field
    const room = activeRooms.find(r => r.id === roomId);
    if (room && room.isPrivate) {
      setShowPassword(true);
    } else {
      setShowPassword(false);
    }
  };

  if (!isOpen) return null;

  return (
    <View style={[StyleSheet.absoluteFill, styles.container]}>
      <GestureDetector gesture={gesture}>
        <Animated.View 
          style={[
            styles.drawer,
            { backgroundColor: isDark ? '#0F172A' : '#FFFFFF', width: screenWidth },
            drawerStyle,
          ]}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color={isDark ? '#E5E7EB' : '#4B5563'} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Join Video Study Room
              </Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
              {/* Video Preview */}
              <View style={[styles.videoPreviewContainer, { backgroundColor: isDark ? '#1E293B' : '#F3F4F6' }]}>
                <View 
                  ref={videoRef}
                  style={[
                    styles.videoPreview, 
                    !isCameraOn && { backgroundColor: isDark ? '#0F172A' : '#E5E7EB' }
                  ]}
                >
                  {isCameraOn ? (
                    <Camera size={48} color={isDark ? '#60A5FA' : '#3B82F6'} />
                  ) : (
                    <VideoOff size={48} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  )}
                  <Text style={[styles.videoPreviewText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    {isCameraOn ? 'Camera Preview' : 'Camera Off'}
                  </Text>
                </View>
                
                <View style={styles.videoControls}>
                  <TouchableOpacity 
                    style={[
                      styles.videoControl,
                      { backgroundColor: isCameraOn ? (isDark ? '#374151' : '#E5E7EB') : '#EF4444' }
                    ]}
                    onPress={toggleCamera}
                  >
                    {isCameraOn ? (
                      <Video size={24} color={isDark ? '#E5E7EB' : '#4B5563'} />
                    ) : (
                      <VideoOff size={24} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.videoControl,
                      { backgroundColor: isMicOn ? (isDark ? '#374151' : '#E5E7EB') : '#EF4444' }
                    ]}
                    onPress={toggleMic}
                  >
                    {isMicOn ? (
                      <Mic size={24} color={isDark ? '#E5E7EB' : '#4B5563'} />
                    ) : (
                      <MicOff size={24} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Search Active Rooms */}
              <View style={styles.searchSection}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Active Study Rooms
                </Text>
                <View style={[styles.searchBar, { backgroundColor: isDark ? '#1E293B' : '#F3F4F6' }]}>
                  <Search size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  <TextInput
                    style={[styles.searchInput, { color: isDark ? '#E5E7EB' : '#1F2937' }]}
                    placeholder="Search by subject or room name"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>
              </View>

              {/* Active Rooms List */}
              <View style={styles.roomsSection}>
                {filteredRooms.length > 0 ? (
                  filteredRooms.map((room) => (
                    <TouchableOpacity
                      key={room.id}
                      style={[
                        styles.roomItem,
                        { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' },
                        selectedRoom === room.id && { 
                          borderColor: '#10B981',
                          borderWidth: 2,
                        }
                      ]}
                      onPress={() => handleRoomSelect(room.id)}
                    >
                      <View style={styles.roomInfo}>
                        <View style={styles.roomHeader}>
                          <Text style={[styles.roomName, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                            {room.name}
                          </Text>
                          {room.isPrivate && (
                            <Lock size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
                          )}
                        </View>
                        
                        <View style={styles.roomDetails}>
                          {room.subject && (
                            <View style={styles.roomDetail}>
                              <BookOpen size={14} color={isDark ? '#60A5FA' : '#3B82F6'} />
                              <Text style={[styles.roomDetailText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                                {room.subject}
                              </Text>
                            </View>
                          )}
                          
                          <View style={styles.roomDetail}>
                            <Users size={14} color={isDark ? '#60A5FA' : '#3B82F6'} />
                            <Text style={[styles.roomDetailText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                              {room.participants} {room.maxParticipants ? `/ ${room.maxParticipants}` : ''} online
                            </Text>
                          </View>
                        </View>
                      </View>
                      
                      <View style={[
                        styles.participantIndicator,
                        { backgroundColor: room.participants > 0 ? '#10B981' : '#9CA3AF' }
                      ]}>
                        <Text style={styles.participantCount}>{room.participants}</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={[styles.emptyStateText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                      No active rooms match your search
                    </Text>
                  </View>
                )}
              </View>

              {/* Or Join with Code */}
              <View style={styles.orDivider}>
                <View style={[styles.dividerLine, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]} />
                <Text style={[styles.orText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>OR</Text>
                <View style={[styles.dividerLine, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]} />
              </View>

              <View style={styles.codeSection}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Join with Room Code
                </Text>
                
                <View style={styles.inputGroup}>
                  <View style={styles.inputWithIcon}>
                    <Key size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    <TextInput
                      style={[
                        styles.textInput,
                        { 
                          backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                          color: isDark ? '#E5E7EB' : '#1F2937',
                          borderColor: isDark ? '#374151' : '#E5E7EB'
                        }
                      ]}
                      placeholder="Enter room code"
                      placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                      value={roomId}
                      onChangeText={setRoomId}
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                {(showPassword || roomId.trim()) && (
                  <View style={styles.inputGroup}>
                    <View style={styles.inputWithIcon}>
                      <Lock size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                      <TextInput
                        style={[
                          styles.textInput,
                          { 
                            backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                            color: isDark ? '#E5E7EB' : '#1F2937',
                            borderColor: isDark ? '#374151' : '#E5E7EB'
                          }
                        ]}
                        placeholder="Password (if required)"
                        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                      />
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.infoSection}>
                <Text style={[styles.infoTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  About Video Study Rooms
                </Text>
                <Text style={[styles.infoText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  Join a real-time video study session with fellow students. 
                  These rooms are always active - no scheduling needed. 
                  Drop in anytime to collaborate, ask questions, or study in a focused environment.
                </Text>
                
                <View style={[styles.featureItem, { backgroundColor: isDark ? '#1E293B' : '#F3F4F6' }]}>
                  <Video size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                  <Text style={[styles.featureText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Real-time video and audio collaboration
                  </Text>
                </View>
                
                <View style={[styles.featureItem, { backgroundColor: isDark ? '#1E293B' : '#F3F4F6' }]}>
                  <MessageCircle size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                  <Text style={[styles.featureText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Text chat for sharing links and notes
                  </Text>
                </View>
                
                <View style={[styles.featureItem, { backgroundColor: isDark ? '#1E293B' : '#F3F4F6' }]}>
                  <UserPlus size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                  <Text style={[styles.featureText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Invite friends to join your study session
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}>
              <TouchableOpacity 
                style={[
                  styles.joinButton,
                  { backgroundColor: '#10B981' }
                ]}
                onPress={handleJoinRoom}
              >
                <Video size={20} color="#FFFFFF" />
                <Text style={styles.joinButtonText}>Join Video Chat</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
  },
  drawer: {
    flex: 1,
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  videoPreviewContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  videoPreview: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  videoPreviewText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginTop: 8,
  },
  videoControls: {
    flexDirection: 'row',
    gap: 16,
  },
  videoControl: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  searchBar: {
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
  roomsSection: {
    marginBottom: 24,
  },
  roomItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  roomInfo: {
    flex: 1,
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  roomName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  roomDetails: {
    gap: 6,
  },
  roomDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roomDetailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  participantIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantCount: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  orText: {
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  codeSection: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  infoSection: {
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});
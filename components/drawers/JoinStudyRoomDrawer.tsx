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
  onJoinRoom: (roomId: string, password?: string, roomName?: string) => void;
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
  const screenHeight = Dimensions.get('window').height;
  
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  
  const translateY = useSharedValue(screenHeight);
  const videoRef = useRef<View>(null);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const gesture = Gesture.Pan()
    .activeOffsetY([0, 15])
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > screenHeight * 0.3 || event.velocityY > 500) {
        translateY.value = withSpring(screenHeight, {
          damping: 20,
          stiffness: 90,
          mass: 0.4,
        }, () => {
          runOnJS(onClose)();
        });
      } else {
        translateY.value = withSpring(0, {
          damping: 20,
          stiffness: 90,
          mass: 0.4,
        });
      }
    });

  React.useEffect(() => {
    translateY.value = withSpring(isOpen ? 0 : screenHeight, {
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
        // Pass room data to parent for camera preview
        onJoinRoom(room.id, room.isPrivate ? password : undefined, room.name);
      }
    } else if (roomId.trim()) {
      // Pass room ID to parent for camera preview
      onJoinRoom(roomId.trim(), password.trim() || undefined, `Room ${roomId.trim()}`);
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
      <TouchableOpacity 
        style={[StyleSheet.absoluteFill, styles.overlay]}
        activeOpacity={1}
        onPress={onClose}
      />
      <GestureDetector gesture={gesture}>
        <Animated.View 
          style={[
            styles.drawer,
            { backgroundColor: isDark ? '#0F172A' : '#FFFFFF' },
            drawerStyle,
          ]}
        >
          <SafeAreaView style={{ flex: 1 }}>
            {/* Drag Handle */}
            <View style={styles.dragHandle}>
              <View style={[styles.dragIndicator, { backgroundColor: isDark ? '#4B5563' : '#D1D5DB' }]} />
            </View>

            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color={isDark ? '#E5E7EB' : '#4B5563'} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Join Room
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

              <View style={styles.codeSection}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Room Code
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
                          borderColor: isDark ? '#374151' : '#E5E7EB',
                          outlineStyle: 'none',
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
                            borderColor: isDark ? '#374151' : '#E5E7EB',
                            outlineStyle: 'none',
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
                <Text style={styles.joinButtonText}>Join Room</Text>
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
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dragHandle: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
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
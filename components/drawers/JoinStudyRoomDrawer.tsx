import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Video, Mic, MicOff, VideoOff, Camera, RotateCcw, Key, Lock } from 'lucide-react-native';
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

export function JoinStudyRoomDrawer({ isOpen, onClose, onJoinRoom }: JoinStudyRoomDrawerProps) {
  const { isDark } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  
  const [roomCode, setRoomCode] = useState('');
  const [password, setPassword] = useState('');
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [cameraFacing, setCameraFacing] = useState<'front' | 'back'>('front');
  
  const translateY = useSharedValue(screenHeight);

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
  }, [isOpen]);

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
  };

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
  };

  const switchCamera = () => {
    setCameraFacing(prev => prev === 'front' ? 'back' : 'front');
  };

  const handleJoinRoom = () => {
    if (!roomCode.trim()) {
      Alert.alert('Room Code Required', 'Please enter a room code to join');
      return;
    }

    onJoinRoom(roomCode.trim(), password.trim() || undefined, `Room ${roomCode.trim()}`);
    
    // Reset form
    setRoomCode('');
    setPassword('');
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

            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.headerButton}>
                <X size={24} color={isDark ? '#E5E7EB' : '#4B5563'} />
              </TouchableOpacity>
              
              <View style={styles.headerCenter}>
                <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Join Room
                </Text>
              </View>
              
              <View style={styles.headerButton} />
            </View>

            {/* Camera Preview */}
            <View style={styles.cameraContainer}>
              <View 
                style={[
                  styles.cameraPreview, 
                  { backgroundColor: isCameraOn ? '#000000' : (isDark ? '#1E293B' : '#F3F4F6') }
                ]}
              >
                {isCameraOn ? (
                  <View style={styles.cameraContent}>
                    <Camera size={64} color="#FFFFFF" />
                    <Text style={styles.cameraText}>Camera Preview</Text>
                    <Text style={styles.cameraSubtext}>
                      {cameraFacing === 'front' ? 'Front Camera' : 'Back Camera'}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.cameraContent}>
                    <VideoOff size={64} color={isDark ? '#9CA3AF' : '#6B7280'} />
                    <Text style={[styles.cameraText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                      Camera Off
                    </Text>
                  </View>
                )}
              </View>

              {/* Camera Controls */}
              <View style={styles.cameraControls}>
                <TouchableOpacity 
                  style={[
                    styles.controlButton,
                    { backgroundColor: isDark ? '#374151' : '#F3F4F6' }
                  ]}
                  onPress={switchCamera}
                >
                  <RotateCcw size={24} color={isDark ? '#E5E7EB' : '#4B5563'} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.controlButton,
                    styles.primaryControl,
                    { backgroundColor: isCameraOn ? '#3B82F6' : '#EF4444' }
                  ]}
                  onPress={toggleCamera}
                >
                  {isCameraOn ? (
                    <Video size={28} color="#FFFFFF" />
                  ) : (
                    <VideoOff size={28} color="#FFFFFF" />
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.controlButton,
                    { backgroundColor: isMicOn ? '#3B82F6' : '#EF4444' }
                  ]}
                  onPress={toggleMic}
                >
                  {isMicOn ? (
                    <Mic size={24} color="#FFFFFF" />
                  ) : (
                    <MicOff size={24} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Room Code Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                  Room Code
                </Text>
                <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}>
                  <Key size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                  <TextInput
                    style={[styles.input, { color: isDark ? '#E5E7EB' : '#1F2937' }]}
                    placeholder="Enter room code"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={roomCode}
                    onChangeText={setRoomCode}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                  Password (Optional)
                </Text>
                <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}>
                  <Lock size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                  <TextInput
                    style={[styles.input, { color: isDark ? '#E5E7EB' : '#1F2937' }]}
                    placeholder="Enter password if required"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>
              </View>
            </View>

            {/* Status Info */}
            <View style={styles.statusContainer}>
              <View style={styles.statusRow}>
                <View style={styles.statusItem}>
                  <View style={[
                    styles.statusIndicator,
                    { backgroundColor: isCameraOn ? '#10B981' : '#EF4444' }
                  ]} />
                  <Text style={[styles.statusText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Camera {isCameraOn ? 'On' : 'Off'}
                  </Text>
                </View>
                
                <View style={styles.statusItem}>
                  <View style={[
                    styles.statusIndicator,
                    { backgroundColor: isMicOn ? '#10B981' : '#EF4444' }
                  ]} />
                  <Text style={[styles.statusText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Microphone {isMicOn ? 'On' : 'Off'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Join Button */}
            <View style={styles.joinContainer}>
              <TouchableOpacity 
                style={[
                  styles.joinButton, 
                  { 
                    backgroundColor: roomCode.trim() ? '#10B981' : (isDark ? '#374151' : '#E5E7EB'),
                    opacity: roomCode.trim() ? 1 : 0.5
                  }
                ]}
                onPress={handleJoinRoom}
                disabled={!roomCode.trim()}
              >
                <Video size={24} color="#FFFFFF" />
                <Text style={styles.joinButtonText}>Join Room</Text>
              </TouchableOpacity>
              
              <Text style={[styles.joinHint, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                You can adjust your camera and microphone settings anytime during the call
              </Text>
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
    height: '85%',
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
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  cameraContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cameraPreview: {
    flex: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  cameraContent: {
    alignItems: 'center',
    gap: 12,
  },
  cameraText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  cameraSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginBottom: 20,
  },
  controlButton: {
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
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  primaryControl: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  inputContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    outlineStyle: 'none',
  },
  statusContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  joinContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  joinHint: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 16,
  },
});
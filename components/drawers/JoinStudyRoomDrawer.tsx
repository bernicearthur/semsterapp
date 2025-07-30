import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import {
  X,
  Settings,
  Camera,
  RotateCcw,
  Video,
  Mic,
  Lock,
} from 'lucide-react-native';

interface JoinStudyRoomDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export default function JoinStudyRoomDrawer({
  visible,
  onClose,
}: JoinStudyRoomDrawerProps) {
  const [passcode, setPasscode] = useState('');
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <GestureDetector>
        <Animated.View style={styles.drawer}>
          <SafeAreaView style={styles.container}>
            {/* Drag Handle */}
            <View style={styles.dragHandle} />

            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="#ffffff" />
              </TouchableOpacity>
              <View style={styles.headerContent}>
                <Text style={styles.title}>Ready to join?</Text>
                <Text style={styles.subtitle}>Enter room passcode</Text>
              </View>
              <TouchableOpacity style={styles.settingsButton}>
                <Settings size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Camera Preview */}
              <View style={styles.cameraPreview}>
                <Camera size={48} color="#ffffff" />
                <Text style={styles.cameraText}>Camera Preview</Text>
                <Text style={styles.cameraSubtext}>Front Camera</Text>
              </View>

              {/* Camera Controls */}
              <View style={styles.cameraControls}>
                <TouchableOpacity style={styles.controlButton}>
                  <RotateCcw size={24} color="#ffffff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.controlButton, styles.primaryButton]}
                  onPress={() => setCameraOn(!cameraOn)}
                >
                  <Video size={24} color="#ffffff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.controlButton, styles.primaryButton]}
                  onPress={() => setMicOn(!micOn)}
                >
                  <Mic size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>

              {/* Passcode Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Room Passcode"
                    placeholderTextColor="#9CA3AF"
                    value={passcode}
                    onChangeText={setPasscode}
                    secureTextEntry
                  />
                </View>
              </View>

              {/* Status Indicators */}
              <View style={styles.statusContainer}>
                <View style={styles.statusItem}>
                  <View style={[styles.statusDot, { backgroundColor: cameraOn ? '#10B981' : '#EF4444' }]} />
                  <Text style={styles.statusText}>Camera {cameraOn ? 'On' : 'Off'}</Text>
                </View>
                <View style={styles.statusItem}>
                  <View style={[styles.statusDot, { backgroundColor: micOn ? '#10B981' : '#EF4444' }]} />
                  <Text style={styles.statusText}>Microphone {micOn ? 'On' : 'Off'}</Text>
                </View>
              </View>
            </ScrollView>

            {/* Join Button */}
            <View style={styles.joinButtonContainer}>
              <TouchableOpacity style={styles.joinButton}>
                <Video size={20} color="#ffffff" />
                <Text style={styles.joinButtonText}>Join Room</Text>
              </TouchableOpacity>
              <Text style={styles.hintText}>
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
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '85%',
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  container: {
    flex: 1,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#4B5563',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cameraPreview: {
    height: 160,
    backgroundColor: '#000000',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  cameraText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 12,
  },
  cameraSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginBottom: 24,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#ffffff',
  },
  joinButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 20,
  },
  joinButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  joinButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  hintText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
  },
});
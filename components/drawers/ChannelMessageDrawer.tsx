import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Image, ScrollView, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Send, Image as ImageIcon, Paperclip, Mic, MoreVertical, Users, Settings, Info, Bell } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  runOnJS
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface ChannelMessageDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  channel?: {
    name: string;
    avatar: string;
  };
}

interface Message {
  id: string;
  text: string;
  time: string;
  sender: {
    name: string;
    avatar: string;
    role: string;
  };
  isPinned?: boolean;
}

const messages: Message[] = [
  {
    id: '1',
    text: "Library hours will be extended during finals week. The library will remain open until 2 AM from December 10th to December 20th.",
    time: '2:30 PM',
    sender: {
      name: 'Library Services',
      avatar: 'https://images.pexels.com/photos/590493/pexels-photo-590493.jpeg?auto=compress&cs=tinysrgb&w=100',
      role: 'Admin',
    },
    isPinned: true,
  },
  {
    id: '2',
    text: "Reminder: Student Council meeting tomorrow at 3 PM in Room 301. All representatives must attend.",
    time: '3:15 PM',
    sender: {
      name: 'Student Council',
      avatar: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=100',
      role: 'Moderator',
    },
  },
  {
    id: '3',
    text: "Career fair registration is now open! Over 50 companies will be attending. Don't miss this opportunity!",
    time: '4:00 PM',
    sender: {
      name: 'Career Services',
      avatar: 'https://images.pexels.com/photos/1181622/pexels-photo-1181622.jpeg?auto=compress&cs=tinysrgb&w=100',
      role: 'Admin',
    },
    isPinned: true,
  },
  {
    id: '4',
    text: "The campus shuttle schedule has been updated for the winter break. Check the website for new timings.",
    time: '4:45 PM',
    sender: {
      name: 'Transportation Services',
      avatar: 'https://images.pexels.com/photos/2402235/pexels-photo-2402235.jpeg?auto=compress&cs=tinysrgb&w=100',
      role: 'Admin',
    },
  },
];

export function ChannelMessageDrawer({ isOpen, onClose, channel }: ChannelMessageDrawerProps) {
  const { isDark } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const [newMessage, setNewMessage] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(true);
  
  const translateX = useSharedValue(screenWidth);

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
  }, [isOpen]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Handle sending message
      setNewMessage('');
    }
  };

  if (!isOpen || !channel) return null;

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
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}
            >
              <View style={[styles.header, { borderBottomColor: isDark ? '#334155' : '#E5E7EB' }]}>
                <TouchableOpacity onPress={onClose} style={styles.headerButton}>
                  <X size={24} color={isDark ? '#E5E7EB' : '#4B5563'} />
                </TouchableOpacity>
                
                <View style={styles.headerProfile}>
                  <Image source={{ uri: channel.avatar }} style={styles.headerAvatar} />
                  <View style={styles.headerInfo}>
                    <Text style={[styles.headerName, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                      {channel.name}
                    </Text>
                    <View style={styles.subscriberCount}>
                      <Users size={14} color={isDark ? '#60A5FA' : '#3B82F6'} />
                      <Text style={[styles.subscriberCountText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                        2.5K subscribers
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.headerActions}>
                  <TouchableOpacity 
                    style={styles.headerButton}
                    onPress={() => setIsSubscribed(!isSubscribed)}
                  >
                    <Bell 
                      size={24} 
                      color={isSubscribed ? '#3B82F6' : (isDark ? '#E5E7EB' : '#4B5563')}
                      fill={isSubscribed ? '#3B82F6' : 'none'}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.headerButton}>
                    <Info size={24} color={isDark ? '#E5E7EB' : '#4B5563'} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.headerButton}>
                    <MoreVertical size={24} color={isDark ? '#E5E7EB' : '#4B5563'} />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView 
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
              >
                {messages.map((message) => (
                  <View 
                    key={message.id} 
                    style={[
                      styles.messageWrapper,
                      message.isPinned && { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }
                    ]}
                  >
                    <Image source={{ uri: message.sender.avatar }} style={styles.senderAvatar} />
                    <View style={styles.messageContent}>
                      <View style={styles.messageHeader}>
                        <View style={styles.senderInfo}>
                          <Text style={[styles.senderName, { color: isDark ? '#60A5FA' : '#3B82F6' }]}>
                            {message.sender.name}
                          </Text>
                          <View 
                            style={[
                              styles.roleBadge,
                              { backgroundColor: isDark ? '#374151' : '#F3F4F6' }
                            ]}
                          >
                            <Text style={[styles.roleText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                              {message.sender.role}
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.messageTime, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                          {message.time}
                        </Text>
                      </View>
                      <Text style={[styles.messageText, { color: isDark ? '#E5E7EB' : '#1F2937' }]}>
                        {message.text}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>

              <View style={[styles.inputContainer, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}>
                <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#0F172A' : '#FFFFFF' }]}>
                  <TextInput
                    style={[styles.input, { color: isDark ? '#E5E7EB' : '#1F2937' }]}
                    placeholder="Type a message..."
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    multiline
                  />
                  <View style={styles.inputActions}>
                    <TouchableOpacity style={styles.inputButton}>
                      <ImageIcon size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.inputButton}>
                      <Paperclip size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.inputButton}>
                      <Mic size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity 
                  style={[
                    styles.sendButton,
                    { opacity: newMessage.trim() ? 1 : 0.5 }
                  ]}
                  onPress={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  <Send size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
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
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerButton: {
    padding: 4,
  },
  headerProfile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerInfo: {
    marginLeft: 12,
  },
  headerName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 2,
  },
  subscriberCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subscriberCountText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
  },
  senderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  senderName: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  roleText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  messageTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  messageText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  inputContainer: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 24,
    padding: 12,
  },
  input: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    maxHeight: 100,
  },
  inputActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  inputButton: {
    padding: 4,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Image, ScrollView, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Send, Image as ImageIcon, Paperclip, Mic, MoreVertical, Users, Settings, Info } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  runOnJS
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface GroupMessageDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  group?: {
    name: string;
    avatar: string;
    members: number;
  };
}

interface Message {
  id: string;
  text: string;
  time: string;
  sender: {
    name: string;
    avatar: string;
  };
}

const messages: Message[] = [
  {
    id: '1',
    text: "I'll share my notes from today's class",
    time: '2:30 PM',
    sender: {
      name: 'Michael',
      avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
  },
  {
    id: '2',
    text: "Thanks Michael! Could you also share the slides from the presentation?",
    time: '2:31 PM',
    sender: {
      name: 'Sarah',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
  },
  {
    id: '3',
    text: "I have them. I'll upload them to our shared folder.",
    time: '2:32 PM',
    sender: {
      name: 'Emma',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
  },
  {
    id: '4',
    text: "Perfect! When should we meet to discuss the group project?",
    time: '2:33 PM',
    sender: {
      name: 'Michael',
      avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
  },
  {
    id: '5',
    text: "How about tomorrow at 3 PM in the library?",
    time: '2:34 PM',
    sender: {
      name: 'Sarah',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
  },
  {
    id: '6',
    text: "Works for me!",
    time: '2:35 PM',
    sender: {
      name: 'Emma',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
  },
];

export function GroupMessageDrawer({ isOpen, onClose, group }: GroupMessageDrawerProps) {
  const { isDark } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const [newMessage, setNewMessage] = useState('');
  
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

  if (!isOpen || !group) return null;

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
                  <Image source={{ uri: group.avatar }} style={styles.headerAvatar} />
                  <View style={styles.headerInfo}>
                    <Text style={[styles.headerName, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                      {group.name}
                    </Text>
                    <View style={styles.memberCount}>
                      <Users size={14} color={isDark ? '#60A5FA' : '#3B82F6'} />
                      <Text style={[styles.memberCountText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                        {group.members} members
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.headerActions}>
                  <TouchableOpacity style={styles.headerButton}>
                    <Info size={24} color={isDark ? '#E5E7EB' : '#4B5563'} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.headerButton}>
                    <Settings size={24} color={isDark ? '#E5E7EB' : '#4B5563'} />
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
                  <View key={message.id} style={styles.messageWrapper}>
                    <Image source={{ uri: message.sender.avatar }} style={styles.senderAvatar} />
                    <View style={styles.messageContent}>
                      <View style={styles.messageHeader}>
                        <Text style={[styles.senderName, { color: isDark ? '#60A5FA' : '#3B82F6' }]}>
                          {message.sender.name}
                        </Text>
                        <Text style={[styles.messageTime, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                          {message.time}
                        </Text>
                      </View>
                      <View 
                        style={[
                          styles.messageBubble,
                          { backgroundColor: isDark ? '#1E293B' : '#F3F4F6' }
                        ]}
                      >
                        <Text style={[styles.messageText, { color: isDark ? '#E5E7EB' : '#1F2937' }]}>
                          {message.text}
                        </Text>
                      </View>
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
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberCountText: {
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
  },
  senderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderName: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginRight: 8,
  },
  messageTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  messageBubble: {
    alignSelf: 'flex-start',
    maxWidth: '85%',
    borderRadius: 16,
    borderTopLeftRadius: 4,
    padding: 12,
  },
  messageText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 22,
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
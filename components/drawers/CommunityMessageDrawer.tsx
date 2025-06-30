import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Image, ScrollView, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Send, Image as ImageIcon, Paperclip, Mic, MoveVertical as MoreVertical, Users, Settings, Info, Bell, Hash, Calendar, MessageCircle, Heart } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  runOnJS
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface CommunityMessageDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  community?: {
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
  likes: number;
  comments: number;
  isLiked?: boolean;
  tags?: string[];
  image?: string;
}

const messages: Message[] = [
  {
    id: '1',
    text: "Excited to announce our new workshop series on AI and Machine Learning! Starting next week, we'll be hosting weekly sessions covering everything from basics to advanced topics. Don't miss out! #AI #Workshop",
    time: '2:30 PM',
    sender: {
      name: 'Dr. Sarah Chen',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100',
      role: 'Moderator',
    },
    likes: 45,
    comments: 12,
    isLiked: true,
    tags: ['AI', 'Workshop'],
    image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: '2',
    text: "Great turnout at today's coding competition! Congratulations to all participants and winners. Looking forward to more events like this! #CodingCompetition #Programming",
    time: '3:15 PM',
    sender: {
      name: 'Michael Brown',
      avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100',
      role: 'Member',
    },
    likes: 32,
    comments: 8,
    tags: ['CodingCompetition', 'Programming'],
    image: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: '3',
    text: "Reminder: Project submissions for the hackathon are due this Friday! Make sure to submit your work through the portal. #Hackathon #Projects",
    time: '4:00 PM',
    sender: {
      name: 'Emma Wilson',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
      role: 'Admin',
    },
    likes: 28,
    comments: 15,
    tags: ['Hackathon', 'Projects'],
  },
];

export function CommunityMessageDrawer({ isOpen, onClose, community }: CommunityMessageDrawerProps) {
  const { isDark } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const [newMessage, setNewMessage] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(true);
  const [likedMessages, setLikedMessages] = useState<Record<string, boolean>>({});
  
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

  const handleLike = (messageId: string) => {
    setLikedMessages(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  if (!isOpen || !community) return null;

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
                  <Image source={{ uri: community.avatar }} style={styles.headerAvatar} />
                  <View style={styles.headerInfo}>
                    <Text style={[styles.headerName, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                      {community.name}
                    </Text>
                    <View style={styles.communityStats}>
                      <View style={styles.statItem}>
                        <Users size={14} color={isDark ? '#60A5FA' : '#3B82F6'} />
                        <Text style={[styles.statText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                          2.5K members
                        </Text>
                      </View>
                      <View style={styles.statItem}>
                        <Calendar size={14} color={isDark ? '#60A5FA' : '#3B82F6'} />
                        <Text style={[styles.statText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                          Since 2023
                        </Text>
                      </View>
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
                      { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }
                    ]}
                  >
                    <View style={styles.messageHeader}>
                      <View style={styles.senderInfo}>
                        <Image source={{ uri: message.sender.avatar }} style={styles.senderAvatar} />
                        <View>
                          <Text style={[styles.senderName, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                            {message.sender.name}
                          </Text>
                          <View style={styles.messageMetadata}>
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
                            <Text style={[styles.messageTime, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                              {message.time}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <TouchableOpacity>
                        <MoreVertical size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                      </TouchableOpacity>
                    </View>

                    <Text style={[styles.messageText, { color: isDark ? '#E5E7EB' : '#1F2937' }]}>
                      {message.text}
                    </Text>

                    {message.image && (
                      <Image 
                        source={{ uri: message.image }} 
                        style={styles.messageImage}
                      />
                    )}

                    {message.tags && message.tags.length > 0 && (
                      <View style={styles.tagsContainer}>
                        {message.tags.map((tag, index) => (
                          <View 
                            key={index}
                            style={[
                              styles.tagChip,
                              { backgroundColor: isDark ? '#374151' : '#F3F4F6' }
                            ]}
                          >
                            <Hash size={14} color={isDark ? '#60A5FA' : '#3B82F6'} />
                            <Text style={[styles.tagText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                              {tag}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}

                    <View style={styles.messageActions}>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleLike(message.id)}
                      >
                        <Heart 
                          size={20} 
                          color={(message.isLiked || likedMessages[message.id]) ? '#EF4444' : (isDark ? '#9CA3AF' : '#6B7280')}
                          fill={(message.isLiked || likedMessages[message.id]) ? '#EF4444' : 'none'}
                        />
                        <Text 
                          style={[
                            styles.actionCount,
                            { 
                              color: (message.isLiked || likedMessages[message.id]) ? 
                                '#EF4444' : 
                                (isDark ? '#9CA3AF' : '#6B7280')
                            }
                          ]}
                        >
                          {message.likes + ((message.isLiked || likedMessages[message.id]) ? 1 : 0)}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.actionButton}>
                        <MessageCircle size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                        <Text style={[styles.actionCount, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                          {message.comments}
                        </Text>
                      </TouchableOpacity>
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
                      <Hash size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />
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
    marginBottom: 4,
  },
  communityStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
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
    gap: 16,
  },
  messageWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    padding: 16,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  senderInfo: {
    flexDirection: 'row',
    gap: 12,
  },
  senderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  senderName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    marginBottom: 4,
  },
  messageMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    marginBottom: 12,
  },
  messageImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  tagText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  messageActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionCount: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
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
import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Image, ScrollView, Dimensions, KeyboardAvoidingView, Platform, Alert, Animated as RNAnimated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Send, Image as ImageIcon, Paperclip, Mic, MoreVertical, Phone, Video, Camera, Smile, Plus, Heart, Info, VolumeX, AlertTriangle, MapPin, Gift, Sticker, UserCheck, UserX, Shield, Flag, Archive, Trash2, Settings } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  runOnJS,
  withTiming,
  interpolate,
  withSequence,
  withRepeat
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface DirectMessageDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    name: string;
    avatar: string;
    online?: boolean;
    lastSeen?: string;
    username?: string;
    verified?: boolean;
    mutualConnections?: number;
    bio?: string;
    isBlocked?: boolean;
    isMuted?: boolean;
    isArchived?: boolean;
  };
}

interface Message {
  id: string;
  text?: string;
  time: string;
  sent: boolean;
  type: 'text' | 'image' | 'voice' | 'emoji' | 'location' | 'sticker';
  image?: string;
  voiceDuration?: number;
  emoji?: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  location?: { name: string; address: string };
  sticker?: string;
  reactions?: { emoji: string; count: number; reacted: boolean }[];
}

const messages: Message[] = [
  {
    id: '1',
    text: "Hey, did you get the notes from yesterday's lecture?",
    time: '2:30 PM',
    sent: false,
    type: 'text',
    status: 'read',
    reactions: [{ emoji: '👍', count: 1, reacted: false }],
  },
  {
    id: '2',
    text: "Yes, I did! Let me share them with you.",
    time: '2:31 PM',
    sent: true,
    type: 'text',
    status: 'read',
  },
  {
    id: '3',
    emoji: '👍',
    time: '2:32 PM',
    sent: false,
    type: 'emoji',
    status: 'read',
  },
  {
    id: '4',
    text: "No problem! Let me know if you need any clarification on the topics covered. I'm always here to help with any questions you might have about the course material.",
    time: '2:33 PM',
    sent: true,
    type: 'text',
    status: 'read',
    reactions: [{ emoji: '❤️', count: 1, reacted: true }],
  },
  {
    id: '5',
    image: 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=800',
    time: '2:34 PM',
    sent: false,
    type: 'image',
    status: 'read',
    text: "Here's the diagram from the lecture",
  },
  {
    id: '6',
    text: "Actually, I had a question about the second part of the lecture. Could you help me understand it better?",
    time: '2:34 PM',
    sent: false,
    type: 'text',
    status: 'read',
  },
  {
    id: '7',
    voiceDuration: 15,
    time: '2:35 PM',
    sent: true,
    type: 'voice',
    status: 'delivered',
  },
  {
    id: '8',
    location: { name: 'University Library', address: 'Main Campus, Study Hall' },
    time: '2:36 PM',
    sent: true,
    type: 'location',
    status: 'sent',
  },
  {
    id: '9',
    text: "Of course! The key concept there was about distributed systems. Let me explain it in detail...",
    time: '2:37 PM',
    sent: true,
    type: 'text',
    status: 'sent',
  },
];

const quickEmojis = ['❤️', '😂', '😮', '😢', '😡', '👍', '👎', '🔥', '🎉', '💯'];
const reactionEmojis = ['❤️', '😂', '😮', '😢', '😡', '👍'];

export function DirectMessageDrawer({ isOpen, onClose, user }: DirectMessageDrawerProps) {
  const { isDark } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messageList, setMessageList] = useState(messages);
  const [inputHeight, setInputHeight] = useState(40);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [showUserActions, setShowUserActions] = useState(false);
  const [userStatus, setUserStatus] = useState({
    isBlocked: user?.isBlocked || false,
    isMuted: user?.isMuted || false,
    isArchived: user?.isArchived || false,
  });
  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);
  const recordingTimer = useRef<NodeJS.Timeout>();
  
  const translateX = useSharedValue(screenWidth);
  const recordingScale = useSharedValue(1);
  const recordingOpacity = useSharedValue(1);
  const emojiPickerHeight = useSharedValue(0);
  const moreOptionsHeight = useSharedValue(0);
  const userActionsOpacity = useSharedValue(0);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const recordingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: recordingScale.value }],
    opacity: recordingOpacity.value,
  }));

  const emojiPickerStyle = useAnimatedStyle(() => ({
    height: emojiPickerHeight.value,
    opacity: interpolate(emojiPickerHeight.value, [0, 250], [0, 1]),
  }));

  const moreOptionsStyle = useAnimatedStyle(() => ({
    height: moreOptionsHeight.value,
    opacity: interpolate(moreOptionsHeight.value, [0, 200], [0, 1]),
  }));

  const userActionsStyle = useAnimatedStyle(() => ({
    opacity: userActionsOpacity.value,
    transform: [{ 
      translateY: interpolate(userActionsOpacity.value, [0, 1], [20, 0])
    }],
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

  useEffect(() => {
    if (newMessage.length > 0) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
    }
  }, [newMessage]);

  useEffect(() => {
    if (isRecording) {
      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      recordingOpacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
      setRecordingDuration(0);
      recordingOpacity.value = withTiming(1);
    }

    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    };
  }, [isRecording]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sent: true,
        type: 'text',
        status: 'sending',
      };
      
      setMessageList(prev => [...prev, message]);
      setNewMessage('');
      setInputHeight(40);
      
      // Simulate message status updates
      setTimeout(() => {
        setMessageList(prev => prev.map(msg => 
          msg.id === message.id ? { ...msg, status: 'sent' } : msg
        ));
      }, 1000);
      
      setTimeout(() => {
        setMessageList(prev => prev.map(msg => 
          msg.id === message.id ? { ...msg, status: 'delivered' } : msg
        ));
      }, 2000);
      
      scrollToBottom();
    }
  };

  const handleSendEmoji = (emoji: string) => {
    const message: Message = {
      id: Date.now().toString(),
      emoji,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sent: true,
      type: 'emoji',
      status: 'sending',
    };
    
    setMessageList(prev => [...prev, message]);
    setShowEmojiPicker(false);
    emojiPickerHeight.value = withTiming(0);
    scrollToBottom();
  };

  const handleVoiceRecord = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      recordingScale.value = withSpring(1);
      
      if (recordingDuration > 0) {
        const message: Message = {
          id: Date.now().toString(),
          voiceDuration: recordingDuration,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sent: true,
          type: 'voice',
          status: 'sending',
        };
        
        setMessageList(prev => [...prev, message]);
        scrollToBottom();
      }
    } else {
      // Start recording
      setIsRecording(true);
      recordingScale.value = withSpring(1.2);
    }
  };

  const handleSendLocation = () => {
    const message: Message = {
      id: Date.now().toString(),
      location: { name: 'Current Location', address: 'University Campus' },
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sent: true,
      type: 'location',
      status: 'sending',
    };
    
    setMessageList(prev => [...prev, message]);
    setShowMoreOptions(false);
    moreOptionsHeight.value = withTiming(0);
    scrollToBottom();
  };

  const handleSendSticker = () => {
    const message: Message = {
      id: Date.now().toString(),
      sticker: '🎉',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sent: true,
      type: 'sticker',
      status: 'sending',
    };
    
    setMessageList(prev => [...prev, message]);
    setShowMoreOptions(false);
    moreOptionsHeight.value = withTiming(0);
    scrollToBottom();
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
    setShowMoreOptions(false);
    emojiPickerHeight.value = withTiming(showEmojiPicker ? 0 : 250);
    moreOptionsHeight.value = withTiming(0);
  };

  const toggleMoreOptions = () => {
    setShowMoreOptions(!showMoreOptions);
    setShowEmojiPicker(false);
    moreOptionsHeight.value = withTiming(showMoreOptions ? 0 : 200);
    emojiPickerHeight.value = withTiming(0);
  };

  const toggleUserActions = () => {
    setShowUserActions(!showUserActions);
    userActionsOpacity.value = withTiming(showUserActions ? 0 : 1);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    setMessageList(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || [];
        const existingReaction = reactions.find(r => r.emoji === emoji);
        
        if (existingReaction) {
          if (existingReaction.reacted) {
            // Remove reaction
            return {
              ...msg,
              reactions: reactions.map(r => 
                r.emoji === emoji 
                  ? { ...r, count: r.count - 1, reacted: false }
                  : r
              ).filter(r => r.count > 0)
            };
          } else {
            // Add reaction
            return {
              ...msg,
              reactions: reactions.map(r => 
                r.emoji === emoji 
                  ? { ...r, count: r.count + 1, reacted: true }
                  : r
              )
            };
          }
        } else {
          // New reaction
          return {
            ...msg,
            reactions: [...reactions, { emoji, count: 1, reacted: true }]
          };
        }
      }
      return msg;
    }));
    
    setShowReactions(null);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleCall = () => {
    Alert.alert('Voice Call', `Calling ${user?.name}...`);
  };

  const handleVideoCall = () => {
    Alert.alert('Video Call', `Video calling ${user?.name}...`);
  };

  const handleUserAction = (action: string) => {
    switch (action) {
      case 'block':
        setUserStatus(prev => ({ ...prev, isBlocked: !prev.isBlocked }));
        Alert.alert(
          userStatus.isBlocked ? 'Unblock User' : 'Block User',
          userStatus.isBlocked 
            ? `${user?.name} has been unblocked`
            : `${user?.name} has been blocked`
        );
        break;
      case 'mute':
        setUserStatus(prev => ({ ...prev, isMuted: !prev.isMuted }));
        Alert.alert(
          userStatus.isMuted ? 'Unmute Conversation' : 'Mute Conversation',
          userStatus.isMuted 
            ? 'You will now receive notifications'
            : 'You will not receive notifications'
        );
        break;
      case 'archive':
        setUserStatus(prev => ({ ...prev, isArchived: !prev.isArchived }));
        Alert.alert(
          userStatus.isArchived ? 'Unarchive Conversation' : 'Archive Conversation',
          userStatus.isArchived 
            ? 'Conversation moved to inbox'
            : 'Conversation archived'
        );
        break;
      case 'report':
        Alert.alert('Report User', 'Report this user for inappropriate behavior?');
        break;
      case 'delete':
        Alert.alert(
          'Delete Conversation',
          'Are you sure you want to delete this conversation? This action cannot be undone.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => console.log('Delete conversation') }
          ]
        );
        break;
    }
    setShowUserActions(false);
    userActionsOpacity.value = withTiming(0);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderMessageStatus = (status: Message['status']) => {
    switch (status) {
      case 'sending':
        return <View style={styles.statusDot} />;
      case 'sent':
        return <Text style={styles.statusText}>✓</Text>;
      case 'delivered':
        return <Text style={styles.statusText}>✓✓</Text>;
      case 'read':
        return <Text style={[styles.statusText, { color: '#3B82F6' }]}>✓✓</Text>;
      default:
        return null;
    }
  };

  const renderMessage = (message: Message, index: number) => {
    const isOwn = message.sent;
    const showProfile = !isOwn && (index === 0 || messageList[index - 1]?.sent !== message.sent);
    
    return (
      <View 
        key={message.id}
        style={[
          styles.messageWrapper,
          isOwn ? styles.sentWrapper : styles.receivedWrapper
        ]}
      >
        {/* Profile Picture for Received Messages */}
        {!isOwn && (
          <View style={styles.profileContainer}>
            {showProfile ? (
              <Image source={{ uri: user?.avatar }} style={styles.messageAvatar} />
            ) : (
              <View style={styles.avatarSpacer} />
            )}
          </View>
        )}
        
        <View style={styles.messageContentContainer}>
          {/* Username for Received Messages */}
          {!isOwn && showProfile && (
            <View style={styles.messageHeader}>
              <Text style={[styles.messageSender, { color: isDark ? '#60A5FA' : '#3B82F6' }]}>
                {user?.name}
              </Text>
              {user?.verified && (
                <Text style={styles.verifiedBadge}>✓</Text>
              )}
            </View>
          )}
          
          <TouchableOpacity
            style={[
              styles.messageBubble,
              isOwn ? 
                [styles.sentBubble, { backgroundColor: '#3B82F6' }] : 
                [styles.receivedBubble, { backgroundColor: isDark ? '#1E293B' : '#F3F4F6' }]
            ]}
            onLongPress={() => setShowReactions(message.id)}
          >
            {message.type === 'text' && (
              <Text 
                style={[
                  styles.messageText,
                  { color: isOwn ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#1F2937') }
                ]}
              >
                {message.text}
              </Text>
            )}
            
            {message.type === 'emoji' && (
              <Text style={styles.emojiMessage}>
                {message.emoji}
              </Text>
            )}
            
            {message.type === 'image' && (
              <View>
                <Image 
                  source={{ uri: message.image }} 
                  style={styles.messageImage}
                />
                {message.text && (
                  <Text 
                    style={[
                      styles.imageCaption,
                      { color: isOwn ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#1F2937') }
                    ]}
                  >
                    {message.text}
                  </Text>
                )}
              </View>
            )}
            
            {message.type === 'voice' && (
              <View style={styles.voiceMessage}>
                <TouchableOpacity style={styles.playButton}>
                  <Text style={[styles.playIcon, { color: isOwn ? '#FFFFFF' : '#3B82F6' }]}>▶</Text>
                </TouchableOpacity>
                <View style={styles.voiceWaveform}>
                  {Array.from({ length: 20 }).map((_, i) => (
                    <View 
                      key={i}
                      style={[
                        styles.waveformBar,
                        { 
                          height: Math.random() * 20 + 5,
                          backgroundColor: isOwn ? '#FFFFFF' : '#3B82F6'
                        }
                      ]}
                    />
                  ))}
                </View>
                <Text 
                  style={[
                    styles.voiceDuration,
                    { color: isOwn ? '#E5E7EB' : (isDark ? '#9CA3AF' : '#6B7280') }
                  ]}
                >
                  {formatDuration(message.voiceDuration || 0)}
                </Text>
              </View>
            )}
            
            {message.type === 'location' && (
              <View style={styles.locationMessage}>
                <MapPin size={20} color={isOwn ? '#FFFFFF' : '#3B82F6'} />
                <View style={styles.locationInfo}>
                  <Text 
                    style={[
                      styles.locationName,
                      { color: isOwn ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#1F2937') }
                    ]}
                  >
                    {message.location?.name}
                  </Text>
                  <Text 
                    style={[
                      styles.locationAddress,
                      { color: isOwn ? '#E5E7EB' : (isDark ? '#9CA3AF' : '#6B7280') }
                    ]}
                  >
                    {message.location?.address}
                  </Text>
                </View>
              </View>
            )}
            
            {message.type === 'sticker' && (
              <Text style={styles.stickerMessage}>
                {message.sticker}
              </Text>
            )}
            
            <View style={styles.messageFooter}>
              <Text 
                style={[
                  styles.messageTime,
                  { color: isOwn ? '#E5E7EB' : (isDark ? '#9CA3AF' : '#6B7280') }
                ]}
              >
                {message.time}
              </Text>
              {isOwn && renderMessageStatus(message.status)}
            </View>
          </TouchableOpacity>
          
          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <View style={[styles.reactionsContainer, isOwn && styles.reactionsContainerOwn]}>
              {message.reactions.map((reaction, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.reactionBubble,
                    { backgroundColor: isDark ? '#374151' : '#E5E7EB' },
                    reaction.reacted && { backgroundColor: '#3B82F6' }
                  ]}
                  onPress={() => handleReaction(message.id, reaction.emoji)}
                >
                  <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                  <Text style={[
                    styles.reactionCount,
                    { color: reaction.reacted ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#1F2937') }
                  ]}>
                    {reaction.count}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {/* Quick Reactions */}
          {showReactions === message.id && (
            <View style={[styles.quickReactions, isOwn && styles.quickReactionsOwn]}>
              {reactionEmojis.map((emoji, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.quickReactionButton}
                  onPress={() => handleReaction(message.id, emoji)}
                >
                  <Text style={styles.quickReactionEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  if (!isOpen || !user) return null;

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
              {/* Enhanced Header */}
              <View style={[styles.header, { borderBottomColor: isDark ? '#334155' : '#E5E7EB' }]}>
                <TouchableOpacity onPress={onClose} style={styles.headerButton}>
                  <X size={24} color={isDark ? '#E5E7EB' : '#4B5563'} />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.headerProfile} onPress={() => Alert.alert('Profile', 'View user profile')}>
                  <View style={styles.headerAvatarContainer}>
                    <Image source={{ uri: user.avatar }} style={styles.headerAvatar} />
                    {user.online && <View style={styles.onlineIndicator} />}
                    {user.verified && (
                      <View style={styles.verifiedBadgeHeader}>
                        <Text style={styles.verifiedTextHeader}>✓</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.headerInfo}>
                    <View style={styles.headerNameRow}>
                      <Text style={[styles.headerName, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                        {user.name}
                      </Text>
                      {userStatus.isMuted && (
                        <VolumeX size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
                      )}
                      {userStatus.isBlocked && (
                        <Shield size={16} color="#EF4444" />
                      )}
                    </View>
                    {user.username && (
                      <Text style={[styles.headerUsername, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                        @{user.username}
                      </Text>
                    )}
                    {user.online ? (
                      <Text style={styles.onlineStatus}>Online</Text>
                    ) : (
                      <Text style={[styles.lastSeen, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                        {user.lastSeen || 'Last seen recently'}
                      </Text>
                    )}
                    {user.mutualConnections && (
                      <Text style={[styles.mutualConnections, { color: isDark ? '#60A5FA' : '#3B82F6' }]}>
                        {user.mutualConnections} mutual connections
                      </Text>
                    )}
                    {isTyping && (
                      <Text style={styles.typingIndicator}>typing...</Text>
                    )}
                  </View>
                </TouchableOpacity>
                
                <View style={styles.headerActions}>
                  <TouchableOpacity style={styles.headerActionButton} onPress={handleCall}>
                    <Phone size={22} color={isDark ? '#E5E7EB' : '#4B5563'} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.headerActionButton} onPress={handleVideoCall}>
                    <Video size={22} color={isDark ? '#E5E7EB' : '#4B5563'} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.headerActionButton} onPress={toggleUserActions}>
                    <MoreVertical size={22} color={isDark ? '#E5E7EB' : '#4B5563'} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* User Actions Menu */}
              {showUserActions && (
                <Animated.View 
                  style={[
                    styles.userActionsMenu,
                    { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' },
                    userActionsStyle
                  ]}
                >
                  <TouchableOpacity 
                    style={styles.userActionItem}
                    onPress={() => handleUserAction('mute')}
                  >
                    <VolumeX size={20} color={isDark ? '#E5E7EB' : '#4B5563'} />
                    <Text style={[styles.userActionText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                      {userStatus.isMuted ? 'Unmute' : 'Mute'} Notifications
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.userActionItem}
                    onPress={() => handleUserAction('archive')}
                  >
                    <Archive size={20} color={isDark ? '#E5E7EB' : '#4B5563'} />
                    <Text style={[styles.userActionText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                      {userStatus.isArchived ? 'Unarchive' : 'Archive'} Chat
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.userActionItem}
                    onPress={() => handleUserAction('block')}
                  >
                    {userStatus.isBlocked ? (
                      <UserCheck size={20} color="#10B981" />
                    ) : (
                      <UserX size={20} color="#EF4444" />
                    )}
                    <Text style={[
                      styles.userActionText, 
                      { color: userStatus.isBlocked ? '#10B981' : '#EF4444' }
                    ]}>
                      {userStatus.isBlocked ? 'Unblock' : 'Block'} User
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.userActionItem}
                    onPress={() => handleUserAction('report')}
                  >
                    <Flag size={20} color="#F59E0B" />
                    <Text style={[styles.userActionText, { color: '#F59E0B' }]}>
                      Report User
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.userActionItem, styles.dangerAction]}
                    onPress={() => handleUserAction('delete')}
                  >
                    <Trash2 size={20} color="#EF4444" />
                    <Text style={[styles.userActionText, { color: '#EF4444' }]}>
                      Delete Conversation
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              )}

              {/* Messages */}
              <ScrollView 
                ref={scrollViewRef}
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={scrollToBottom}
                onTouchStart={() => {
                  setShowReactions(null);
                  setShowEmojiPicker(false);
                  setShowMoreOptions(false);
                  setShowUserActions(false);
                  emojiPickerHeight.value = withTiming(0);
                  moreOptionsHeight.value = withTiming(0);
                  userActionsOpacity.value = withTiming(0);
                }}
              >
                {messageList.map((message, index) => renderMessage(message, index))}
              </ScrollView>

              {/* Recording Indicator */}
              {isRecording && (
                <View style={[styles.recordingIndicator, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}>
                  <Animated.View style={[styles.recordingDot, recordingStyle]} />
                  <Text style={[styles.recordingText, { color: isDark ? '#E5E7EB' : '#1F2937' }]}>
                    Recording... {formatDuration(recordingDuration)}
                  </Text>
                  <TouchableOpacity onPress={() => setIsRecording(false)}>
                    <Text style={styles.cancelRecording}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* More Options */}
              <Animated.View 
                style={[
                  styles.moreOptions,
                  { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' },
                  moreOptionsStyle
                ]}
              >
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.moreOptionsContainer}
                >
                  <TouchableOpacity style={styles.moreOptionButton} onPress={handleSendLocation}>
                    <View style={[styles.moreOptionIcon, { backgroundColor: '#10B981' }]}>
                      <MapPin size={24} color="#FFFFFF" />
                    </View>
                    <Text style={[styles.moreOptionText, { color: isDark ? '#E5E7EB' : '#1F2937' }]}>
                      Location
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.moreOptionButton} onPress={handleSendSticker}>
                    <View style={[styles.moreOptionIcon, { backgroundColor: '#F59E0B' }]}>
                      <Sticker size={24} color="#FFFFFF" />
                    </View>
                    <Text style={[styles.moreOptionText, { color: isDark ? '#E5E7EB' : '#1F2937' }]}>
                      Sticker
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.moreOptionButton}>
                    <View style={[styles.moreOptionIcon, { backgroundColor: '#8B5CF6' }]}>
                      <Gift size={24} color="#FFFFFF" />
                    </View>
                    <Text style={[styles.moreOptionText, { color: isDark ? '#E5E7EB' : '#1F2937' }]}>
                      Gift
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </Animated.View>

              {/* Emoji Picker */}
              <Animated.View 
                style={[
                  styles.emojiPicker,
                  { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' },
                  emojiPickerStyle
                ]}
              >
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.emojiContainer}
                >
                  {quickEmojis.map((emoji, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.emojiButton}
                      onPress={() => handleSendEmoji(emoji)}
                    >
                      <Text style={styles.emojiText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </Animated.View>

              {/* Enhanced Input Area */}
              <View style={[styles.inputContainer, { backgroundColor: isDark ? '#0F172A' : '#FFFFFF' }]}>
                <View style={[
                  styles.inputWrapper, 
                  { 
                    backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                    borderWidth: 0, // Remove border to eliminate hover effects
                  }
                ]}>
                  <TouchableOpacity style={styles.inputButton} onPress={toggleEmojiPicker}>
                    <Smile size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />
                  </TouchableOpacity>
                  
                  <TextInput
                    ref={textInputRef}
                    style={[
                      styles.input, 
                      { 
                        color: isDark ? '#E5E7EB' : '#1F2937',
                        height: Math.max(40, inputHeight),
                        outlineStyle: 'none', // Remove web outline
                      }
                    ]}
                    placeholder="Message..."
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    multiline
                    onContentSizeChange={(event) => {
                      setInputHeight(event.nativeEvent.contentSize.height);
                    }}
                  />
                  
                  <View style={styles.inputActions}>
                    <TouchableOpacity style={styles.inputButton}>
                      <Camera size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.inputButton}>
                      <ImageIcon size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.inputButton} onPress={toggleMoreOptions}>
                      <Plus size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    </TouchableOpacity>
                  </View>
                </View>
                
                {newMessage.trim() ? (
                  <TouchableOpacity 
                    style={styles.sendButton}
                    onPress={handleSendMessage}
                  >
                    <Send size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                ) : (
                  <Animated.View style={recordingStyle}>
                    <TouchableOpacity 
                      style={[
                        styles.voiceButton,
                        { backgroundColor: isRecording ? '#EF4444' : '#3B82F6' }
                      ]}
                      onPress={handleVoiceRecord}
                      onLongPress={handleVoiceRecord}
                    >
                      <Mic size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </Animated.View>
                )}
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
    minHeight: 80,
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
  headerAvatarContainer: {
    position: 'relative',
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  verifiedBadgeHeader: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  verifiedTextHeader: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  headerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    gap: 6,
  },
  headerName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
  },
  headerUsername: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 2,
  },
  onlineStatus: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#10B981',
  },
  lastSeen: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  mutualConnections: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  typingIndicator: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#3B82F6',
    fontStyle: 'italic',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerActionButton: {
    padding: 8,
    borderRadius: 20,
  },
  userActionsMenu: {
    position: 'absolute',
    top: 80,
    right: 16,
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
    minWidth: 200,
  },
  userActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  dangerAction: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(239, 68, 68, 0.2)',
    marginTop: 4,
    paddingTop: 16,
  },
  userActionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageWrapper: {
    marginBottom: 16,
    flexDirection: 'row',
  },
  sentWrapper: {
    justifyContent: 'flex-end',
  },
  receivedWrapper: {
    justifyContent: 'flex-start',
  },
  profileContainer: {
    width: 40,
    alignItems: 'center',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarSpacer: {
    width: 32,
    height: 32,
  },
  messageContentContainer: {
    flex: 1,
    marginLeft: 8,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageSender: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  verifiedBadge: {
    color: '#3B82F6',
    fontSize: 12,
    marginLeft: 4,
  },
  messageBubble: {
    maxWidth: '85%',
    borderRadius: 20,
    padding: 12,
    position: 'relative',
    alignSelf: 'flex-start',
  },
  sentBubble: {
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
  },
  receivedBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 22,
  },
  emojiMessage: {
    fontSize: 32,
    textAlign: 'center',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  imageCaption: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: 8,
  },
  voiceMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 150,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  playIcon: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  voiceWaveform: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    height: 20,
    gap: 1,
  },
  waveformBar: {
    width: 2,
    borderRadius: 1,
  },
  voiceDuration: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginLeft: 8,
  },
  locationMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 200,
  },
  locationInfo: {
    marginLeft: 8,
    flex: 1,
  },
  locationName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  locationAddress: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginTop: 2,
  },
  stickerMessage: {
    fontSize: 48,
    textAlign: 'center',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  messageTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
  },
  statusText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#9CA3AF',
  },
  reactionsContainer: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 4,
  },
  reactionsContainerOwn: {
    justifyContent: 'flex-end',
  },
  reactionBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  quickReactions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  quickReactionsOwn: {
    alignSelf: 'flex-end',
  },
  quickReactionButton: {
    padding: 4,
  },
  quickReactionEmoji: {
    fontSize: 20,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  recordingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    flex: 1,
  },
  cancelRecording: {
    color: '#EF4444',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  moreOptions: {
    overflow: 'hidden',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  moreOptionsContainer: {
    padding: 16,
    gap: 20,
  },
  moreOptionButton: {
    alignItems: 'center',
    gap: 8,
  },
  moreOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreOptionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  emojiPicker: {
    overflow: 'hidden',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  emojiContainer: {
    padding: 16,
    gap: 12,
  },
  emojiButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  emojiText: {
    fontSize: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
  },
  inputButton: {
    padding: 4,
    marginHorizontal: 2,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginHorizontal: 8,
    maxHeight: 120,
    textAlignVertical: 'center',
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
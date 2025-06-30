import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Image, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Search, Users, PenSquare, ChevronRight } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  runOnJS
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { NewMessageDrawer } from './NewMessageDrawer';
import { DirectMessageDrawer } from './DirectMessageDrawer';
import { GroupMessageDrawer } from './GroupMessageDrawer';
import { ChannelMessageDrawer } from './ChannelMessageDrawer';
import { CommunityMessageDrawer } from './CommunityMessageDrawer';

interface MessagesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// Initialize global messages if it doesn't exist
if (typeof global !== 'undefined' && !global.messages) {
  global.messages = [
    {
      id: '1',
      type: 'individual',
      name: 'Sarah Chen',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
      lastMessage: "Hey, did you get the notes from yesterday's lecture?",
      time: '2m',
      unread: true,
      online: true,
    },
    {
      id: '2',
      type: 'group',
      name: 'Study Group',
      avatar: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=100',
      lastMessage: "Michael: I'll share my notes from today's class",
      time: '5m',
      unread: true,
      members: 8,
    },
    {
      id: '3',
      type: 'individual',
      name: 'Emma Wilson',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
      lastMessage: 'Thanks for helping with the project!',
      time: '15m',
      unread: true,
      online: true,
    },
    {
      id: '4',
      type: 'channel',
      name: 'Campus Updates',
      avatar: 'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=100',
      lastMessage: 'Library hours extended during finals week',
      time: '30m',
    },
    {
      id: '5',
      type: 'community',
      name: 'Computer Science Society',
      avatar: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=100',
      lastMessage: 'New workshop series starting next week!',
      time: '1h',
      unread: true,
    },
    {
      id: '6',
      type: 'individual',
      name: 'Michael Brown',
      avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100',
      lastMessage: 'See you at the study session tomorrow',
      time: '2h',
      online: false,
    },
    {
      id: '7',
      type: 'group',
      name: 'Research Team',
      avatar: 'https://images.pexels.com/photos/3184302/pexels-photo-3184302.jpeg?auto=compress&cs=tinysrgb&w=100',
      lastMessage: 'Sarah: Updated the project timeline',
      time: '3h',
      members: 5,
    },
    {
      id: '8',
      type: 'channel',
      name: 'Events & Activities',
      avatar: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=100',
      lastMessage: 'Spring Festival registration now open!',
      time: '4h',
    }
  ];
}

const categories = [
  { id: 'all', name: 'All' },
  { id: 'individual', name: 'Direct' },
  { id: 'group', name: 'Groups' },
  { id: 'channel', name: 'Channels' },
  { id: 'community', name: 'Communities' },
  { id: 'unread', name: 'Unread' },
];

export function MessagesDrawer({ isOpen, onClose }: MessagesDrawerProps) {
  const { isDark } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    name: string;
    avatar: string;
    online?: boolean;
  } | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<{
    name: string;
    avatar: string;
    members: number;
  } | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<{
    name: string;
    avatar: string;
  } | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<{
    name: string;
    avatar: string;
  } | null>(null);
  const [messages, setMessages] = useState(global.messages || []);
  
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

  // Update messages when global.messages changes
  useEffect(() => {
    if (isOpen && global.messages) {
      setMessages([...global.messages]);
    }
  }, [isOpen]);

  const filteredMessages = messages.filter(message => {
    if (selectedCategory !== 'all' && selectedCategory !== 'unread') {
      return message.type === selectedCategory;
    }
    if (selectedCategory === 'unread') {
      return message.unread;
    }
    return true;
  }).filter(message => {
    if (searchQuery) {
      return message.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             message.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const handleMessagePress = (message: typeof messages[0]) => {
    if (message.type === 'individual') {
      setSelectedUser({
        name: message.name,
        avatar: message.avatar,
        online: message.online,
      });
    } else if (message.type === 'group') {
      setSelectedGroup({
        name: message.name,
        avatar: message.avatar,
        members: message.members || 0,
      });
    } else if (message.type === 'channel') {
      setSelectedChannel({
        name: message.name,
        avatar: message.avatar,
      });
    } else if (message.type === 'community') {
      setSelectedCommunity({
        name: message.name,
        avatar: message.avatar,
      });
    }
  };

  const renderMessage = ({ item }) => (
    <TouchableOpacity 
      style={styles.messageItem}
      onPress={() => handleMessagePress(item)}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.type === 'individual' && item.online && (
          <View style={styles.onlineIndicator} />
        )}
      </View>
      
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text 
            style={[styles.messageName, { color: isDark ? '#FFFFFF' : '#111827' }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text style={styles.messageTime}>{item.time}</Text>
        </View>
        
        <View style={styles.messageFooter}>
          <Text 
            style={[
              styles.messageText,
              { color: item.unread ? (isDark ? '#FFFFFF' : '#111827') : (isDark ? '#9CA3AF' : '#6B7280') }
            ]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          {item.unread && <View style={styles.unreadIndicator} />}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!isOpen) {
    return null;
  }

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
          <SafeAreaView style={{flex: 1}}>
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.headerButton}>
                <X size={24} color={isDark ? '#E5E7EB' : '#4B5563'} />
              </TouchableOpacity>
              
              <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Messages
              </Text>
              
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => setIsNewMessageOpen(true)}
              >
                <PenSquare size={24} color={isDark ? '#E5E7EB' : '#4B5563'} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <View style={[styles.searchBar, { backgroundColor: isDark ? '#1E293B' : '#F3F4F6' }]}>
                <Search size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
                <TextInput
                  style={[styles.searchInput, { color: isDark ? '#E5E7EB' : '#1F2937' }]}
                  placeholder="Search messages"
                  placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesContainer}
              contentContainerStyle={styles.categoriesContent}
            >
              {categories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    { 
                      backgroundColor: selectedCategory === category.id ? 
                        '#3B82F6' : 
                        (isDark ? '#1E293B' : '#F3F4F6')
                    }
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      { 
                        color: selectedCategory === category.id ? 
                          '#FFFFFF' : 
                          (isDark ? '#E5E7EB' : '#4B5563')
                      }
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <ScrollView
              style={styles.messagesList}
              showsVerticalScrollIndicator={false}
            >
              {filteredMessages.map((item) => (
                <React.Fragment key={item.id}>
                  {renderMessage({ item })}
                </React.Fragment>
              ))}
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </GestureDetector>

      <NewMessageDrawer 
        isOpen={isNewMessageOpen} 
        onClose={() => setIsNewMessageOpen(false)} 
      />

      <DirectMessageDrawer 
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        user={selectedUser || undefined}
      />

      <GroupMessageDrawer
        isOpen={!!selectedGroup}
        onClose={() => setSelectedGroup(null)}
        group={selectedGroup || undefined}
      />

      <ChannelMessageDrawer
        isOpen={!!selectedChannel}
        onClose={() => setSelectedChannel(null)}
        channel={selectedChannel || undefined}
      />

      <CommunityMessageDrawer
        isOpen={!!selectedCommunity}
        onClose={() => setSelectedCommunity(null)}
        community={selectedCommunity || undefined}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
  headerButton: {
    padding: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    height: 40,
  },
  categoriesContainer: {
    maxHeight: 48,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  categoryButton: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    lineHeight: 20,
  },
  messagesList: {
    paddingTop: 8,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  messageContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    alignItems: 'center',
  },
  messageName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  messageTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#9CA3AF',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  messageText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    flex: 1,
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3B82F6',
    marginLeft: 8,
  },
});
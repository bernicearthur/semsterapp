import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Image, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Search, Users, Hash, UserPlus } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  runOnJS
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { CreateGroupDrawer } from './CreateGroupDrawer';
import { CreateChannelDrawer } from './CreateChannelDrawer';
import { CreateCommunityDrawer } from './CreateCommunityDrawer';

interface NewMessageDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const suggestedUsers = [
  {
    id: '1',
    name: 'Sarah Chen',
    username: '@sarahc',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
  },
  {
    id: '2',
    name: 'Michael Brown',
    username: '@michaelb',
    avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100',
  },
  {
    id: '3',
    name: 'Emma Wilson',
    username: '@emmaw',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
  },
  {
    id: '4',
    name: 'David Kim',
    username: '@davidk',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100',
  },
  {
    id: '5',
    name: 'Lisa Wang',
    username: '@lisaw',
    avatar: 'https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=100',
  },
  {
    id: '6',
    name: 'James Rodriguez',
    username: '@jamesr',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100',
  },
  {
    id: '7',
    name: 'Sophia Patel',
    username: '@sophiap',
    avatar: 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=100',
  },
  {
    id: '8',
    name: 'Marcus Johnson',
    username: '@marcusj',
    avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=100',
  },
  {
    id: '9',
    name: 'Olivia Zhang',
    username: '@oliviaz',
    avatar: 'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=100',
  },
  {
    id: '10',
    name: 'Alex Thompson',
    username: '@alext',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
  }
];

const options = [
  {
    id: 'new-group',
    icon: <Users size={24} color="#3B82F6" />,
    title: 'Create New Group',
    description: 'Start a group chat with multiple people',
  },
  {
    id: 'new-channel',
    icon: <Hash size={24} color="#3B82F6" />,
    title: 'Create New Channel',
    description: 'Broadcast messages to a large audience',
  },
  {
    id: 'new-community',
    icon: <UserPlus size={24} color="#3B82F6" />,
    title: 'Create New Community',
    description: 'Build a space for like-minded people',
  },
];

export function NewMessageDrawer({ isOpen, onClose }: NewMessageDrawerProps) {
  const { isDark } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const [searchQuery, setSearchQuery] = useState('');
  const [isGroupDrawerOpen, setIsGroupDrawerOpen] = useState(false);
  const [isChannelDrawerOpen, setIsChannelDrawerOpen] = useState(false);
  const [isCommunityDrawerOpen, setIsCommunityDrawerOpen] = useState(false);
  
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

  const handleOptionPress = (optionId: string) => {
    switch (optionId) {
      case 'new-group':
        setIsGroupDrawerOpen(true);
        break;
      case 'new-channel':
        setIsChannelDrawerOpen(true);
        break;
      case 'new-community':
        setIsCommunityDrawerOpen(true);
        break;
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
              <View style={styles.headerTitleContainer}>
                <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  New Message
                </Text>
              </View>
              <View style={styles.headerRight} />
            </View>

            <ScrollView 
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              stickyHeaderIndices={[0]}
            >
              <View style={[styles.searchContainer, { backgroundColor: isDark ? '#0F172A' : '#FFFFFF' }]}>
                <View style={[styles.searchBar, { backgroundColor: isDark ? '#1E293B' : '#F3F4F6' }]}>
                  <Search size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  <TextInput
                    style={[styles.searchInput, { color: isDark ? '#E5E7EB' : '#1F2937' }]}
                    placeholder="Search people"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>
              </View>

              <View style={styles.content}>
                <View style={styles.optionsContainer}>
                  {options.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.optionItem,
                        { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }
                      ]}
                      onPress={() => handleOptionPress(option.id)}
                    >
                      <View style={styles.optionIcon}>
                        {option.icon}
                      </View>
                      <View style={styles.optionContent}>
                        <Text style={[styles.optionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                          {option.title}
                        </Text>
                        <Text style={[styles.optionDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                          {option.description}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.suggestedSection}>
                  <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    Suggested
                  </Text>
                  {suggestedUsers.map((user) => (
                    <TouchableOpacity 
                      key={user.id}
                      style={styles.userItem}
                    >
                      <Image source={{ uri: user.avatar }} style={styles.avatar} />
                      <View style={styles.userInfo}>
                        <Text style={[styles.userName, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                          {user.name}
                        </Text>
                        <Text style={[styles.userUsername, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                          {user.username}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </GestureDetector>

      <CreateGroupDrawer
        isOpen={isGroupDrawerOpen}
        onClose={() => setIsGroupDrawerOpen(false)}
      />
      <CreateChannelDrawer
        isOpen={isChannelDrawerOpen}
        onClose={() => setIsChannelDrawerOpen(false)}
      />
      <CreateCommunityDrawer
        isOpen={isCommunityDrawerOpen}
        onClose={() => setIsCommunityDrawerOpen(false)}
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
    alignItems: 'center',
    padding: 16,
  },
  closeButton: {
    padding: 4,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
  headerRight: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  optionsContainer: {
    padding: 16,
    gap: 12,
  },
  optionItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContent: {
    marginLeft: 12,
    flex: 1,
  },
  optionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  optionDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  suggestedSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 12,
  },
  userItem: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  userUsername: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
});
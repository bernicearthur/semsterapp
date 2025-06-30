import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Image, ScrollView, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Search, Users, Camera } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  runOnJS
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface CreateGroupDrawerProps {
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
];

export function CreateGroupDrawer({ isOpen, onClose }: CreateGroupDrawerProps) {
  const { isDark } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  
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
    
    // Reset form when drawer opens
    if (isOpen) {
      setGroupName('');
      setDescription('');
      setSearchQuery('');
      setSelectedUsers([]);
      setIsPublic(true);
    }
  }, [isOpen]);

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }
    
    if (selectedUsers.length === 0) {
      Alert.alert('Error', 'Please select at least one member');
      return;
    }
    
    // Add the new group to messages
    const selectedUserObjects = selectedUsers.map(userId => 
      suggestedUsers.find(user => user.id === userId)
    ).filter(Boolean);
    
    // Get the first selected user's avatar or use a default
    const groupAvatar = selectedUserObjects[0]?.avatar || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=100';
    
    // Add to global messages state (in a real app, this would be handled by a context or state management)
    const newGroup = {
      id: Date.now().toString(),
      type: 'group',
      name: groupName.trim(),
      avatar: groupAvatar,
      lastMessage: `You created this group with ${selectedUserObjects.length} members`,
      time: 'now',
      unread: false,
      members: selectedUserObjects.length + 1, // +1 for current user
    };
    
    // In a real app, you would update a global state or context
    // For this demo, we'll use a mock implementation
    global.messages = global.messages || [];
    global.messages.unshift(newGroup);
    
    Alert.alert(
      'Group Created',
      `"${groupName}" has been created with ${selectedUsers.length} members`,
      [
        {
          text: 'OK',
          onPress: onClose
        }
      ]
    );
  };

  const filteredUsers = suggestedUsers.filter(user => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return user.name.toLowerCase().includes(query) || 
             user.username.toLowerCase().includes(query);
    }
    return true;
  });

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
                  Create Group
                </Text>
              </View>
              <TouchableOpacity 
                style={[
                  styles.createButton,
                  { opacity: groupName && selectedUsers.length > 0 ? 1 : 0.5 }
                ]}
                onPress={handleCreateGroup}
                disabled={!groupName || selectedUsers.length === 0}
              >
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
              <View style={styles.groupInfoSection}>
                <TouchableOpacity 
                  style={[styles.groupImageButton, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF' }]}
                  onPress={() => Alert.alert('Select Image', 'Image picker would open here')}
                >
                  <Camera size={32} color={isDark ? '#60A5FA' : '#3B82F6'} />
                </TouchableOpacity>
                
                <View style={styles.groupInputs}>
                  <TextInput
                    style={[
                      styles.groupNameInput,
                      { color: isDark ? '#FFFFFF' : '#111827' }
                    ]}
                    placeholder="Group name"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={groupName}
                    onChangeText={setGroupName}
                  />
                  <TextInput
                    style={[
                      styles.descriptionInput,
                      { color: isDark ? '#E5E7EB' : '#4B5563' }
                    ]}
                    placeholder="Description (optional)"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                  />
                </View>
              </View>

              <View style={styles.privacySection}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Privacy
                </Text>
                <View style={styles.privacyOptions}>
                  <TouchableOpacity 
                    style={[
                      styles.privacyOption,
                      { backgroundColor: isPublic ? '#3B82F6' : (isDark ? '#374151' : '#F3F4F6') }
                    ]}
                    onPress={() => setIsPublic(true)}
                  >
                    <Text style={[
                      styles.privacyText,
                      { color: isPublic ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#4B5563') }
                    ]}>
                      Public
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.privacyOption,
                      { backgroundColor: !isPublic ? '#3B82F6' : (isDark ? '#374151' : '#F3F4F6') }
                    ]}
                    onPress={() => setIsPublic(false)}
                  >
                    <Text style={[
                      styles.privacyText,
                      { color: !isPublic ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#4B5563') }
                    ]}>
                      Private
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={[styles.privacyDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  {isPublic 
                    ? 'Anyone can find and join this group' 
                    : 'Only invited members can join this group'}
                </Text>
              </View>

              <View style={[
                styles.searchContainer,
                { backgroundColor: isDark ? '#1E293B' : '#F3F4F6' }
              ]}>
                <Search size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                <TextInput
                  style={[
                    styles.searchInput,
                    { color: isDark ? '#E5E7EB' : '#1F2937' }
                  ]}
                  placeholder="Search people"
                  placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              <View style={styles.selectedUsersContainer}>
                {selectedUsers.length > 0 && (
                  <Text style={[
                    styles.selectedCount,
                    { color: isDark ? '#E5E7EB' : '#4B5563' }
                  ]}>
                    Selected: {selectedUsers.length}
                  </Text>
                )}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.selectedUsersContent}
                >
                  {selectedUsers.map(userId => {
                    const user = suggestedUsers.find(u => u.id === userId);
                    if (!user) return null;
                    return (
                      <TouchableOpacity
                        key={user.id}
                        style={styles.selectedUserChip}
                        onPress={() => toggleUserSelection(user.id)}
                      >
                        <Image source={{ uri: user.avatar }} style={styles.selectedUserAvatar} />
                        <Text style={styles.selectedUserName}>{user.name}</Text>
                        <X size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <View style={styles.suggestedUsers}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Add Members
                </Text>
                {filteredUsers.map(user => (
                  <TouchableOpacity
                    key={user.id}
                    style={styles.userItem}
                    onPress={() => toggleUserSelection(user.id)}
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
                    <View style={[
                      styles.checkbox,
                      selectedUsers.includes(user.id) && styles.checkboxSelected
                    ]} />
                  </TouchableOpacity>
                ))}
                
                {filteredUsers.length === 0 && (
                  <View style={styles.emptyState}>
                    <Text style={[styles.emptyStateText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                      No users found matching "{searchQuery}"
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
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
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
  createButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  groupInfoSection: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  groupImageButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  groupInputs: {
    flex: 1,
  },
  groupNameInput: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 8,
  },
  descriptionInput: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  privacySection: {
    padding: 16,
    paddingTop: 0,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 12,
  },
  privacyOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  privacyOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  privacyText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  privacyDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  selectedUsersContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  selectedCount: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 8,
  },
  selectedUsersContent: {
    gap: 8,
  },
  selectedUserChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedUserAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  selectedUserName: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginRight: 8,
  },
  suggestedUsers: {
    flex: 1,
    paddingHorizontal: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  userUsername: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  checkboxSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
});
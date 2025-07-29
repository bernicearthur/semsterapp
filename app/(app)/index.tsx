import React, { useState, useCallback, useRef, useMemo } from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, Alert, Share, Platform, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircle, Repeat2, Share2, Bookmark as BookmarkIcon, MoveVertical as MoreVertical, Heart, Camera, UserPlus, Flag, Copy, Link, UserMinus, X, AtSign, Plus, Send, BarChart3, Calendar, Video, PenSquare } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown, SlideInRight } from 'react-native-reanimated';
import { SwipeGestureWrapper } from '@/components/SwipeGestureWrapper';
import { useTheme } from '@/context/ThemeContext';
import { PostDetailsDrawer } from '@/components/drawers/PostDetailsDrawer';
import { StoryViewerDrawer } from '@/components/drawers/StoryViewerDrawer';
import { CreateStoryDrawer } from '@/components/drawers/CreateStoryDrawer';
import { CreateEventDrawer } from '@/components/drawers/CreateEventDrawer';
import { CreateStudyRoomDrawer } from '@/components/drawers/CreateStudyRoomDrawer';
import { CreatePostDrawer } from '@/components/drawers/CreatePostDrawer';
import { CreatePollDrawer } from '@/components/drawers/CreatePollDrawer';
import { router } from 'expo-router';

const initialStories = [
  {
    id: 's1',
    user: {
      name: 'Your Story',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
      hasUnseenStory: false,
    },
    isAddStory: true,
  },
  {
    id: 's2',
    user: {
      name: 'Kwame Mensah',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
      hasUnseenStory: true,
    },
    content: {
      type: 'image',
      url: 'https://images.pexels.com/photos/3755761/pexels-photo-3755761.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
    timestamp: '2h',
    views: 45,
    isViewed: false,
  },
  {
    id: 's3',
    user: {
      name: 'Abena Osei',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
      hasUnseenStory: true,
    },
    content: {
      type: 'text',
      text: 'Just finished my final project! 🎉 So excited to graduate next month!',
      backgroundColor: '#3B82F6',
      textColor: '#FFFFFF',
    },
    timestamp: '4h',
    views: 32,
    isViewed: false,
  },
  {
    id: 's4',
    user: {
      name: 'Kofi Addo',
      avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100',
      hasUnseenStory: true,
    },
    content: {
      type: 'image',
      url: 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
    timestamp: '6h',
    views: 28,
    isViewed: true,
  },
];

// List of users for @mention functionality
const mentionUsers = [
  {
    id: 'u1',
    name: 'Sarah Chen',
    username: 'sarahc',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
  },
  {
    id: 'u2',
    name: 'Michael Brown',
    username: 'michaelb',
    avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100',
  },
  {
    id: 'u3',
    name: 'Emma Wilson',
    username: 'emmaw',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
  },
  {
    id: 'u4',
    name: 'David Kim',
    username: 'davidk',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100',
  },
];

const initialPosts = Array.from({ length: 10 }, (_, index) => ({
  id: index.toString(),
  user: {
    id: `u${index}`,
    name: [
      'Kwame Owusu',
      'Abena Sarpong',
      'Dr. Kofi Mensah',
      'Ama Darkwah',
      'Prof. Yaw Asante',
      'Sarah Boateng'
    ][Math.floor(Math.random() * 6)],
    avatar: [
      'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
      'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
      'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100',
      'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100'
    ][Math.floor(Math.random() * 4)],
    role: ['Student', 'Alumni', 'Lecturer', 'Administration'][Math.floor(Math.random() * 4)],
    course: ['Computer Science', 'Business Administration', 'Engineering'][Math.floor(Math.random() * 3)],
    department: ['Computer Science', 'Business School', 'Engineering'][Math.floor(Math.random() * 3)],
    graduationYear: Math.floor(Math.random() * 4) + 2020,
    year: Math.floor(Math.random() * 4) + 2024,
    isConnected: Math.random() > 0.5,
  },
  content: [
    'Just completed my project on sustainable energy! 🚀 Proud to contribute to Ghana\'s green future. #Innovation #GhanaTech',
    'Great discussion in today\'s lecture about emerging technologies in Africa 💡 #GhanaEducation',
    'Beautiful sunset at campus today! University of Ghana never disappoints 🌅 #LegonLife',
    'Productive study session with my group! Getting ready for finals 📚 #StudentLife',
    'Excited to announce our startup got selected for the Ghana Tech Lab accelerator! 🎉 #GhanaianEntrepreneurs',
    'Just had a great conversation with @sarahc about the upcoming hackathon! Looking forward to collaborating with @michaelb and @emmaw on our project.'
  ][Math.floor(Math.random() * 6)],
  images: Math.random() > 0.5 ? [
    'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3182833/pexels-photo-3182833.jpeg?auto=compress&cs=tinysrgb&w=800'
  ] : undefined,
  timestamp: `${Math.floor(Math.random() * 60)}s`,
  likes: Math.floor(Math.random() * 1000),
  comments: Math.floor(Math.random() * 100),
  reposts: Math.floor(Math.random() * 50),
  shares: Math.floor(Math.random() * 30),
  bookmarks: Math.floor(Math.random() * 20),
  repostedBy: Math.random() > 0.8 ? {
    name: ['Emma Wilson', 'David Kim', 'Lisa Wang'][Math.floor(Math.random() * 3)],
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100'
  } : null,
  mentions: Math.random() > 0.7 ? [
    mentionUsers[Math.floor(Math.random() * mentionUsers.length)],
    mentionUsers[Math.floor(Math.random() * mentionUsers.length)]
  ] : [],
}));

export default function HomeScreen() {
  const { isDark } = useTheme();
  const [interactions, setInteractions] = useState({});
  const [posts, setPosts] = useState(initialPosts);
  const [selectedPost, setSelectedPost] = useState(null);
  const [stories, setStories] = useState(initialStories);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isCreatePollOpen, setIsCreatePollOpen] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [postText, setPostText] = useState('');
  const flatListRef = useRef(null);
  const loadingRef = useRef(false);
  const postIdCounterRef = useRef(initialPosts.length);

  const toggleInteraction = useCallback((postId: string, type: 'liked' | 'bookmarked' | 'reposted') => {
    setInteractions(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        [type]: !prev[postId]?.[type]
      }
    }));
  }, []);

  const formatNumber = useCallback((num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }, []);

  const renderHashtags = useCallback((content: string) => {
    const words = content.split(' ');
    return words.map((word, index) => {
      if (word.startsWith('#')) {
        return (
          <Text
            key={index}
            style={[styles.hashtag, { color: '#3B82F6' }]}
          >
            {word}{' '}
          </Text>
        );
      } else if (word.startsWith('@')) {
        // Handle @mentions
        const username = word.substring(1);
        const mentionedUser = mentionUsers.find(user => 
          user.username.toLowerCase() === username.toLowerCase()
        );
        
        if (mentionedUser) {
          return (
            <Text
              key={index}
              style={[styles.mention, { color: '#3B82F6' }]}
              onPress={() => Alert.alert(`View Profile`, `View ${mentionedUser.name}'s profile`)}
            >
              {word}{' '}
            </Text>
          );
        }
      }
      return word + ' ';
    });
  }, []);

  const loadMorePosts = useCallback(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    const newPosts = Array.from({ length: 5 }, (_, index) => ({
      id: (postIdCounterRef.current + index).toString(),
      user: {
        id: `u${postIdCounterRef.current + index}`,
        name: [
          'Kwame Owusu',
          'Abena Sarpong',
          'Dr. Kofi Mensah',
          'Ama Darkwah',
          'Prof. Yaw Asante',
          'Sarah Boateng'
        ][Math.floor(Math.random() * 6)],
        avatar: [
          'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
          'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
          'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100',
          'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100'
        ][Math.floor(Math.random() * 4)],
        role: ['Student', 'Alumni', 'Lecturer', 'Administration'][Math.floor(Math.random() * 4)],
        course: ['Computer Science', 'Business Administration', 'Engineering'][Math.floor(Math.random() * 3)],
        department: ['Computer Science', 'Business School', 'Engineering'][Math.floor(Math.random() * 3)],
        graduationYear: Math.floor(Math.random() * 4) + 2020,
        year: Math.floor(Math.random() * 4) + 2024,
        isConnected: Math.random() > 0.5,
      },
      content: [
        'Just completed my project on sustainable energy! 🚀 Proud to contribute to Ghana\'s green future. #Innovation #GhanaTech',
        'Great discussion in today\'s lecture about emerging technologies in Africa 💡 #GhanaEducation',
        'Beautiful sunset at campus today! University of Ghana never disappoints 🌅 #LegonLife',
        'Productive study session with my group! Getting ready for finals 📚 #StudentLife',
        'Excited to announce our startup got selected for the Ghana Tech Lab accelerator! 🎉 #GhanaianEntrepreneurs',
        'Just had a great conversation with @sarahc about the upcoming hackathon! Looking forward to collaborating with @michaelb and @emmaw on our project.'
      ][Math.floor(Math.random() * 6)],
      images: Math.random() > 0.5 ? [
        'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/3182833/pexels-photo-3182833.jpeg?auto=compress&cs=tinysrgb&w=800'
      ] : undefined,
      timestamp: `${Math.floor(Math.random() * 60)}s`,
      likes: Math.floor(Math.random() * 1000),
      comments: Math.floor(Math.random() * 100),
      reposts: Math.floor(Math.random() * 50),
      shares: Math.floor(Math.random() * 30),
      bookmarks: Math.floor(Math.random() * 20),
      repostedBy: Math.random() > 0.8 ? {
        name: ['Emma Wilson', 'David Kim', 'Lisa Wang'][Math.floor(Math.random() * 3)],
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100'
      } : null,
      mentions: Math.random() > 0.7 ? [
        mentionUsers[Math.floor(Math.random() * mentionUsers.length)],
        mentionUsers[Math.floor(Math.random() * mentionUsers.length)]
      ] : [],
    }));

    postIdCounterRef.current += 5;

    setTimeout(() => {
      setPosts(prev => [...prev, ...newPosts]);
      loadingRef.current = false;
    }, 0);
  }, []);

  const renderUserMeta = (user) => {
    switch (user.role) {
      case 'Student':
        return `${user.course} • Class of ${user.year}`;
      case 'Alumni':
        return `${user.course} • ${user.graduationYear}`;
      case 'Lecturer':
        return `Department of ${user.department}`;
      default:
        return 'Administration';
    }
  };

  const handlePostPress = (post) => {
    setSelectedPost(post);
  };

  const handleUserNamePress = () => {
    router.push('/profile-tab');
  };

  const handleStoryPress = (index) => {
    if (index === 0) {
      // This is "Your Story" / Add Story button
      setIsCreateStoryOpen(true);
    } else {
      setSelectedStoryIndex(index);
      setIsStoryViewerOpen(true);
    }
  };

  const handleCreateStory = (storyData) => {
    const newStory = {
      id: `s${Date.now()}`,
      user: {
        name: 'Your Story',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
        hasUnseenStory: false,
      },
      content: storyData.content,
      timestamp: 'now',
      views: 0,
      isViewed: false,
    };

    // Update the stories array - replace the "Add Story" with the new story
    // and add back the "Add Story" at the beginning
    const updatedStories = [
      {
        id: 's1',
        user: {
          name: 'Your Story',
          avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
          hasUnseenStory: false,
        },
        isAddStory: true,
      },
      newStory,
      ...stories.slice(1)
    ];

    setStories(updatedStories);
  };

  const handleCreateEvent = (eventData) => {
    Alert.alert('Event Created', `Event "${eventData.title}" has been created successfully!`);
  };

  const handleCreateRoom = (roomData) => {
    Alert.alert('Study Room Created', `Study room "${roomData.name}" has been created successfully!`);
  };

  const handleCreatePost = (postData) => {
    Alert.alert('Post Created', 'Your post has been created successfully!');
  };

  const handleCreatePoll = (pollData) => {
    Alert.alert('Poll Created', 'Your poll has been created successfully!');
  };

  const handleCreateMenuPress = () => {
    setShowCreateMenu(true);
  };

  const handleCreateMenuClose = () => {
    setShowCreateMenu(false);
  };

  const handleCreateOptionPress = (option) => {
    setShowCreateMenu(false);
    
    switch (option) {
      case 'post':
        setIsCreatePostOpen(true);
        break;
      case 'poll':
        setIsCreatePollOpen(true);
        break;
      case 'story':
        setIsCreateStoryOpen(true);
        break;
      case 'event':
        setIsCreateEventOpen(true);
        break;
      case 'room':
        setIsCreateRoomOpen(true);
        break;
    }
  };

  const handleConnectPress = (userId) => {
    // Update the user's connection status
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.user.id === userId 
          ? { ...post, user: { ...post.user, isConnected: true } }
          : post
      )
    );
    
    Alert.alert('Connection Request Sent', 'Your connection request has been sent.');
  };

  const handleMoreOptionsPress = (post) => {
    Alert.alert(
      'Post Options',
      '',
      [
        { 
          text: 'Copy Link', 
          onPress: () => Alert.alert('Link Copied', 'Post link copied to clipboard')
        },
        { 
          text: post.user.isConnected ? 'Unfollow' : 'Connect',
          onPress: () => {
            if (post.user.isConnected) {
              setPosts(prevPosts => 
                prevPosts.map(p => 
                  p.user.id === post.user.id 
                    ? { ...p, user: { ...p.user, isConnected: false } }
                    : p
                )
              );
              Alert.alert('Unfollowed', 'You have unfollowed this user.');
            } else {
              handleConnectPress(post.user.id);
            }
          }
        },
        { 
          text: 'Not Interested', 
          onPress: () => Alert.alert('Not Interested', 'You will see fewer posts like this.')
        },
        { 
          text: 'Report Post', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Report Post',
              'Why are you reporting this post?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Inappropriate Content', onPress: () => Alert.alert('Reported', 'Thank you for your report') },
                { text: 'Spam', onPress: () => Alert.alert('Reported', 'Thank you for your report') },
                { text: 'Harassment', onPress: () => Alert.alert('Reported', 'Thank you for your report') },
              ]
            );
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleSharePost = async (post) => {
    try {
      if (Platform.OS === 'web') {
        // Check if Web Share API is available and allowed
        if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
          const shareData = {
            title: 'Share Post',
            text: `Check out this post by ${post.user.name}: ${post.content}`,
          };
          
          if (navigator.canShare(shareData)) {
            await navigator.share(shareData);
          } else {
            // Fallback for web when sharing is not allowed
            Alert.alert(
              'Sharing Not Available',
              'Sharing is not available in this browser context. You can copy the post content manually.',
              [{ text: 'OK' }]
            );
          }
        } else {
          // Fallback for browsers without Web Share API
          Alert.alert(
            'Sharing Not Available',
            'Your browser does not support sharing. You can copy the post content manually.',
            [{ text: 'OK' }]
          );
        }
      } else {
        // Use React Native Share for mobile platforms
        await Share.share({
          message: `Check out this post by ${post.user.name}: ${post.content}`,
          title: 'Share Post',
        });
      }
    } catch (error) {
      console.error('Error sharing post:', error);
      Alert.alert(
        'Sharing Failed',
        'Unable to share this post at the moment. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  };

  const formatTimestamp = (timestamp) => {
    // Check if timestamp is in seconds format "Xs"
    if (timestamp.endsWith('s')) {
      const seconds = parseInt(timestamp.replace('s', ''));
      if (seconds < 60) {
        return `${seconds}s`;
      }
    }
    
    // Check if timestamp is in the format "Xh"
    if (timestamp.endsWith('h')) {
      const hours = parseInt(timestamp.replace('h', ''));
      if (hours === 0) {
        return 'just now';
      } else if (hours < 1) {
        return `${Math.floor(hours * 60)}m`;
      } else {
        return `${hours}h`;
      }
    }
    return timestamp;
  };

  const handleQuickPost = () => {
    if (postText.trim()) {
      const newPost = {
        id: Date.now().toString(),
        user: {
          id: 'current-user',
          name: 'You',
          avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
          role: 'Student',
          course: 'Computer Science',
          year: 2025,
          isConnected: true,
        },
        content: postText.trim(),
        timestamp: 'now',
        likes: 0,
        comments: 0,
        reposts: 0,
        shares: 0,
        bookmarks: 0,
        mentions: [],
      };
      
      setPosts(prev => [newPost, ...prev]);
      setPostText('');
      Alert.alert('Posted!', 'Your post has been shared successfully.');
    }
  };

  const renderPost = useCallback(({ item: post }) => {
    const postInteractions = interactions[post.id] || { liked: false, bookmarked: false, reposted: false };

    return (
      <Animated.View 
        entering={FadeIn.duration(400)}
        style={[styles.postCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}
      >
        <TouchableOpacity onPress={() => handlePostPress(post)} activeOpacity={0.95}>
          {/* Reposted By */}
          {post.repostedBy && (
            <View style={styles.repostedByContainer}>
              <Repeat2 size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
              <Image source={{ uri: post.repostedBy.avatar }} style={styles.repostedByAvatar} />
              <Text style={[styles.repostedByText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                {post.repostedBy.name} reposted
              </Text>
            </View>
          )}
          
          <View style={styles.postHeader}>
            <View style={styles.userInfo}>
              <Image source={{ uri: post.user.avatar }} style={styles.avatar} />
              <View style={styles.userDetails}>
                <View style={styles.nameRow}>
                  <TouchableOpacity onPress={handleUserNamePress}>
                    <Text style={[styles.userName, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                      {post.user.name}
                    </Text>
                  </TouchableOpacity>
                  {post.user.isOfficial && (
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedText}>✓</Text>
                    </View>
                  )}
                  <Text style={styles.timestamp}> • {formatTimestamp(post.timestamp)}</Text>
                  
                  {!post.user.isConnected && (
                    <TouchableOpacity 
                      style={styles.connectButton}
                      onPress={() => handleConnectPress(post.user.id)}
                    >
                      <UserPlus size={14} color="#3B82F6" />
                      <Text style={styles.connectText}>Connect</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={[styles.userMeta, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  {renderUserMeta(post.user)}
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.moreButton}
              onPress={() => handleMoreOptionsPress(post)}
            >
              <MoreVertical size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.postContent, { color: isDark ? '#E5E7EB' : '#1F2937' }]}>
            {renderHashtags(post.content)}
          </Text>

          {post.images && (
            <View style={[
              styles.imageGrid,
              { flexDirection: post.images.length === 1 ? 'column' : 'row' }
            ]}>
              {post.images.map((image, index) => (
                <Image 
                  key={index}
                  source={{ uri: image }}
                  style={[
                    styles.postImage,
                    post.images.length === 1 ? styles.singleImage : styles.multipleImage
                  ]}
                  resizeMode="cover"
                />
              ))}
            </View>
          )}

          <View style={styles.postActions}>
            <View style={styles.primaryActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => toggleInteraction(post.id, 'liked')}
              >
                <Heart
                  size={22}
                  color={postInteractions.liked ? '#EF4444' : (isDark ? '#9CA3AF' : '#6B7280')}
                  fill={postInteractions.liked ? '#EF4444' : 'none'}
                />
                <Text 
                  style={[
                    styles.actionText,
                    { 
                      color: postInteractions.liked ? 
                        '#EF4444' : 
                        (isDark ? '#9CA3AF' : '#6B7280')
                    }
                  ]}
                >
                  {formatNumber(post.likes + (postInteractions.liked ? 1 : 0))}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handlePostPress(post)}
              >
                <MessageCircle
                  size={22}
                  color={isDark ? '#9CA3AF' : '#6B7280'}
                />
                <Text style={[styles.actionText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  {formatNumber(post.comments)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => toggleInteraction(post.id, 'reposted')}
              >
                <Repeat2
                  size={22}
                  color={postInteractions.reposted ? '#10B981' : (isDark ? '#9CA3AF' : '#6B7280')}
                />
                <Text 
                  style={[
                    styles.actionText,
                    { 
                      color: postInteractions.reposted ? 
                        '#10B981' : 
                        (isDark ? '#9CA3AF' : '#6B7280')
                    }
                  ]}
                >
                  {formatNumber(post.reposts + (postInteractions.reposted ? 1 : 0))}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.secondaryActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleSharePost(post)}
              >
                <Share2
                  size={22}
                  color={isDark ? '#9CA3AF' : '#6B7280'}
                />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => toggleInteraction(post.id, 'bookmarked')}
              >
                <BookmarkIcon
                  size={22}
                  color={postInteractions.bookmarked ? '#F59E0B' : (isDark ? '#9CA3AF' : '#6B7280')}
                  fill={postInteractions.bookmarked ? '#F59E0B' : 'none'}
                />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }, [isDark, interactions, toggleInteraction, formatNumber, renderHashtags]);

  const StoryCircle = useCallback(({ story, index }) => (
    <TouchableOpacity 
      style={[
        styles.storyContainer,
        { marginLeft: index === 0 ? 16 : 8 }
      ]}
      onPress={() => handleStoryPress(index)}
    >
      <View style={[
        styles.storyRing,
        { 
          borderColor: story.user.hasUnseenStory ? 
            (isDark ? '#60A5FA' : '#3B82F6') : 
            'transparent',
        }
      ]}>
        <Image source={{ uri: story.user.avatar }} style={styles.storyAvatar} />
        {story.isAddStory && (
          <View style={styles.addStoryButton}>
            <Camera size={16} color="#FFFFFF" />
          </View>
        )}
      </View>
      <Text 
        style={[
          styles.storyName,
          { color: isDark ? '#E5E7EB' : '#1F2937' }
        ]}
        numberOfLines={1}
      >
        {story.user.name}
      </Text>
    </TouchableOpacity>
  ), [isDark]);

  const ListHeader = useMemo(() => (
    <View>
      {/* Quick Post Input */}
      <View style={[styles.quickPostContainer, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
        <Image 
          source={{ uri: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100' }}
          style={styles.quickPostAvatar}
        />
        <View style={styles.quickPostInputContainer}>
          <TextInput
            style={[
              styles.quickPostInput,
              { 
                backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                color: isDark ? '#E5E7EB' : '#1F2937'
              }
            ]}
            placeholder="What's happening on campus?"
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            value={postText}
            onChangeText={setPostText}
            multiline
          />
          <View style={styles.quickPostActions}>
            <TouchableOpacity style={styles.quickPostAction}>
              <Camera size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickPostAction}>
              <BarChart3 size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickPostAction}>
              <Calendar size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.postButton,
                { 
                  backgroundColor: postText.trim() ? '#3B82F6' : (isDark ? '#374151' : '#E5E7EB'),
                  opacity: postText.trim() ? 1 : 0.5
                }
              ]}
              onPress={handleQuickPost}
              disabled={!postText.trim()}
            >
              <Send size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Stories */}
      <View style={styles.storiesContainer}>
        <FlatList
          data={stories}
          renderItem={({ item, index }) => <StoryCircle story={item} index={index} />}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.storiesList}
        />
      </View>
    </View>
  ), [isDark, StoryCircle, stories, postText]);

  const getItemLayout = useCallback((_, index) => ({
    length: 400,
    offset: 400 * index,
    index,
  }), []);

  // Filter stories for the StoryViewerDrawer (exclude the "Add Story" item)
  const viewableStories = useMemo(() => {
    return stories.filter(story => !story.isAddStory);
  }, [stories]);

  return (
    <SwipeGestureWrapper>
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}>
        <TouchableOpacity 
          style={StyleSheet.absoluteFill} 
          activeOpacity={1}
        >
          <FlatList
            ref={flatListRef}
            data={posts}
            renderItem={renderPost}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={ListHeader}
            onEndReached={loadMorePosts}
            onEndReachedThreshold={0.5}
            maxToRenderPerBatch={5}
            windowSize={5}
            removeClippedSubviews={true}
            initialNumToRender={5}
            updateCellsBatchingPeriod={100}
            getItemLayout={getItemLayout}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 10,
            }}
            contentContainerStyle={styles.content}
          />
        </TouchableOpacity>

        {/* Create FAB */}
        <TouchableOpacity 
          style={[styles.createFab, { backgroundColor: '#3B82F6' }]}
          onPress={handleCreateMenuPress}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Create Menu */}
        {showCreateMenu && (
          <View style={styles.createMenuOverlay}>
            <TouchableOpacity 
              style={StyleSheet.absoluteFill}
              onPress={handleCreateMenuClose}
            />
            <Animated.View 
              entering={SlideInRight.duration(200)}
              style={[
                styles.createMenu,
                { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }
              ]}
            >
              <TouchableOpacity 
                style={styles.createMenuItem}
                onPress={() => handleCreateOptionPress('post')}
              >
                <View style={[styles.createMenuIcon, { backgroundColor: '#3B82F6' }]}>
                  <PenSquare size={18} color="#FFFFFF" />
                </View>
                <Text style={[styles.createMenuText, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Post
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.createMenuItem}
                onPress={() => handleCreateOptionPress('poll')}
              >
                <View style={[styles.createMenuIcon, { backgroundColor: '#10B981' }]}>
                  <BarChart3 size={18} color="#FFFFFF" />
                </View>
                <Text style={[styles.createMenuText, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Poll
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.createMenuItem}
                onPress={() => handleCreateOptionPress('story')}
              >
                <View style={[styles.createMenuIcon, { backgroundColor: '#F59E0B' }]}>
                  <Camera size={18} color="#FFFFFF" />
                </View>
                <Text style={[styles.createMenuText, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Story
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.createMenuItem}
                onPress={() => handleCreateOptionPress('event')}
              >
                <View style={[styles.createMenuIcon, { backgroundColor: '#8B5CF6' }]}>
                  <Calendar size={18} color="#FFFFFF" />
                </View>
                <Text style={[styles.createMenuText, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Event
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.createMenuItem}
                onPress={() => handleCreateOptionPress('room')}
              >
                <View style={[styles.createMenuIcon, { backgroundColor: '#EC4899' }]}>
                  <Video size={18} color="#FFFFFF" />
                </View>
                <Text style={[styles.createMenuText, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Room
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}

        <PostDetailsDrawer
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          post={selectedPost}
          onToggleInteraction={toggleInteraction}
          interactions={selectedPost ? interactions[selectedPost.id] : {}}
        />

        <StoryViewerDrawer
          isOpen={isStoryViewerOpen}
          onClose={() => setIsStoryViewerOpen(false)}
          stories={viewableStories}
          initialStoryIndex={selectedStoryIndex > 0 ? selectedStoryIndex - 1 : 0}
          currentUser={{
            name: 'Alex Johnson',
            avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
          }}
        />

        <CreateStoryDrawer
          isOpen={isCreateStoryOpen}
          onClose={() => setIsCreateStoryOpen(false)}
          onCreateStory={handleCreateStory}
        />

        <CreateEventDrawer
          isOpen={isCreateEventOpen}
          onClose={() => setIsCreateEventOpen(false)}
          onCreateEvent={handleCreateEvent}
        />

        <CreateStudyRoomDrawer
          isOpen={isCreateRoomOpen}
          onClose={() => setIsCreateRoomOpen(false)}
          onCreateRoom={handleCreateRoom}
        />

        <CreatePostDrawer
          isOpen={isCreatePostOpen}
          onClose={() => setIsCreatePostOpen(false)}
          onCreatePost={handleCreatePost}
        />

        <CreatePollDrawer
          isOpen={isCreatePollOpen}
          onClose={() => setIsCreatePollOpen(false)}
          onCreatePoll={handleCreatePoll}
        />
      </SafeAreaView>
    </SwipeGestureWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  quickPostContainer: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickPostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  quickPostInputContainer: {
    flex: 1,
  },
  quickPostInput: {
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  quickPostActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickPostAction: {
    padding: 8,
  },
  postButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storiesContainer: {
    marginBottom: 8,
  },
  storiesList: {
    paddingVertical: 12,
  },
  storyContainer: {
    alignItems: 'center',
    marginRight: 8,
    width: 72,
  },
  storyRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    padding: 2,
    marginBottom: 4,
  },
  storyAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  addStoryButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  storyName: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    width: '100%',
  },
  postCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  repostedByContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 6,
  },
  repostedByAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  repostedByText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 12,
    position: 'relative',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  userName: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
  },
  verifiedBadge: {
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    gap: 4,
  },
  connectText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#3B82F6',
  },
  userMeta: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    marginTop: 1,
  },
  moreButton: {
    padding: 8,
    borderRadius: 20,
  },
  postContent: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  hashtag: {
    fontFamily: 'Inter-SemiBold',
  },
  mention: {
    fontFamily: 'Inter-SemiBold',
  },
  imageGrid: {
    paddingHorizontal: 16,
    gap: 4,
    marginBottom: 12,
  },
  singleImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  multipleImage: {
    flex: 1,
    height: 200,
    borderRadius: 12,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 16,
  },
  primaryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  secondaryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  createFab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
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
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  createMenuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    zIndex: 999,
    paddingBottom: 90,
    paddingRight: 20,
  },
  createMenu: {
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
    minWidth: 160,
  },
  createMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 12,
  },
  createMenuIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createMenuText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});
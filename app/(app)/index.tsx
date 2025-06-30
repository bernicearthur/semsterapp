import React, { useState, useCallback, useRef, useMemo } from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, Alert, Share, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircle, Repeat2, Share2, Bookmark as BookmarkIcon, MoveVertical as MoreVertical, Heart, Camera, UserPlus, Flag, Copy, Link, UserMinus, X, AtSign } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SwipeGestureWrapper } from '@/components/SwipeGestureWrapper';
import { useTheme } from '@/context/ThemeContext';
import { PostDetailsDrawer } from '@/components/drawers/PostDetailsDrawer';
import { StoryViewerDrawer } from '@/components/drawers/StoryViewerDrawer';
import { CreateStoryDrawer } from '@/components/drawers/CreateStoryDrawer';
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
  {
    id: 's5',
    user: {
      name: 'Ama Serwaa',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100',
      hasUnseenStory: true,
    },
    content: {
      type: 'text',
      text: 'Beautiful sunset at campus today! 🌅',
      backgroundColor: '#F59E0B',
      textColor: '#FFFFFF',
    },
    timestamp: '8h',
    views: 67,
    isViewed: false,
  },
  {
    id: 's6',
    user: {
      name: 'Yaw Darko',
      avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=100',
      hasUnseenStory: true,
    },
    content: {
      type: 'image',
      url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
    timestamp: '12h',
    views: 89,
    isViewed: true,
  },
  {
    id: 's7',
    user: {
      name: 'Akua Manu',
      avatar: 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=100',
      hasUnseenStory: true,
    },
    content: {
      type: 'text',
      text: 'Study group session was so productive! 📚✨',
      backgroundColor: '#10B981',
      textColor: '#FFFFFF',
    },
    timestamp: '1d',
    views: 23,
    isViewed: false,
  },
  {
    id: 's8',
    user: {
      name: 'Kojo Annan',
      avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=100',
      hasUnseenStory: true,
    },
    content: {
      type: 'image',
      url: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
    timestamp: '1d',
    views: 156,
    isViewed: true,
  },
  {
    id: 's9',
    user: {
      name: 'Efua Mensah',
      avatar: 'https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=100',
      hasUnseenStory: true,
    },
    content: {
      type: 'text',
      text: 'Grateful for all the amazing friends I\'ve made this year! 💕',
      backgroundColor: '#EC4899',
      textColor: '#FFFFFF',
    },
    timestamp: '1d',
    views: 78,
    isViewed: false,
  }
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

  const renderPost = useCallback(({ item: post }) => {
    const postInteractions = interactions[post.id] || { liked: false, bookmarked: false, reposted: false };

    return (
      <Animated.View 
        entering={FadeIn.duration(400)}
        style={{ backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }}
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
                  color={postInteractions.liked ? '#EF4444' : isDark ? '#9CA3AF' : '#6B7280'}
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
                  color={postInteractions.reposted ? '#10B981' : isDark ? '#9CA3AF' : '#6B7280'}
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
        <View style={[styles.divider, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]} />
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
  ), [isDark, StoryCircle, stories]);

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
      </SafeAreaView>
    </SwipeGestureWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
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
  divider: {
    height: 1,
    marginTop: 8,
  },
});
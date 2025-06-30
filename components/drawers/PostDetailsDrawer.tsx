import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Dimensions, TextInput, KeyboardAvoidingView, Platform, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Heart, MessageCircle, Repeat2, Share2, Bookmark, MoveVertical as MoreVertical, Send, Camera, Smile, Flag, UserX, Copy, Link, UserPlus } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  runOnJS,
  withTiming,
  interpolate
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { router } from 'expo-router';

interface Post {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    role: string;
    course?: string;
    department?: string;
    graduationYear?: number;
    year?: number;
    isOfficial?: boolean;
    isConnected?: boolean;
  };
  content: string;
  images?: string[];
  timestamp: string;
  likes: number;
  comments: number;
  reposts: number;
  shares: number;
  bookmarks: number;
  isPinned?: boolean;
  repostedBy?: {
    name: string;
    avatar: string;
  } | null;
}

interface Comment {
  id: string;
  user: {
    name: string;
    avatar: string;
    verified?: boolean;
  };
  text: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
  replies?: Comment[];
}

interface PostDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
  onToggleInteraction: (postId: string, type: 'liked' | 'bookmarked' | 'reposted') => void;
  interactions?: {
    liked?: boolean;
    bookmarked?: boolean;
    reposted?: boolean;
  };
}

const sampleComments: Comment[] = [
  {
    id: '1',
    user: {
      name: 'Sarah Chen',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
      verified: true,
    },
    text: 'This is really insightful! Thanks for sharing your perspective on this topic.',
    timestamp: '2h',
    likes: 12,
    isLiked: false,
  },
  {
    id: '2',
    user: {
      name: 'Michael Brown',
      avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
    text: 'I completely agree with your points. Have you considered the implications for our upcoming project?',
    timestamp: '1h',
    likes: 8,
    isLiked: true,
    replies: [
      {
        id: '2-1',
        user: {
          name: 'Alex Johnson',
          avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
        },
        text: 'Great question! I think we should definitely discuss this in our next meeting.',
        timestamp: '45m',
        likes: 3,
      },
    ],
  },
  {
    id: '3',
    user: {
      name: 'Emma Wilson',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
    text: 'Could you share more resources about this? I\'d love to learn more! 📚',
    timestamp: '30m',
    likes: 5,
    isLiked: false,
  },
];

export function PostDetailsDrawer({ isOpen, onClose, post, onToggleInteraction, interactions = {} }: PostDetailsDrawerProps) {
  const { isDark } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const [comments, setComments] = useState<Comment[]>(sampleComments);
  const [newComment, setNewComment] = useState('');
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [commentLikes, setCommentLikes] = useState<Record<string, boolean>>({});
  const scrollViewRef = useRef<ScrollView>(null);
  
  const translateX = useSharedValue(screenWidth);
  const moreOptionsOpacity = useSharedValue(0);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const moreOptionsStyle = useAnimatedStyle(() => ({
    opacity: moreOptionsOpacity.value,
    transform: [{ 
      translateY: interpolate(moreOptionsOpacity.value, [0, 1], [20, 0])
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

  const toggleMoreOptions = () => {
    setShowMoreOptions(!showMoreOptions);
    moreOptionsOpacity.value = withTiming(showMoreOptions ? 0 : 1);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        user: {
          name: 'You',
          avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
        },
        text: newComment.trim(),
        timestamp: 'now',
        likes: 0,
        isLiked: false,
      };
      
      setComments(prev => [...prev, comment]);
      setNewComment('');
      
      // Scroll to bottom to show new comment
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleCommentLike = (commentId: string) => {
    setCommentLikes(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const handleSharePost = async () => {
    if (post) {
      try {
        await Share.share({
          message: `Check out this post by ${post.user.name}: ${post.content}`,
          title: 'Share Post',
        });
      } catch (error) {
        console.error('Error sharing post:', error);
      }
    }
  };

  const handleCopyLink = () => {
    // In a real app, this would copy the actual post URL
    Alert.alert('Link Copied', 'Post link copied to clipboard');
  };

  const handleReportPost = () => {
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
  };

  const handleBlockUser = () => {
    Alert.alert(
      'Block User',
      `Are you sure you want to block ${post?.user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Block', style: 'destructive', onPress: () => Alert.alert('Blocked', `${post?.user.name} has been blocked`) },
      ]
    );
  };

  const handleUserNamePress = () => {
    router.push('/profile-tab');
    onClose();
  };

  const handleConnectPress = () => {
    if (post) {
      Alert.alert('Connection Request Sent', `Your connection request has been sent to ${post.user.name}.`);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const renderUserMeta = (user: Post['user']) => {
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

  const renderHashtags = (content: string) => {
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
      }
      return word + ' ';
    });
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <View key={comment.id} style={[styles.commentContainer, isReply && styles.replyContainer]}>
      <Image source={{ uri: comment.user.avatar }} style={styles.commentAvatar} />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <View style={styles.commentUserInfo}>
            <Text style={[styles.commentUserName, { color: isDark ? '#FFFFFF' : '#111827' }]}>
              {comment.user.name}
            </Text>
            {comment.user.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓</Text>
              </View>
            )}
            <Text style={[styles.commentTimestamp, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              • {comment.timestamp}
            </Text>
          </View>
        </View>
        
        <Text style={[styles.commentText, { color: isDark ? '#E5E7EB' : '#1F2937' }]}>
          {comment.text}
        </Text>
        
        <View style={styles.commentActions}>
          <TouchableOpacity 
            style={styles.commentAction}
            onPress={() => handleCommentLike(comment.id)}
          >
            <Heart 
              size={16} 
              color={(comment.isLiked || commentLikes[comment.id]) ? '#EF4444' : (isDark ? '#9CA3AF' : '#6B7280')}
              fill={(comment.isLiked || commentLikes[comment.id]) ? '#EF4444' : 'none'}
            />
            <Text style={[
              styles.commentActionText,
              { 
                color: (comment.isLiked || commentLikes[comment.id]) ? 
                  '#EF4444' : 
                  (isDark ? '#9CA3AF' : '#6B7280')
              }
            ]}>
              {comment.likes + ((comment.isLiked || commentLikes[comment.id]) ? 1 : 0)}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.commentAction}>
            <MessageCircle size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
            <Text style={[styles.commentActionText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Reply
            </Text>
          </TouchableOpacity>
        </View>
        
        {comment.replies && comment.replies.map(reply => renderComment(reply, true))}
      </View>
    </View>
  );

  if (!isOpen || !post) return null;

  return (
    <View style={[StyleSheet.absoluteFill, styles.container]}>
      <GestureDetector gesture={gesture}>
        <Animated.View 
          style={[
            styles.drawer,
            { backgroundColor: isDark ? '#0F172A' : '#FFFFFF', width: screenWidth, height: screenHeight },
            drawerStyle,
          ]}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}
            >
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.headerButton}>
                  <X size={24} color={isDark ? '#E5E7EB' : '#4B5563'} />
                </TouchableOpacity>
                
                <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Post
                </Text>
                
                <TouchableOpacity style={styles.headerButton} onPress={toggleMoreOptions}>
                  <MoreVertical size={24} color={isDark ? '#E5E7EB' : '#4B5563'} />
                </TouchableOpacity>
              </View>

              <ScrollView 
                ref={scrollViewRef}
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
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
                
                {/* Post Content */}
                <View style={[styles.postContainer, { backgroundColor: isDark ? '#0F172A' : '#FFFFFF' }]}>
                  {post.isPinned && (
                    <View style={styles.pinnedBadge}>
                      <Text style={styles.pinnedText}>📌 Pinned</Text>
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
                          <Text style={styles.timestamp}> • {post.timestamp}</Text>
                          
                          {!post.user.isConnected && (
                            <TouchableOpacity 
                              style={styles.connectButton}
                              onPress={handleConnectPress}
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
                            post.images!.length === 1 ? styles.singleImage : styles.multipleImage
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
                        onPress={() => onToggleInteraction(post.id, 'liked')}
                      >
                        <Heart
                          size={22}
                          color={interactions.liked ? '#EF4444' : (isDark ? '#9CA3AF' : '#6B7280')}
                          fill={interactions.liked ? '#EF4444' : 'none'}
                        />
                        <Text 
                          style={[
                            styles.actionText,
                            { 
                              color: interactions.liked ? 
                                '#EF4444' : 
                                (isDark ? '#9CA3AF' : '#6B7280')
                            }
                          ]}
                        >
                          {formatNumber(post.likes + (interactions.liked ? 1 : 0))}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.actionButton}>
                        <MessageCircle
                          size={22}
                          color={isDark ? '#9CA3AF' : '#6B7280'}
                        />
                        <Text style={[styles.actionText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                          {formatNumber(post.comments + comments.length)}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => onToggleInteraction(post.id, 'reposted')}
                      >
                        <Repeat2
                          size={22}
                          color={interactions.reposted ? '#10B981' : (isDark ? '#9CA3AF' : '#6B7280')}
                        />
                        <Text 
                          style={[
                            styles.actionText,
                            { 
                              color: interactions.reposted ? 
                                '#10B981' : 
                                (isDark ? '#9CA3AF' : '#6B7280')
                            }
                          ]}
                        >
                          {formatNumber(post.reposts + (interactions.reposted ? 1 : 0))}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.secondaryActions}>
                      <TouchableOpacity style={styles.actionButton} onPress={handleSharePost}>
                        <Share2
                          size={22}
                          color={isDark ? '#9CA3AF' : '#6B7280'}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => onToggleInteraction(post.id, 'bookmarked')}
                      >
                        <Bookmark
                          size={22}
                          color={interactions.bookmarked ? '#F59E0B' : (isDark ? '#9CA3AF' : '#6B7280')}
                          fill={interactions.bookmarked ? '#F59E0B' : 'none'}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Comments Section */}
                <View style={[styles.commentsSection, { backgroundColor: isDark ? '#0F172A' : '#FFFFFF' }]}>
                  <Text style={[styles.commentsTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    Comments ({comments.length})
                  </Text>
                  
                  {comments.map(comment => renderComment(comment))}
                </View>
              </ScrollView>

              {/* Comment Input */}
              <View style={[styles.commentInputContainer, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}>
                <View style={[styles.commentInputWrapper, { backgroundColor: isDark ? '#0F172A' : '#FFFFFF' }]}>
                  <Image 
                    source={{ uri: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100' }}
                    style={styles.commentInputAvatar}
                  />
                  <TextInput
                    style={[styles.commentInput, { color: isDark ? '#E5E7EB' : '#1F2937' }]}
                    placeholder="Add a comment..."
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={newComment}
                    onChangeText={setNewComment}
                    multiline
                  />
                  <View style={styles.commentInputActions}>
                    <TouchableOpacity style={styles.commentInputButton}>
                      <Camera size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.commentInputButton}>
                      <Smile size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity 
                  style={[
                    styles.sendCommentButton,
                    { opacity: newComment.trim() ? 1 : 0.5 }
                  ]}
                  onPress={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  <Send size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* More Options Menu */}
              {showMoreOptions && (
                <Animated.View 
                  style={[
                    styles.moreOptionsMenu,
                    { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' },
                    moreOptionsStyle
                  ]}
                >
                  <TouchableOpacity 
                    style={styles.moreOptionItem}
                    onPress={() => {
                      setShowMoreOptions(false);
                      moreOptionsOpacity.value = withTiming(0);
                      handleCopyLink();
                    }}
                  >
                    <Copy size={20} color={isDark ? '#E5E7EB' : '#4B5563'} />
                    <Text style={[styles.moreOptionText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                      Copy Link
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.moreOptionItem}
                    onPress={() => {
                      setShowMoreOptions(false);
                      moreOptionsOpacity.value = withTiming(0);
                      handleReportPost();
                    }}
                  >
                    <Flag size={20} color="#F59E0B" />
                    <Text style={[styles.moreOptionText, { color: '#F59E0B' }]}>
                      Report Post
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.moreOptionItem}
                    onPress={() => {
                      setShowMoreOptions(false);
                      moreOptionsOpacity.value = withTiming(0);
                      handleBlockUser();
                    }}
                  >
                    <UserX size={20} color="#EF4444" />
                    <Text style={[styles.moreOptionText, { color: '#EF4444' }]}>
                      Block User
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
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
    justifyContent: 'space-between',
    padding: 16,
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
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
  postContainer: {
    padding: 16,
  },
  pinnedBadge: {
    marginBottom: 12,
  },
  pinnedText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#3B82F6',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    fontSize: 16,
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
    fontSize: 14,
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
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  postContent: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    marginBottom: 16,
  },
  hashtag: {
    fontFamily: 'Inter-SemiBold',
  },
  imageGrid: {
    gap: 8,
    marginBottom: 16,
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
  commentsSection: {
    padding: 16,
  },
  commentsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  replyContainer: {
    marginLeft: 40,
    marginTop: 12,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    marginBottom: 4,
  },
  commentUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentUserName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  commentTimestamp: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginLeft: 4,
  },
  commentText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 16,
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentActionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 8,
  },
  commentInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 48,
  },
  commentInputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  commentInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    maxHeight: 100,
    textAlignVertical: 'center',
  },
  commentInputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentInputButton: {
    padding: 4,
  },
  sendCommentButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreOptionsMenu: {
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
    minWidth: 180,
  },
  moreOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  moreOptionText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
});
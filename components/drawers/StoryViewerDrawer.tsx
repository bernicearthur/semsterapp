import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Dimensions, TextInput, Alert, Animated as RNAnimated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Heart, Send, MoveVertical as MoreVertical, Volume2, VolumeX, Pause, Play } from 'lucide-react-native';
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

interface Story {
  id: string;
  user: {
    name: string;
    avatar: string;
    hasUnseenStory?: boolean;
    verified?: boolean;
  };
  content: {
    type: 'image' | 'text' | 'video';
    url?: string;
    text?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  timestamp: string;
  views: number;
  isViewed: boolean;
  duration?: number; // in seconds
}

interface StoryViewerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  stories: Story[];
  initialStoryIndex?: number;
  currentUser?: {
    name: string;
    avatar: string;
  };
}

const STORY_DURATION = 5000; // 5 seconds per story

export function StoryViewerDrawer({ 
  isOpen, 
  onClose, 
  stories, 
  initialStoryIndex = 0,
  currentUser 
}: StoryViewerDrawerProps) {
  const { isDark } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [storyLikes, setStoryLikes] = useState<Record<string, boolean>>({});
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  
  const progressAnimations = useRef<RNAnimated.Value[]>([]);
  const storyTimer = useRef<NodeJS.Timeout>();
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const moreOptionsOpacity = useSharedValue(0);
  
  const currentStory = stories[currentStoryIndex];
  
  // Initialize progress animations
  useEffect(() => {
    progressAnimations.current = stories.map(() => new RNAnimated.Value(0));
  }, [stories]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value }
    ],
  }));

  const moreOptionsStyle = useAnimatedStyle(() => ({
    opacity: moreOptionsOpacity.value,
    transform: [{ 
      translateY: interpolate(moreOptionsOpacity.value, [0, 1], [20, 0])
    }],
  }));

  // Vertical swipe to close
  const verticalGesture = Gesture.Pan()
    .activeOffsetY([-15, 15])
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > screenHeight * 0.3 || event.velocityY > 500) {
        translateY.value = withSpring(screenHeight, {
          damping: 20,
          stiffness: 90,
          mass: 0.4,
        }, () => {
          runOnJS(onClose)();
        });
      } else {
        translateY.value = withSpring(0, {
          damping: 20,
          stiffness: 90,
          mass: 0.4,
        });
      }
    });

  // Horizontal swipe for navigation
  const horizontalGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (event.translationX < -screenWidth * 0.2 || event.velocityX < -500) {
        // Swipe left to next story
        if (currentStoryIndex < stories.length - 1) {
          translateX.value = withSpring(-screenWidth, {
            damping: 20,
            stiffness: 90,
            mass: 0.4,
          }, () => {
            translateX.value = 0;
            runOnJS(setCurrentStoryIndex)(currentStoryIndex + 1);
          });
        } else {
          translateX.value = withSpring(0);
        }
      } else if (event.translationX > screenWidth * 0.2 || event.velocityX > 500) {
        // Swipe right to previous story
        if (currentStoryIndex > 0) {
          translateX.value = withSpring(screenWidth, {
            damping: 20,
            stiffness: 90,
            mass: 0.4,
          }, () => {
            translateX.value = 0;
            runOnJS(setCurrentStoryIndex)(currentStoryIndex - 1);
          });
        } else {
          translateX.value = withSpring(0);
        }
      } else {
        translateX.value = withSpring(0);
      }
    });

  // Combine gestures
  const combinedGestures = Gesture.Simultaneous(verticalGesture, horizontalGesture);

  React.useEffect(() => {
    translateY.value = withSpring(isOpen ? 0 : screenHeight, {
      damping: 20,
      stiffness: 90,
      mass: 0.4,
    });
    translateX.value = 0;
  }, [isOpen]);

  const startStoryProgress = () => {
    if (isPaused || !isOpen) return;
    
    const progressValue = progressAnimations.current[currentStoryIndex];
    progressValue.setValue(0);
    
    RNAnimated.timing(progressValue, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !isPaused) {
        nextStory();
      }
    });
  };

  const pauseStoryProgress = () => {
    progressAnimations.current[currentStoryIndex]?.stopAnimation();
  };

  const nextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const previousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleLike = () => {
    if (currentStory) {
      setStoryLikes(prev => ({
        ...prev,
        [currentStory.id]: !prev[currentStory.id]
      }));
    }
  };

  const handleReply = () => {
    if (replyText.trim()) {
      Alert.alert('Reply Sent', `Your reply "${replyText}" has been sent to ${currentStory?.user.name}`);
      setReplyText('');
      setShowReplyInput(false);
    }
  };

  const handleMoreOptions = () => {
    setShowMoreOptions(!showMoreOptions);
    moreOptionsOpacity.value = withTiming(showMoreOptions ? 0 : 1);
  };

  const handleReport = () => {
    Alert.alert(
      'Report Story',
      'Why are you reporting this story?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Inappropriate Content', onPress: () => Alert.alert('Reported', 'Thank you for your report') },
        { text: 'Spam', onPress: () => Alert.alert('Reported', 'Thank you for your report') },
        { text: 'False Information', onPress: () => Alert.alert('Reported', 'Thank you for your report') },
      ]
    );
    setShowMoreOptions(false);
    moreOptionsOpacity.value = withTiming(0);
  };

  const handleBlock = () => {
    Alert.alert(
      'Block User',
      `Are you sure you want to block ${currentStory?.user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Block', style: 'destructive', onPress: () => {
          Alert.alert('Blocked', `${currentStory?.user.name} has been blocked`);
          onClose();
        }},
      ]
    );
    setShowMoreOptions(false);
    moreOptionsOpacity.value = withTiming(0);
  };

  // Start story progress when story changes or component mounts
  useEffect(() => {
    if (isOpen && currentStory) {
      startStoryProgress();
    }
    
    return () => {
      if (storyTimer.current) {
        clearTimeout(storyTimer.current);
      }
      pauseStoryProgress();
    };
  }, [currentStoryIndex, isOpen, isPaused]);

  // Pause/resume based on isPaused state
  useEffect(() => {
    if (isPaused) {
      pauseStoryProgress();
    } else if (isOpen) {
      startStoryProgress();
    }
  }, [isPaused]);

  if (!isOpen || !currentStory) return null;

  return (
    <View style={[StyleSheet.absoluteFill, styles.container]}>
      <GestureDetector gesture={combinedGestures}>
        <Animated.View 
          style={[
            styles.drawer,
            { backgroundColor: isDark ? '#0F172A' : '#000000', width: screenWidth, height: screenHeight },
            drawerStyle,
          ]}
        >
          <SafeAreaView style={{ flex: 1 }}>
            {/* Progress Bars */}
            <View style={styles.progressContainer}>
              {stories.map((_, index) => (
                <View key={index} style={styles.progressBarBackground}>
                  <RNAnimated.View
                    style={[
                      styles.progressBar,
                      {
                        width: progressAnimations.current[index]?.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }) || '0%',
                        backgroundColor: index < currentStoryIndex ? '#FFFFFF' : 
                                       index === currentStoryIndex ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)',
                      }
                    ]}
                  />
                </View>
              ))}
            </View>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.userInfo}>
                <Image source={{ uri: currentStory.user.avatar }} style={styles.userAvatar} />
                <View style={styles.userDetails}>
                  <View style={styles.userNameRow}>
                    <Text style={styles.userName}>{currentStory.user.name}</Text>
                    {currentStory.user.verified && (
                      <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedText}>✓</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.timestamp}>{currentStory.timestamp}</Text>
                </View>
              </View>
              
              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.headerButton} onPress={togglePause}>
                  {isPaused ? (
                    <Play size={24} color="#FFFFFF" />
                  ) : (
                    <Pause size={24} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
                
                {currentStory.content.type === 'video' && (
                  <TouchableOpacity style={styles.headerButton} onPress={toggleMute}>
                    {isMuted ? (
                      <VolumeX size={24} color="#FFFFFF" />
                    ) : (
                      <Volume2 size={24} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity style={styles.headerButton} onPress={handleMoreOptions}>
                  <MoreVertical size={24} color="#FFFFFF" />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.headerButton} onPress={onClose}>
                  <X size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Story Content */}
            <View style={styles.storyContent}>
              {/* Navigation Areas */}
              <TouchableOpacity 
                style={[styles.navigationArea, styles.leftNavigation]}
                onPress={previousStory}
                activeOpacity={0.7}
              />
              
              <TouchableOpacity 
                style={[styles.navigationArea, styles.rightNavigation]}
                onPress={nextStory}
                activeOpacity={0.7}
              />

              {/* Content Display */}
              {currentStory.content.type === 'image' && currentStory.content.url && (
                <Image 
                  source={{ uri: currentStory.content.url }} 
                  style={styles.storyImage}
                  resizeMode="cover"
                />
              )}
              
              {currentStory.content.type === 'text' && (
                <View style={[
                  styles.textStoryContainer,
                  { backgroundColor: currentStory.content.backgroundColor || '#3B82F6' }
                ]}>
                  <Text style={[
                    styles.textStoryContent,
                    { color: currentStory.content.textColor || '#FFFFFF' }
                  ]}>
                    {currentStory.content.text}
                  </Text>
                </View>
              )}
              
              {currentStory.content.type === 'video' && currentStory.content.url && (
                <View style={styles.videoContainer}>
                  {/* Video placeholder - in a real app, use a video player component */}
                  <View style={styles.videoPlaceholder}>
                    <Text style={styles.videoPlaceholderText}>Video Story</Text>
                    <Text style={styles.videoPlaceholderSubtext}>
                      {currentStory.content.url}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Bottom Actions */}
            <View style={styles.bottomActions}>
              {!showReplyInput ? (
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.replyButton}
                    onPress={() => setShowReplyInput(true)}
                  >
                    <Send size={20} color="#FFFFFF" />
                    <Text style={styles.replyButtonText}>Send message</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.likeButton, storyLikes[currentStory.id] && styles.likeButtonActive]}
                    onPress={handleLike}
                  >
                    <Heart 
                      size={24} 
                      color={storyLikes[currentStory.id] ? "#EF4444" : "#FFFFFF"}
                      fill={storyLikes[currentStory.id] ? "#EF4444" : "none"}
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.replyInputContainer}>
                  <View style={styles.replyInputWrapper}>
                    <TextInput
                      style={styles.replyInput}
                      placeholder={`Reply to ${currentStory.user.name}...`}
                      placeholderTextColor="rgba(255, 255, 255, 0.7)"
                      value={replyText}
                      onChangeText={setReplyText}
                      autoFocus
                    />
                    <TouchableOpacity 
                      style={styles.sendReplyButton}
                      onPress={handleReply}
                    >
                      <Send size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity 
                    style={styles.cancelReplyButton}
                    onPress={() => {
                      setShowReplyInput(false);
                      setReplyText('');
                    }}
                  >
                    <X size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* More Options Menu */}
            {showMoreOptions && (
              <Animated.View 
                style={[styles.moreOptionsMenu, moreOptionsStyle]}
              >
                <TouchableOpacity style={styles.moreOptionItem} onPress={handleReport}>
                  <Text style={styles.moreOptionText}>Report Story</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.moreOptionItem} onPress={handleBlock}>
                  <Text style={[styles.moreOptionText, styles.dangerText]}>Block User</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
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
    left: 0,
    right: 0,
    bottom: 0,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 8,
    gap: 4,
  },
  progressBarBackground: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  verifiedBadge: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  timestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  storyContent: {
    flex: 1,
    position: 'relative',
  },
  navigationArea: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '50%',
    zIndex: 10,
  },
  leftNavigation: {
    left: 0,
  },
  rightNavigation: {
    right: 0,
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  textStoryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  textStoryContent: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    lineHeight: 32,
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholder: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  videoPlaceholderText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  videoPlaceholderSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  bottomActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  replyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    gap: 8,
  },
  replyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  likeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeButtonActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  replyInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  replyInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    paddingVertical: 8,
  },
  sendReplyButton: {
    padding: 8,
  },
  cancelReplyButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreOptionsMenu: {
    position: 'absolute',
    top: 80,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    padding: 8,
    minWidth: 150,
  },
  moreOptionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  moreOptionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  dangerText: {
    color: '#EF4444',
  },
});
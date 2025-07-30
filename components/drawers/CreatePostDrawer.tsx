import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, Dimensions, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Camera, Image as ImageIcon, Paperclip, AtSign, Hash, MapPin, Smile, Globe, Users, Lock } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  runOnJS
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface CreatePostDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePost: (postData: {
    content: string;
    images?: string[];
    location?: string;
    audience: string;
  }) => void;
}

export function CreatePostDrawer({ isOpen, onClose, onCreatePost }: CreatePostDrawerProps) {
  const { isDark } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const [isExtended, setIsExtended] = useState(false);
  
  const [postContent, setPostContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [selectedAudience, setSelectedAudience] = useState<'public' | 'connections' | 'course' | 'yeargroup'>('public');
  const [showAudienceModal, setShowAudienceModal] = useState(false);
  
  const translateY = useSharedValue(screenHeight);
  const drawerHeight = useSharedValue(0.85);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    height: `${drawerHeight.value * 100}%`,
  }));

  const dragHandleGesture = Gesture.Pan()
    .activeOffsetY([0, 15])
    .onUpdate((event) => {
      if (isExtended) {
        if (event.translationY > 0) {
          const progress = Math.min(event.translationY / (screenHeight * 0.15), 1);
          drawerHeight.value = 1 - (progress * 0.15);
        }
      } else {
        if (event.translationY < 0) {
          const progress = Math.min(Math.abs(event.translationY) / (screenHeight * 0.15), 1);
          drawerHeight.value = 0.85 + (progress * 0.15);
        } else if (event.translationY > 0) {
          translateY.value = event.translationY;
        }
      }
    })
    .onEnd((event) => {
      if (isExtended) {
        if (event.translationY > screenHeight * 0.1 || event.velocityY > 500) {
          drawerHeight.value = withSpring(0.85);
          runOnJS(setIsExtended)(false);
        } else {
          drawerHeight.value = withSpring(1);
        }
      } else {
        if (event.translationY < -screenHeight * 0.1 || event.velocityY < -500) {
          drawerHeight.value = withSpring(1);
          runOnJS(setIsExtended)(true);
        } else if (event.translationY > screenHeight * 0.3 || event.velocityY > 500) {
          translateY.value = withSpring(screenHeight, {
            damping: 20,
            stiffness: 90,
            mass: 0.4,
          }, () => {
            runOnJS(onClose)();
          });
        } else {
          translateY.value = withSpring(0);
          drawerHeight.value = withSpring(0.85);
        }
      }
    });

  React.useEffect(() => {
    translateY.value = withSpring(isOpen ? 0 : screenHeight, {
      damping: 20,
      stiffness: 90,
      mass: 0.4,
    });
    
    if (!isOpen) {
      setIsExtended(false);
      drawerHeight.value = 0.85;
    }
  }, [isOpen]);

  const handleCreatePost = () => {
    if (postContent.trim() === '') {
      Alert.alert('Empty Post', 'Please write something before posting.');
      return;
    }

    const postData = {
      content: postContent.trim(),
      images: selectedImages.length > 0 ? selectedImages : undefined,
      location: location.trim() || undefined,
      audience: selectedAudience,
    };

    onCreatePost(postData);
    
    // Reset form
    setPostContent('');
    setSelectedImages([]);
    setLocation('');
    setSelectedAudience('public');
    
    onClose();
  };

  const handleAddImage = () => {
    // Simulate adding an image
    const sampleImages = [
      'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
    ];
    
    const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
    setSelectedImages([...selectedImages, randomImage]);
  };

  const audienceOptions = [
    {
      id: 'public',
      icon: <Globe size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />,
      title: 'Public',
      description: 'Anyone can see this post',
    },
    {
      id: 'connections',
      icon: <Users size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />,
      title: 'Connections',
      description: 'Only your connections can see this post',
    },
  ];

  const getAudienceIcon = () => {
    switch (selectedAudience) {
      case 'public':
        return <Globe size={22} color={isDark ? '#60A5FA' : '#3B82F6'} />;
      case 'connections':
        return <Users size={22} color={isDark ? '#60A5FA' : '#3B82F6'} />;
      default:
        return <Globe size={22} color={isDark ? '#60A5FA' : '#3B82F6'} />;
    }
  };

  const getAudienceTitle = () => {
    switch (selectedAudience) {
      case 'public':
        return 'Public';
      case 'connections':
        return 'Connections';
      default:
        return 'Public';
    }
  };

  if (!isOpen) return null;

  return (
    <View style={[StyleSheet.absoluteFill, styles.container]}>
      <TouchableOpacity 
        style={[StyleSheet.absoluteFill, styles.overlay]}
        activeOpacity={1}
        onPress={onClose}
      />
      <GestureDetector gesture={dragHandleGesture}>
        <Animated.View 
          style={[
            styles.drawer,
            { backgroundColor: isDark ? '#0F172A' : '#FFFFFF', width: screenWidth },
            drawerStyle,
          ]}
        >
          <SafeAreaView style={{ flex: 1 }}>
            {/* Drag Handle */}
            <View style={styles.dragHandle}>
              <View style={[styles.dragIndicator, { backgroundColor: isDark ? '#4B5563' : '#D1D5DB' }]} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.headerButton}>
                <X size={24} color={isDark ? '#E5E7EB' : '#4B5563'} />
              </TouchableOpacity>
              
              <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Create Post
              </Text>
              
              <TouchableOpacity
                style={[styles.audienceSelector, { backgroundColor: isDark ? '#0F172A' : '#F3F4F6' }]}
                onPress={() => setShowAudienceModal(true)}
              >
                {getAudienceIcon()}
                <Text style={[styles.audienceText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                  {getAudienceTitle()}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {/* Post Content */}
              <View style={styles.section}>
                <TextInput
                  style={[
                    styles.postInput,
                    { backgroundColor: isDark ? '#1E293B' : '#F9FAFB', color: isDark ? '#E5E7EB' : '#1F2937' }
                  ]}
                  placeholder="What's on your mind?"
                  placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                  value={postContent}
                  onChangeText={setPostContent}
                  multiline
                  autoFocus
                />
              </View>

              {/* Media Attachments */}
              {selectedImages.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    Attached Images
                  </Text>
                  <View style={styles.imagesContainer}>
                    {selectedImages.map((image, index) => (
                      <View key={index} style={styles.imagePreview}>
                        <Text style={[styles.imagePreviewText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                          Image {index + 1}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Location */}
              {location && (
                <View style={styles.section}>
                  <View style={styles.locationContainer}>
                    <MapPin size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    <Text style={[styles.locationText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                      {location}
                    </Text>
                  </View>
                </View>
              )}

              {/* Actions */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.actionButton} onPress={handleAddImage}>
                  <ImageIcon size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />
                  <Text style={[styles.actionText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>Photo</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton}>
                  <Camera size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />
                  <Text style={[styles.actionText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>Camera</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton}>
                  <MapPin size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />
                  <Text style={[styles.actionText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>Location</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton}>
                  <AtSign size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />
                  <Text style={[styles.actionText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>Tag</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}>
              <TouchableOpacity 
                style={[
                  styles.postButton, 
                  { 
                    backgroundColor: postContent.trim() ? '#3B82F6' : (isDark ? '#374151' : '#E5E7EB'),
                    opacity: postContent.trim() ? 1 : 0.5
                  }
                ]}
                onPress={handleCreatePost}
                disabled={!postContent.trim()}
              >
                <Text style={styles.postButtonText}>Post</Text>
              </TouchableOpacity>
            </View>

            {/* Audience Modal */}
            {showAudienceModal && (
              <View style={[StyleSheet.absoluteFill, styles.modalOverlay]}>
                <TouchableOpacity
                  style={StyleSheet.absoluteFill}
                  onPress={() => setShowAudienceModal(false)}
                />
                <View style={[styles.modalContent, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
                  <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    Choose Audience
                  </Text>
                  {audienceOptions.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.audienceOption,
                        selectedAudience === option.id && styles.selectedAudienceOption,
                        { backgroundColor: isDark ? '#0F172A' : '#F3F4F6' }
                      ]}
                      onPress={() => {
                        setSelectedAudience(option.id as typeof selectedAudience);
                        setShowAudienceModal(false);
                      }}
                    >
                      <View style={styles.audienceOptionIcon}>
                        {option.icon}
                      </View>
                      <View style={styles.audienceOptionText}>
                        <Text style={[styles.audienceOptionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                          {option.title}
                        </Text>
                        <Text style={[styles.audienceOptionDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                          {option.description}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
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
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dragHandle: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
    minHeight: 40,
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
  audienceSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  audienceText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  postInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imagePreview: {
    width: 80,
    height: 80,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreviewText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  postButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    marginBottom: 16,
  },
  audienceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  selectedAudienceOption: {
    backgroundColor: '#3B82F6',
  },
  audienceOptionIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audienceOptionText: {
    flex: 1,
    marginLeft: 12,
  },
  audienceOptionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 2,
  },
  audienceOptionDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
});
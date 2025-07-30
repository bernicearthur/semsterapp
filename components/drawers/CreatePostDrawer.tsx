import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, Dimensions, Alert, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Camera, Image as ImageIcon, Send, Paperclip, AtSign, Hash } from 'lucide-react-native';
import { Globe, Users, BookOpen, GraduationCap } from 'lucide-react-native';
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
    audience: string;
  }) => void;
}

const audienceOptions = [
  {
    id: 'public',
    icon: <Globe size={24} color="#3B82F6" />,
    title: 'Public',
    description: 'Anyone can see this post',
  },
  {
    id: 'buddies',
    icon: <Users size={24} color="#3B82F6" />,
    title: 'Buddies',
    description: 'Only your buddies can see this post',
  },
  {
    id: 'course',
    icon: <BookOpen size={24} color="#3B82F6" />,
    title: 'Course',
    description: 'Only students in your course can see this post',
  },
  {
    id: 'yeargroup',
    icon: <GraduationCap size={24} color="#3B82F6" />,
    title: 'Year Group',
    description: 'Only students in your year can see this post',
  },
];

export function CreatePostDrawer({ isOpen, onClose, onCreatePost }: CreatePostDrawerProps) {
  const { isDark } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  
  const [postText, setPostText] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedAudience, setSelectedAudience] = useState<'public' | 'buddies' | 'course' | 'yeargroup'>('public');
  const [showAudienceModal, setShowAudienceModal] = useState(false);
  const [isExtended, setIsExtended] = useState(false);
  
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

  const handleAddPhoto = () => {
    const sampleImages = [
      'https://images.pexels.com/photos/3755761/pexels-photo-3755761.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
    ];
    const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
    setSelectedImages([...selectedImages, randomImage]);
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handleCreatePost = () => {
    if (!postText.trim() && selectedImages.length === 0) {
      Alert.alert('Empty Post', 'Please add some content to your post.');
      return;
    }

    const postData = {
      content: postText.trim(),
      images: selectedImages.length > 0 ? selectedImages : undefined,
      audience: selectedAudience,
    };

    onCreatePost(postData);
    
    setPostText('');
    setSelectedImages([]);
    setSelectedAudience('public');
    onClose();
  };

  const getAudienceIcon = () => {
    switch (selectedAudience) {
      case 'public':
        return <Globe size={22} color={isDark ? '#60A5FA' : '#3B82F6'} />;
      case 'buddies':
        return <Users size={22} color={isDark ? '#60A5FA' : '#3B82F6'} />;
      case 'course':
        return <BookOpen size={22} color={isDark ? '#60A5FA' : '#3B82F6'} />;
      case 'yeargroup':
        return <GraduationCap size={22} color={isDark ? '#60A5FA' : '#3B82F6'} />;
    }
  };

  const getAudienceTitle = () => {
    switch (selectedAudience) {
      case 'public':
        return 'Public';
      case 'buddies':
        return 'Buddies';
      case 'course':
        return 'Course';
      case 'yeargroup':
        return 'Year Group';
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
      
      <Animated.View style={[styles.drawer, drawerStyle, { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}>
        <SafeAreaView style={{ flex: 1 }}>
          {/* Drag Handle */}
          <GestureDetector gesture={dragHandleGesture}>
            <View style={[styles.dragHandle, { paddingVertical: 8 }]}>
              <View style={[styles.dragIndicator, { backgroundColor: isDark ? '#4B5563' : '#D1D5DB' }]} />
            </View>
          </GestureDetector>
          
          {/* Header Section */}
          <View style={[styles.headerSection, { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}>
            <View style={styles.headerContent}>
              <TouchableOpacity
                style={[styles.audienceSelector, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}
                onPress={() => setShowAudienceModal(true)}
              >
                {getAudienceIcon()}
                <Text style={[styles.audienceText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                  {getAudienceTitle()}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color={isDark ? '#E5E7EB' : '#4B5563'} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Text Input */}
            <View style={styles.textInputContainer}>
              <TextInput
                style={[
                  styles.textInput, 
                  { 
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF', 
                    color: isDark ? '#E5E7EB' : '#1F2937',
                    borderColor: isDark ? '#374151' : '#E5E7EB'
                  }
                ]}
                placeholder="What's on your mind?"
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                multiline
                value={postText}
                onChangeText={setPostText}
              />
            </View>

            {/* Selected Images */}
            {selectedImages.length > 0 && (
              <View style={styles.imagesContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {selectedImages.map((image, index) => (
                    <View key={index} style={styles.imagePreviewContainer}>
                      <Image source={{ uri: image }} style={styles.imagePreview} />
                      <TouchableOpacity 
                        style={styles.removeImageButton}
                        onPress={() => handleRemoveImage(index)}
                      >
                        <X size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Action Tools */}
            <View style={styles.actionsContainer}>
              <View style={[styles.actionButtonsRow, { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={handleAddPhoto}
                >
                  <Camera size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                  <Text style={[styles.actionText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Photo
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton}>
                  <Paperclip size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                  <Text style={[styles.actionText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    File
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton}>
                  <AtSign size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                  <Text style={[styles.actionText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Mention
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton}>
                  <Hash size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                  <Text style={[styles.actionText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Tag
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
          
          {/* Post Button at Bottom */}
          <View style={[styles.postButtonFooter, { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}>
            <TouchableOpacity 
              style={[
                styles.postButton, 
                { 
                  backgroundColor: postText.trim() || selectedImages.length > 0 ? '#3B82F6' : (isDark ? '#374151' : '#E5E7EB'),
                  opacity: postText.trim() || selectedImages.length > 0 ? 1 : 0.5
                }
              ]}
              onPress={handleCreatePost}
              disabled={!postText.trim() && selectedImages.length === 0}
            >
              <Send size={18} color="#FFFFFF" />
              <Text style={styles.postButtonText}>Post</Text>
            </TouchableOpacity>
          </View>

        </SafeAreaView>
      </Animated.View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 10000,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  dragHandle: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerLeft: {
    maxWidth: '35%',
  },
  audienceSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    maxWidth: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  audienceText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textInputContainer: {
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    minHeight: 120,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  imagesContainer: {
    marginBottom: 16,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginRight: 12,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 4,
  },
  actionsContainer: {
    marginBottom: 16,
  },
  postButtonFooter: {
    padding: 20,
    paddingTop: 16,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: 16,
    padding: 16,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  integratedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 16,
    zIndex: 15000,
  },
  modalContent: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
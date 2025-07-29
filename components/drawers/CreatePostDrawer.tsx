import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, Dimensions, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Camera, Image as ImageIcon, Send, Paperclip, AtSign, Hash } from 'lucide-react-native';
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
  }) => void;
}

export function CreatePostDrawer({ isOpen, onClose, onCreatePost }: CreatePostDrawerProps) {
  const { isDark } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  
  const [postText, setPostText] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  
  const translateY = useSharedValue(screenHeight);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const gesture = Gesture.Pan()
    .activeOffsetY([0, 15])
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

  React.useEffect(() => {
    translateY.value = withSpring(isOpen ? 0 : screenHeight, {
      damping: 20,
      stiffness: 90,
      mass: 0.4,
    });
  }, [isOpen]);

  const handleAddPhoto = () => {
    // Simulate image picker
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
    };

    onCreatePost(postData);
    
    // Reset form
    setPostText('');
    setSelectedImages([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <View style={[StyleSheet.absoluteFill, styles.container]}>
      <View style={[StyleSheet.absoluteFill, styles.overlay]} />
      <GestureDetector gesture={gesture}>
        <Animated.View 
          style={[
            styles.drawer,
            { backgroundColor: isDark ? '#0F172A' : '#FFFFFF', width: screenWidth },
            drawerStyle,
          ]}
        >
          <SafeAreaView style={{ flex: 1 }}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: isDark ? '#334155' : '#E5E7EB' }]}>
              <TouchableOpacity onPress={onClose} style={styles.headerButton}>
                <X size={24} color={isDark ? '#E5E7EB' : '#4B5563'} />
              </TouchableOpacity>
              
              <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Create Post
              </Text>
              
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

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Text Input */}
              <View style={styles.textInputContainer}>
                <TextInput
                  style={[
                    styles.textInput, 
                    { 
                      backgroundColor: isDark ? '#1E293B' : '#F9FAFB', 
                      color: isDark ? '#E5E7EB' : '#1F2937' 
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

              {/* Actions */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: isDark ? '#1E293B' : '#F3F4F6' }]}
                  onPress={handleAddPhoto}
                >
                  <Camera size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                  <Text style={[styles.actionText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Photo
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: isDark ? '#1E293B' : '#F3F4F6' }]}
                >
                  <Paperclip size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                  <Text style={[styles.actionText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    File
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: isDark ? '#1E293B' : '#F3F4F6' }]}
                >
                  <AtSign size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                  <Text style={[styles.actionText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Mention
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: isDark ? '#1E293B' : '#F3F4F6' }]}
                >
                  <Hash size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                  <Text style={[styles.actionText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Tag
                  </Text>
                </TouchableOpacity>
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
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '80%',
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
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  textInputContainer: {
    marginBottom: 20,
  },
  textInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  imagesContainer: {
    marginBottom: 20,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});
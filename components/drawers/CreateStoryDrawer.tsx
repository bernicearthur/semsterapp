import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, Dimensions, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Camera, Type, Palette, Image as ImageIcon, Video, Send, Smile, Hash, AtSign } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  runOnJS
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface CreateStoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateStory: (story: {
    type: 'image' | 'text' | 'video';
    content: {
      url?: string;
      text?: string;
      backgroundColor?: string;
      textColor?: string;
    };
  }) => void;
}

const backgroundColors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

const textColors = ['#FFFFFF', '#000000', '#3B82F6', '#EF4444', '#10B981'];

const gradients = [
  ['#667eea', '#764ba2'],
  ['#f093fb', '#f5576c'],
  ['#4facfe', '#00f2fe'],
  ['#43e97b', '#38f9d7'],
  ['#fa709a', '#fee140'],
  ['#a8edea', '#fed6e3'],
  ['#ffecd2', '#fcb69f'],
  ['#ff9a9e', '#fecfef'],
];

export function CreateStoryDrawer({ isOpen, onClose, onCreateStory }: CreateStoryDrawerProps) {
  const { isDark } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const [storyType, setStoryType] = useState<'image' | 'text' | 'video'>('text');
  const [textContent, setTextContent] = useState('');
  const [selectedBackground, setSelectedBackground] = useState(backgroundColors[0]);
  const [selectedTextColor, setSelectedTextColor] = useState(textColors[0]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
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

  const handleCreateStory = () => {
    if (storyType === 'text' && !textContent.trim()) {
      Alert.alert('Error', 'Please enter some text for your story');
      return;
    }

    if (storyType === 'image' && !selectedImage) {
      Alert.alert('Error', 'Please select an image for your story');
      return;
    }

    const storyData = {
      type: storyType,
      content: {
        ...(storyType === 'text' && {
          text: textContent,
          backgroundColor: selectedBackground,
          textColor: selectedTextColor,
        }),
        ...(storyType === 'image' && {
          url: selectedImage,
        }),
        ...(storyType === 'video' && {
          url: 'https://example.com/video.mp4', // Placeholder
        }),
      },
    };

    onCreateStory(storyData);
    
    // Reset form
    setTextContent('');
    setSelectedImage(null);
    setStoryType('text');
    
    onClose();
  };

  const handleSelectImage = () => {
    // Simulate image picker
    const sampleImages = [
      'https://images.pexels.com/photos/3755761/pexels-photo-3755761.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
    ];
    const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
    setSelectedImage(randomImage);
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
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: isDark ? '#334155' : '#E5E7EB' }]}>
              <TouchableOpacity onPress={onClose} style={styles.headerButton}>
                <X size={24} color={isDark ? '#E5E7EB' : '#4B5563'} />
              </TouchableOpacity>
              
              <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Create Story
              </Text>
              
              <TouchableOpacity 
                style={[
                  styles.createButton,
                  { 
                    backgroundColor: (storyType === 'text' && textContent.trim()) || 
                                   (storyType === 'image' && selectedImage) || 
                                   storyType === 'video' ? '#3B82F6' : (isDark ? '#374151' : '#E5E7EB'),
                    opacity: (storyType === 'text' && textContent.trim()) || 
                            (storyType === 'image' && selectedImage) || 
                            storyType === 'video' ? 1 : 0.5
                  }
                ]}
                onPress={handleCreateStory}
                disabled={!(
                  (storyType === 'text' && textContent.trim()) || 
                  (storyType === 'image' && selectedImage) || 
                  storyType === 'video'
                )}
              >
                <Send size={18} color="#FFFFFF" />
                <Text style={styles.createButtonText}>Share</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Story Type Selector */}
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    { 
                      backgroundColor: storyType === 'text' ? '#3B82F6' : (isDark ? '#374151' : '#F3F4F6'),
                      borderColor: storyType === 'text' ? '#3B82F6' : 'transparent'
                    }
                  ]}
                  onPress={() => setStoryType('text')}
                >
                  <Type size={24} color={storyType === 'text' ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#4B5563')} />
                  <Text style={[
                    styles.typeButtonText,
                    { color: storyType === 'text' ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#4B5563') }
                  ]}>
                    Text
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    { 
                      backgroundColor: storyType === 'image' ? '#3B82F6' : (isDark ? '#374151' : '#F3F4F6'),
                      borderColor: storyType === 'image' ? '#3B82F6' : 'transparent'
                    }
                  ]}
                  onPress={() => setStoryType('image')}
                >
                  <ImageIcon size={24} color={storyType === 'image' ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#4B5563')} />
                  <Text style={[
                    styles.typeButtonText,
                    { color: storyType === 'image' ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#4B5563') }
                  ]}>
                    Photo
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    { 
                      backgroundColor: storyType === 'video' ? '#3B82F6' : (isDark ? '#374151' : '#F3F4F6'),
                      borderColor: storyType === 'video' ? '#3B82F6' : 'transparent'
                    }
                  ]}
                  onPress={() => setStoryType('video')}
                >
                  <Video size={24} color={storyType === 'video' ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#4B5563')} />
                  <Text style={[
                    styles.typeButtonText,
                    { color: storyType === 'video' ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#4B5563') }
                  ]}>
                    Video
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Preview */}
              <View style={styles.previewSection}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Preview
                </Text>
                
                <View style={styles.previewContainer}>
                  {storyType === 'text' && (
                    <View style={[
                      styles.textPreview,
                      { backgroundColor: selectedBackground }
                    ]}>
                      <Text style={[
                        styles.textPreviewContent,
                        { color: selectedTextColor }
                      ]}>
                        {textContent || 'Your text will appear here...'}
                      </Text>
                    </View>
                  )}
                  
                  {storyType === 'image' && (
                    <View style={styles.imagePreview}>
                      {selectedImage ? (
                        <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                      ) : (
                        <View style={[styles.imagePlaceholder, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                          <ImageIcon size={48} color={isDark ? '#9CA3AF' : '#6B7280'} />
                          <Text style={[styles.placeholderText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                            Select an image
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                  
                  {storyType === 'video' && (
                    <View style={[styles.videoPreview, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                      <Video size={48} color={isDark ? '#9CA3AF' : '#6B7280'} />
                      <Text style={[styles.placeholderText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                        Video story ready
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Content Input */}
              {storyType === 'text' && (
                <View style={styles.textInputSection}>
                  <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    Your Message
                  </Text>
                  
                  <TextInput
                    style={[
                      styles.textInput,
                      { 
                        backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                        color: isDark ? '#E5E7EB' : '#1F2937',
                        borderColor: isDark ? '#374151' : '#E5E7EB'
                      }
                    ]}
                    placeholder="What's on your mind?"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={textContent}
                    onChangeText={setTextContent}
                    multiline
                    maxLength={200}
                  />
                  
                  <Text style={[styles.characterCount, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                    {textContent.length}/200
                  </Text>
                </View>
              )}

              {/* Background Colors (for text stories) */}
              {storyType === 'text' && (
                <View style={styles.colorSection}>
                  <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    Background Color
                  </Text>
                  
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.colorPalette}
                  >
                    {backgroundColors.map((color, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.colorOption,
                          { backgroundColor: color },
                          selectedBackground === color && styles.selectedColor
                        ]}
                        onPress={() => setSelectedBackground(color)}
                      />
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Text Colors (for text stories) */}
              {storyType === 'text' && (
                <View style={styles.colorSection}>
                  <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    Text Color
                  </Text>
                  
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.colorPalette}
                  >
                    {textColors.map((color, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.colorOption,
                          { backgroundColor: color },
                          selectedTextColor === color && styles.selectedColor,
                          color === '#FFFFFF' && { borderWidth: 1, borderColor: '#E5E7EB' }
                        ]}
                        onPress={() => setSelectedTextColor(color)}
                      />
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Image Selection (for image stories) */}
              {storyType === 'image' && (
                <View style={styles.imageSection}>
                  <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    Select Image
                  </Text>
                  
                  <View style={styles.imageActions}>
                    <TouchableOpacity 
                      style={[styles.imageActionButton, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}
                      onPress={handleSelectImage}
                    >
                      <ImageIcon size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />
                      <Text style={[styles.imageActionText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                        Choose from Gallery
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.imageActionButton, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}
                    >
                      <Camera size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />
                      <Text style={[styles.imageActionText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                        Take Photo
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Video Options (for video stories) */}
              {storyType === 'video' && (
                <View style={styles.videoSection}>
                  <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    Video Options
                  </Text>
                  
                  <View style={styles.videoActions}>
                    <TouchableOpacity 
                      style={[styles.videoActionButton, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}
                    >
                      <Video size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />
                      <Text style={[styles.videoActionText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                        Record Video
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.videoActionButton, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}
                    >
                      <ImageIcon size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />
                      <Text style={[styles.videoActionText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                        Choose from Gallery
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
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
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  typeButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  previewSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  previewContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  textPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  textPreviewContent: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    lineHeight: 28,
  },
  imagePreview: {
    flex: 1,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  videoPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  textInputSection: {
    marginBottom: 24,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    height: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'right',
    marginTop: 8,
  },
  colorSection: {
    marginBottom: 24,
  },
  colorPalette: {
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageSection: {
    marginBottom: 24,
  },
  imageActions: {
    gap: 12,
  },
  imageActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  imageActionText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  videoSection: {
    marginBottom: 24,
  },
  videoActions: {
    gap: 12,
  },
  videoActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  videoActionText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
});
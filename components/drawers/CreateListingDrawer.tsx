import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, Dimensions, Alert, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Tag, DollarSign, MapPin, Camera, Info, FileText, Trash2 } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  runOnJS
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface CreateListingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateListing: (listing: {
    title: string;
    description: string;
    price: number;
    category: string;
    condition?: string;
    location: string;
    images: string[];
  }) => void;
}

const categories = [
  'Books', 'Electronics', 'Furniture', 'Clothing', 'Sports', 'Other'
];

const conditions = [
  'New', 'Like New', 'Good', 'Used', 'For Parts'
];

export function CreateListingDrawer({ isOpen, onClose, onCreateListing }: CreateListingDrawerProps) {
  const { isDark } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isNegotiable, setIsNegotiable] = useState(false);
  
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

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setSelectedCategory('');
    setSelectedCondition('');
    setLocation('');
    setImages([]);
    setIsNegotiable(false);
  };

  const handleAddImage = () => {
    // Simulate adding an image
    const sampleImages = [
      'https://images.pexels.com/photos/5834/nature-grass-leaf-green.jpg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=800',
    ];
    
    const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
    
    if (images.length < 5) {
      setImages([...images, randomImage]);
    } else {
      Alert.alert('Maximum Images', 'You can only add up to 5 images per listing.');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleCreateListing = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your listing');
      return;
    }
    
    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description');
      return;
    }
    
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }
    
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    
    if (!location.trim()) {
      Alert.alert('Error', 'Please specify a location');
      return;
    }
    
    if (images.length === 0) {
      Alert.alert('Error', 'Please add at least one image');
      return;
    }

    const listingData = {
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category: selectedCategory,
      condition: selectedCondition || undefined,
      location: location.trim(),
      images: [...images],
    };

    onCreateListing(listingData);
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
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
              <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
                <X size={24} color={isDark ? '#E5E7EB' : '#4B5563'} />
              </TouchableOpacity>
              
              <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Create Listing
              </Text>
              
              <TouchableOpacity 
                style={[
                  styles.postButton,
                  { 
                    backgroundColor: title && description && price && selectedCategory && location && images.length > 0 ? 
                      '#3B82F6' : 
                      (isDark ? '#374151' : '#E5E7EB'),
                    opacity: title && description && price && selectedCategory && location && images.length > 0 ? 1 : 0.5
                  }
                ]}
                onPress={handleCreateListing}
                disabled={!title || !description || !price || !selectedCategory || !location || images.length === 0}
              >
                <Text style={[
                  styles.postButtonText,
                  { 
                    color: title && description && price && selectedCategory && location && images.length > 0 ? 
                      '#FFFFFF' : 
                      (isDark ? '#9CA3AF' : '#6B7280')
                  }
                ]}>
                  Post
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Images */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Photos
                </Text>
                
                <View style={styles.imagesContainer}>
                  {images.map((image, index) => (
                    <View key={index} style={styles.imagePreviewContainer}>
                      <View style={styles.imagePreview}>
                        <View style={styles.imagePreviewContent}>
                          <FileText size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />
                          <Text style={[styles.imagePreviewText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                            Image {index + 1}
                          </Text>
                        </View>
                        <TouchableOpacity 
                          style={styles.removeImageButton}
                          onPress={() => handleRemoveImage(index)}
                        >
                          <Trash2 size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                  
                  {images.length < 5 && (
                    <TouchableOpacity 
                      style={[styles.addImageButton, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}
                      onPress={handleAddImage}
                    >
                      <Camera size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />
                      <Text style={[styles.addImageText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                        Add Photo
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                <Text style={[styles.imageHint, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  Add up to 5 photos to showcase your item
                </Text>
              </View>

              {/* Basic Information */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Item Details
                </Text>
                
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Title *
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
                    placeholder="What are you selling?"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={title}
                    onChangeText={setTitle}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Description *
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      styles.textArea,
                      { 
                        backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                        color: isDark ? '#E5E7EB' : '#1F2937',
                        borderColor: isDark ? '#374151' : '#E5E7EB'
                      }
                    ]}
                    placeholder="Describe your item, including condition, features, and any other relevant details"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Category *
                  </Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesContainer}
                  >
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.categoryChip,
                          { 
                            backgroundColor: selectedCategory === category ? '#3B82F6' : (isDark ? '#374151' : '#F3F4F6'),
                            borderColor: selectedCategory === category ? '#3B82F6' : 'transparent'
                          }
                        ]}
                        onPress={() => setSelectedCategory(category)}
                      >
                        <Text style={[
                          styles.categoryChipText,
                          { color: selectedCategory === category ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#4B5563') }
                        ]}>
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Condition (Optional)
                  </Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesContainer}
                  >
                    {conditions.map((condition) => (
                      <TouchableOpacity
                        key={condition}
                        style={[
                          styles.categoryChip,
                          { 
                            backgroundColor: selectedCondition === condition ? '#3B82F6' : (isDark ? '#374151' : '#F3F4F6'),
                            borderColor: selectedCondition === condition ? '#3B82F6' : 'transparent'
                          }
                        ]}
                        onPress={() => setSelectedCondition(condition)}
                      >
                        <Text style={[
                          styles.categoryChipText,
                          { color: selectedCondition === condition ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#4B5563') }
                        ]}>
                          {condition}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Price and Location */}
              <View style={styles.section}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Price *
                  </Text>
                  <View style={styles.inputWithIcon}>
                    <DollarSign size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    <TextInput
                      style={[
                        styles.textInput,
                        { 
                          backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                          color: isDark ? '#E5E7EB' : '#1F2937',
                          borderColor: isDark ? '#374151' : '#E5E7EB'
                        }
                      ]}
                      placeholder="0.00"
                      placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                      value={price}
                      onChangeText={setPrice}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingTitle, { color: isDark ? '#E5E7EB' : '#1F2937' }]}>
                      Price Negotiable
                    </Text>
                    <Text style={[styles.settingDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                      Allow buyers to make offers
                    </Text>
                  </View>
                  <Switch
                    value={isNegotiable}
                    onValueChange={setIsNegotiable}
                    trackColor={{ false: isDark ? '#374151' : '#E5E7EB', true: '#3B82F6' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Location *
                  </Text>
                  <View style={styles.inputWithIcon}>
                    <MapPin size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    <TextInput
                      style={[
                        styles.textInput,
                        { 
                          backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                          color: isDark ? '#E5E7EB' : '#1F2937',
                          borderColor: isDark ? '#374151' : '#E5E7EB'
                        }
                      ]}
                      placeholder="Where can the buyer pick up the item?"
                      placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                      value={location}
                      onChangeText={setLocation}
                    />
                  </View>
                </View>
              </View>

              {/* Additional Information */}
              <View style={styles.section}>
                <View style={[styles.infoBox, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}>
                  <Info size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                  <Text style={[styles.infoText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Your listing will be reviewed before being published. Make sure it follows our community guidelines.
                  </Text>
                </View>
              </View>

              <View style={{ height: 40 }} />
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
  postButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  imagePreviewContainer: {
    width: '48%',
    aspectRatio: 1,
  },
  imagePreview: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  imagePreviewContent: {
    alignItems: 'center',
    gap: 8,
  },
  imagePreviewText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  addImageText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  imageHint: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoriesContainer: {
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    flex: 1,
    lineHeight: 20,
  },
});
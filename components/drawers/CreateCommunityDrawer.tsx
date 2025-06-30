import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Camera, Globe, Lock, Users, Hash, BookOpen } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  runOnJS
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface CreateCommunityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  'Academic', 'Sports', 'Arts', 'Technology', 'Business',
  'Social', 'Gaming', 'Music', 'Health', 'Other'
];

const features = [
  {
    id: 'discussions',
    icon: <Users size={24} color="#3B82F6" />,
    title: 'Discussion Forums',
    description: 'Enable threaded discussions',
  },
  {
    id: 'channels',
    icon: <Hash size={24} color="#3B82F6" />,
    title: 'Channels',
    description: 'Create topic-specific channels',
  },
  {
    id: 'resources',
    icon: <BookOpen size={24} color="#3B82F6" />,
    title: 'Resource Library',
    description: 'Share documents and resources',
  },
];

export function CreateCommunityDrawer({ isOpen, onClose }: CreateCommunityDrawerProps) {
  const { isDark } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const [communityName, setCommunityName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(['discussions']);
  
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
      setCommunityName('');
      setDescription('');
      setSelectedCategory('');
      setVisibility('public');
      setSelectedFeatures(['discussions']);
    }
  }, [isOpen]);

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev =>
      prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const handleCreateCommunity = () => {
    if (!communityName.trim()) {
      Alert.alert('Error', 'Please enter a community name');
      return;
    }
    
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    
    if (selectedFeatures.length === 0) {
      Alert.alert('Error', 'Please select at least one feature');
      return;
    }
    
    // Add the new community to messages
    const newCommunity = {
      id: Date.now().toString(),
      type: 'community',
      name: communityName.trim(),
      avatar: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=100',
      lastMessage: `You created this community in the ${selectedCategory} category`,
      time: 'now',
      unread: false,
    };
    
    // In a real app, you would update a global state or context
    // For this demo, we'll use a mock implementation
    global.messages = global.messages || [];
    global.messages.unshift(newCommunity);
    
    Alert.alert(
      'Community Created',
      `"${communityName}" has been created in the ${selectedCategory} category`,
      [
        {
          text: 'OK',
          onPress: onClose
        }
      ]
    );
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
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color={isDark ? '#E5E7EB' : '#4B5563'} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Create Community
              </Text>
              <TouchableOpacity 
                style={[
                  styles.createButton,
                  { opacity: communityName && selectedCategory ? 1 : 0.5 }
                ]}
                onPress={handleCreateCommunity}
                disabled={!communityName || !selectedCategory}
              >
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
              <View style={styles.communityInfoSection}>
                <TouchableOpacity 
                  style={[styles.communityImageButton, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF' }]}
                  onPress={() => Alert.alert('Select Image', 'Image picker would open here')}
                >
                  <Camera size={32} color={isDark ? '#60A5FA' : '#3B82F6'} />
                </TouchableOpacity>
                
                <View style={styles.communityInputs}>
                  <TextInput
                    style={[
                      styles.communityNameInput,
                      { color: isDark ? '#FFFFFF' : '#111827' }
                    ]}
                    placeholder="Community name"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={communityName}
                    onChangeText={setCommunityName}
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

              <View style={styles.categorySection}>
                <Text style={[
                  styles.sectionTitle,
                  { color: isDark ? '#FFFFFF' : '#111827' }
                ]}>
                  Category
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoriesContainer}
                >
                  {categories.map(category => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryChip,
                        { 
                          backgroundColor: selectedCategory === category ? 
                            '#3B82F6' : 
                            (isDark ? '#1E293B' : '#F3F4F6')
                        }
                      ]}
                      onPress={() => setSelectedCategory(category)}
                    >
                      <Text style={[
                        styles.categoryText,
                        { 
                          color: selectedCategory === category ?
                            '#FFFFFF' :
                            (isDark ? '#E5E7EB' : '#4B5563')
                        }
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.visibilitySection}>
                <Text style={[
                  styles.sectionTitle,
                  { color: isDark ? '#FFFFFF' : '#111827' }
                ]}>
                  Visibility
                </Text>
                <View style={styles.visibilityOptions}>
                  <TouchableOpacity
                    style={[
                      styles.visibilityOption,
                      { 
                        backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                        borderColor: visibility === 'public' ? '#3B82F6' : 'transparent'
                      }
                    ]}
                    onPress={() => setVisibility('public')}
                  >
                    <Globe size={24} color="#3B82F6" />
                    <Text style={[
                      styles.visibilityText,
                      { color: isDark ? '#FFFFFF' : '#111827' }
                    ]}>
                      Public
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.visibilityOption,
                      { 
                        backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                        borderColor: visibility === 'private' ? '#3B82F6' : 'transparent'
                      }
                    ]}
                    onPress={() => setVisibility('private')}
                  >
                    <Lock size={24} color="#3B82F6" />
                    <Text style={[
                      styles.visibilityText,
                      { color: isDark ? '#FFFFFF' : '#111827' }
                    ]}>
                      Private
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={[styles.visibilityDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  {visibility === 'public' 
                    ? 'Anyone can find and join this community' 
                    : 'Only invited members can join this community'}
                </Text>
              </View>

              <View style={styles.featuresSection}>
                <Text style={[
                  styles.sectionTitle,
                  { color: isDark ? '#FFFFFF' : '#111827' }
                ]}>
                  Features
                </Text>
                {features.map(feature => (
                  <TouchableOpacity
                    key={feature.id}
                    style={[
                      styles.featureOption,
                      { 
                        backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                        borderColor: selectedFeatures.includes(feature.id) ? '#3B82F6' : 'transparent'
                      }
                    ]}
                    onPress={() => toggleFeature(feature.id)}
                  >
                    <View style={[styles.featureIcon, { backgroundColor: isDark ? '#0F172A' : '#EFF6FF' }]}>
                      {feature.icon}
                    </View>
                    <View style={styles.featureContent}>
                      <Text style={[
                        styles.featureTitle,
                        { color: isDark ? '#FFFFFF' : '#111827' }
                      ]}>
                        {feature.title}
                      </Text>
                      <Text style={[
                        styles.featureDescription,
                        { color: isDark ? '#9CA3AF' : '#6B7280' }
                      ]}>
                        {feature.description}
                      </Text>
                    </View>
                    <View style={[
                      styles.checkbox,
                      { borderColor: isDark ? '#4B5563' : '#D1D5DB' },
                      selectedFeatures.includes(feature.id) && styles.checkboxSelected
                    ]} />
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.infoSection}>
                <Text style={[styles.infoTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  About Communities
                </Text>
                <Text style={[styles.infoText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  Communities are spaces for people with shared interests to connect, 
                  share content, and engage in discussions. As a community creator, 
                  you'll be responsible for moderating content and managing members.
                </Text>
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
  communityInfoSection: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  communityImageButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  communityInputs: {
    flex: 1,
  },
  communityNameInput: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 8,
  },
  descriptionInput: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  categorySection: {
    padding: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingBottom: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  visibilitySection: {
    padding: 16,
  },
  visibilityOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  visibilityOption: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  visibilityText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginTop: 8,
  },
  visibilityDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  featuresSection: {
    padding: 16,
  },
  featureOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
    marginLeft: 12,
  },
  featureTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  featureDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginLeft: 12,
  },
  checkboxSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  infoSection: {
    padding: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 8,
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
});
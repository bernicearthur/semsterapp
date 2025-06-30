import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, Dimensions, Alert, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Camera, MapPin, Tag, Calendar, Clock, Phone, Mail, User, Info } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  runOnJS
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface ReportItemDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onReportItem: (itemData: any) => void;
}

const categories = [
  'Electronics', 'Documents', 'Personal Items', 'Clothing', 'Accessories', 'Books', 'Other'
];

const locations = [
  'Main Library', 'Student Center', 'Science Building', 'Engineering Building', 
  'Business School', 'Cafeteria', 'Gym', 'Dormitories', 'Other'
];

const dateOptions = [
  'Today', 'Yesterday', '2 days ago', '3 days ago', 'This week', 'Last week',
  'Dec 1', 'Dec 2', 'Dec 3', 'Dec 4', 'Dec 5', 'Dec 6', 'Dec 7', 'Dec 8', 'Dec 9', 'Dec 10',
  'Dec 11', 'Dec 12', 'Dec 13', 'Dec 14', 'Dec 15', 'Other'
];

export function ReportItemDrawer({ isOpen, onClose, onReportItem }: ReportItemDrawerProps) {
  const { isDark } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [location, setLocation] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isLost, setIsLost] = useState(true);
  const [hasReward, setHasReward] = useState(false);
  const [reward, setReward] = useState('');
  const [date, setDate] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [hasAdditionalInfo, setHasAdditionalInfo] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
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
    setSelectedCategory('');
    setLocation('');
    setContactName('');
    setContactEmail('');
    setContactPhone('');
    setIsLost(true);
    setHasReward(false);
    setReward('');
    setDate('');
    setAdditionalInfo('');
    setHasAdditionalInfo(false);
    setShowDatePicker(false);
  };

  const handleReportItem = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for the item');
      return;
    }
    
    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description');
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
    
    if (!date.trim()) {
      Alert.alert('Error', 'Please specify when the item was lost/found');
      return;
    }

    if (!contactName.trim() || !contactEmail.trim()) {
      Alert.alert('Error', 'Please provide your contact information');
      return;
    }

    const itemData = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      category: selectedCategory,
      location: location.trim(),
      date: date.trim(),
      type: isLost ? 'lost' : 'found',
      contact: {
        name: contactName.trim(),
        email: contactEmail.trim(),
        phone: contactPhone.trim() || undefined,
      },
      reward: hasReward && isLost ? reward.trim() : undefined,
      additionalInfo: hasAdditionalInfo ? additionalInfo.trim() : undefined,
      image: isLost ? 
        'https://images.pexels.com/photos/6457579/pexels-photo-6457579.jpeg?auto=compress&cs=tinysrgb&w=800' : 
        'https://images.pexels.com/photos/4495798/pexels-photo-4495798.jpeg?auto=compress&cs=tinysrgb&w=800',
      timestamp: new Date().toISOString(),
    };

    onReportItem(itemData);
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSelectDate = (selectedDate: string) => {
    setDate(selectedDate);
    setShowDatePicker(false);
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
                {isLost ? 'Report Lost Item' : 'Report Found Item'}
              </Text>
              
              <TouchableOpacity 
                style={[
                  styles.reportButton,
                  { 
                    backgroundColor: title && description && selectedCategory && location ? 
                      '#3B82F6' : 
                      (isDark ? '#374151' : '#E5E7EB'),
                    opacity: title && description && selectedCategory && location ? 1 : 0.5
                  }
                ]}
                onPress={handleReportItem}
                disabled={!title || !description || !selectedCategory || !location}
              >
                <Text style={[
                  styles.reportButtonText,
                  { 
                    color: title && description && selectedCategory && location ? 
                      '#FFFFFF' : 
                      (isDark ? '#9CA3AF' : '#6B7280')
                  }
                ]}>
                  Submit
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Item Type */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Item Status
                </Text>
                
                <View style={styles.itemTypeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.itemTypeButton,
                      { 
                        backgroundColor: isLost ? '#EF4444' : (isDark ? '#374151' : '#F3F4F6'),
                        borderColor: isLost ? '#EF4444' : 'transparent'
                      }
                    ]}
                    onPress={() => setIsLost(true)}
                  >
                    <Text style={[
                      styles.itemTypeText,
                      { color: isLost ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#4B5563') }
                    ]}>
                      Lost Item
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.itemTypeButton,
                      { 
                        backgroundColor: !isLost ? '#10B981' : (isDark ? '#374151' : '#F3F4F6'),
                        borderColor: !isLost ? '#10B981' : 'transparent'
                      }
                    ]}
                    onPress={() => setIsLost(false)}
                  >
                    <Text style={[
                      styles.itemTypeText,
                      { color: !isLost ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#4B5563') }
                    ]}>
                      Found Item
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Item Image */}
              <TouchableOpacity style={[styles.imageUpload, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}>
                <Camera size={32} color={isDark ? '#60A5FA' : '#3B82F6'} />
                <Text style={[styles.imageUploadText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                  Add Item Photo
                </Text>
              </TouchableOpacity>

              {/* Basic Information */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Item Details
                </Text>
                
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Item Name *
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
                    placeholder="e.g., Blue Backpack, Student ID Card"
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
                    placeholder="Describe the item in detail (color, brand, distinguishing features, etc.)"
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
              </View>

              {/* Location and Date */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Location & Date
                </Text>
                
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
                      placeholder={isLost ? "Where did you last see it?" : "Where did you find it?"}
                      placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                      value={location}
                      onChangeText={setLocation}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Date *
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.dateSelector,
                      { 
                        backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                        borderColor: isDark ? '#374151' : '#E5E7EB'
                      }
                    ]}
                    onPress={() => setShowDatePicker(!showDatePicker)}
                  >
                    <Calendar size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    <Text style={[
                      styles.dateSelectorText,
                      { 
                        color: date ? (isDark ? '#E5E7EB' : '#1F2937') : (isDark ? '#9CA3AF' : '#6B7280')
                      }
                    ]}>
                      {date || (isLost ? "When did you lose it?" : "When did you find it?")}
                    </Text>
                  </TouchableOpacity>
                  
                  {showDatePicker && (
                    <View style={[
                      styles.datePickerContainer,
                      { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }
                    ]}>
                      <ScrollView style={styles.datePickerScroll} showsVerticalScrollIndicator={false}>
                        {dateOptions.map((option) => (
                          <TouchableOpacity
                            key={option}
                            style={[
                              styles.dateOption,
                              { backgroundColor: date === option ? '#3B82F6' : 'transparent' }
                            ]}
                            onPress={() => handleSelectDate(option)}
                          >
                            <Text style={[
                              styles.dateOptionText,
                              { 
                                color: date === option ? 
                                  '#FFFFFF' : 
                                  (isDark ? '#E5E7EB' : '#1F2937')
                              }
                            ]}>
                              {option}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {/* Additional Information Toggle */}
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingTitle, { color: isDark ? '#E5E7EB' : '#1F2937' }]}>
                      Additional Information
                    </Text>
                    <Text style={[styles.settingDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                      Add more details about the circumstances
                    </Text>
                  </View>
                  <Switch
                    value={hasAdditionalInfo}
                    onValueChange={setHasAdditionalInfo}
                    trackColor={{ false: isDark ? '#374151' : '#E5E7EB', true: '#3B82F6' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                {/* Additional Information Input */}
                {hasAdditionalInfo && (
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                      Additional Details (Optional)
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
                      placeholder={isLost ? 
                        "Describe the circumstances when you lost the item, what you were doing, who you were with, etc." : 
                        "Describe the circumstances when you found the item, what condition it was in, etc."
                      }
                      placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                      value={additionalInfo}
                      onChangeText={setAdditionalInfo}
                      multiline
                      numberOfLines={4}
                    />
                  </View>
                )}
              </View>

              {/* Reward Section (for lost items) */}
              {isLost && (
                <View style={styles.section}>
                  <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                      <Text style={[styles.settingTitle, { color: isDark ? '#E5E7EB' : '#1F2937' }]}>
                        Offer Reward
                      </Text>
                      <Text style={[styles.settingDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                        Incentivize the return of your item
                      </Text>
                    </View>
                    <Switch
                      value={hasReward}
                      onValueChange={setHasReward}
                      trackColor={{ false: isDark ? '#374151' : '#E5E7EB', true: '#3B82F6' }}
                      thumbColor="#FFFFFF"
                    />
                  </View>

                  {hasReward && (
                    <View style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                        Reward Amount
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
                        placeholder="e.g., $20, Coffee, etc."
                        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                        value={reward}
                        onChangeText={setReward}
                      />
                    </View>
                  )}
                </View>
              )}

              {/* Contact Information */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Contact Information
                </Text>
                
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Your Name *
                  </Text>
                  <View style={styles.inputWithIcon}>
                    <User size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    <TextInput
                      style={[
                        styles.textInput,
                        { 
                          backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                          color: isDark ? '#E5E7EB' : '#1F2937',
                          borderColor: isDark ? '#374151' : '#E5E7EB'
                        }
                      ]}
                      placeholder="Your full name"
                      placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                      value={contactName}
                      onChangeText={setContactName}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Email *
                  </Text>
                  <View style={styles.inputWithIcon}>
                    <Mail size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    <TextInput
                      style={[
                        styles.textInput,
                        { 
                          backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                          color: isDark ? '#E5E7EB' : '#1F2937',
                          borderColor: isDark ? '#374151' : '#E5E7EB'
                        }
                      ]}
                      placeholder="Your email address"
                      placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                      value={contactEmail}
                      onChangeText={setContactEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Phone (Optional)
                  </Text>
                  <View style={styles.inputWithIcon}>
                    <Phone size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    <TextInput
                      style={[
                        styles.textInput,
                        { 
                          backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                          color: isDark ? '#E5E7EB' : '#1F2937',
                          borderColor: isDark ? '#374151' : '#E5E7EB'
                        }
                      ]}
                      placeholder="Your phone number"
                      placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                      value={contactPhone}
                      onChangeText={setContactPhone}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
              </View>

              {/* Privacy Note */}
              <View style={[styles.privacyNote, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}>
                <Info size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                <Text style={[styles.privacyText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                  Your contact information will only be shared with the person who {isLost ? 'found your item' : 'lost this item'} after verification.
                </Text>
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
  reportButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  reportButtonText: {
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
  itemTypeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  itemTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  itemTypeText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  imageUpload: {
    height: 120,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
  },
  imageUploadText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
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
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
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
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  dateSelectorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  datePickerContainer: {
    marginTop: 8,
    borderRadius: 12,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10,
  },
  datePickerScroll: {
    maxHeight: 200,
  },
  dateOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dateOptionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
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
  privacyNote: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
    alignItems: 'flex-start',
  },
  privacyText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
});
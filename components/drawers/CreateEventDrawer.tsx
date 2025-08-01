import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, Dimensions, Alert, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Calendar, Clock, MapPin, Globe, Link, Camera, Users, DollarSign, Info } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  runOnJS
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface Event {
  title: string;
  description: string;
  date: string;
  time: string;
  location?: string;
  isOnline: boolean;
  onlineLink?: string;
  organizer: {
    name: string;
    avatar: string;
    verified?: boolean;
  };
  image: string;
  category: string;
  price?: number;
  isFree: boolean;
  maxAttendees?: number;
}

interface CreateEventDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent: (event: Event) => void;
}

const categories = [
  'Academic', 'Social', 'Sports', 'Arts', 'Career', 'Business', 'Health', 'Technology', 'Other'
];

const timeSlots = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
  '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'
];

const dates = [
  'Today', 'Tomorrow', 'Dec 15', 'Dec 16', 'Dec 17', 'Dec 18', 'Dec 19', 'Dec 20'
];

export function CreateEventDrawer({ isOpen, onClose, onCreateEvent }: CreateEventDrawerProps) {
  const { isDark } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [location, setLocation] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [onlineLink, setOnlineLink] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState('');
  const [maxAttendees, setMaxAttendees] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
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
        // When extended, allow dragging down to collapse
        if (event.translationY > 0) {
          const progress = Math.min(event.translationY / (screenHeight * 0.15), 1);
          drawerHeight.value = 1 - (progress * 0.15);
        }
      } else {
        // When collapsed, allow dragging up to extend or down to close
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
        // When extended, decide whether to stay extended or collapse
        if (event.translationY > screenHeight * 0.1 || event.velocityY > 500) {
          // Collapse to 85%
          drawerHeight.value = withSpring(0.85);
          runOnJS(setIsExtended)(false);
        } else {
          // Stay extended
          drawerHeight.value = withSpring(1);
        }
      } else {
        // When collapsed, decide whether to extend, stay collapsed, or close
        if (event.translationY < -screenHeight * 0.1 || event.velocityY < -500) {
          // Extend to 100%
          drawerHeight.value = withSpring(1);
          runOnJS(setIsExtended)(true);
        } else if (event.translationY > screenHeight * 0.3 || event.velocityY > 500) {
          // Close drawer
          translateY.value = withSpring(screenHeight, {
            damping: 20,
            stiffness: 90,
            mass: 0.4,
          }, () => {
            runOnJS(onClose)();
          });
        } else {
          // Stay at current position
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
      // Reset to collapsed state when drawer closes
      setIsExtended(false);
      drawerHeight.value = 0.85;
    }
  }, [isOpen]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSelectedDate('');
    setSelectedTime('');
    setLocation('');
    setIsOnline(false);
    setOnlineLink('');
    setSelectedCategory('');
    setIsFree(true);
    setPrice('');
    setMaxAttendees('');
  };

  const handleCreateEvent = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }
    
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter an event description');
      return;
    }
    
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date');
      return;
    }
    
    if (!selectedTime) {
      Alert.alert('Error', 'Please select a time');
      return;
    }
    
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    
    if (!isOnline && !location.trim()) {
      Alert.alert('Error', 'Please enter a location for in-person events');
      return;
    }
    
    if (isOnline && !onlineLink.trim()) {
      Alert.alert('Error', 'Please enter an online link for virtual events');
      return;
    }

    const event: Event = {
      title: title.trim(),
      description: description.trim(),
      date: selectedDate,
      time: selectedTime,
      location: isOnline ? undefined : location.trim(),
      isOnline,
      onlineLink: isOnline ? onlineLink.trim() : undefined,
      organizer: {
        name: 'Alex Johnson', // Current user
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
        verified: true,
      },
      image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=800', // Default image
      category: selectedCategory,
      price: isFree ? undefined : parseFloat(price) || 0,
      isFree,
      maxAttendees: maxAttendees ? parseInt(maxAttendees) : undefined,
    };

    onCreateEvent(event);
    resetForm();
    onClose();
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
            <View style={styles.dragHandle}>
              <View style={[styles.dragIndicator, { backgroundColor: isDark ? '#4B5563' : '#D1D5DB' }]} />
            </View>
          </GestureDetector>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.headerButton}>
              <X size={24} color={isDark ? '#E5E7EB' : '#4B5563'} />
            </TouchableOpacity>
            
            <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
              Create Event
            </Text>
            
            <TouchableOpacity 
              style={[
                styles.createButton,
                { 
                  backgroundColor: title && description && selectedDate && selectedTime && selectedCategory ? '#3B82F6' : (isDark ? '#374151' : '#E5E7EB'),
                  opacity: title && description && selectedDate && selectedTime && selectedCategory ? 1 : 0.5
                }
              ]}
              onPress={handleCreateEvent}
              disabled={!title || !description || !selectedDate || !selectedTime || !selectedCategory}
            >
              <Text style={[
                styles.createButtonText,
                { color: title && description && selectedDate && selectedTime && selectedCategory ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#6B7280') }
              ]}>
                Create
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Event Image */}
            <TouchableOpacity style={[styles.imageUpload, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}>
              <Camera size={32} color={isDark ? '#60A5FA' : '#3B82F6'} />
              <Text style={[styles.imageUploadText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                Add Event Photo
              </Text>
            </TouchableOpacity>

            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Event Details
              </Text>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                  Event Title *
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
                  placeholder="Enter event title"
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
                  placeholder="Describe your event"
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

            {/* Date and Time */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                When
              </Text>
              
              <View style={styles.dateTimeRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Date *
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.selectButton,
                      { 
                        backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                        borderColor: isDark ? '#374151' : '#E5E7EB'
                      }
                    ]}
                    onPress={() => setShowDatePicker(!showDatePicker)}
                  >
                    <Calendar size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    <Text style={[
                      styles.selectButtonText,
                      { color: selectedDate ? (isDark ? '#E5E7EB' : '#1F2937') : (isDark ? '#9CA3AF' : '#6B7280') }
                    ]}>
                      {selectedDate || 'Select date'}
                    </Text>
                  </TouchableOpacity>
                  
                  {showDatePicker && (
                    <View style={[styles.picker, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
                      {dates.map((date) => (
                        <TouchableOpacity
                          key={date}
                          style={[
                            styles.pickerItem,
                            selectedDate === date && { backgroundColor: '#3B82F6' }
                          ]}
                          onPress={() => {
                            setSelectedDate(date);
                            setShowDatePicker(false);
                          }}
                        >
                          <Text style={[
                            styles.pickerItemText,
                            { color: selectedDate === date ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#1F2937') }
                          ]}>
                            {date}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Time *
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.selectButton,
                      { 
                        backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                        borderColor: isDark ? '#374151' : '#E5E7EB'
                      }
                    ]}
                    onPress={() => setShowTimePicker(!showTimePicker)}
                  >
                    <Clock size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    <Text style={[
                      styles.selectButtonText,
                      { color: selectedTime ? (isDark ? '#E5E7EB' : '#1F2937') : (isDark ? '#9CA3AF' : '#6B7280') }
                    ]}>
                      {selectedTime || 'Select time'}
                    </Text>
                  </TouchableOpacity>
                  
                  {showTimePicker && (
                    <View style={[styles.picker, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
                      <ScrollView style={{ maxHeight: 200 }}>
                        {timeSlots.map((time) => (
                          <TouchableOpacity
                            key={time}
                            style={[
                              styles.pickerItem,
                              selectedTime === time && { backgroundColor: '#3B82F6' }
                            ]}
                            onPress={() => {
                              setSelectedTime(time);
                              setShowTimePicker(false);
                            }}
                          >
                            <Text style={[
                              styles.pickerItemText,
                              { color: selectedTime === time ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#1F2937') }
                            ]}>
                              {time}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Location */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Location
              </Text>
              
              <View style={styles.locationTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.locationTypeButton,
                    { 
                      backgroundColor: !isOnline ? '#3B82F6' : (isDark ? '#374151' : '#F3F4F6'),
                      borderColor: !isOnline ? '#3B82F6' : 'transparent'
                    }
                  ]}
                  onPress={() => setIsOnline(false)}
                >
                  <MapPin size={20} color={!isOnline ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#4B5563')} />
                  <Text style={[
                    styles.locationTypeText,
                    { color: !isOnline ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#4B5563') }
                  ]}>
                    In-Person
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.locationTypeButton,
                    { 
                      backgroundColor: isOnline ? '#3B82F6' : (isDark ? '#374151' : '#F3F4F6'),
                      borderColor: isOnline ? '#3B82F6' : 'transparent'
                    }
                  ]}
                  onPress={() => setIsOnline(true)}
                >
                  <Globe size={20} color={isOnline ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#4B5563')} />
                  <Text style={[
                    styles.locationTypeText,
                    { color: isOnline ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#4B5563') }
                  ]}>
                    Online
                  </Text>
                </TouchableOpacity>
              </View>

              {isOnline ? (
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Online Link *
                  </Text>
                  <View style={styles.inputWithIcon}>
                    <Link size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    <TextInput
                      style={[
                        styles.textInput,
                        styles.inputWithIconText,
                        { 
                          backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                          color: isDark ? '#E5E7EB' : '#1F2937',
                          borderColor: isDark ? '#374151' : '#E5E7EB'
                        }
                      ]}
                      placeholder="https://zoom.us/j/123456789"
                      placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                      value={onlineLink}
                      onChangeText={setOnlineLink}
                      keyboardType="url"
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Venue *
                  </Text>
                  <View style={styles.inputWithIcon}>
                    <MapPin size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    <TextInput
                      style={[
                        styles.textInput,
                        styles.inputWithIconText,
                        { 
                          backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                          color: isDark ? '#E5E7EB' : '#1F2937',
                          borderColor: isDark ? '#374151' : '#E5E7EB'
                        }
                      ]}
                      placeholder="Enter venue address"
                      placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                      value={location}
                      onChangeText={setLocation}
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Additional Settings */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Additional Settings
              </Text>
              
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: isDark ? '#E5E7EB' : '#1F2937' }]}>
                    Free Event
                  </Text>
                  <Text style={[styles.settingDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                    No charge for attendees
                  </Text>
                </View>
                <Switch
                  value={isFree}
                  onValueChange={setIsFree}
                  trackColor={{ false: isDark ? '#374151' : '#E5E7EB', true: '#3B82F6' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {!isFree && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Ticket Price
                  </Text>
                  <View style={styles.inputWithIcon}>
                    <DollarSign size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    <TextInput
                      style={[
                        styles.textInput,
                        styles.inputWithIconText,
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
              )}

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                  Max Attendees (Optional)
                </Text>
                <View style={styles.inputWithIcon}>
                  <Users size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                  <TextInput
                    style={[
                      styles.textInput,
                      styles.inputWithIconText,
                      { 
                        backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                        color: isDark ? '#E5E7EB' : '#1F2937',
                        borderColor: isDark ? '#374151' : '#E5E7EB'
                      }
                    ]}
                    placeholder="No limit"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={maxAttendees}
                    onChangeText={setMaxAttendees}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
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
    fontSize: 24,
  },
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
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
  dateTimeRow: {
    flexDirection: 'row',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  selectButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  picker: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
    marginTop: 4,
  },
  pickerItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pickerItemText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  locationTypeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  locationTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  locationTypeText: {
    fontSize: 16,
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
  inputWithIconText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    borderWidth: 0,
    padding: 0,
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
  createButtonSection: {
    marginTop: 24,
    marginBottom: 16,
  },
});
import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, Dimensions, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Calendar, Clock, MapPin, Users, Globe, Lock } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  runOnJS
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface CreateEventDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent: (eventData: any) => void;
}

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
  const [isExtended, setIsExtended] = useState(false);
  
  const [eventTitle, setEventTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [maxAttendees, setMaxAttendees] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
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

  const resetForm = () => {
    setEventTitle('');
    setDescription('');
    setLocation('');
    setSelectedDate('');
    setSelectedTime('');
    setIsPrivate(false);
    setMaxAttendees('');
    setShowDatePicker(false);
    setShowTimePicker(false);
  };

  const handleCreateEvent = () => {
    if (!eventTitle.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }
    
    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description');
      return;
    }
    
    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select a date and time');
      return;
    }

    const eventData = {
      id: Date.now().toString(),
      title: eventTitle.trim(),
      description: description.trim(),
      location: location.trim(),
      date: selectedDate,
      time: selectedTime,
      isPrivate,
      maxAttendees: maxAttendees ? parseInt(maxAttendees) : undefined,
      organizer: {
        name: 'Alex Johnson',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
      },
      attendees: {
        current: 1,
        max: maxAttendees ? parseInt(maxAttendees) : undefined,
      },
    };

    onCreateEvent(eventData);
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
      <GestureDetector gesture={dragHandleGesture}>
        <Animated.View 
          style={[
            styles.drawer,
            { backgroundColor: isDark ? '#0F172A' : '#FFFFFF', width: screenWidth },
            drawerStyle,
          ]}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.dragHandle}>
              <View style={[styles.dragIndicator, { backgroundColor: isDark ? '#4B5563' : '#D1D5DB' }]} />
            </View>

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
                    backgroundColor: eventTitle && description ? '#3B82F6' : (isDark ? '#374151' : '#E5E7EB'),
                    opacity: eventTitle && description ? 1 : 0.5
                  }
                ]}
                onPress={handleCreateEvent}
                disabled={!eventTitle || !description}
              >
                <Text style={[
                  styles.createButtonText,
                  { color: eventTitle && description ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#6B7280') }
                ]}>
                  Create
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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
                    placeholder="e.g., Study Group Meetup"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={eventTitle}
                    onChangeText={setEventTitle}
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
                    placeholder="Describe your event..."
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Location
                  </Text>
                  <View style={[styles.inputWithIcon, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: isDark ? '#374151' : '#E5E7EB' }]}>
                    <MapPin size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    <TextInput
                      style={[
                        styles.inputWithIconText,
                        { color: isDark ? '#E5E7EB' : '#1F2937' }
                      ]}
                      placeholder="Add location"
                      placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                      value={location}
                      onChangeText={setLocation}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Date & Time
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
                      onPress={() => {
                        setShowDatePicker(!showDatePicker);
                        setShowTimePicker(false);
                      }}
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
                        <ScrollView style={{ maxHeight: 200 }}>
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
                        </ScrollView>
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
                      onPress={() => {
                        setShowTimePicker(!showTimePicker);
                        setShowDatePicker(false);
                      }}
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

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Event Settings
                </Text>
                
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingTitle, { color: isDark ? '#E5E7EB' : '#1F2937' }]}>
                      Private Event
                    </Text>
                    <Text style={[styles.settingDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                      Only invited people can see and join
                    </Text>
                  </View>
                  <Switch
                    value={isPrivate}
                    onValueChange={setIsPrivate}
                    trackColor={{ false: isDark ? '#374151' : '#E5E7EB', true: '#3B82F6' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Max Attendees (Optional)
                  </Text>
                  <View style={[styles.inputWithIcon, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: isDark ? '#374151' : '#E5E7EB' }]}>
                    <Users size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    <TextInput
                      style={[
                        styles.inputWithIconText,
                        { color: isDark ? '#E5E7EB' : '#1F2937' }
                      ]}
                      placeholder="Leave blank for no limit"
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
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
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
});
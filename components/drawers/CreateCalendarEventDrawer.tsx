import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, Dimensions, Alert, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Calendar, Clock, MapPin, Tag, Info, Camera, Users, Bell, Bookmark } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  runOnJS
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface CreateCalendarEventDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent: (event: CalendarEvent) => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
  description?: string;
  type: 'exam' | 'academic' | 'holiday' | 'registration' | 'other';
  isAllDay: boolean;
  hasReminder: boolean;
  reminderTime?: string;
  color: string;
}

const eventTypes = [
  { id: 'exam', label: 'Exam', color: '#EF4444' },
  { id: 'academic', label: 'Academic', color: '#3B82F6' },
  { id: 'holiday', label: 'Holiday', color: '#10B981' },
  { id: 'registration', label: 'Registration', color: '#F59E0B' },
  { id: 'other', label: 'Other', color: '#8B5CF6' },
];

const reminderOptions = [
  '10 minutes before',
  '30 minutes before',
  '1 hour before',
  '1 day before',
  '1 week before',
];

const dates = [
  'Today', 'Tomorrow', 'Dec 15', 'Dec 16', 'Dec 17', 'Dec 18', 'Dec 19', 'Dec 20',
  'Dec 21', 'Dec 22', 'Dec 23', 'Dec 24', 'Dec 25', 'Dec 26', 'Dec 27', 'Dec 28',
  'Dec 29', 'Dec 30', 'Dec 31', 'Jan 1', 'Jan 2', 'Jan 3', 'Jan 4', 'Jan 5'
];

const timeSlots = [
  'All Day',
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
  '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'
];

export function CreateCalendarEventDrawer({ isOpen, onClose, onCreateEvent }: CreateCalendarEventDrawerProps) {
  const { isDark } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [location, setLocation] = useState('');
  const [selectedType, setSelectedType] = useState<string>('academic');
  const [isAllDay, setIsAllDay] = useState(false);
  const [hasReminder, setHasReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState('30 minutes before');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  
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
    setSelectedDate('');
    setSelectedTime('');
    setLocation('');
    setSelectedType('academic');
    setIsAllDay(false);
    setHasReminder(false);
    setReminderTime('30 minutes before');
    setShowDatePicker(false);
    setShowTimePicker(false);
    setShowReminderPicker(false);
  };

  const handleCreateEvent = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }
    
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date');
      return;
    }
    
    if (!isAllDay && !selectedTime) {
      Alert.alert('Error', 'Please select a time or mark as all-day event');
      return;
    }

    const eventColor = eventTypes.find(type => type.id === selectedType)?.color || '#3B82F6';
    
    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: title.trim(),
      date: selectedDate,
      time: isAllDay ? 'All Day' : selectedTime,
      location: location.trim() || undefined,
      description: description.trim() || undefined,
      type: selectedType as any,
      isAllDay,
      hasReminder,
      reminderTime: hasReminder ? reminderTime : undefined,
      color: eventColor,
    };

    onCreateEvent(event);
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
                Add to Calendar
              </Text>
              
              <TouchableOpacity 
                style={[
                  styles.createButton,
                  { 
                    backgroundColor: title && selectedDate && (isAllDay || selectedTime) ? '#3B82F6' : (isDark ? '#374151' : '#E5E7EB'),
                    opacity: title && selectedDate && (isAllDay || selectedTime) ? 1 : 0.5
                  }
                ]}
                onPress={handleCreateEvent}
                disabled={!title || !selectedDate || (!isAllDay && !selectedTime)}
              >
                <Text style={[
                  styles.createButtonText,
                  { color: title && selectedDate && (isAllDay || selectedTime) ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#6B7280') }
                ]}>
                  Add
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Event Image */}
              <TouchableOpacity style={[styles.imageUpload, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}>
                <Camera size={32} color={isDark ? '#60A5FA' : '#3B82F6'} />
                <Text style={[styles.imageUploadText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                  Add Event Image
                </Text>
              </TouchableOpacity>

              {/* Basic Information */}
              <View style={styles.section}>
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
                    Description (Optional)
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
                    placeholder="Add event details"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Event Type
                  </Text>
                  <View style={styles.eventTypesContainer}>
                    {eventTypes.map((type) => (
                      <TouchableOpacity
                        key={type.id}
                        style={[
                          styles.eventTypeButton,
                          { 
                            backgroundColor: selectedType === type.id ? type.color : (isDark ? '#1E293B' : '#F8FAFC'),
                            borderColor: selectedType === type.id ? type.color : (isDark ? '#374151' : '#E5E7EB')
                          }
                        ]}
                        onPress={() => setSelectedType(type.id)}
                      >
                        <Text style={[
                          styles.eventTypeText,
                          { color: selectedType === type.id ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#4B5563') }
                        ]}>
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* Date and Time */}
              <View style={styles.section}>
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingTitle, { color: isDark ? '#E5E7EB' : '#1F2937' }]}>
                      All-day Event
                    </Text>
                    <Text style={[styles.settingDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                      Event lasts the entire day
                    </Text>
                  </View>
                  <Switch
                    value={isAllDay}
                    onValueChange={setIsAllDay}
                    trackColor={{ false: isDark ? '#374151' : '#E5E7EB', true: '#3B82F6' }}
                    thumbColor="#FFFFFF"
                  />
                </View>
                
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
                        setShowReminderPicker(false);
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

                  {!isAllDay && (
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
                          setShowReminderPicker(false);
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
                            {timeSlots.filter(time => time !== 'All Day').map((time) => (
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
                  )}
                </View>
              </View>

              {/* Location */}
              <View style={styles.section}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Location (Optional)
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
                      placeholder="Enter location"
                      placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                      value={location}
                      onChangeText={setLocation}
                    />
                  </View>
                </View>
              </View>

              {/* Additional Settings */}
              <View style={styles.section}>
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingTitle, { color: isDark ? '#E5E7EB' : '#1F2937' }]}>
                      Set Reminder
                    </Text>
                    <Text style={[styles.settingDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                      Get notified before the event
                    </Text>
                  </View>
                  <Switch
                    value={hasReminder}
                    onValueChange={setHasReminder}
                    trackColor={{ false: isDark ? '#374151' : '#E5E7EB', true: '#3B82F6' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                {hasReminder && (
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                      Reminder Time
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
                        setShowReminderPicker(!showReminderPicker);
                        setShowDatePicker(false);
                        setShowTimePicker(false);
                      }}
                    >
                      <Bell size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                      <Text style={[
                        styles.selectButtonText,
                        { color: reminderTime ? (isDark ? '#E5E7EB' : '#1F2937') : (isDark ? '#9CA3AF' : '#6B7280') }
                      ]}>
                        {reminderTime}
                      </Text>
                    </TouchableOpacity>
                    
                    {showReminderPicker && (
                      <View style={[styles.picker, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
                        <ScrollView style={{ maxHeight: 200 }}>
                          {reminderOptions.map((option) => (
                            <TouchableOpacity
                              key={option}
                              style={[
                                styles.pickerItem,
                                reminderTime === option && { backgroundColor: '#3B82F6' }
                              ]}
                              onPress={() => {
                                setReminderTime(option);
                                setShowReminderPicker(false);
                              }}
                            >
                              <Text style={[
                                styles.pickerItemText,
                                { color: reminderTime === option ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#1F2937') }
                              ]}>
                                {option}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                )}

                <TouchableOpacity 
                  style={[styles.addToCalendarButton, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}
                >
                  <Bookmark size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                  <Text style={[styles.addToCalendarText, { color: isDark ? '#60A5FA' : '#3B82F6' }]}>
                    Add to Device Calendar
                  </Text>
                </TouchableOpacity>
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
    padding: 20,
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
  eventTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  eventTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 8,
  },
  eventTypeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
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
      height: 2,
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
  addToCalendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  addToCalendarText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
});
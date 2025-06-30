import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, Dimensions, Alert, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Calendar, Clock, Key, Lock, Users } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  runOnJS
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface CreateStudyRoomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (roomData: any) => void;
}

const timeSlots = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
  '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'
];

const dates = [
  'Today', 'Tomorrow', 'Dec 15', 'Dec 16', 'Dec 17', 'Dec 18', 'Dec 19', 'Dec 20'
];

export function CreateStudyRoomDrawer({ isOpen, onClose, onCreateRoom }: CreateStudyRoomDrawerProps) {
  const { isDark } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  
  const [roomName, setRoomName] = useState('');
  const [description, setDescription] = useState('');
  const [isLive, setIsLive] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
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
    setRoomName('');
    setDescription('');
    setIsLive(true);
    setSelectedDate('');
    setSelectedTime('');
    setIsPrivate(false);
    setPassword('');
    setMaxParticipants('');
    setShowDatePicker(false);
    setShowTimePicker(false);
  };

  const handleCreateRoom = () => {
    if (!roomName.trim()) {
      Alert.alert('Error', 'Please enter a room name');
      return;
    }
    
    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description');
      return;
    }
    
    if (!isLive && (!selectedDate || !selectedTime)) {
      Alert.alert('Error', 'Please select a date and time for scheduled rooms');
      return;
    }
    
    if (isPrivate && !password.trim()) {
      Alert.alert('Error', 'Please set a password for private rooms');
      return;
    }

    const roomData = {
      id: Date.now().toString(),
      name: roomName.trim(),
      host: {
        name: 'Alex Johnson', // Current user
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
      },
      participants: {
        current: 1, // Host is the first participant
        max: maxParticipants ? parseInt(maxParticipants) : undefined,
        avatars: ['https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100'],
      },
      isPrivate,
      status: isLive ? 'live' : 'scheduled',
      startTime: !isLive ? `${selectedDate}, ${selectedTime}` : undefined,
      endTime: !isLive ? `${selectedDate}, ${getEndTime(selectedTime)}` : undefined,
      description: description.trim(),
    };

    onCreateRoom(roomData);
    resetForm();
  };

  const getEndTime = (startTime: string) => {
    // Simple function to add 2 hours to the start time
    const [time, period] = startTime.split(' ');
    const [hour, minute] = time.split(':').map(Number);
    
    let newHour = hour + 2;
    let newPeriod = period;
    
    if (period === 'AM' && newHour >= 12) {
      newPeriod = 'PM';
      if (newHour > 12) newHour -= 12;
    } else if (period === 'PM' && newHour > 12) {
      newHour -= 12;
    }
    
    return `${newHour}:${minute.toString().padStart(2, '0')} ${newPeriod}`;
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
                Create Study Room
              </Text>
              
              <TouchableOpacity 
                style={[
                  styles.createButton,
                  { 
                    backgroundColor: roomName && description ? '#3B82F6' : (isDark ? '#374151' : '#E5E7EB'),
                    opacity: roomName && description ? 1 : 0.5
                  }
                ]}
                onPress={handleCreateRoom}
                disabled={!roomName || !description}
              >
                <Text style={[
                  styles.createButtonText,
                  { color: roomName && description ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#6B7280') }
                ]}>
                  Create
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Basic Information */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Room Details
                </Text>
                
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Room Name *
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
                    placeholder="e.g., CS301 Final Exam Prep"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={roomName}
                    onChangeText={setRoomName}
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
                    placeholder="Describe what you'll be studying..."
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                  />
                </View>
              </View>

              {/* Room Type */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Room Type
                </Text>
                
                <View style={styles.roomTypeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.roomTypeButton,
                      { 
                        backgroundColor: isLive ? '#3B82F6' : (isDark ? '#374151' : '#F3F4F6'),
                        borderColor: isLive ? '#3B82F6' : 'transparent'
                      }
                    ]}
                    onPress={() => setIsLive(true)}
                  >
                    <Text style={[
                      styles.roomTypeText,
                      { color: isLive ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#4B5563') }
                    ]}>
                      Start Now
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.roomTypeButton,
                      { 
                        backgroundColor: !isLive ? '#3B82F6' : (isDark ? '#374151' : '#F3F4F6'),
                        borderColor: !isLive ? '#3B82F6' : 'transparent'
                      }
                    ]}
                    onPress={() => setIsLive(false)}
                  >
                    <Text style={[
                      styles.roomTypeText,
                      { color: !isLive ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#4B5563') }
                    ]}>
                      Schedule
                    </Text>
                  </TouchableOpacity>
                </View>

                {!isLive && (
                  <View style={styles.schedulingContainer}>
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
                      Private Room
                    </Text>
                    <Text style={[styles.settingDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                      Require password to join
                    </Text>
                  </View>
                  <Switch
                    value={isPrivate}
                    onValueChange={setIsPrivate}
                    trackColor={{ false: isDark ? '#374151' : '#E5E7EB', true: '#3B82F6' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                {isPrivate && (
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                      Password *
                    </Text>
                    <View style={styles.inputWithIcon}>
                      <Lock size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
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
                        placeholder="Set a password"
                        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                      />
                    </View>
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Max Participants (Optional)
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
                      placeholder="Leave blank for no limit"
                      placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                      value={maxParticipants}
                      onChangeText={setMaxParticipants}
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
    borderWidth: 0,
    padding: 0,
  },
  roomTypeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  roomTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  roomTypeText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  schedulingContainer: {
    marginTop: 8,
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
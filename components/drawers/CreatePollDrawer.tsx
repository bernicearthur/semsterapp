import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, BarChart3, Plus, Minus, Clock, Globe, Users, BookOpen, GraduationCap } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  runOnJS
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface CreatePollDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePoll: (pollData: {
    content: string;
    pollQuestion: string;
    pollOptions: string[];
    pollDuration: number;
    audience: string;
  }) => void;
}

export function CreatePollDrawer({ isOpen, onClose, onCreatePoll }: CreatePollDrawerProps) {
  const { isDark } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollDuration, setPollDuration] = useState(24);
  const [selectedAudience, setSelectedAudience] = useState<'public' | 'connections' | 'course' | 'yeargroup'>('public');
  const [showAudienceModal, setShowAudienceModal] = useState(false);
  
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

  const handleAddPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handleUpdatePollOption = (text: string, index: number) => {
    const newOptions = [...pollOptions];
    newOptions[index] = text;
    setPollOptions(newOptions);
  };

  const handleCreatePoll = () => {
    if (pollQuestion.trim() === '' || pollOptions.some(opt => opt.trim() === '')) {
      Alert.alert('Incomplete Poll', 'Please fill in the poll question and all options.');
      return;
    }

    const pollData = {
      content: `Poll: ${pollQuestion}`,
      pollQuestion: pollQuestion.trim(),
      pollOptions: pollOptions.map(opt => opt.trim()),
      pollDuration,
      audience: selectedAudience,
    };

    onCreatePoll(pollData);
    
    // Reset form
    setPollQuestion('');
    setPollOptions(['', '']);
    setPollDuration(24);
    setSelectedAudience('public');
    
    onClose();
  };

  const audienceOptions = [
    {
      id: 'public',
      icon: <Globe size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />,
      title: 'Public',
      description: 'Anyone can see this poll',
    },
    {
      id: 'connections',
      icon: <Users size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />,
      title: 'Connections',
      description: 'Only your connections can see this poll',
    },
    {
      id: 'course',
      icon: <BookOpen size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />,
      title: 'Course',
      description: 'Only students in your course can see this poll',
    },
    {
      id: 'yeargroup',
      icon: <GraduationCap size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />,
      title: 'Year Group',
      description: 'Only students in your year can see this poll',
    },
  ];

  const getAudienceIcon = () => {
    switch (selectedAudience) {
      case 'public':
        return <Globe size={22} color={isDark ? '#60A5FA' : '#3B82F6'} />;
      case 'connections':
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
      case 'connections':
        return 'Connections';
      case 'course':
        return 'Course';
      case 'yeargroup':
        return 'Year Group';
    }
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
                Create Poll
              </Text>
              
              <TouchableOpacity
                style={[styles.audienceSelector, { backgroundColor: isDark ? '#0F172A' : '#F3F4F6' }]}
                onPress={() => setShowAudienceModal(true)}
              >
                {getAudienceIcon()}
                <Text style={[styles.audienceText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                  {getAudienceTitle()}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Poll Question */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Poll Question
                </Text>
                <TextInput
                  style={[
                    styles.pollQuestionInput,
                    { backgroundColor: isDark ? '#1E293B' : '#F9FAFB', color: isDark ? '#E5E7EB' : '#1F2937' }
                  ]}
                  placeholder="Ask a question..."
                  placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                  value={pollQuestion}
                  onChangeText={setPollQuestion}
                  multiline
                />
              </View>

              {/* Poll Options */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Poll Options
                </Text>
                
                <View style={styles.pollOptionsContainer}>
                  {pollOptions.map((option, index) => (
                    <View key={index} style={styles.pollOptionRow}>
                      <TextInput
                        style={[
                          styles.pollOptionInput,
                          { backgroundColor: isDark ? '#1E293B' : '#F9FAFB', color: isDark ? '#E5E7EB' : '#1F2937' }
                        ]}
                        placeholder={`Option ${index + 1}`}
                        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                        value={option}
                        onChangeText={(text) => handleUpdatePollOption(text, index)}
                      />
                      {pollOptions.length > 2 && (
                        <TouchableOpacity
                          style={[styles.removeOptionButton, { backgroundColor: isDark ? '#0F172A' : '#F3F4F6' }]}
                          onPress={() => handleRemovePollOption(index)}
                        >
                          <Minus size={16} color={isDark ? '#E5E7EB' : '#4B5563'} />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}

                  {pollOptions.length < 4 && (
                    <TouchableOpacity
                      style={[styles.addOptionButton, { backgroundColor: isDark ? '#1E293B' : '#F3F4F6' }]}
                      onPress={handleAddPollOption}
                    >
                      <Plus size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
                      <Text style={[styles.addOptionText, { color: isDark ? '#60A5FA' : '#3B82F6' }]}>
                        Add Option
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Poll Duration */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Poll Duration
                </Text>
                
                <View style={styles.pollDurationContainer}>
                  <Clock size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                  <Text style={[styles.pollDurationLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Duration:
                  </Text>
                  <View style={styles.pollDurationOptions}>
                    {[24, 48, 72].map((hours) => (
                      <TouchableOpacity
                        key={hours}
                        style={[
                          styles.pollDurationOption,
                          { 
                            backgroundColor: pollDuration === hours ? 
                              '#3B82F6' : 
                              (isDark ? '#1E293B' : '#F3F4F6')
                          }
                        ]}
                        onPress={() => setPollDuration(hours)}
                      >
                        <Text
                          style={[
                            styles.pollDurationText,
                            { 
                              color: pollDuration === hours ? 
                                '#FFFFFF' : 
                                (isDark ? '#E5E7EB' : '#4B5563')
                            }
                          ]}
                        >
                          {hours}h
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}>
              <TouchableOpacity 
                style={[
                  styles.createButton, 
                  { 
                    backgroundColor: pollQuestion.trim() && pollOptions.every(opt => opt.trim()) ? '#3B82F6' : (isDark ? '#374151' : '#E5E7EB'),
                    opacity: pollQuestion.trim() && pollOptions.every(opt => opt.trim()) ? 1 : 0.5
                  }
                ]}
                onPress={handleCreatePoll}
                disabled={!pollQuestion.trim() || pollOptions.some(opt => opt.trim() === '')}
              >
                <BarChart3 size={20} color="#FFFFFF" />
                <Text style={styles.createButtonText}>Create Poll</Text>
              </TouchableOpacity>
            </View>

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
    height: '85%',
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
  audienceSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  audienceText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 8,
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
    marginBottom: 12,
  },
  pollQuestionInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pollOptionsContainer: {
    gap: 12,
  },
  pollOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pollOptionInput: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  removeOptionButton: {
    padding: 8,
    borderRadius: 8,
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  addOptionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  pollDurationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pollDurationLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  pollDurationOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  pollDurationOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pollDurationText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    borderRadius: 16,
    padding: 16,
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
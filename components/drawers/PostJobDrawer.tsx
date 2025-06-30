import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, Dimensions, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Building2, MapPin, DollarSign, Clock, Users, FileText, Camera, Globe, Briefcase, GraduationCap } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  runOnJS
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface PostJobDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onPostJob: (jobData: any) => void;
}

const jobTypes = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Voluntary'];
const experienceLevels = ['No Experience', 'Entry', 'Mid', 'Senior'];
const departments = [
  'Computer Science', 'Engineering', 'Business', 'Liberal Arts', 'Sciences', 
  'Library', 'Administration', 'Student Services', 'Research', 'Other'
];

export function PostJobDrawer({ isOpen, onClose, onPostJob }: PostJobDrawerProps) {
  const { isDark } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [benefits, setBenefits] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [deadline, setDeadline] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [selectedType, setSelectedType] = useState('Part-time');
  const [selectedExperience, setSelectedExperience] = useState('Entry');
  const [selectedDepartment, setSelectedDepartment] = useState('Computer Science');
  const [isRemote, setIsRemote] = useState(false);
  
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
    setCompany('');
    setDescription('');
    setRequirements('');
    setBenefits('');
    setLocation('');
    setSalary('');
    setDeadline('');
    setContactEmail('');
    setCompanyWebsite('');
    setSelectedType('Part-time');
    setSelectedExperience('Entry');
    setSelectedDepartment('Computer Science');
    setIsRemote(false);
  };

  const handlePostJob = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a job title');
      return;
    }
    
    if (!company.trim()) {
      Alert.alert('Error', 'Please enter a company name');
      return;
    }
    
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a job description');
      return;
    }
    
    if (!location.trim() && !isRemote) {
      Alert.alert('Error', 'Please enter a location or mark as remote');
      return;
    }

    const jobData = {
      title: title.trim(),
      company: company.trim(),
      type: selectedType,
      location: isRemote ? 'Remote' : location.trim(),
      salary: salary.trim() || 'Competitive',
      deadline: deadline.trim() || 'Open until filled',
      description: description.trim(),
      requirements: requirements.trim().split('\n').filter(req => req.trim()),
      benefits: benefits.trim().split('\n').filter(benefit => benefit.trim()),
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
      isRemote,
      experienceLevel: selectedExperience,
      department: selectedDepartment,
      contactEmail: contactEmail.trim() || 'contact@example.com',
      companyWebsite: companyWebsite.trim(),
    };

    onPostJob(jobData);
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
                Post a Job
              </Text>
              
              <TouchableOpacity 
                style={[
                  styles.postButton,
                  { 
                    backgroundColor: title && company && description ? '#3B82F6' : (isDark ? '#374151' : '#E5E7EB'),
                    opacity: title && company && description ? 1 : 0.5
                  }
                ]}
                onPress={handlePostJob}
                disabled={!title || !company || !description}
              >
                <Text style={[
                  styles.postButtonText,
                  { color: title && company && description ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#6B7280') }
                ]}>
                  Post
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Job Image */}
              <TouchableOpacity style={[styles.imageUpload, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}>
                <Camera size={32} color={isDark ? '#60A5FA' : '#3B82F6'} />
                <Text style={[styles.imageUploadText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                  Add Job Image
                </Text>
              </TouchableOpacity>

              {/* Basic Information */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Job Information
                </Text>
                
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Job Title *
                  </Text>
                  <View style={styles.inputWithIcon}>
                    <Briefcase size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    <TextInput
                      style={[
                        styles.textInput,
                        { 
                          backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                          color: isDark ? '#E5E7EB' : '#1F2937',
                          borderColor: isDark ? '#374151' : '#E5E7EB'
                        }
                      ]}
                      placeholder="e.g., Software Engineering Intern"
                      placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                      value={title}
                      onChangeText={setTitle}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Company/Department *
                  </Text>
                  <View style={styles.inputWithIcon}>
                    <Building2 size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    <TextInput
                      style={[
                        styles.textInput,
                        { 
                          backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                          color: isDark ? '#E5E7EB' : '#1F2937',
                          borderColor: isDark ? '#374151' : '#E5E7EB'
                        }
                      ]}
                      placeholder="e.g., Computer Science Department"
                      placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                      value={company}
                      onChangeText={setCompany}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Job Description *
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
                    placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                  />
                </View>
              </View>

              {/* Job Details */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Job Details
                </Text>
                
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Job Type
                  </Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.optionsContainer}
                  >
                    {jobTypes.map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.optionChip,
                          { 
                            backgroundColor: selectedType === type ? '#3B82F6' : (isDark ? '#374151' : '#F3F4F6'),
                            borderColor: selectedType === type ? '#3B82F6' : 'transparent'
                          }
                        ]}
                        onPress={() => setSelectedType(type)}
                      >
                        <Text style={[
                          styles.optionChipText,
                          { color: selectedType === type ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#4B5563') }
                        ]}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Experience Level
                  </Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.optionsContainer}
                  >
                    {experienceLevels.map((level) => (
                      <TouchableOpacity
                        key={level}
                        style={[
                          styles.optionChip,
                          { 
                            backgroundColor: selectedExperience === level ? '#3B82F6' : (isDark ? '#374151' : '#F3F4F6'),
                            borderColor: selectedExperience === level ? '#3B82F6' : 'transparent'
                          }
                        ]}
                        onPress={() => setSelectedExperience(level)}
                      >
                        <Text style={[
                          styles.optionChipText,
                          { color: selectedExperience === level ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#4B5563') }
                        ]}>
                          {level}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Department
                  </Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.optionsContainer}
                  >
                    {departments.map((dept) => (
                      <TouchableOpacity
                        key={dept}
                        style={[
                          styles.optionChip,
                          { 
                            backgroundColor: selectedDepartment === dept ? '#3B82F6' : (isDark ? '#374151' : '#F3F4F6'),
                            borderColor: selectedDepartment === dept ? '#3B82F6' : 'transparent'
                          }
                        ]}
                        onPress={() => setSelectedDepartment(dept)}
                      >
                        <Text style={[
                          styles.optionChipText,
                          { color: selectedDepartment === dept ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#4B5563') }
                        ]}>
                          {dept}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Location and Compensation */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Location & Compensation
                </Text>
                
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingTitle, { color: isDark ? '#E5E7EB' : '#1F2937' }]}>
                      Remote Work
                    </Text>
                    <Text style={[styles.settingDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                      This is a remote position
                    </Text>
                  </View>
                  <Switch
                    value={isRemote}
                    onValueChange={setIsRemote}
                    trackColor={{ false: isDark ? '#374151' : '#E5E7EB', true: '#3B82F6' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                {!isRemote && (
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                      Location
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
                        placeholder="e.g., Main Campus, Library Building"
                        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                        value={location}
                        onChangeText={setLocation}
                      />
                    </View>
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Salary/Compensation (Optional)
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
                      placeholder="e.g., $15-20/hr, Competitive, Unpaid"
                      placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                      value={salary}
                      onChangeText={setSalary}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Application Deadline
                  </Text>
                  <View style={styles.inputWithIcon}>
                    <Clock size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    <TextInput
                      style={[
                        styles.textInput,
                        { 
                          backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                          color: isDark ? '#E5E7EB' : '#1F2937',
                          borderColor: isDark ? '#374151' : '#E5E7EB'
                        }
                      ]}
                      placeholder="e.g., Applications due in 2 weeks"
                      placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                      value={deadline}
                      onChangeText={setDeadline}
                    />
                  </View>
                </View>
              </View>

              {/* Requirements and Benefits */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Additional Details
                </Text>
                
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Requirements (one per line)
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
                    placeholder="Currently enrolled student&#10;Strong communication skills&#10;Previous experience preferred"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={requirements}
                    onChangeText={setRequirements}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Benefits (one per line)
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
                    placeholder="Flexible working hours&#10;Professional development&#10;Networking opportunities"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={benefits}
                    onChangeText={setBenefits}
                    multiline
                    numberOfLines={4}
                  />
                </View>
              </View>

              {/* Contact Information */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Contact Information
                </Text>
                
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Contact Email (Optional)
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
                    placeholder="hiring@company.com"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={contactEmail}
                    onChangeText={setContactEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Company Website (Optional)
                  </Text>
                  <View style={styles.inputWithIcon}>
                    <Globe size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    <TextInput
                      style={[
                        styles.textInput,
                        { 
                          backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                          color: isDark ? '#E5E7EB' : '#1F2937',
                          borderColor: isDark ? '#374151' : '#E5E7EB'
                        }
                      ]}
                      placeholder="https://company.com"
                      placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                      value={companyWebsite}
                      onChangeText={setCompanyWebsite}
                      keyboardType="url"
                      autoCapitalize="none"
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
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  optionsContainer: {
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  optionChipText: {
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
});
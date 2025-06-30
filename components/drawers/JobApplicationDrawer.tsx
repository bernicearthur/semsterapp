import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, Dimensions, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, User, Mail, Phone, FileText, Upload, ExternalLink, Building2, MapPin, DollarSign, Clock, Users, Star, Globe, Paperclip, Send } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  runOnJS
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface Job {
  id: string;
  title: string;
  company: string;
  type: string;
  location: string;
  salary: string;
  posted: string;
  deadline: string;
  description: string;
  requirements: string[];
  benefits: string[];
  image: string;
  isRemote: boolean;
  experienceLevel: string;
  department: string;
  applicants: number;
  isSaved: boolean;
  isApplied: boolean;
  contactEmail: string;
  companyWebsite?: string;
}

interface JobApplicationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  onSubmitApplication: (applicationData: any) => void;
}

export function JobApplicationDrawer({ isOpen, onClose, job, onSubmitApplication }: JobApplicationDrawerProps) {
  const { isDark } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [showJobDetails, setShowJobDetails] = useState(false);
  
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
    setFullName('');
    setEmail('');
    setPhone('');
    setCoverLetter('');
    setResumeUploaded(false);
    setShowJobDetails(false);
  };

  const handleSubmitApplication = () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }
    
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    const applicationData = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      coverLetter: coverLetter.trim(),
      jobId: job?.id,
      hasResume: resumeUploaded
    };

    onSubmitApplication(applicationData);
    resetForm();
  };

  const handleUploadResume = () => {
    // Simulate resume upload
    setTimeout(() => {
      setResumeUploaded(true);
      Alert.alert('Success', 'Resume uploaded successfully');
    }, 500);
  };

  const handleVisitWebsite = () => {
    if (job?.companyWebsite) {
      Linking.openURL(job.companyWebsite).catch(() => {
        Alert.alert('Error', 'Unable to open the website');
      });
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen || !job) return null;

  return (
    <View style={[StyleSheet.absoluteFill, styles.container]}>
      <GestureDetector gesture={gesture}>
        <Animated.View 
          style={[
            styles.drawer,
            { backgroundColor: isDark ? '#0F172A' : '#FFFFFF', width: screenWidth, height: screenHeight },
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
                Apply for Job
              </Text>
              
              <View style={{ width: 32 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Job Summary */}
              <View style={[styles.jobSummary, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}>
                <Text style={[styles.jobTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  {job.title}
                </Text>
                <View style={styles.jobMeta}>
                  <View style={styles.metaItem}>
                    <Building2 size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    <Text style={[styles.metaText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                      {job.company}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <MapPin size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    <Text style={[styles.metaText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                      {job.location}
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={styles.viewDetailsButton}
                  onPress={() => setShowJobDetails(!showJobDetails)}
                >
                  <Text style={[styles.viewDetailsText, { color: isDark ? '#60A5FA' : '#3B82F6' }]}>
                    {showJobDetails ? 'Hide Details' : 'View Full Job Details'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Job Details (Collapsible) */}
              {showJobDetails && (
                <View style={[styles.jobDetails, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}>
                  <Text style={[styles.detailsTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    Job Description
                  </Text>
                  <Text style={[styles.detailsText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    {job.description}
                  </Text>
                  
                  <Text style={[styles.detailsTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    Requirements
                  </Text>
                  {job.requirements.map((req, index) => (
                    <View key={index} style={styles.listItem}>
                      <Text style={[styles.listBullet, { color: isDark ? '#60A5FA' : '#3B82F6' }]}>•</Text>
                      <Text style={[styles.listText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                        {req}
                      </Text>
                    </View>
                  ))}
                  
                  <Text style={[styles.detailsTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    Benefits
                  </Text>
                  {job.benefits.map((benefit, index) => (
                    <View key={index} style={styles.listItem}>
                      <Text style={[styles.listBullet, { color: isDark ? '#60A5FA' : '#3B82F6' }]}>•</Text>
                      <Text style={[styles.listText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                        {benefit}
                      </Text>
                    </View>
                  ))}
                  
                  <View style={styles.additionalDetails}>
                    <View style={styles.detailItem}>
                      <DollarSign size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
                      <Text style={[styles.detailText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                        {job.salary}
                      </Text>
                    </View>
                    
                    <View style={styles.detailItem}>
                      <Clock size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
                      <Text style={[styles.detailText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                        {job.deadline}
                      </Text>
                    </View>
                    
                    <View style={styles.detailItem}>
                      <Users size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
                      <Text style={[styles.detailText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                        {job.applicants} applicants
                      </Text>
                    </View>
                    
                    <View style={styles.detailItem}>
                      <Star size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
                      <Text style={[styles.detailText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                        {job.experienceLevel} level
                      </Text>
                    </View>
                  </View>
                  
                  {job.companyWebsite && (
                    <TouchableOpacity 
                      style={[styles.websiteButton, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}
                      onPress={handleVisitWebsite}
                    >
                      <Globe size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
                      <Text style={[styles.websiteButtonText, { color: isDark ? '#60A5FA' : '#3B82F6' }]}>
                        Visit Company Website
                      </Text>
                      <ExternalLink size={14} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Application Form */}
              <View style={styles.applicationForm}>
                <Text style={[styles.formTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Your Information
                </Text>
                
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Full Name *
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
                      value={fullName}
                      onChangeText={setFullName}
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
                      value={email}
                      onChangeText={setEmail}
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
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Cover Letter (Optional)
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
                    placeholder="Explain why you're a good fit for this position..."
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={coverLetter}
                    onChangeText={setCoverLetter}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Resume/CV (Optional)
                  </Text>
                  <TouchableOpacity 
                    style={[
                      styles.uploadButton,
                      { 
                        backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                        borderColor: resumeUploaded ? '#10B981' : (isDark ? '#374151' : '#E5E7EB')
                      }
                    ]}
                    onPress={handleUploadResume}
                  >
                    {resumeUploaded ? (
                      <>
                        <FileText size={24} color="#10B981" />
                        <View style={styles.uploadedFileInfo}>
                          <Text style={[styles.uploadedFileName, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                            resume.pdf
                          </Text>
                          <Text style={[styles.uploadedFileSize, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                            245 KB
                          </Text>
                        </View>
                        <TouchableOpacity 
                          style={[styles.changeFileButton, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]}
                          onPress={handleUploadResume}
                        >
                          <Text style={[styles.changeFileText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                            Change
                          </Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <Upload size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />
                        <Text style={[styles.uploadButtonText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                          Upload Resume/CV
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.additionalDocuments}>
                  <TouchableOpacity 
                    style={[styles.addDocumentButton, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}
                  >
                    <Paperclip size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    <Text style={[styles.addDocumentText, { color: isDark ? '#60A5FA' : '#3B82F6' }]}>
                      Add Additional Documents
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            {/* Submit Button */}
            <View style={[styles.submitContainer, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}>
              <TouchableOpacity 
                style={[
                  styles.submitButton,
                  { 
                    backgroundColor: fullName && email ? '#3B82F6' : (isDark ? '#374151' : '#E5E7EB'),
                    opacity: fullName && email ? 1 : 0.5
                  }
                ]}
                onPress={handleSubmitApplication}
                disabled={!fullName || !email}
              >
                <Send size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>
                  Submit Application
                </Text>
              </TouchableOpacity>
            </View>
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
  content: {
    flex: 1,
  },
  jobSummary: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  jobTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  jobMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  viewDetailsButton: {
    alignSelf: 'flex-start',
  },
  viewDetailsText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  jobDetails: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  detailsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  detailsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  listBullet: {
    fontSize: 16,
    marginRight: 8,
    width: 12,
  },
  listText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  additionalDetails: {
    marginTop: 16,
    marginBottom: 16,
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  websiteButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  applicationForm: {
    padding: 16,
  },
  formTitle: {
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
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 12,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginLeft: 12,
  },
  uploadedFileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  uploadedFileName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  uploadedFileSize: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  changeFileButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  changeFileText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  additionalDocuments: {
    marginBottom: 24,
  },
  addDocumentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addDocumentText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  submitContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});
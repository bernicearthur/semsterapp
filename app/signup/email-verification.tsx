import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, Mail, CircleAlert as AlertCircle, CheckCircle } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { validateSchoolEmail, getSchoolFromEmail } from '@/lib/school-utils';

export default function EmailVerificationScreen() {
  const { isDark } = useTheme();
  const { currentStep, setCurrentStep, updateSignUpData, signUpData } = useAuth();
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  useEffect(() => {
    // Ensure we're on the correct step
    setCurrentStep(2);
  }, []);

  useEffect(() => {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidFormat = emailRegex.test(email);
    setIsValid(isValidFormat);
    
    // Clear error when user types
    if (error) setError('');
    if (success) setSuccess('');
    
    // Check if it's a school email when the user stops typing
    if (isValidFormat) {
      const timeoutId = setTimeout(() => {
        checkSchoolEmail(email);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [email]);

  const checkSchoolEmail = async (emailToCheck: string) => {
    if (!emailToCheck) return;
    
    setIsCheckingEmail(true);
    
    try {
      const isSchoolEmail = await validateSchoolEmail(emailToCheck);
      
      if (!isSchoolEmail) {
        setError('Please use your school email address or a valid email for testing');
        setIsValid(false);
      } else {
        // Get the school name from the email
        const schoolName = await getSchoolFromEmail(emailToCheck);
        if (schoolName) {
          // Update the school in sign up data if it's different
          if (signUpData.school !== schoolName) {
            updateSignUpData({ school: schoolName });
          }
        }
        setError(''); // Clear any previous errors
      }
    } catch (err) {
      console.error('Error checking school email:', err);
      // Don't show error to user for network issues, just log it
      // The validation will happen again on continue
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleContinue = async () => {
    if (!isValid) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError(''); // Clear any previous errors
    setSuccess(''); // Clear any previous success messages

    try {
      // Final check if it's a school email
      const isSchoolEmail = await validateSchoolEmail(email);
      if (!isSchoolEmail) {
        setError('Please use your school email address or a valid email for testing');
        setIsLoading(false);
        return;
      }

      // Get school name and update signup data
      const schoolName = await getSchoolFromEmail(email);
      if (schoolName) {
        updateSignUpData({ school: schoolName });
      }

      // Store the email in sign up data
      updateSignUpData({ email });
      
      // Try to sign up with a temporary password to trigger email verification
      const { data, error } = await supabase.auth.signUp({
        email,
        password: 'TEMPORARY_PASSWORD_FOR_VERIFICATION', // This will be changed later
        options: {
          emailRedirectTo: window.location.origin + '/signup/otp-verification',
          data: {
            email,
            school: schoolName || ''
          }
        }
      });
      
      if (error) {
        // If the user already exists but is not confirmed, resend the confirmation email
        if (error.message.includes('already registered')) {
          setSuccess('A verification code has been sent to your email. Please check your inbox and spam folder.');
          
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email,
            options: {
              emailRedirectTo: window.location.origin + '/signup/otp-verification',
            }
          });
          
          if (resendError) {
            setError(resendError.message);
            setIsLoading(false);
            return;
          }
        } else {
          setError(error.message);
          setIsLoading(false);
          return;
        }
      } else {
        setSuccess('A verification code has been sent to your email. Please check your inbox and spam folder.');
      }
      
      // Wait a moment to show the success message before navigating
      setTimeout(() => {
        router.push('/signup/otp-verification');
      }, 2000);
    } catch (err: any) {
      console.error('Email verification error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color={isDark ? '#E5E7EB' : '#4B5563'} />
          </TouchableOpacity>
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, { backgroundColor: '#3B82F6' }]}>
              <Text style={styles.stepNumber}>✓</Text>
            </View>
            <View style={[styles.stepLine, { backgroundColor: '#3B82F6' }]} />
            <View style={[styles.stepDot, { backgroundColor: '#3B82F6' }]}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <View style={[styles.stepLine, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]} />
            <View style={[styles.stepDot, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]}>
              <Text style={[styles.stepNumber, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>3</Text>
            </View>
            <View style={[styles.stepLine, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]} />
            <View style={[styles.stepDot, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]}>
              <Text style={[styles.stepNumber, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>4</Text>
            </View>
            <View style={[styles.stepLine, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]} />
            <View style={[styles.stepDot, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]}>
              <Text style={[styles.stepNumber, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>5</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#111827' }]}>
            Verify Your Email
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Enter your school email address to receive a verification code
          </Text>

          {error ? (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : success ? (
            <View style={styles.successContainer}>
              <CheckCircle size={16} color="#10B981" />
              <Text style={styles.successText}>{success}</Text>
            </View>
          ) : (
            <Text style={[styles.helperText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              We'll send a verification code to this email
            </Text>
          )}

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
              School Email *
            </Text>
            <View style={[
              styles.inputContainer,
              { 
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: error ? '#EF4444' : success ? '#10B981' : isDark ? '#374151' : '#E5E7EB'
              }
            ]}>
              <Mail size={20} color={error ? '#EF4444' : success ? '#10B981' : (isDark ? '#60A5FA' : '#3B82F6')} />
              <TextInput
                style={[styles.input, { color: isDark ? '#E5E7EB' : '#1F2937' }]}
                placeholder="your.name@school.edu"
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!isLoading}
              />
              {isCheckingEmail && (
                <ActivityIndicator size="small" color={isDark ? '#60A5FA' : '#3B82F6'} />
              )}
            </View>
          </View>

          <View style={styles.schoolInfo}>
            <Text style={[styles.schoolInfoLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
              Selected School:
            </Text>
            <Text style={[styles.schoolName, { color: isDark ? '#FFFFFF' : '#111827' }]}>
              {signUpData.school || 'Will be detected from your email'}
            </Text>
          </View>
          
          <View style={styles.noticeContainer}>
            <Text style={[styles.noticeText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              For testing purposes, you can use common email domains like gmail.com, yahoo.com, etc.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[
              styles.continueButton, 
              { 
                backgroundColor: isValid && !isCheckingEmail ? '#3B82F6' : (isDark ? '#374151' : '#E5E7EB'),
                opacity: isValid && !isCheckingEmail && !isLoading ? 1 : 0.5
              }
            ]}
            onPress={handleContinue}
            disabled={!isValid || isCheckingEmail || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={[
                  styles.continueButtonText,
                  { color: isValid ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#6B7280') }
                ]}>
                  Continue
                </Text>
                <ArrowRight 
                  size={20} 
                  color={isValid ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#6B7280')} 
                />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  stepIndicator: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 40, // To balance the back button
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  stepLine: {
    height: 2,
    width: 20,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 24,
    textAlign: 'center',
    alignSelf: 'center',
    maxWidth: '80%',
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 56,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginLeft: 6,
    flex: 1,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successText: {
    color: '#10B981',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginLeft: 6,
    flex: 1,
  },
  helperText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
  },
  schoolInfo: {
    marginTop: 32,
    alignItems: 'center',
  },
  schoolInfoLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  schoolName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  noticeContainer: {
    marginTop: 24,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#60A5FA',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  noticeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  footer: {
    padding: 24,
    paddingTop: 0,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});
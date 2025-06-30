import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, CircleCheck as CheckCircle, AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function OtpVerificationScreen() {
  const { isDark } = useTheme();
  const { currentStep, setCurrentStep, signUpData } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const screenWidth = Dimensions.get('window').width;
  const inputWidth = (screenWidth - 96) / 6; // Calculate width based on screen size

  useEffect(() => {
    // Ensure we're on the correct step
    setCurrentStep(3);
  }, []);

  useEffect(() => {
    // Countdown for resend button
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleBack = () => {
    router.back();
  };

  const handleOtpChange = (text: string, index: number) => {
    if (text.length > 1) {
      text = text[0]; // Only take the first character
    }
    
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    
    // Auto-focus next input if value is entered
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Clear any previous errors
    if (error) {
      setError('');
    }
    
    // Clear any previous success
    if (success) {
      setSuccess('');
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace to move to previous input
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Verify OTP with Supabase
      const { data, error } = await supabase.auth.verifyOtp({
        email: signUpData.email || '',
        token: otpValue,
        type: 'signup',
      });

      if (error) {
        console.error('OTP verification error:', error);
        setError(error.message || 'Invalid verification code. Please try again.');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setIsVerified(true);
      setSuccess('Email verified successfully!');
      
      // Navigate to next step after showing success state
      setTimeout(() => {
        router.push('/signup/profile-setup');
      }, 1500);
    } catch (error: any) {
      console.error('OTP verification error:', error);
      setError(error.message || 'An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCountdown > 0 || isLoading) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (!signUpData.email) {
        setError('Email address is missing. Please go back and enter your email.');
        setIsLoading(false);
        return;
      }
      
      // Resend the verification email
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: signUpData.email,
        options: {
          emailRedirectTo: window.location.origin + '/signup/otp-verification',
        }
      });
      
      if (error) {
        setError(error.message || 'Failed to resend verification code');
        setIsLoading(false);
        return;
      }
      
      setResendCountdown(60);
      setSuccess(`A new verification code has been sent to ${signUpData.email}. Please check your inbox and spam folder.`);
      setIsLoading(false);
    } catch (error: any) {
      console.error('Error resending code:', error);
      setError(error.message || 'Failed to resend verification code');
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
              <Text style={styles.stepNumber}>✓</Text>
            </View>
            <View style={[styles.stepLine, { backgroundColor: '#3B82F6' }]} />
            <View style={[styles.stepDot, { backgroundColor: '#3B82F6' }]}>
              <Text style={styles.stepNumber}>3</Text>
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
            Verification Code
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Enter the 6-digit code sent to {signUpData.email || 'your email'}
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
          ) : null}

          {isVerified ? (
            <View style={styles.verificationSuccess}>
              <View style={styles.successIcon}>
                <CheckCircle size={64} color="#10B981" />
              </View>
              <Text style={styles.successText}>Email Verified!</Text>
              <Text style={[styles.successSubtext, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Redirecting to the next step...
              </Text>
            </View>
          ) : (
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => inputRefs.current[index] = ref}
                  style={[
                    styles.otpInput,
                    { 
                      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                      borderColor: error ? '#EF4444' : success ? '#10B981' : isDark ? '#374151' : '#E5E7EB',
                      color: isDark ? '#E5E7EB' : '#1F2937',
                      width: inputWidth,
                      height: inputWidth * 1.2
                    }
                  ]}
                  value={digit}
                  onChangeText={text => handleOtpChange(text, index)}
                  onKeyPress={e => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  fontSize={24}
                  fontFamily="Inter-Bold"
                  editable={!isLoading && !isVerified}
                />
              ))}
            </View>
          )}

          <View style={styles.resendContainer}>
            <Text style={[styles.resendText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Didn't receive the code?
            </Text>
            <TouchableOpacity 
              onPress={handleResendCode}
              disabled={resendCountdown > 0 || isLoading || isVerified}
            >
              <Text style={[
                styles.resendButton,
                { 
                  color: (resendCountdown > 0 || isLoading || isVerified) ? 
                    (isDark ? '#9CA3AF' : '#6B7280') : 
                    (isDark ? '#60A5FA' : '#3B82F6') 
                }
              ]}>
                {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.emailCheckContainer}>
            <Text style={[styles.emailCheckText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Please check both your inbox and spam folder for the verification email.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[
              styles.verifyButton, 
              { 
                backgroundColor: otp.every(digit => digit) && !isVerified ? '#3B82F6' : (isDark ? '#374151' : '#E5E7EB'),
                opacity: otp.every(digit => digit) && !isVerified && !isLoading ? 1 : 0.5
              }
            ]}
            onPress={handleVerify}
            disabled={!otp.every(digit => digit) || isVerified || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={[
                  styles.verifyButtonText,
                  { 
                    color: otp.every(digit => digit) && !isVerified ? 
                      '#FFFFFF' : 
                      (isDark ? '#9CA3AF' : '#6B7280')
                  }
                ]}>
                  Verify
                </Text>
                <ArrowRight 
                  size={20} 
                  color={otp.every(digit => digit) && !isVerified ? 
                    '#FFFFFF' : 
                    (isDark ? '#9CA3AF' : '#6B7280')
                  } 
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
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 32,
    textAlign: 'center',
    maxWidth: '80%',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  errorText: {
    color: '#EF4444',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  successText: {
    color: '#10B981',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 8,
    marginBottom: 32,
  },
  otpInput: {
    borderWidth: 1,
    borderRadius: 12,
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  verificationSuccess: {
    alignItems: 'center',
    marginVertical: 40,
  },
  successIcon: {
    marginBottom: 16,
  },
  successSubtext: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginTop: 8,
    textAlign: 'center',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  resendText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginRight: 4,
  },
  resendButton: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  emailCheckContainer: {
    marginTop: 24,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#60A5FA',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    width: '100%',
  },
  emailCheckText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  footer: {
    padding: 24,
    paddingTop: 0,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  verifyButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});
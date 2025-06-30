import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Mail, CircleCheck as CheckCircle2 } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordScreen() {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleSendResetLink = async () => {
    setError('');
    
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://your-app-url.com/reset-password',
      });
      
      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(false);
      setIsEmailSent(true);
    } catch (err) {
      console.error('Password reset error:', err);
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackToSignIn}
          >
            <ArrowLeft size={24} color={isDark ? '#E5E7EB' : '#4B5563'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
            Forgot Password
          </Text>
          <View style={styles.headerRight} />
        </View>
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {!isEmailSent ? (
            <View style={[styles.formCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
              <Text style={[styles.formTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Reset Your Password
              </Text>
              
              <Text style={[styles.formDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Enter your email address and we'll send you a link to reset your password.
              </Text>
              
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                  Email
                </Text>
                <View style={[
                  styles.inputContainer, 
                  { backgroundColor: isDark ? '#0F172A' : '#F9FAFB', borderColor: isDark ? '#374151' : '#E5E7EB' }
                ]}>
                  <Mail size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                  <TextInput
                    style={[styles.input, { color: isDark ? '#E5E7EB' : '#1F2937' }]}
                    placeholder="Enter your email"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>
              </View>
              
              <TouchableOpacity 
                style={[
                  styles.resetButton, 
                  { backgroundColor: '#3B82F6' },
                  isLoading && { opacity: 0.7 }
                ]}
                onPress={handleSendResetLink}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.resetButtonText}>Send Reset Link</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.formCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
              <View style={styles.successIconContainer}>
                <CheckCircle2 size={64} color="#10B981" />
              </View>
              
              <Text style={[styles.formTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Check Your Email
              </Text>
              
              <Text style={[styles.formDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                We've sent a password reset link to:
              </Text>
              
              <Text style={[styles.emailSent, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                {email}
              </Text>
              
              <Text style={[styles.formDescription, { color: isDark ? '#9CA3AF' : '#6B7280', marginTop: 16 }]}>
                Please check your email and follow the instructions to reset your password. The link will expire in 1 hour.
              </Text>
              
              <TouchableOpacity 
                style={[styles.resetButton, { backgroundColor: '#3B82F6' }]}
                onPress={handleBackToSignIn}
              >
                <Text style={styles.resetButtonText}>Back to Sign In</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.resendButton}
                onPress={handleSendResetLink}
              >
                <Text style={[styles.resendButtonText, { color: isDark ? '#60A5FA' : '#3B82F6' }]}>
                  Didn't receive the email? Resend
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  formCard: {
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  formTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  formDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
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
    height: 50,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  resetButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  emailSent: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    marginBottom: 16,
  },
  resendButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  resendButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
});
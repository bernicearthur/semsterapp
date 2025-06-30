import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Eye, EyeOff, Mail, Key, ArrowRight, GraduationCap, User, Calendar, Check, ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

const { width } = Dimensions.get('window');

export default function SignUpScreen() {
  const { isDark } = useTheme();
  const { signInWithSocial } = useAuth();
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  
  const handleSchoolSelection = () => {
    router.push('/signup/school-selection');
  };

  const handleSocialSignUp = async (provider: 'google' | 'microsoft') => {
    setSocialLoading(provider);
    
    try {
      const { error } = await signInWithSocial(provider);
      
      if (error) {
        console.error(`Error signing up with ${provider}:`, error);
        alert(`Failed to sign up with ${provider}: ${error.message}`);
      }
    } catch (error) {
      console.error(`Error signing up with ${provider}:`, error);
      alert(`Failed to sign up with ${provider}`);
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <View style={[styles.logoCircle, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
              <GraduationCap size={48} color={isDark ? '#60A5FA' : '#3B82F6'} />
            </View>
            <Text style={[styles.logoText, { color: isDark ? '#FFFFFF' : '#111827' }]}>
              Semster
            </Text>
            <Text style={[styles.tagline, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Connect. Learn. Thrive.
            </Text>
          </View>

          <View style={[styles.formCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
            <Text style={[styles.formTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
              Create Your Account
            </Text>
            
            <Text style={[styles.formDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Join your campus community and connect with fellow students, access resources, and stay updated on events.
            </Text>
            
            <TouchableOpacity 
              style={[styles.getStartedButton, { backgroundColor: '#3B82F6' }]}
              onPress={handleSchoolSelection}
            >
              <Text style={styles.getStartedButtonText}>Get Started</Text>
              <ArrowRight size={20} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]} />
              <Text style={[styles.dividerText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                or continue with
              </Text>
              <View style={[styles.divider, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]} />
            </View>
            
            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity 
                style={[
                  styles.socialButton, 
                  { backgroundColor: isDark ? '#0F172A' : '#F9FAFB', borderColor: isDark ? '#374151' : '#E5E7EB' }
                ]}
                onPress={() => handleSocialSignUp('google')}
                disabled={!!socialLoading}
              >
                {socialLoading === 'google' ? (
                  <ActivityIndicator size="small" color={isDark ? '#60A5FA' : '#3B82F6'} />
                ) : (
                  <>
                    <View style={styles.googleIcon}>
                      <View style={[styles.googleIconSegment, { backgroundColor: '#4285F4' }]} />
                      <View style={[styles.googleIconSegment, { backgroundColor: '#34A853' }]} />
                      <View style={[styles.googleIconSegment, { backgroundColor: '#FBBC05' }]} />
                      <View style={[styles.googleIconSegment, { backgroundColor: '#EA4335' }]} />
                    </View>
                    <Text style={[styles.socialButtonText, { color: isDark ? '#E5E7EB' : '#1F2937' }]}>
                      Google
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.socialButton, 
                  { backgroundColor: isDark ? '#0F172A' : '#F9FAFB', borderColor: isDark ? '#374151' : '#E5E7EB' }
                ]}
                onPress={() => handleSocialSignUp('microsoft')}
                disabled={!!socialLoading}
              >
                {socialLoading === 'microsoft' ? (
                  <ActivityIndicator size="small" color={isDark ? '#60A5FA' : '#3B82F6'} />
                ) : (
                  <>
                    <View style={styles.microsoftIcon}>
                      <View style={[styles.microsoftSquare, { backgroundColor: '#F25022' }]} />
                      <View style={[styles.microsoftSquare, { backgroundColor: '#7FBA00' }]} />
                      <View style={[styles.microsoftSquare, { backgroundColor: '#00A4EF' }]} />
                      <View style={[styles.microsoftSquare, { backgroundColor: '#FFB900' }]} />
                    </View>
                    <Text style={[styles.socialButtonText, { color: isDark ? '#E5E7EB' : '#1F2937' }]}>
                      Microsoft
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.signInContainer}>
            <Text style={[styles.signInText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => router.push('/')}>
              <Text style={[styles.signInLink, { color: isDark ? '#60A5FA' : '#3B82F6' }]}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  logoText: {
    fontSize: 36,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  formCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
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
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  getStartedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  googleIcon: {
    width: 20,
    height: 20,
    position: 'relative',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  googleIconSegment: {
    width: 10,
    height: 10,
  },
  socialButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signInText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginRight: 4,
  },
  signInLink: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  microsoftIcon: {
    width: 20,
    height: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  microsoftSquare: {
    width: 9,
    height: 9,
    margin: 0.5,
  },
});
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Eye, EyeOff, Mail, Key, ArrowRight, GraduationCap } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

export default function SignInScreen() {
  const { isDark } = useTheme();
  const { signIn, loading: authLoading, signInWithUsername, signInWithGoogle, signInWithMicrosoft } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEmail, setIsEmail] = useState(true);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  useEffect(() => {
    // Clear error when user types
    if (error && (identifier || password)) {
      setError('');
    }

    // Check if input is email or username
    setIsEmail(identifier.includes('@'));
  }, [identifier, password]);

  const handleSignIn = async () => {
    if (!identifier.trim()) {
      setError('Please enter your email or username');
      return;
    }
    
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      let result;
      
      if (isEmail) {
        // Sign in with email
        result = await signIn(identifier, password);
      } else {
        // Sign in with username
        result = await signInWithUsername(identifier, password);
      }
      
      if (result.error) {
        setError(result.error.message || 'Invalid credentials');
        setIsLoading(false);
        return;
      }
      
      // Navigation is handled in the signIn function
    } catch (err) {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  const handleSignUp = () => {
    router.push('/signup');
  };

  const handleSocialSignIn = async (provider: 'google' | 'microsoft') => {
    setSocialLoading(provider);
    
    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else {
        await signInWithMicrosoft();
      }
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
      setError(`Failed to sign in with ${provider}`);
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
              Sign In
            </Text>
            
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                Email or Username
              </Text>
              <View style={[
                styles.inputContainer, 
                { backgroundColor: isDark ? '#0F172A' : '#F9FAFB', borderColor: isDark ? '#374151' : '#E5E7EB' }
              ]}>
                <Mail size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                <TextInput
                  style={[styles.input, { color: isDark ? '#E5E7EB' : '#1F2937' }]}
                  placeholder="Enter your email or username"
                  placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                  value={identifier}
                  onChangeText={setIdentifier}
                  keyboardType={isEmail ? "email-address" : "default"}
                  autoCapitalize="none"
                  autoComplete={isEmail ? "email" : "username"}
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                Password
              </Text>
              <View style={[
                styles.inputContainer, 
                { backgroundColor: isDark ? '#0F172A' : '#F9FAFB', borderColor: isDark ? '#374151' : '#E5E7EB' }
              ]}>
                <Key size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                <TextInput
                  style={[styles.input, { color: isDark ? '#E5E7EB' : '#1F2937' }]}
                  placeholder="Enter your password"
                  placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                  ) : (
                    <Eye size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.forgotPasswordButton}
              onPress={handleForgotPassword}
            >
              <Text style={[styles.forgotPasswordText, { color: isDark ? '#60A5FA' : '#3B82F6' }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.signInButton, 
                { backgroundColor: '#3B82F6' },
                isLoading && { opacity: 0.7 }
              ]}
              onPress={handleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View style={styles.signInButtonContent}>
                  <Text style={styles.signInButtonText}>Sign In</Text>
                  <ArrowRight size={20} color="#FFFFFF" />
                </View>
              )}
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
                onPress={() => handleSocialSignIn('google')}
                disabled={!!socialLoading}
              >
                {socialLoading === 'google' ? (
                  <ActivityIndicator size="small" color={isDark ? '#60A5FA' : '#3B82F6'} />
                ) : (
                  <>
                    <View style={styles.googleIconContainer}>
                      <View style={styles.googleIcon}>
                        <View style={[styles.googleIconSegment, { backgroundColor: '#4285F4' }]} />
                        <View style={[styles.googleIconSegment, { backgroundColor: '#34A853' }]} />
                        <View style={[styles.googleIconSegment, { backgroundColor: '#FBBC05' }]} />
                        <View style={[styles.googleIconSegment, { backgroundColor: '#EA4335' }]} />
                      </View>
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
                onPress={() => handleSocialSignIn('microsoft')}
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
          
          <View style={styles.signUpContainer}>
            <Text style={[styles.signUpText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
              Don't have an account?
            </Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text style={[styles.signUpLink, { color: isDark ? '#60A5FA' : '#3B82F6' }]}>
                Sign Up
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
  logoImage: {
    width: 80,
    height: 80,
  },
  logoText: {
    fontSize: 36,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
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
    marginBottom: 24,
    textAlign: 'center',
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
    marginBottom: 16,
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
  eyeButton: {
    padding: 4,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  signInButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
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
  googleIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
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
  socialButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signUpText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginRight: 4,
  },
  signUpLink: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
});
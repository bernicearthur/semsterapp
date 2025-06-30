import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, Key, Eye, EyeOff, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Shield } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

export default function PasswordCreationScreen() {
  const { isDark } = useTheme();
  const { currentStep, setCurrentStep, signUp, updateSignUpData, signUpData } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Password strength criteria
  const [hasMinLength, setHasMinLength] = useState(false);
  const [hasUppercase, setHasUppercase] = useState(false);
  const [hasLowercase, setHasLowercase] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);

  useEffect(() => {
    // Ensure we're on the correct step
    setCurrentStep(5);
  }, []);

  useEffect(() => {
    // Check password strength
    setHasMinLength(password.length >= 8);
    setHasUppercase(/[A-Z]/.test(password));
    setHasLowercase(/[a-z]/.test(password));
    setHasNumber(/[0-9]/.test(password));
    setHasSpecialChar(/[!@#$%^&*(),.?":{}|<>]/.test(password));
    
    // Clear errors when user types
    if (passwordError) setPasswordError('');
    if (confirmPasswordError && confirmPassword) setConfirmPasswordError('');
  }, [password, confirmPassword]);

  const handleBack = () => {
    router.back();
  };

  const validatePassword = () => {
    if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber) {
      setPasswordError('Please ensure your password meets all requirements');
      return false;
    }
    
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleCreateAccount = async () => {
    if (!validatePassword()) return;

    setIsLoading(true);

    // Store password in sign-up data
    updateSignUpData({ password });

    // Attempt to create account with Supabase
    try {
      const { error } = await signUp(signUpData.email || '', password);
      
      if (error) {
        console.error('Error creating account:', error);
        Alert.alert('Error', error.message || 'Failed to create account');
        setIsLoading(false);
        return;
      }
      
      // Account created successfully
      setIsSuccess(true);
      
      // Show success message and redirect to login page after a delay
      setTimeout(() => {
        Alert.alert(
          'Account Created Successfully!',
          'Your account has been created. You can now sign in with your email and password.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/')
            }
          ]
        );
      }, 1500);
    } catch (error: any) {
      console.error('Error creating account:', error);
      Alert.alert('Error', error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    let strength = 0;
    if (hasMinLength) strength++;
    if (hasUppercase) strength++;
    if (hasLowercase) strength++;
    if (hasNumber) strength++;
    if (hasSpecialChar) strength++;
    
    if (strength <= 2) return 'Weak';
    if (strength <= 4) return 'Medium';
    return 'Strong';
  };

  const getPasswordStrengthColor = () => {
    const strength = getPasswordStrength();
    if (strength === 'Weak') return '#EF4444';
    if (strength === 'Medium') return '#F59E0B';
    return '#10B981';
  };

  if (isSuccess) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}>
        <View style={styles.successContainer}>
          <CheckCircle size={80} color="#10B981" />
          <Text style={[styles.successTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
            Account Created!
          </Text>
          <Text style={[styles.successMessage, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Your account has been created successfully. You will be redirected to the sign in page.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
              <Text style={styles.stepNumber}>✓</Text>
            </View>
            <View style={[styles.stepLine, { backgroundColor: '#3B82F6' }]} />
            <View style={[styles.stepDot, { backgroundColor: '#3B82F6' }]}>
              <Text style={styles.stepNumber}>✓</Text>
            </View>
            <View style={[styles.stepLine, { backgroundColor: '#3B82F6' }]} />
            <View style={[styles.stepDot, { backgroundColor: '#3B82F6' }]}>
              <Text style={styles.stepNumber}>5</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#111827' }]}>
            Create Password
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Set a secure password for your account
          </Text>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
              Password *
            </Text>
            <View style={[
              styles.inputContainer,
              { 
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: passwordError ? '#EF4444' : isDark ? '#374151' : '#E5E7EB'
              }
            ]}>
              <Key size={20} color={passwordError ? '#EF4444' : (isDark ? '#60A5FA' : '#3B82F6')} />
              <TextInput
                style={[styles.input, { color: isDark ? '#E5E7EB' : '#1F2937' }]}
                placeholder="Create a password"
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                ) : (
                  <Eye size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                )}
              </TouchableOpacity>
            </View>
            {passwordError ? (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color="#EF4444" />
                <Text style={styles.errorText}>{passwordError}</Text>
              </View>
            ) : (
              <View style={styles.passwordStrengthContainer}>
                <Text style={[styles.passwordStrengthLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  Password Strength:
                </Text>
                <Text style={[styles.passwordStrengthValue, { color: getPasswordStrengthColor() }]}>
                  {getPasswordStrength()}
                </Text>
              </View>
            )}

            <View style={styles.passwordRequirements}>
              <View style={styles.requirementItem}>
                {hasMinLength ? (
                  <CheckCircle size={16} color="#10B981" />
                ) : (
                  <Shield size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
                )}
                <Text 
                  style={[
                    styles.requirementText, 
                    { 
                      color: hasMinLength ? 
                        '#10B981' : 
                        (isDark ? '#9CA3AF' : '#6B7280') 
                    }
                  ]}
                >
                  At least 8 characters
                </Text>
              </View>
              
              <View style={styles.requirementItem}>
                {hasUppercase ? (
                  <CheckCircle size={16} color="#10B981" />
                ) : (
                  <Shield size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
                )}
                <Text 
                  style={[
                    styles.requirementText, 
                    { 
                      color: hasUppercase ? 
                        '#10B981' : 
                        (isDark ? '#9CA3AF' : '#6B7280') 
                    }
                  ]}
                >
                  At least one uppercase letter
                </Text>
              </View>
              
              <View style={styles.requirementItem}>
                {hasLowercase ? (
                  <CheckCircle size={16} color="#10B981" />
                ) : (
                  <Shield size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
                )}
                <Text 
                  style={[
                    styles.requirementText, 
                    { 
                      color: hasLowercase ? 
                        '#10B981' : 
                        (isDark ? '#9CA3AF' : '#6B7280') 
                    }
                  ]}
                >
                  At least one lowercase letter
                </Text>
              </View>
              
              <View style={styles.requirementItem}>
                {hasNumber ? (
                  <CheckCircle size={16} color="#10B981" />
                ) : (
                  <Shield size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
                )}
                <Text 
                  style={[
                    styles.requirementText, 
                    { 
                      color: hasNumber ? 
                        '#10B981' : 
                        (isDark ? '#9CA3AF' : '#6B7280') 
                    }
                  ]}
                >
                  At least one number
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
              Confirm Password *
            </Text>
            <View style={[
              styles.inputContainer,
              { 
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: confirmPasswordError ? '#EF4444' : isDark ? '#374151' : '#E5E7EB'
              }
            ]}>
              <Key size={20} color={confirmPasswordError ? '#EF4444' : (isDark ? '#60A5FA' : '#3B82F6')} />
              <TextInput
                style={[styles.input, { color: isDark ? '#E5E7EB' : '#1F2937' }]}
                placeholder="Confirm your password"
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? (
                  <EyeOff size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                ) : (
                  <Eye size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                )}
              </TouchableOpacity>
            </View>
            {confirmPasswordError ? (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color="#EF4444" />
                <Text style={styles.errorText}>{confirmPasswordError}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[
              styles.createAccountButton, 
              { 
                backgroundColor: password && confirmPassword ? '#3B82F6' : (isDark ? '#374151' : '#E5E7EB'),
                opacity: password && confirmPassword && !isLoading ? 1 : 0.5
              }
            ]}
            onPress={handleCreateAccount}
            disabled={!password || !confirmPassword || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={[
                  styles.createAccountButtonText,
                  { color: password && confirmPassword ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#6B7280') }
                ]}>
                  Create Account
                </Text>
                <ArrowRight 
                  size={20} 
                  color={password && confirmPassword ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#6B7280')} 
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
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 32,
    textAlign: 'center',
    maxWidth: '80%',
  },
  formGroup: {
    marginBottom: 24,
    width: '100%',
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
    marginRight: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginLeft: 6,
  },
  passwordStrengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  passwordStrengthLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginRight: 4,
  },
  passwordStrengthValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  passwordRequirements: {
    marginTop: 16,
    gap: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  footer: {
    padding: 24,
    paddingTop: 0,
  },
  createAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  createAccountButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '80%',
  },
});
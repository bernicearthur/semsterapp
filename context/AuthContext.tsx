import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { router } from 'expo-router';
import { Platform, Alert } from 'react-native';

type AuthContextType = {
  session: any | null;
  user: any | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<{ error: any }>;
  updateProfile: (data: { username?: string, full_name?: string, avatar_url?: string, school?: string }) => Promise<{ error: any }>;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  signUpData: {
    school?: string;
    schoolDomains?: string[];
    email?: string;
    username?: string;
    fullName?: string;
    avatarUrl?: string;
    password?: string;
  };
  updateSignUpData: (data: Partial<AuthContextType['signUpData']>) => void;
  userProfile: {
    id?: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
    school?: string;
  } | null;
  refreshProfile: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithMicrosoft: () => Promise<void>;
  signInWithUsername: (username: string, password: string) => Promise<{ error: any }>;
  getInitials: (name: string) => string;
  signInWithSocial: (provider: 'google' | 'microsoft') => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  verifyOtp: async () => ({ error: null }),
  updateProfile: async () => ({ error: null }),
  currentStep: 1,
  setCurrentStep: () => {},
  signUpData: {},
  updateSignUpData: () => {},
  userProfile: null,
  refreshProfile: async () => {},
  signInWithGoogle: async () => {},
  signInWithMicrosoft: async () => {},
  signInWithUsername: async () => ({ error: null }),
  getInitials: () => '',
  signInWithSocial: async () => ({ error: null }),
  resetPassword: async () => ({ error: null }),
  updatePassword: async () => ({ error: null }),
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [signUpData, setSignUpData] = useState<AuthContextType['signUpData']>({});
  const [userProfile, setUserProfile] = useState<AuthContextType['userProfile']>(null);
  const [profileFetchAttempts, setProfileFetchAttempts] = useState(0);

  // Mock auth initialization
  useEffect(() => {
    // Mock initialization
    setLoading(false);
  }, []);

  const fetchUserProfile = async (userId: string) => {
    // Mock profile fetch
    setUserProfile({
      id: userId,
      username: 'mockuser',
      full_name: 'Mock User',
      avatar_url: null,
      school: 'Mock University'
    });
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    // Mock signup
    console.log('Mock signup for:', email);
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    // Mock signin
    console.log('Mock signin for:', email);
    router.replace('/(app)');
    return { error: null };
  };

  const signInWithUsername = async (username: string, password: string) => {
    // Mock username signin
    console.log('Mock signin with username:', username);
    router.replace('/(app)');
    return { error: null };
  };

  const signInWithSocial = async (provider: 'google' | 'microsoft') => {
    // Mock social signin
    console.log('Mock social signin with:', provider);
    return { error: null };
  };

  const signInWithGoogle = async () => {
    const { error } = await signInWithSocial('google');
    if (error) {
      Alert.alert('Error', error.message || 'Failed to sign in with Google');
    }
  };

  const signInWithMicrosoft = async () => {
    const { error } = await signInWithSocial('microsoft');
    if (error) {
      Alert.alert('Error', error.message || 'Failed to sign in with Microsoft');
    }
  };

  const signOut = async () => {
    // Mock signout
    setSession(null);
    setUser(null);
    setUserProfile(null);
    router.replace('/');
  };

  const verifyOtp = async (email: string, otp: string) => {
    // Mock OTP verification
    console.log('Mock OTP verification for:', email);
    return { error: null };
  };

  const resetPassword = async (email: string) => {
    // Mock password reset
    console.log('Mock password reset for:', email);
    return { error: null };
  };

  const updatePassword = async (password: string) => {
    // Mock password update
    console.log('Mock password update');
    return { error: null };
  };

  const updateProfile = async (data: { username?: string, full_name?: string, avatar_url?: string, school?: string }) => {
    // Mock profile update
    console.log('Mock profile update:', data);
    if (userProfile) {
      setUserProfile({ ...userProfile, ...data });
    }
    return { error: null };
  };

  const updateSignUpData = (data: Partial<AuthContextType['signUpData']>) => {
    setSignUpData(prev => ({ ...prev, ...data }));
  };

  const getInitials = (name: string) => {
    if (!name) return '';
    
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signUp,
        signIn,
        signOut,
        verifyOtp,
        updateProfile,
        currentStep,
        setCurrentStep,
        signUpData,
        updateSignUpData,
        userProfile,
        refreshProfile,
        signInWithGoogle,
        signInWithMicrosoft,
        signInWithUsername,
        getInitials,
        signInWithSocial,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
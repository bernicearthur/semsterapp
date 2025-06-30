import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { router } from 'expo-router';
import { Platform, Alert } from 'react-native';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
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
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [signUpData, setSignUpData] = useState<AuthContextType['signUpData']>({});
  const [userProfile, setUserProfile] = useState<AuthContextType['userProfile']>(null);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user || null);

        if (currentSession?.user) {
          await fetchUserProfile(currentSession.user.id);
        }

        // Set up auth state change listener
        const { data: { subscription } } = await supabase.auth.onAuthStateChange(
          async (_event, newSession) => {
            setSession(newSession);
            setUser(newSession?.user || null);

            if (newSession?.user) {
              await fetchUserProfile(newSession.user.id);
            } else {
              setUserProfile(null);
            }
          }
        );

        setLoading(false);
        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: signUpData.fullName,
            school: signUpData.school,
          },
          emailRedirectTo: 'https://your-app-url.com/auth/callback',
        },
      });

      if (!error) {
        // Create profile entry
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: (await supabase.auth.getUser()).data.user?.id,
            username: signUpData.username,
            full_name: signUpData.fullName,
            avatar_url: signUpData.avatarUrl,
            school: signUpData.school,
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          return { error: profileError };
        }
      }

      return { error };
    } catch (error) {
      console.error('Error in signUp:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error) {
        router.replace('/(app)');
      }

      return { error };
    } catch (error) {
      console.error('Error in signIn:', error);
      return { error };
    }
  };

  const signInWithUsername = async (username: string, password: string) => {
    try {
      // First, get the email associated with the username
      const { data, error: lookupError } = await supabase.functions.invoke('auth-by-username', {
        method: 'POST',
        body: { username, password },
      });

      if (lookupError || data.error) {
        return { error: { message: lookupError?.message || data.error || 'Invalid username or password' } };
      }

      if (!data.email) {
        return { error: { message: 'Username not found' } };
      }

      // Now sign in with the email and password
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password,
      });

      if (error) {
        return { error };
      }

      router.replace('/(app)');
      return { error: null };
    } catch (error) {
      console.error('Error in signInWithUsername:', error);
      return { error: { message: 'An unexpected error occurred' } };
    }
  };

  const signInWithSocial = async (provider: 'google' | 'microsoft') => {
    try {
      if (Platform.OS === 'web') {
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: window.location.origin,
          },
        });

        return { error };
      } else {
        // For native platforms, we would use a different approach
        // This is simplified for the demo
        return { error: { message: `${provider} sign-in is not supported on this platform yet.` } };
      }
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
      return { error };
    }
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
    try {
      await supabase.auth.signOut();
      router.replace('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup'
      });
      
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://your-app-url.com/reset-password',
      });
      
      return { error };
    } catch (error) {
      console.error('Error in resetPassword:', error);
      return { error };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });
      
      return { error };
    } catch (error) {
      console.error('Error in updatePassword:', error);
      return { error };
    }
  };

  const updateProfile = async (data: { username?: string, full_name?: string, avatar_url?: string, school?: string }) => {
    try {
      if (!user) {
        return { error: { message: 'User not authenticated' } };
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...data,
          updated_at: new Date().toISOString(),
        });

      if (!error) {
        await refreshProfile();
      }

      return { error };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { error };
    }
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
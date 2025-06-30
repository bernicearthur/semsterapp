import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://swrlgqyufhquduevjjxy.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3cmxncXl1ZmhxdWR1ZXZqanh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk2MjY1NzYsImV4cCI6MjAzNTIwMjU3Nn0.Nh1qdoS_RZZn-YGBK1p_UQk-NVzRSPr9W50dMYA-QHs';

// Platform-specific storage implementation
const createStorageAdapter = () => {
  if (Platform.OS === 'web') {
    // For web, use localStorage
    return {
      getItem: (key: string) => {
        if (typeof window !== 'undefined') {
          return Promise.resolve(window.localStorage.getItem(key));
        }
        return Promise.resolve(null);
      },
      setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, value);
        }
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key);
        }
        return Promise.resolve();
      },
    };
  } else {
    // For native platforms, use SecureStore
    return {
      getItem: (key: string) => {
        return SecureStore.getItemAsync(key);
      },
      setItem: (key: string, value: string) => {
        return SecureStore.setItemAsync(key, value);
      },
      removeItem: (key: string) => {
        return SecureStore.deleteItemAsync(key);
      },
    };
  }
};

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: createStorageAdapter(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

// Add a function to get the current user's school
export async function getCurrentUserSchool() {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) return null;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('school')
      .eq('id', user.user.id)
      .single();
      
    if (error) throw error;
    return data?.school || null;
  } catch (error) {
    console.error('Error getting current user school:', error);
    return null;
  }
}

// Add a function to check if a user belongs to a specific school
export async function userBelongsToSchool(school: string) {
  try {
    const userSchool = await getCurrentUserSchool();
    return userSchool === school;
  } catch (error) {
    console.error('Error checking if user belongs to school:', error);
    return false;
  }
}
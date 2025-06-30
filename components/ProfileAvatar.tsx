import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useAuth } from '@/context/AuthContext';

interface ProfileAvatarProps {
  size?: number;
  uri?: string | null;
  name?: string;
  showInitials?: boolean;
}

export function ProfileAvatar({ size = 40, uri, name, showInitials = true }: ProfileAvatarProps) {
  const { getInitials } = useAuth();
  const [imageError, setImageError] = useState(false);
  
  // Use provided name or fallback to empty string
  const displayName = name || '';
  
  // Calculate initials from name
  const initials = getInitials(displayName);
  
  // Determine if we should show the image or initials
  const shouldShowInitials = showInitials && (!uri || imageError);
  
  // Generate a consistent color based on the name
  const getColorFromName = (name: string) => {
    if (!name) return '#3B82F6'; // Default blue
    
    // List of pleasant colors for avatars
    const colors = [
      '#3B82F6', // Blue
      '#10B981', // Green
      '#F59E0B', // Yellow
      '#EF4444', // Red
      '#8B5CF6', // Purple
      '#EC4899', // Pink
      '#06B6D4', // Cyan
      '#84CC16', // Lime
      '#F97316', // Orange
      '#6366F1', // Indigo
    ];
    
    // Simple hash function to get a consistent color for the same name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Use the hash to pick a color
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };
  
  const backgroundColor = getColorFromName(displayName);
  
  return (
    <View style={[
      styles.container, 
      { 
        width: size, 
        height: size, 
        borderRadius: size / 2,
        backgroundColor: shouldShowInitials ? backgroundColor : 'transparent'
      }
    ]}>
      {shouldShowInitials ? (
        <Text style={[
          styles.initials,
          { fontSize: size * 0.4 }
        ]}>
          {initials}
        </Text>
      ) : (
        <Image 
          source={{ uri: uri || undefined }}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
          onError={() => setImageError(true)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
});
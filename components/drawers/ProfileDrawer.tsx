import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Dimensions, Platform, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, User, Settings, Shield, Bell, CircleHelp as HelpCircle, LogOut, ChevronRight, Bot, Moon, Sun } from 'lucide-react-native';
import { router } from 'expo-router';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  runOnJS,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useAuth } from '@/context/AuthContext';
import { ProfileAvatar } from '@/components/ProfileAvatar';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileDrawer({ isOpen, onClose }: ProfileDrawerProps) {
  const { isDark, toggleTheme } = useTheme();
  const { userProfile, signOut, getInitials } = useAuth();
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const [avatarError, setAvatarError] = useState(false);
  
  const translateY = useSharedValue(screenHeight); // Start hidden at bottom
  const minHeight = screenHeight * 0.4; // Minimum 40% height
  const maxHeight = screenHeight * 0.95; // Maximum 95% height

  const drawerStyle = useAnimatedStyle(() => ({
    height: screenHeight - translateY.value,
    transform: [{ translateY: translateY.value }],
  }));

  const gesture = Gesture.Pan()
    .activeOffsetY([-15, 15])
    .onUpdate((event) => {
      const newTranslateY = translateY.value + event.translationY;
      // Constrain between min and max heights
      translateY.value = Math.max(
        screenHeight - maxHeight,
        Math.min(screenHeight - minHeight, newTranslateY)
      );
    })
    .onEnd((event) => {
      const currentHeight = screenHeight - translateY.value;
      const midHeight = (minHeight + maxHeight) / 2;
      
      if (event.velocityY > 500 || (event.translationY > 100 && currentHeight < midHeight)) {
        // Close drawer
        translateY.value = withSpring(screenHeight, {
          damping: 20,
          stiffness: 90,
          mass: 0.4,
        }, () => {
          runOnJS(onClose)();
        });
      } else if (event.velocityY < -500 || (event.translationY < -100 && currentHeight < midHeight)) {
        // Expand to full height
        translateY.value = withSpring(screenHeight - maxHeight, {
          damping: 20,
          stiffness: 90,
          mass: 0.4,
        });
      } else {
        // Snap to nearest position
        const targetHeight = currentHeight > midHeight ? maxHeight : minHeight;
        translateY.value = withSpring(screenHeight - targetHeight, {
          damping: 20,
          stiffness: 90,
          mass: 0.4,
        });
      }
    });

  React.useEffect(() => {
    translateY.value = withSpring(isOpen ? screenHeight * 0.6 : screenHeight, {
      damping: 20,
      stiffness: 90,
      mass: 0.4,
    });
  }, [isOpen]);

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Sign Out",
          onPress: () => {
            onClose();
            signOut();
          }
        }
      ]
    );
  };

  const handleNavigate = (route: string) => {
    onClose();
    router.push(route);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <View style={[StyleSheet.absoluteFill, styles.container]}>
      <TouchableOpacity 
        style={[StyleSheet.absoluteFill, styles.overlay]}
        activeOpacity={1}
        onPress={onClose}
      />
      
      <TouchableOpacity 
        style={[StyleSheet.absoluteFill, styles.overlay]}
        activeOpacity={1}
        onPress={onClose}
      />
      
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.drawer, drawerStyle, { backgroundColor: isDark ? '#0F172A' : '#FFFFFF' }]}>
          <SafeAreaView style={{ flex: 1 }}>
            {/* Unified Header with Drag Handle */}
            <View style={styles.unifiedHeader}>
              {/* Drag Handle */}
              <View style={styles.dragHandle}>
                <View style={[styles.dragIndicator, { backgroundColor: isDark ? '#4B5563' : '#D1D5DB' }]} />
              </View>
              
              {/* Header Content */}
              <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Account
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color={isDark ? '#E5E7EB' : '#4B5563'} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Profile Card */}
              <TouchableOpacity 
                style={[styles.profileCard, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}
                onPress={() => {
                  onClose();
                  router.push('/profile-tab');
                }}
                activeOpacity={0.7}
              >
                <View style={styles.profileInfo}>
                  <ProfileAvatar 
                    size={80}
                    uri={userProfile?.avatar_url}
                    name={userProfile?.full_name || 'User'}
                  />
                  <View style={styles.profileDetails}>
                    <Text style={[styles.profileName, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                      {userProfile?.full_name || 'Alex Student'}
                    </Text>
                    <Text style={[styles.profileEmail, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                      {userProfile?.username ? `@${userProfile.username}` : 'alex.student@university.edu'}
                    </Text>
                    <View style={styles.profileBadges}>
                      <View style={[styles.badge, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]}>
                        <Text style={[styles.badgeText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                          Junior
                        </Text>
                      </View>
                      <View style={[styles.badge, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]}>
                        <Text style={[styles.badgeText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                          Computer Science
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

              {/* AI Study Assistant */}
              <View style={styles.section}>
                <TouchableOpacity 
                  style={[styles.aiStudyButton, { backgroundColor: '#3B82F6' }]}
                  onPress={() => handleNavigate('/ai-assistant')}
                >
                  <Bot size={24} color="#FFFFFF" />
                  <Text style={styles.aiStudyText}>AI Study Assistant</Text>
                </TouchableOpacity>
              </View>

              {/* Quick Actions */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  Quick Actions
                </Text>
                
                <View style={[styles.menuContainer, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => handleNavigate('/profile-tab')}
                  >
                    <View style={styles.menuItemLeft}>
                      <User size={22} color={isDark ? '#60A5FA' : '#3B82F6'} />
                      <Text style={[styles.menuItemText, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                        Profile
                      </Text>
                    </View>
                    <ChevronRight size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  </TouchableOpacity>

                  <View style={[styles.divider, { backgroundColor: isDark ? '#334155' : '#E5E7EB' }]} />

                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => handleNavigate('/settings')}
                  >
                    <View style={styles.menuItemLeft}>
                      <Settings size={22} color={isDark ? '#60A5FA' : '#3B82F6'} />
                      <Text style={[styles.menuItemText, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                        Settings
                      </Text>
                    </View>
                    <ChevronRight size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  </TouchableOpacity>

                  <View style={[styles.divider, { backgroundColor: isDark ? '#334155' : '#E5E7EB' }]} />

                  <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.menuItemLeft}>
                      <Shield size={22} color={isDark ? '#60A5FA' : '#3B82F6'} />
                      <Text style={[styles.menuItemText, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                        Privacy
                      </Text>
                    </View>
                    <ChevronRight size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  </TouchableOpacity>

                  <View style={[styles.divider, { backgroundColor: isDark ? '#334155' : '#E5E7EB' }]} />

                  <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.menuItemLeft}>
                      <Bell size={22} color={isDark ? '#60A5FA' : '#3B82F6'} />
                      <Text style={[styles.menuItemText, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                        Notifications
                      </Text>
                    </View>
                    <ChevronRight size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  </TouchableOpacity>

                  <View style={[styles.divider, { backgroundColor: isDark ? '#334155' : '#E5E7EB' }]} />

                  <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.menuItemLeft}>
                      <HelpCircle size={22} color={isDark ? '#60A5FA' : '#3B82F6'} />
                      <Text style={[styles.menuItemText, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                        Help & Support
                      </Text>
                    </View>
                    <ChevronRight size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  </TouchableOpacity>

                  <View style={[styles.divider, { backgroundColor: isDark ? '#334155' : '#E5E7EB' }]} />

                  <View style={styles.menuItem}>
                    <View style={styles.menuItemLeft}>
                      {isDark ? (
                        <Sun size={22} color="#F59E0B" />
                      ) : (
                        <Moon size={22} color="#6366F1" />
                      )}
                      <Text style={[styles.menuItemText, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                        Theme
                      </Text>
                    </View>
                    <Switch
                      value={isDark}
                      onValueChange={toggleTheme}
                      trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                </View>
              </View>

              {/* Sign Out */}
              <View style={styles.section}>
                <TouchableOpacity 
                  style={[styles.signOutButton, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}
                  onPress={handleSignOut}
                >
                  <LogOut size={22} color="#EF4444" />
                  <Text style={[styles.signOutText, { color: '#EF4444' }]}>
                    Sign Out
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  unifiedHeader: {
    position: 'relative',
  },
  dragHandle: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 20,
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileDetails: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
  },
  profileBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  aiStudyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  aiStudyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  menuContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 50,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  signOutText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});
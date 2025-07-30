import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Dimensions, Platform, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, User, Settings, Shield, Bell, CircleHelp as HelpCircle, LogOut, ChevronRight, Bot, Moon, Sun } from 'lucide-react-native';
import { router } from 'expo-router';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  runOnJS
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
  const { userProfile, signOut } = useAuth();
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const [avatarError, setAvatarError] = useState(false);
  const [isExtended, setIsExtended] = useState(false);
  
  const translateY = useSharedValue(screenHeight);
  const drawerHeight = useSharedValue(0.85);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    height: `${drawerHeight.value * 100}%`,
  }));

  const dragHandleGesture = Gesture.Pan()
    .activeOffsetY([0, 15])
    .onUpdate((event) => {
      if (isExtended) {
        // When extended, allow dragging down to collapse
        if (event.translationY > 0) {
          const progress = Math.min(event.translationY / (screenHeight * 0.15), 1);
          drawerHeight.value = 1 - (progress * 0.15);
        }
      } else {
        // When collapsed, allow dragging up to extend or down to close
        if (event.translationY < 0) {
          const progress = Math.min(Math.abs(event.translationY) / (screenHeight * 0.15), 1);
          drawerHeight.value = 0.85 + (progress * 0.15);
        } else if (event.translationY > 0) {
          translateY.value = event.translationY;
        }
      }
    })
    .onEnd((event) => {
      if (isExtended) {
        // When extended, decide whether to stay extended or collapse
        if (event.translationY > screenHeight * 0.1 || event.velocityY > 500) {
          // Collapse to 85%
          drawerHeight.value = withSpring(0.85);
          runOnJS(setIsExtended)(false);
        } else {
          // Stay extended
          drawerHeight.value = withSpring(1);
        }
      } else {
        // When collapsed, decide whether to extend, stay collapsed, or close
        if (event.translationY < -screenHeight * 0.1 || event.velocityY < -500) {
          // Extend to 100%
          drawerHeight.value = withSpring(1);
          runOnJS(setIsExtended)(true);
        } else if (event.translationY > screenHeight * 0.3 || event.velocityY > 500) {
          // Close drawer
          translateY.value = withSpring(screenHeight, {
            damping: 20,
            stiffness: 90,
            mass: 0.4,
          }, () => {
            runOnJS(onClose)();
          });
        } else {
          // Stay at current position
          translateY.value = withSpring(0);
          drawerHeight.value = withSpring(0.85);
        }
      }
    });

  const overlayGesture = Gesture.Pan()
    .activeOffsetY([0, 15])
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > screenHeight * 0.3 || event.velocityY > 500) {
        translateY.value = withSpring(screenHeight, {
          damping: 20,
          stiffness: 90,
          mass: 0.4,
        }, () => {
          runOnJS(onClose)();
        });
      } else {
        translateY.value = withSpring(0, {
          damping: 20,
          stiffness: 90,
          mass: 0.4,
        });
      }
    });

  React.useEffect(() => {
    translateY.value = withSpring(isOpen ? 0 : screenHeight, {
      damping: 20,
      stiffness: 90,
      mass: 0.4,
    });
    
    if (!isOpen) {
      // Reset to collapsed state when drawer closes
      setIsExtended(false);
      drawerHeight.value = 0.85;
    }
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
      
      <Animated.View style={[styles.drawer, drawerStyle, { backgroundColor: isDark ? '#0F172A' : '#FFFFFF' }]}>
        <SafeAreaView style={{ flex: 1 }}>
          {/* Drag Handle */}
          <GestureDetector gesture={dragHandleGesture}>
            <View style={styles.dragHandle}>
              <View style={[styles.dragIndicator, { backgroundColor: isDark ? '#4B5563' : '#D1D5DB' }]} />
            </View>
          </GestureDetector>

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
              Account
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={isDark ? '#E5E7EB' : '#4B5563'} />
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
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
  dragHandle: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
    minHeight: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 40,
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
import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Dimensions, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, Briefcase, Search, Menu, X, Moon, Sun, LogOut, CircleHelp as HelpCircle, Settings, Calendar, Bot, ShoppingBag } from 'lucide-react-native';
import { router } from 'expo-router';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  Easing,
  useSharedValue,
  runOnJS
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useAuth } from '@/context/AuthContext';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileDrawer({ isOpen, onClose }: ProfileDrawerProps) {
  const { isDark, toggleTheme } = useTheme();
  const { userProfile, signOut, getInitials } = useAuth();
  const screenWidth = Dimensions.get('window').width;
  const drawerWidth = screenWidth * 0.8;
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isThemeDark, setIsThemeDark] = useState(isDark);
  const [avatarError, setAvatarError] = useState(false);
  
  const translateX = useSharedValue(-drawerWidth);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const gesture = Gesture.Pan()
    .activeOffsetX([-15, 0])
    .onUpdate((event) => {
      if (event.translationX < 0) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      if (event.translationX < -drawerWidth * 0.3 || event.velocityX < -500) {
        translateX.value = withSpring(-drawerWidth, {
          damping: 20,
          stiffness: 90,
          mass: 0.4,
        }, () => {
          runOnJS(onClose)();
        });
      } else {
        translateX.value = withSpring(0, {
          damping: 20,
          stiffness: 90,
          mass: 0.4,
        });
      }
    });

  React.useEffect(() => {
    translateX.value = withSpring(isOpen ? 0 : -drawerWidth, {
      damping: 20,
      stiffness: 90,
      mass: 0.4,
    });
    
    // Update theme state when drawer opens
    if (isOpen) {
      setIsThemeDark(isDark);
    }
  }, [isOpen, isDark]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isOpen ? 0.5 : 0, {
      duration: 200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }),
    pointerEvents: isOpen ? 'auto' : 'none',
  }));

  const handleOverlayPress = () => {
    setShowMoreMenu(false);
    onClose();
  };

  const handleMorePress = () => {
    setShowMoreMenu(!showMoreMenu);
  };

  const handleNavigate = (route: string) => {
    onClose();
    router.push(route);
  };

  const handleMenuItemPress = (action: () => void) => {
    action();
    setShowMoreMenu(false);
  };

  const handleProfilePress = () => {
    onClose();
    router.push('/profile-tab');
  };

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

  const renderInitialsAvatar = () => {
    const initials = userProfile?.full_name ? getInitials(userProfile.full_name) : "U";
    
    return (
      <View style={[styles.initialsAvatar, { backgroundColor: '#3B82F6' }]}>
        <Text style={styles.initialsText}>{initials}</Text>
      </View>
    );
  };

  const menuItems = [
    {
      icon: <Bot size={22} color={isDark ? '#60A5FA' : '#3B82F6'} />,
      title: 'AI Study Assistant',
      subtitle: 'Get personalized study help',
      route: '/ai-assistant'
    },
    {
      icon: <Calendar size={22} color={isDark ? '#60A5FA' : '#3B82F6'} />,
      title: 'Academic Calendar',
      subtitle: 'View important dates and events',
      route: '/academic-calendar'
    },
    {
      icon: <BookOpen size={22} color={isDark ? '#60A5FA' : '#3B82F6'} />,
      title: 'Study Rooms',
      subtitle: 'Find or create study groups',
      route: '/study-rooms'
    },
    {
      icon: <ShoppingBag size={22} color={isDark ? '#60A5FA' : '#3B82F6'} />,
      title: 'Marketplace',
      subtitle: 'Buy and sell campus items',
      route: '/marketplace'
    },
    {
      icon: <Search size={22} color={isDark ? '#60A5FA' : '#3B82F6'} />,
      title: 'Lost & Found',
      subtitle: 'Report or find lost items',
      route: '/lost-found'
    },
    {
      icon: <Briefcase size={22} color={isDark ? '#60A5FA' : '#3B82F6'} />,
      title: 'Job Board',
      subtitle: 'Find campus jobs and internships',
      route: '/job-board'
    },
    {
      icon: <Settings size={22} color={isDark ? '#60A5FA' : '#3B82F6'} />,
      title: 'Settings',
      subtitle: 'Manage your preferences',
      route: '/settings'
    },
  ];

  const moreMenuItems = [
    {
      icon: isThemeDark ? <Sun size={22} color="#F59E0B" /> : <Moon size={22} color="#6366F1" />,
      title: 'Theme',
      subtitle: 'Change app appearance',
      action: toggleTheme,
      isToggle: true,
      isActive: isThemeDark,
    },
    {
      icon: <HelpCircle size={22} color={isDark ? '#60A5FA' : '#3B82F6'} />,
      title: 'Help Center',
      subtitle: 'Get support and FAQs',
      action: () => console.log('Help'),
    },
    {
      icon: <LogOut size={22} color="#EF4444" />,
      title: 'Sign Out',
      subtitle: 'Log out of your account',
      action: handleSignOut,
      danger: true,
    },
  ];

  if (!isOpen) {
    return null;
  }

  return (
    <View style={[StyleSheet.absoluteFill, styles.container]}>
      <Animated.View 
        style={[StyleSheet.absoluteFill, styles.overlay, overlayStyle]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleOverlayPress}
        />
      </Animated.View>
      
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.drawer, drawerStyle, { width: drawerWidth }]}>
          <SafeAreaView 
            style={[styles.safeArea, { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}
            edges={['top', 'bottom']}
          >
            <View style={[
              styles.profileSection,
              { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' },
              showMoreMenu && { opacity: 0.5 }
            ]}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={24} color={isDark ? '#E5E7EB' : '#4B5563'} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.profileInfo} onPress={handleProfilePress}>
                {userProfile?.avatar_url && !avatarError ? (
                  <Image 
                    source={{ uri: userProfile.avatar_url }}
                    style={styles.profileImage}
                    onError={() => setAvatarError(true)}
                  />
                ) : renderInitialsAvatar()}
                <View style={styles.profileText}>
                  <Text style={[styles.profileName, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    {userProfile?.full_name || 'User'}
                  </Text>
                  <Text style={[styles.profileUsername, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                    @{userProfile?.username || 'username'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            
            <View style={styles.contentContainer}>
              <ScrollView 
                style={[styles.scrollView, showMoreMenu && { opacity: 0.5 }]}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                onTouchStart={() => showMoreMenu && setShowMoreMenu(false)}
              >
                <View style={styles.menuContainer}>
                  {menuItems.map((item, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={styles.menuItem}
                      onPress={() => item.route ? handleNavigate(item.route) : null}
                    >
                      <View style={styles.menuIcon}>
                        {item.icon}
                      </View>
                      <View style={styles.menuText}>
                        <Text style={[styles.menuTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                          {item.title}
                        </Text>
                        <Text style={[styles.menuSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                          {item.subtitle}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <TouchableOpacity
                style={[
                  styles.moreButton,
                  { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }
                ]}
                onPress={handleMorePress}
              >
                <Menu size={22} color={isDark ? '#60A5FA' : '#3B82F6'} />
                <Text style={[styles.moreButtonText, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  More
                </Text>
              </TouchableOpacity>

              <Animated.View 
                style={[
                  styles.moreMenuContainer,
                  { 
                    backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                    transform: [{ 
                      translateY: withSpring(showMoreMenu ? 0 : 300, {
                        damping: 20,
                        stiffness: 90,
                      })
                    }],
                    opacity: showMoreMenu ? 1 : 0,
                    pointerEvents: showMoreMenu ? 'auto' : 'none',
                  }
                ]}
              >
                {moreMenuItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.moreMenuItem,
                      index === moreMenuItems.length - 1 && styles.lastMoreMenuItem
                    ]}
                    onPress={() => handleMenuItemPress(item.action)}
                  >
                    <View style={styles.moreMenuIcon}>
                      {item.icon}
                    </View>
                    <View style={[
                      styles.moreMenuText,
                      item.isToggle && styles.moreMenuToggleContainer
                    ]}>
                      <View>
                        <Text style={[
                          styles.moreMenuTitle,
                          { 
                            color: item.danger ? '#EF4444' : 
                              (isDark ? '#FFFFFF' : '#111827')
                          }
                        ]}>
                          {item.title}
                        </Text>
                        <Text style={[
                          styles.moreMenuSubtitle,
                          { color: isDark ? '#9CA3AF' : '#6B7280' }
                        ]}>
                          {item.subtitle}
                        </Text>
                      </View>
                      {item.isToggle && (
                        <View style={[
                          styles.toggleSwitch,
                          { backgroundColor: item.isActive ? '#3B82F6' : (isDark ? '#374151' : '#E5E7EB') }
                        ]}>
                          <Animated.View style={[
                            styles.toggleKnob,
                            { transform: [{ translateX: item.isActive ? 20 : 2 }] }
                          ]} />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            </View>
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
    backgroundColor: '#000000',
  },
  drawer: {
    height: '100%',
  },
  safeArea: {
    flex: 1,
  },
  profileSection: {
    padding: 16,
    paddingTop: 32,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 8,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  initialsAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  profileText: {
    marginLeft: 12,
  },
  profileName: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginBottom: 2,
  },
  profileUsername: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  contentContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    marginTop: -8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  menuContainer: {
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuIcon: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    marginLeft: 12,
    flex: 1,
  },
  menuTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  moreButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginLeft: 12,
  },
  moreMenuContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4.65,
    elevation: 6,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  moreMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  lastMoreMenuItem: {
    borderBottomWidth: 0,
  },
  moreMenuIcon: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreMenuText: {
    marginLeft: 12,
    flex: 1,
  },
  moreMenuToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moreMenuTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 2,
  },
  moreMenuSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
});
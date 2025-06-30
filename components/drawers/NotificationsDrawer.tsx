import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, MoreVertical, Settings } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  Easing,
  useSharedValue,
  useAnimatedGestureHandler,
  runOnJS
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const notifications = [
  {
    id: '1',
    type: 'like',
    user: {
      name: 'Sarah Chen',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
    content: 'liked your post about the upcoming campus event',
    time: '2m ago',
    unread: true,
  },
  {
    id: '2',
    type: 'comment',
    user: {
      name: 'Michael Brown',
      avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
    content: 'commented on your research paper',
    time: '15m ago',
    unread: true,
  },
  {
    id: '3',
    type: 'mention',
    user: {
      name: 'Emily Wilson',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
    content: 'mentioned you in a comment',
    time: '1h ago',
    unread: false,
  },
  {
    id: '4',
    type: 'event',
    content: 'Campus Career Fair is tomorrow',
    time: '2h ago',
    unread: false,
  },
  {
    id: '5',
    type: 'group',
    user: {
      name: 'Study Group',
      avatar: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
    content: 'New study materials available',
    time: '3h ago',
    unread: false,
  },
  {
    id: '6',
    type: 'system',
    content: 'Your account was successfully verified',
    time: '1d ago',
    unread: false,
  },
];

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export function NotificationsDrawer({ isOpen, onClose }: NotificationsDrawerProps) {
  const { isDark } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const translateX = useSharedValue(screenWidth);
  
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isOpen ? 0.5 : 0, {
      duration: 200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }),
    pointerEvents: isOpen ? 'auto' : 'none',
  }));

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const gesture = Gesture.Pan()
    .activeOffsetX([0, 15])
    .onUpdate((event) => {
      if (event.translationX > 0) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      if (event.translationX > screenWidth * 0.3 || event.velocityX > 500) {
        translateX.value = withSpring(screenWidth, {
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
    translateX.value = withSpring(isOpen ? 0 : screenWidth, {
      damping: 20,
      stiffness: 90,
      mass: 0.4,
    });
  }, [isOpen]);

  const renderNotification = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.notificationItem, 
        { backgroundColor: item.unread ? (isDark ? '#0F172A' : '#F8FAFC') : 'transparent' }
      ]}
    >
      {item.user && (
        <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
      )}
      
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          {item.user && (
            <Text 
              style={[styles.username, { color: isDark ? '#FFFFFF' : '#111827' }]}
              numberOfLines={1}
            >
              {item.user.name}
            </Text>
          )}
          <Text style={styles.timestamp}>{item.time}</Text>
        </View>
        
        <Text 
          style={[
            styles.notificationText,
            { color: isDark ? '#E5E7EB' : '#4B5563' }
          ]}
          numberOfLines={2}
        >
          {item.content}
        </Text>
      </View>
      
      <TouchableOpacity style={styles.moreButton}>
        <MoreVertical size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

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
          onPress={onClose}
        />
      </Animated.View>
      
      <GestureDetector gesture={gesture}>
        <Animated.View 
          style={[
            styles.drawer,
            { backgroundColor: isDark ? '#0F172A' : '#FFFFFF', width: screenWidth },
            drawerStyle,
          ]}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Notifications
              </Text>
              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.headerButton}>
                  <Settings size={22} color={isDark ? '#E5E7EB' : '#4B5563'} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.headerButton, { marginLeft: 16 }]} onPress={onClose}>
                  <X size={22} color={isDark ? '#E5E7EB' : '#4B5563'} />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.tabs}>
              <TouchableOpacity style={[styles.tab, styles.activeTab]}>
                <Text style={[styles.tabText, styles.activeTabText]}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tab}>
                <Text style={[styles.tabText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Mentions</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={notifications}
              renderItem={renderNotification}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.notificationsList}
              showsVerticalScrollIndicator={false}
            />
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
    flex: 1,
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 4,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
  },
  activeTabText: {
    color: '#3B82F6',
    fontFamily: 'Inter-SemiBold',
  },
  notificationsList: {
    paddingTop: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
    marginRight: 8,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#9CA3AF',
  },
  notificationText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  moreButton: {
    padding: 4,
  },
});

export { NotificationsDrawer }
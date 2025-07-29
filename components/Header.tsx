import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, MessageSquare, User, Image } from 'lucide-react-native';
import { useAppContext } from '@/context/AppContext';
import { MessagesDrawer } from './drawers/MessagesDrawer';
import { ProfileDrawer } from './drawers/ProfileDrawer';
import { NotificationsDrawer } from './drawers/NotificationsDrawer';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { ProfileAvatar } from './ProfileAvatar';

export function Header() {
  const { isDark } = useTheme();
  const { userProfile } = useAuth();
  const { 
    openProfileDrawer, 
    openMessagesDrawer,
    openNotificationsDrawer,
    isProfileDrawerOpen,
    isMessagesDrawerOpen,
    isNotificationsDrawerOpen,
    closeProfileDrawer,
    closeMessagesDrawer,
    closeNotificationsDrawer
  } = useAppContext();
  
  // Display school name or app name as fallback
  const displayName = userProfile?.school || "University";
  
  return (
    <>
      <SafeAreaView 
        style={[
          styles.safeArea, 
          { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }
        ]}
        edges={['top']}
      >
        <View style={styles.header}>
          <View style={styles.leftSection}>
            <TouchableOpacity 
              onPress={openProfileDrawer} 
              style={[styles.menuButton, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}
            >
              <Menu size={22} color={isDark ? '#E5E7EB' : '#4B5563'} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.centerSection}>
            <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#111827' }]}>
              {displayName}
            </Text>
          </View>
          
          <View style={styles.rightSection}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={openNotificationsDrawer}
            >
              <Bell 
                size={24} 
                color={isDark ? '#E5E7EB' : '#4B5563'} 
              />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>3</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.iconButton, { marginLeft: 16 }]}
              onPress={openMessagesDrawer}
            >
              <MessageSquare 
                size={24} 
                color={isDark ? '#E5E7EB' : '#4B5563'} 
              />
              <View style={styles.notificationBadge}>
            style={styles.profileButton}
              </View>
            <ProfileAvatar 
              size={32}
              uri={userProfile?.avatar_url}
              name={userProfile?.full_name || 'User'}
            />
          </View>
        </View>
      </SafeAreaView>

      <ProfileDrawer isOpen={isProfileDrawerOpen} onClose={closeProfileDrawer} />
      <MessagesDrawer isOpen={isMessagesDrawerOpen} onClose={closeMessagesDrawer} />
      <NotificationsDrawer isOpen={isNotificationsDrawerOpen} onClose={closeNotificationsDrawer} />
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    width: '100%',
    zIndex: 10,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  profileButton: {
    padding: 4,
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  iconButton: {
    position: 'relative',
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    fontSize: 10,
  },
});
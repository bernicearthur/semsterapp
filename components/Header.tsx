import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, MessageSquare, Menu } from 'lucide-react-native';
import { useAppContext } from '@/context/AppContext';
import { MessagesDrawer } from './drawers/MessagesDrawer';
import { ProfileDrawer } from './drawers/ProfileDrawer';
import { NotificationsDrawer } from './drawers/NotificationsDrawer';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

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
  
  // Display school name if available, otherwise fall back to "Semster"
  const displayName = userProfile?.school || "Semster";
  
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
          <TouchableOpacity 
            onPress={openProfileDrawer} 
            style={[styles.menuButton, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}
          >
            <Menu size={22} color={isDark ? '#E5E7EB' : '#4B5563'} />
          </TouchableOpacity>
          
          <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#111827' }]}>
            {displayName}
          </Text>
          
          <View style={styles.actionsContainer}>
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
                <Text style={styles.notificationText}>2</Text>
              </View>
            </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
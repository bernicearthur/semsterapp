import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SwipeGestureWrapper } from '@/components/SwipeGestureWrapper';
import { useTheme } from '@/context/ThemeContext';
import { Bell, Moon, Shield, Key, Languages, CircleHelp as HelpCircle, Info, LogOut, ChevronRight, Smartphone, Eye, Volume2 } from 'lucide-react-native';

export default function SettingsScreen() {
  const { isDark, toggleTheme } = useTheme();

  const sections = [
    {
      title: 'Preferences',
      items: [
        {
          icon: <Moon size={22} color={isDark ? '#60A5FA' : '#3B82F6'} />,
          title: 'Dark Mode',
          type: 'switch',
          value: isDark,
          onToggle: toggleTheme,
        },
        {
          icon: <Bell size={22} color={isDark ? '#60A5FA' : '#3B82F6'} />,
          title: 'Notifications',
          subtitle: 'Manage notification preferences',
          type: 'link',
        },
        {
          icon: <Volume2 size={22} color={isDark ? '#60A5FA' : '#3B82F6'} />,
          title: 'Sounds & Haptics',
          subtitle: 'Customize app sounds and vibrations',
          type: 'link',
        },
      ],
    },
    {
      title: 'Privacy & Security',
      items: [
        {
          icon: <Shield size={22} color={isDark ? '#60A5FA' : '#3B82F6'} />,
          title: 'Privacy',
          subtitle: 'Manage your privacy settings',
          type: 'link',
        },
        {
          icon: <Key size={22} color={isDark ? '#60A5FA' : '#3B82F6'} />,
          title: 'Security',
          subtitle: 'Password and authentication',
          type: 'link',
        },
        {
          icon: <Eye size={22} color={isDark ? '#60A5FA' : '#3B82F6'} />,
          title: 'Activity Status',
          type: 'switch',
          value: true,
        },
      ],
    },
    {
      title: 'App Settings',
      items: [
        {
          icon: <Languages size={22} color={isDark ? '#60A5FA' : '#3B82F6'} />,
          title: 'Language',
          subtitle: 'English (US)',
          type: 'link',
        },
        {
          icon: <Smartphone size={22} color={isDark ? '#60A5FA' : '#3B82F6'} />,
          title: 'Storage and Data',
          subtitle: 'Manage app storage',
          type: 'link',
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: <HelpCircle size={22} color={isDark ? '#60A5FA' : '#3B82F6'} />,
          title: 'Help Center',
          type: 'link',
        },
        {
          icon: <Info size={22} color={isDark ? '#60A5FA' : '#3B82F6'} />,
          title: 'About',
          subtitle: 'Version 1.0.0',
          type: 'link',
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          icon: <LogOut size={22} color="#EF4444" />,
          title: 'Sign Out',
          type: 'button',
          danger: true,
        },
      ],
    },
  ];

  return (
    <SwipeGestureWrapper>
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {sections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                {section.title}
              </Text>
              
              <View style={[styles.sectionContent, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
                {section.items.map((item, itemIndex) => (
                  <TouchableOpacity
                    key={itemIndex}
                    style={[
                      styles.item,
                      itemIndex < section.items.length - 1 && styles.itemBorder,
                      { borderBottomColor: isDark ? '#334155' : '#E5E7EB' }
                    ]}
                    disabled={item.type === 'switch'}
                  >
                    <View style={styles.itemContent}>
                      <View style={styles.itemIcon}>
                        {item.icon}
                      </View>
                      
                      <View style={styles.itemText}>
                        <Text 
                          style={[
                            styles.itemTitle,
                            { color: item.danger ? '#EF4444' : (isDark ? '#FFFFFF' : '#111827') }
                          ]}
                        >
                          {item.title}
                        </Text>
                        {item.subtitle && (
                          <Text style={[styles.itemSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                            {item.subtitle}
                          </Text>
                        )}
                      </View>
                      
                      {item.type === 'switch' ? (
                        <Switch
                          value={item.value}
                          onValueChange={item.onToggle}
                          trackColor={{ false: isDark ? '#374151' : '#E5E7EB', true: '#3B82F6' }}
                          thumbColor="#FFFFFF"
                        />
                      ) : item.type === 'link' && (
                        <ChevronRight size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </SwipeGestureWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  sectionContent: {
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
  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  itemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    width: 40,
    alignItems: 'center',
  },
  itemText: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  itemSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
});
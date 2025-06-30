import { Tabs } from 'expo-router';
import { Dimensions, Image } from 'react-native';
import { Header } from '@/components/Header';
import { House, Search, SquarePlus as PlusSquare, CalendarDays } from 'lucide-react-native';
import { useAppContext } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';

export default function AppLayout() {
  const { openProfileDrawer } = useAppContext();
  const { colors, isDark } = useTheme();

  return (
    <>
      <Header />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.subtext,
          tabBarStyle: {
            backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
            height: 56,
            paddingTop: 0,
            paddingBottom: 0,
            borderTopWidth: 0
          },
          tabBarItemStyle: {
            paddingTop: 0,
            paddingBottom: 0,
          },
        }}>
        <Tabs.Screen 
          name="index"
          options={{
            tabBarIcon: ({ color, size }) => <House size={size} color={color} />,
          }}
        />
        <Tabs.Screen 
          name="explore"
          options={{
            tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
          }}
        />
        <Tabs.Screen 
          name="create-post"
          options={{
            tabBarIcon: ({ color, size }) => <PlusSquare size={size} color={color} />,
          }}
        />
        <Tabs.Screen 
          name="events"
          options={{
            tabBarIcon: ({ color, size }) => <CalendarDays size={size} color={color} />,
          }}
        />
        <Tabs.Screen 
          name="profile-tab"
          options={{
            tabBarIcon: ({ focused }) => (
              <Image 
                source={{ uri: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100' }}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  borderWidth: focused ? 2 : 0,
                  borderColor: colors.primary,
                }}
              />
            ),
          }}
        />
        <Tabs.Screen 
          name="ai-assistant"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen 
          name="find-connections"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen 
          name="communities"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen 
          name="notes"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen 
          name="study-rooms"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen 
          name="settings"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen 
          name="lost-found"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen 
          name="job-board"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen 
          name="academic-calendar"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen 
          name="marketplace"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen 
          name="campus-map"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </>
  );
}
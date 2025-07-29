import { Tabs } from 'expo-router';
import { Dimensions, Image } from 'react-native';
import { Header } from '@/components/Header';
import { House, Search, CalendarDays, ShoppingBag, Users, Compass, Calendar } from 'lucide-react-native';
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
            height: 60,
            paddingTop: 0,
            paddingBottom: 8,
            borderTopWidth: 0
          },
          tabBarItemStyle: {
            paddingTop: 8,
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
            tabBarIcon: ({ color, size }) => <Compass size={size} color={color} />,
          }}
        />
        <Tabs.Screen 
          name="events"
          options={{
            tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
          }}
        />
        <Tabs.Screen 
          name="marketplace"
          options={{
            tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} />,
          }}
        />
        <Tabs.Screen 
          name="study-rooms"
          options={{
            tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
          }}
        />
        <Tabs.Screen 
          name="create-post"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen 
          name="profile-tab"
          options={{
            href: null,
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
          name="settings"
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
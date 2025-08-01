import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, TrendingUp, Users, BookOpen, ChevronRight, Plus, Hash, MessageCircle, Lock, UserPlus } from 'lucide-react-native';
import { SwipeGestureWrapper } from '@/components/SwipeGestureWrapper';
import { useTheme } from '@/context/ThemeContext';

// Mock data for trending topics
const trendingTopics = [
  'Final Exams',
  'Campus Concert',
  'Student Election',
  'Research Symposium',
  'Career Fair'
];

// Mock data for communities
const popularCommunities = [
  {
    id: '1',
    name: 'Computer Science',
    members: 2543,
    icon: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=100',
  },
  {
    id: '2',
    name: 'Biology Club',
    members: 1892,
    icon: 'https://images.pexels.com/photos/3825526/pexels-photo-3825526.jpeg?auto=compress&cs=tinysrgb&w=100',
  },
  {
    id: '3',
    name: 'Film Society',
    members: 1245,
    icon: 'https://images.pexels.com/photos/274937/pexels-photo-274937.jpeg?auto=compress&cs=tinysrgb&w=100',
  },
];

// Mock data for suggested connections
const suggestedConnections = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    role: 'Professor of Computer Science',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100',
    mutualConnections: 12,
    department: 'Computer Science',
  },
  {
    id: '2',
    name: 'Michael Brown',
    role: 'Research Assistant',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100',
    mutualConnections: 8,
    department: 'Physics',
  },
  {
    id: '3',
    name: 'Emma Wilson',
    role: 'Teaching Assistant',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
    mutualConnections: 15,
    department: 'Mathematics',
  },
];

// Mock data for groups
const suggestedGroups = [
  {
    id: '1',
    name: 'Study Group - CS301',
    description: 'Data Structures and Algorithms study group',
    members: 12,
    avatar: 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=100',
    isPrivate: false,
  },
  {
    id: '2',
    name: 'Research Team Alpha',
    description: 'Machine Learning research collaboration',
    members: 8,
    avatar: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=100',
    isPrivate: true,
  },
  {
    id: '3',
    name: 'Campus Photography',
    description: 'Share and discuss photography techniques',
    members: 24,
    avatar: 'https://images.pexels.com/photos/1793525/pexels-photo-1793525.jpeg?auto=compress&cs=tinysrgb&w=100',
    isPrivate: false,
  },
];

// Mock data for channels
const suggestedChannels = [
  {
    id: '1',
    name: 'Campus Updates',
    description: 'Official university announcements and news',
    subscribers: 3421,
    avatar: 'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=100',
    isVerified: true,
    isPrivate: false,
  },
  {
    id: '2',
    name: 'Tech News Daily',
    description: 'Latest technology news and trends',
    subscribers: 1892,
    avatar: 'https://images.pexels.com/photos/2004161/pexels-photo-2004161.jpeg?auto=compress&cs=tinysrgb&w=100',
    isVerified: false,
    isPrivate: true,
  },
  {
    id: '3',
    name: 'Career Opportunities',
    description: 'Job postings and career advice',
    subscribers: 2156,
    avatar: 'https://images.pexels.com/photos/3183183/pexels-photo-3183183.jpeg?auto=compress&cs=tinysrgb&w=100',
    isVerified: true,
    isPrivate: false,
  },
];

export default function ExploreScreen() {
  const { isDark } = useTheme();

  return (
    <SwipeGestureWrapper>
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Search Bar */}
          <TouchableOpacity 
            style={[styles.searchBar, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}
            activeOpacity={0.7}
          >
            <Search size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
            <Text style={[styles.searchText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Search Semster
            </Text>
          </TouchableOpacity>
          
          {/* Trending Topics */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <TrendingUp size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Trending Topics
                </Text>
              </View>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={[styles.seeAllText, { color: isDark ? '#60A5FA' : '#3B82F6' }]}>See All</Text>
                <ChevronRight size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.trendingContainer}
            >
              {trendingTopics.map((topic, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.trendingItem, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}
                >
                  <Text style={[styles.trendingText, { color: isDark ? '#E5E7EB' : '#1F2937' }]}>
                    #{topic}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Suggested Connections */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Users size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Suggested Connections
                </Text>
              </View>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={[styles.seeAllText, { color: isDark ? '#60A5FA' : '#3B82F6' }]}>See All</Text>
                <ChevronRight size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.connectionsContainer}
            >
              {suggestedConnections.map((connection) => (
                <View
                  key={connection.id}
                  style={[styles.connectionCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}
                >
                  <Image source={{ uri: connection.avatar }} style={styles.connectionAvatar} />
                  <Text style={[styles.connectionName, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    {connection.name}
                  </Text>
                  <Text style={[styles.connectionRole, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                    {connection.role}
                  </Text>
                  <Text style={[styles.connectionMutual, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                    {connection.mutualConnections} mutual connections
                  </Text>
                  <TouchableOpacity 
                    style={[styles.connectButton, { backgroundColor: '#3B82F6' }]}
                  >
                    <UserPlus size={18} color="#FFFFFF" />
                    <Text style={styles.connectButtonText}>Buddy Up</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Suggested Groups */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Users size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Suggested Groups
                </Text>
              </View>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={[styles.seeAllText, { color: isDark ? '#60A5FA' : '#3B82F6' }]}>See All</Text>
                <ChevronRight size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
              </TouchableOpacity>
            </View>

            {suggestedGroups.map(group => (
              <View 
                key={group.id} 
                style={[styles.socialCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}
              >
                <View style={styles.socialCardHeader}>
                  <Image source={{ uri: group.avatar }} style={styles.socialAvatar} />
                  <View style={styles.socialInfo}>
                    <View style={styles.socialNameRow}>
                      <Text style={[styles.socialName, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                        {group.name}
                      </Text>
                      {group.isPrivate && (
                        <Lock size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
                      )}
                    </View>
                    <Text style={[styles.socialMeta, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                      {group.members} members
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={[styles.socialActionButton, { backgroundColor: '#3B82F6' }]}
                  >
                    <Text style={styles.socialActionText}>
                      {group.isPrivate ? 'Request' : 'Join'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={[styles.socialDescription, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                  {group.description}
                </Text>
              </View>
            ))}
          </View>

          {/* Suggested Channels */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Hash size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Suggested Channels
                </Text>
              </View>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={[styles.seeAllText, { color: isDark ? '#60A5FA' : '#3B82F6' }]}>See All</Text>
                <ChevronRight size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
              </TouchableOpacity>
            </View>

            {suggestedChannels.map(channel => (
              <View 
                key={channel.id} 
                style={[styles.socialCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}
              >
                <View style={styles.socialCardHeader}>
                  <Image source={{ uri: channel.avatar }} style={styles.socialAvatar} />
                  <View style={styles.socialInfo}>
                    <View style={styles.socialNameRow}>
                      <Text style={[styles.socialName, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                        {channel.name}
                      </Text>
                      {channel.isPrivate && (
                        <Lock size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
                      )}
                      {channel.isVerified && (
                        <View style={[styles.verifiedBadge, { backgroundColor: '#3B82F6' }]}>
                          <Text style={styles.verifiedBadgeText}>✓</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.socialMeta, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                      {channel.subscribers.toLocaleString()} subscribers
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={[styles.socialActionButton, { backgroundColor: '#10B981' }]}
                  >
                    <Text style={styles.socialActionText}>
                      {channel.isPrivate ? 'Request' : 'Subscribe'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={[styles.socialDescription, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                  {channel.description}
                </Text>
              </View>
            ))}
          </View>
          
          {/* Popular Communities */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <BookOpen size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Popular Communities
                </Text>
              </View>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={[styles.seeAllText, { color: isDark ? '#60A5FA' : '#3B82F6' }]}>See All</Text>
                <ChevronRight size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
              </TouchableOpacity>
            </View>
            
            {popularCommunities.map(community => (
              <TouchableOpacity 
                key={community.id} 
                style={[styles.communityItem, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}
              >
                <Image source={{ uri: community.icon }} style={styles.communityIcon} />
                <View style={styles.communityInfo}>
                  <Text style={[styles.communityName, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    {community.name}
                  </Text>
                  <Text style={styles.communityMembers}>
                    {community.members.toLocaleString()} members
                  </Text>
                </View>
                <ChevronRight size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            ))}
          </View>
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
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginLeft: 10,
    outlineStyle: 'none',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginLeft: 8,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginRight: 4,
  },
  trendingContainer: {
    paddingBottom: 8,
  },
  trendingItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  trendingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  connectionsContainer: {
    paddingBottom: 8,
  },
  connectionCard: {
    width: 200,
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  connectionAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  connectionName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
  },
  connectionRole: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  connectionMutual: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  socialCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  socialCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  socialAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  socialInfo: {
    flex: 1,
  },
  socialNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  socialName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginRight: 6,
  },
  socialMeta: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
  },
  socialDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  socialActionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  socialActionText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  verifiedBadgeText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    fontSize: 10,
  },
  communityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  communityIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  communityInfo: {
    flex: 1,
    marginLeft: 16,
  },
  communityName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  communityMembers: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#9CA3AF',
  },
});
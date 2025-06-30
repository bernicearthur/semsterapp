import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SwipeGestureWrapper } from '@/components/SwipeGestureWrapper';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { MapPin, Calendar, Briefcase, Mail, Link, CreditCard as Edit, Settings, Share2, UserPlus, MessageCircle, Bookmark, Repeat2 } from 'lucide-react-native';
import { router } from 'expo-router';

interface Post {
  id: string;
  user: {
    name: string;
    avatar: string;
    role: string;
    course?: string;
    department?: string;
    graduationYear?: number;
    year?: number;
  };
  content: string;
  images?: string[];
  timestamp: string;
  likes: number;
  comments: number;
  reposts: number;
}

const userPosts: Post[] = [
  {
    id: '1',
    user: {
      name: 'Alex Johnson',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
      role: 'Student',
      course: 'Computer Science',
      year: 2025,
    },
    content: 'Excited to announce our new workshop series on AI and Machine Learning! Starting next week, we\'ll be hosting weekly sessions covering everything from basics to advanced topics. Don\'t miss out! #AI #Workshop',
    images: ['https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800'],
    timestamp: '1d',
    likes: 124,
    comments: 32,
    reposts: 18,
  },
  {
    id: '2',
    user: {
      name: 'Alex Johnson',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
      role: 'Student',
      course: 'Computer Science',
      year: 2025,
    },
    content: 'Just finished my final project for the semester! So proud of what our team accomplished. #ComputerScience #TeamWork',
    images: [
      'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    timestamp: '3d',
    likes: 89,
    comments: 14,
    reposts: 7,
  },
  {
    id: '3',
    user: {
      name: 'Alex Johnson',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
      role: 'Student',
      course: 'Computer Science',
      year: 2025,
    },
    content: 'Great discussion in today\'s lecture about emerging technologies in Africa 💡 #GhanaEducation',
    timestamp: '1w',
    likes: 56,
    comments: 8,
    reposts: 3,
  },
];

const savedPosts: Post[] = [
  {
    id: '4',
    user: {
      name: 'Sarah Chen',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
      role: 'Lecturer',
      department: 'Computer Science',
    },
    content: 'Reminder: The deadline for the research paper submission is next Friday. Make sure to follow the formatting guidelines!',
    timestamp: '2d',
    likes: 45,
    comments: 12,
    reposts: 8,
  },
  {
    id: '5',
    user: {
      name: 'Michael Brown',
      avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100',
      role: 'Student',
      course: 'Engineering',
      year: 2024,
    },
    content: 'Check out our engineering project that won first place at the innovation fair! #Engineering #Innovation',
    images: ['https://images.pexels.com/photos/3862130/pexels-photo-3862130.jpeg?auto=compress&cs=tinysrgb&w=800'],
    timestamp: '5d',
    likes: 112,
    comments: 28,
    reposts: 15,
  },
];

const repostedPosts: Post[] = [
  {
    id: '6',
    user: {
      name: 'Emma Wilson',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
      role: 'Student',
      course: 'Business Administration',
      year: 2026,
    },
    content: 'The campus entrepreneurship competition is now open for registrations! Great opportunity for students with innovative ideas. #Entrepreneurship #Innovation',
    timestamp: '4d',
    likes: 78,
    comments: 23,
    reposts: 42,
  },
  {
    id: '7',
    user: {
      name: 'David Kim',
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100',
      role: 'Alumni',
      course: 'Computer Science',
      graduationYear: 2022,
    },
    content: 'Excited to be coming back to campus next month to give a talk on my journey from student to tech entrepreneur! #AlumniTalk #TechStartup',
    images: ['https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800'],
    timestamp: '1w',
    likes: 156,
    comments: 34,
    reposts: 27,
  },
];

const buddies = [
  {
    id: '1',
    name: 'Sarah Chen',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
    role: 'Lecturer',
    department: 'Computer Science',
  },
  {
    id: '2',
    name: 'Michael Brown',
    avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100',
    role: 'Student',
    course: 'Engineering',
    year: 2024,
  },
  {
    id: '3',
    name: 'Emma Wilson',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
    role: 'Student',
    course: 'Business Administration',
    year: 2026,
  },
  {
    id: '4',
    name: 'David Kim',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100',
    role: 'Alumni',
    course: 'Computer Science',
    graduationYear: 2022,
  },
  {
    id: '5',
    name: 'Lisa Wang',
    avatar: 'https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=100',
    role: 'Student',
    course: 'Psychology',
    year: 2025,
  },
  {
    id: '6',
    name: 'James Rodriguez',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100',
    role: 'Administration',
  },
];

export default function ProfileScreen() {
  const { isDark } = useTheme();
  const { userProfile, signOut, getInitials } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  const [showBuddies, setShowBuddies] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const renderUserMeta = (user: Post['user']) => {
    switch (user.role) {
      case 'Student':
        return `${user.course} • Class of ${user.year}`;
      case 'Alumni':
        return `${user.course} • ${user.graduationYear}`;
      case 'Lecturer':
        return `Department of ${user.department}`;
      default:
        return 'Administration';
    }
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
          onPress: () => signOut()
        }
      ]
    );
  };

  const renderPost = (post: Post) => (
    <View 
      key={post.id} 
      style={[styles.postCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}
    >
      <View style={styles.postHeader}>
        <Image 
          source={{ uri: post.user.avatar }}
          style={styles.postAvatar}
          onError={() => console.log("Error loading avatar")}
        />
        <View style={styles.postHeaderInfo}>
          <Text style={[styles.postUserName, { color: isDark ? '#FFFFFF' : '#111827' }]}>
            {post.user.name}
          </Text>
          <Text style={[styles.postMeta, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {renderUserMeta(post.user)} • {post.timestamp}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.postContent, { color: isDark ? '#E5E7EB' : '#1F2937' }]}>
        {post.content}
      </Text>
      
      {post.images && (
        <View style={[
          styles.postImagesContainer,
          { flexDirection: post.images.length === 1 ? 'column' : 'row' }
        ]}>
          {post.images.map((image, index) => (
            <Image 
              key={index}
              source={{ uri: image }}
              style={[
                styles.postImage,
                post.images.length === 1 ? styles.singleImage : styles.multipleImage
              ]}
              resizeMode="cover"
            />
          ))}
        </View>
      )}
      
      <View style={styles.postActions}>
        <View style={styles.postAction}>
          <TouchableOpacity style={styles.actionButton}>
            <MessageCircle size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
          </TouchableOpacity>
          <Text style={[styles.actionCount, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {post.comments}
          </Text>
        </View>
        
        <View style={styles.postAction}>
          <TouchableOpacity style={styles.actionButton}>
            <Repeat2 size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
          </TouchableOpacity>
          <Text style={[styles.actionCount, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {post.reposts}
          </Text>
        </View>
        
        <View style={styles.postAction}>
          <TouchableOpacity style={styles.actionButton}>
            <Bookmark size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.postAction}>
          <TouchableOpacity style={styles.actionButton}>
            <Share2 size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderBuddyItem = ({ item }) => (
    <View style={[styles.buddyItem, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
      <Image source={{ uri: item.avatar }} style={styles.buddyAvatar} />
      <View style={styles.buddyInfo}>
        <Text style={[styles.buddyName, { color: isDark ? '#FFFFFF' : '#111827' }]}>
          {item.name}
        </Text>
        <Text style={[styles.buddyRole, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          {item.role === 'Student' ? `${item.course} • Class of ${item.year}` : 
           item.role === 'Alumni' ? `${item.course} • ${item.graduationYear}` :
           item.role === 'Lecturer' ? `Department of ${item.department}` : 'Administration'}
        </Text>
      </View>
      <TouchableOpacity style={[styles.messageButton, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
        <MessageCircle size={18} color={isDark ? '#60A5FA' : '#3B82F6'} />
      </TouchableOpacity>
    </View>
  );

  const renderInitialsAvatar = () => {
    const initials = userProfile?.full_name ? getInitials(userProfile.full_name) : "U";
    
    return (
      <View style={[styles.initialsAvatar, { backgroundColor: '#3B82F6' }]}>
        <Text style={styles.initialsText}>{initials}</Text>
      </View>
    );
  };

  return (
    <SwipeGestureWrapper>
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}>
        {showBuddies ? (
          <View style={styles.buddiesContainer}>
            <View style={styles.buddiesHeader}>
              <Text style={[styles.buddiesTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Buddies
              </Text>
              <TouchableOpacity 
                style={[styles.backButton, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}
                onPress={() => setShowBuddies(false)}
              >
                <Text style={[styles.backButtonText, { color: isDark ? '#60A5FA' : '#3B82F6' }]}>
                  Back to Profile
                </Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={buddies}
              renderItem={renderBuddyItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.buddiesList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Profile Header */}
            <View style={[styles.profileHeader, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
              <View style={styles.coverPhoto}>
                <Image 
                  source={{ uri: 'https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }}
                  style={styles.coverImage}
                />
                <TouchableOpacity style={styles.editCoverButton}>
                  <Edit size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.profileInfo}>
                <View style={styles.avatarContainer}>
                  {userProfile?.avatar_url && !avatarError ? (
                    <Image 
                      source={{ uri: userProfile.avatar_url }}
                      style={styles.avatar}
                      onError={() => setAvatarError(true)}
                    />
                  ) : renderInitialsAvatar()}
                  <TouchableOpacity style={styles.editAvatarButton}>
                    <Edit size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.nameContainer}>
                  <Text style={[styles.userName, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    {userProfile?.full_name || 'User'}
                  </Text>
                  <Text style={[styles.userHandle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                    @{userProfile?.username || 'username'}
                  </Text>
                </View>
                
                <View style={styles.userStats}>
                  <TouchableOpacity 
                    style={styles.statItem}
                    onPress={() => setShowBuddies(true)}
                  >
                    <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                      248
                    </Text>
                    <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                      Buddies
                    </Text>
                  </TouchableOpacity>
                  
                  <View style={styles.statDivider} />
                  
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                      36
                    </Text>
                    <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                      Posts
                    </Text>
                  </View>
                </View>

                <Text style={[styles.userDescription, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                  {userProfile?.school ? `${userProfile.school}` : 'Computer Science • Class of 2025'}
                </Text>
                
                <View style={styles.userDetails}>
                  <View style={styles.detailItem}>
                    <MapPin size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    <Text style={[styles.detailText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                      Accra, Ghana
                    </Text>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <Calendar size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    <Text style={[styles.detailText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                      Joined September 2023
                    </Text>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <Briefcase size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    <Text style={[styles.detailText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                      Research Assistant
                    </Text>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <Mail size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    <Text style={[styles.detailText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                      {userProfile?.id ? 'andrew.tetteh@ashesi.edu.gh' : 'alex.johnson@university.edu'}
                    </Text>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <Link size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    <Text style={[styles.detailText, { color: isDark ? '#60A5FA' : '#3B82F6' }]}>
                      github.com/alexjohnson
                    </Text>
                  </View>
                </View>
                
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={[styles.editProfileButton, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}
                  >
                    <Edit size={18} color={isDark ? '#E5E7EB' : '#4B5563'} />
                    <Text style={[styles.editButtonText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                      Edit Profile
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.settingsButton}
                    onPress={() => router.push('/settings')}
                  >
                    <Settings size={20} color={isDark ? '#E5E7EB' : '#4B5563'} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.shareButton}
                    onPress={handleSignOut}
                  >
                    <Text style={[styles.signOutText, { color: '#EF4444' }]}>Sign Out</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            {/* Tabs */}
            <View style={[styles.tabsContainer, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
              <TouchableOpacity 
                style={[
                  styles.tab, 
                  activeTab === 'posts' && styles.activeTab
                ]}
                onPress={() => setActiveTab('posts')}
              >
                <Text 
                  style={[
                    styles.tabText, 
                    { color: isDark ? '#9CA3AF' : '#6B7280' },
                    activeTab === 'posts' && { color: isDark ? '#FFFFFF' : '#111827' }
                  ]}
                >
                  Posts
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.tab, 
                  activeTab === 'saved' && styles.activeTab
                ]}
                onPress={() => setActiveTab('saved')}
              >
                <Text 
                  style={[
                    styles.tabText, 
                    { color: isDark ? '#9CA3AF' : '#6B7280' },
                    activeTab === 'saved' && { color: isDark ? '#FFFFFF' : '#111827' }
                  ]}
                >
                  Saved
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.tab, 
                  activeTab === 'reposts' && styles.activeTab
                ]}
                onPress={() => setActiveTab('reposts')}
              >
                <Text 
                  style={[
                    styles.tabText, 
                    { color: isDark ? '#9CA3AF' : '#6B7280' },
                    activeTab === 'reposts' && { color: isDark ? '#FFFFFF' : '#111827' }
                  ]}
                >
                  Reposts
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.tab, 
                  activeTab === 'about' && styles.activeTab
                ]}
                onPress={() => setActiveTab('about')}
              >
                <Text 
                  style={[
                    styles.tabText, 
                    { color: isDark ? '#9CA3AF' : '#6B7280' },
                    activeTab === 'about' && { color: isDark ? '#FFFFFF' : '#111827' }
                  ]}
                >
                  About
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Posts */}
            {activeTab === 'posts' && (
              <View style={styles.postsContainer}>
                {userPosts.map(post => renderPost(post))}
              </View>
            )}
            
            {/* Saved Posts */}
            {activeTab === 'saved' && (
              <View style={styles.postsContainer}>
                {savedPosts.map(post => renderPost(post))}
              </View>
            )}

            {/* Reposted Posts */}
            {activeTab === 'reposts' && (
              <View style={styles.postsContainer}>
                {repostedPosts.map(post => renderPost(post))}
              </View>
            )}
            
            {/* About */}
            {activeTab === 'about' && (
              <View style={[styles.aboutContainer, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
                <View style={styles.aboutSection}>
                  <Text style={[styles.aboutSectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    Bio
                  </Text>
                  <Text style={[styles.aboutText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Computer Science student at {userProfile?.school || 'University of Ghana'}. Passionate about AI, machine learning, and software development. Research assistant in the Computer Science department.
                  </Text>
                </View>
                
                <View style={styles.aboutSection}>
                  <Text style={[styles.aboutSectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    Education
                  </Text>
                  <View style={styles.educationItem}>
                    <Text style={[styles.educationTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                      {userProfile?.school || 'University of Ghana'}
                    </Text>
                    <Text style={[styles.educationDetails, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                      BSc Computer Science • 2021 - 2025
                    </Text>
                  </View>
                  <View style={styles.educationItem}>
                    <Text style={[styles.educationTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                      Accra High School
                    </Text>
                    <Text style={[styles.educationDetails, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                      High School Diploma • 2018 - 2021
                    </Text>
                  </View>
                </View>
                
                <View style={styles.aboutSection}>
                  <Text style={[styles.aboutSectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    Interests
                  </Text>
                  <View style={styles.interestsContainer}>
                    <View style={[styles.interestTag, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                      <Text style={[styles.interestText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                        Artificial Intelligence
                      </Text>
                    </View>
                    <View style={[styles.interestTag, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                      <Text style={[styles.interestText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                        Web Development
                      </Text>
                    </View>
                    <View style={[styles.interestTag, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                      <Text style={[styles.interestText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                        Mobile Apps
                      </Text>
                    </View>
                    <View style={[styles.interestTag, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                      <Text style={[styles.interestText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                        Data Science
                      </Text>
                    </View>
                    <View style={[styles.interestTag, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                      <Text style={[styles.interestText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                        Blockchain
                      </Text>
                    </View>
                    <View style={[styles.interestTag, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                      <Text style={[styles.interestText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                        Photography
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </SwipeGestureWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  coverPhoto: {
    height: 150,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  editCoverButton: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    padding: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginTop: -50,
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  initialsAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontFamily: 'Inter-Bold',
  },
  editAvatarButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameContainer: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  userHandle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  userStats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingRight: 24,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#E5E7EB',
    marginRight: 24,
  },
  userDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
    lineHeight: 22,
  },
  userDetails: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 12,
  },
  editButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  shareButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signOutText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  postsContainer: {
    padding: 16,
    paddingTop: 8,
  },
  postCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postHeaderInfo: {
    flex: 1,
  },
  postUserName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  postMeta: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  postContent: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
    marginBottom: 12,
  },
  postImagesContainer: {
    gap: 8,
    marginBottom: 12,
  },
  postImage: {
    borderRadius: 12,
  },
  singleImage: {
    width: '100%',
    height: 200,
  },
  multipleImage: {
    flex: 1,
    height: 150,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
  },
  actionCount: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  aboutContainer: {
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  aboutSection: {
    marginBottom: 24,
  },
  aboutSectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  educationItem: {
    marginBottom: 12,
  },
  educationTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  educationDetails: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  buddiesContainer: {
    flex: 1,
    padding: 16,
  },
  buddiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  buddiesTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  buddiesList: {
    paddingBottom: 20,
  },
  buddyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buddyAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  buddyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  buddyName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  buddyRole: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
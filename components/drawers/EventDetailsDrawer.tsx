import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Dimensions, Linking, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Calendar, Clock, MapPin, Users, Globe, Link, Bookmark, Share2, MoveVertical as MoreVertical, ExternalLink, Copy, UserPlus, Flag } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  runOnJS,
  withTiming,
  interpolate
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location?: string;
  isOnline: boolean;
  onlineLink?: string;
  organizer: {
    name: string;
    avatar: string;
    verified?: boolean;
  };
  attendees: number;
  maxAttendees?: number;
  image: string;
  category: string;
  isAttending: boolean;
  isSaved: boolean;
  price?: number;
  isFree: boolean;
  featured?: boolean;
}

interface EventDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  onToggleAttendance: (eventId: string) => void;
  onToggleSaved: (eventId: string) => void;
}

export function EventDetailsDrawer({ isOpen, onClose, event, onToggleAttendance, onToggleSaved }: EventDetailsDrawerProps) {
  const { isDark } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  
  const translateY = useSharedValue(screenHeight);
  const moreOptionsOpacity = useSharedValue(0);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const moreOptionsStyle = useAnimatedStyle(() => ({
    opacity: moreOptionsOpacity.value,
    transform: [{ 
      translateY: interpolate(moreOptionsOpacity.value, [0, 1], [20, 0])
    }],
  }));

  const gesture = Gesture.Pan()
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
  }, [isOpen]);

  const toggleMoreOptions = () => {
    setShowMoreOptions(!showMoreOptions);
    moreOptionsOpacity.value = withTiming(showMoreOptions ? 0 : 1);
  };

  const handleJoinOnlineEvent = () => {
    if (event?.onlineLink) {
      Linking.openURL(event.onlineLink).catch(() => {
        Alert.alert('Error', 'Unable to open the link');
      });
    }
  };

  const handleCopyLink = () => {
    if (event?.onlineLink) {
      // In a real app, use Clipboard.setString(event.onlineLink)
      Alert.alert('Copied', 'Event link copied to clipboard');
    }
  };

  const handleShareEvent = () => {
    if (event) {
      Share.share({
        message: `Check out this event: ${event.title}\n${event.description}\n\nDate: ${event.date} at ${event.time}`,
        title: event.title,
      });
    }
  };

  const handleReportEvent = () => {
    Alert.alert(
      'Report Event',
      'Why are you reporting this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Inappropriate Content', onPress: () => Alert.alert('Reported', 'Thank you for your report') },
        { text: 'Spam', onPress: () => Alert.alert('Reported', 'Thank you for your report') },
        { text: 'Misleading Information', onPress: () => Alert.alert('Reported', 'Thank you for your report') },
      ]
    );
  };

  const handleContactOrganizer = () => {
    Alert.alert('Contact Organizer', 'This would open a message to the event organizer');
  };

  if (!isOpen || !event) return null;

  return (
    <View style={[StyleSheet.absoluteFill, styles.container]}>
      <TouchableOpacity 
        style={[StyleSheet.absoluteFill, styles.overlay]}
        activeOpacity={1}
        onPress={onClose}
      />
      
      <GestureDetector gesture={gesture}>
        <Animated.View 
          style={[
            styles.drawer,
            { backgroundColor: isDark ? '#0F172A' : '#FFFFFF' },
            drawerStyle,
          ]}
        >
          <SafeAreaView style={{ flex: 1 }}>
            {/* Drag Handle */}
            <View style={styles.dragHandle}>
              <View style={[styles.dragIndicator, { backgroundColor: isDark ? '#4B5563' : '#D1D5DB' }]} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header Image */}
              <View style={styles.headerImageContainer}>
                <Image source={{ uri: event.image }} style={styles.headerImage} />
                
                {/* Header Controls */}
                <View style={styles.headerControls}>
                  <TouchableOpacity 
                    style={[styles.headerButton, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}
                    onPress={onClose}
                  >
                    <X size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                  
                  <View style={styles.headerRightControls}>
                    <TouchableOpacity 
                      style={[styles.headerButton, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}
                      onPress={() => onToggleSaved(event.id)}
                    >
                      <Bookmark 
                        size={24} 
                        color={event.isSaved ? '#F59E0B' : '#FFFFFF'}
                        fill={event.isSaved ? '#F59E0B' : 'none'}
                      />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.headerButton, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}
                      onPress={handleShareEvent}
                    >
                      <Share2 size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.headerButton, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}
                      onPress={toggleMoreOptions}
                    >
                      <MoreVertical size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Event Type Badge */}
                <View style={[
                  styles.eventTypeBadge,
                  { backgroundColor: event.isOnline ? '#10B981' : '#3B82F6' }
                ]}>
                  {event.isOnline ? (
                    <Globe size={16} color="#FFFFFF" />
                  ) : (
                    <MapPin size={16} color="#FFFFFF" />
                  )}
                  <Text style={styles.eventTypeText}>
                    {event.isOnline ? 'Online Event' : 'In-Person Event'}
                  </Text>
                </View>

                {/* Price Badge */}
                {!event.isFree && (
                  <View style={[styles.priceBadge, { backgroundColor: '#F59E0B' }]}>
                    <Text style={styles.priceText}>${event.price}</Text>
                  </View>
                )}
              </View>

              {/* Content */}
              <View style={styles.content}>
                {/* Title and Category */}
                <View style={styles.titleSection}>
                  <Text style={[styles.eventTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    {event.title}
                  </Text>
                  <View style={[
                    styles.categoryBadge,
                    { backgroundColor: isDark ? '#374151' : '#F3F4F6' }
                  ]}>
                    <Text style={[styles.categoryText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                      {event.category}
                    </Text>
                  </View>
                </View>

                {/* Event Details */}
                <View style={styles.detailsSection}>
                  <View style={styles.detailRow}>
                    <Calendar size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    <Text style={[styles.detailText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                      {event.date}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Clock size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    <Text style={[styles.detailText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                      {event.time}
                    </Text>
                  </View>

                  {event.location && (
                    <View style={styles.detailRow}>
                      <MapPin size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                      <Text style={[styles.detailText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                        {event.location}
                      </Text>
                    </View>
                  )}

                  {event.isOnline && event.onlineLink && (
                    <TouchableOpacity style={styles.detailRow} onPress={handleJoinOnlineEvent}>
                      <Link size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                      <Text style={[styles.detailText, styles.linkText, { color: isDark ? '#60A5FA' : '#3B82F6' }]}>
                        Join Online Event
                      </Text>
                      <ExternalLink size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    </TouchableOpacity>
                  )}

                  <View style={styles.detailRow}>
                    <Users size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    <Text style={[styles.detailText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                      {event.attendees} {event.maxAttendees ? `/ ${event.maxAttendees}` : ''} attending
                    </Text>
                  </View>
                </View>

                {/* Description */}
                <View style={styles.descriptionSection}>
                  <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    About This Event
                  </Text>
                  <Text style={[styles.description, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    {event.description}
                  </Text>
                </View>

                {/* Organizer */}
                <View style={styles.organizerSection}>
                  <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    Organizer
                  </Text>
                  <View style={styles.organizerInfo}>
                    <Image source={{ uri: event.organizer.avatar }} style={styles.organizerAvatar} />
                    <View style={styles.organizerDetails}>
                      <View style={styles.organizerNameRow}>
                        <Text style={[styles.organizerName, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                          {event.organizer.name}
                        </Text>
                        {event.organizer.verified && (
                          <View style={styles.verifiedBadge}>
                            <Text style={styles.verifiedText}>✓</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.organizerRole, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                        Event Organizer
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Online Event Actions */}
                {event.isOnline && event.onlineLink && (
                  <View style={styles.onlineActionsSection}>
                    <TouchableOpacity 
                      style={[styles.onlineActionButton, { backgroundColor: '#10B981' }]}
                      onPress={handleJoinOnlineEvent}
                    >
                      <ExternalLink size={20} color="#FFFFFF" />
                      <Text style={styles.onlineActionText}>Join Event</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.onlineActionButton, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}
                      onPress={handleCopyLink}
                    >
                      <Copy size={20} color={isDark ? '#E5E7EB' : '#4B5563'} />
                      <Text style={[styles.onlineActionText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                        Copy Link
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Bottom Actions */}
            <View style={[styles.bottomActions, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}>
              <TouchableOpacity
                style={[
                  styles.attendButton,
                  { backgroundColor: event.isAttending ? '#10B981' : '#3B82F6' }
                ]}
                onPress={() => onToggleAttendance(event.id)}
              >
                <Text style={styles.attendButtonText}>
                  {event.isAttending ? 'Attending' : 'Attend Event'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* More Options Menu */}
            {showMoreOptions && (
              <Animated.View 
                style={[
                  styles.moreOptionsMenu,
                  { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' },
                  moreOptionsStyle
                ]}
              >
                <TouchableOpacity 
                  style={styles.moreOptionItem}
                  onPress={() => {
                    setShowMoreOptions(false);
                    moreOptionsOpacity.value = withTiming(0);
                    handleContactOrganizer();
                  }}
                >
                  <UserPlus size={20} color={isDark ? '#E5E7EB' : '#4B5563'} />
                  <Text style={[styles.moreOptionText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    Invite Friends
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.moreOptionItem}
                  onPress={() => {
                    setShowMoreOptions(false);
                    moreOptionsOpacity.value = withTiming(0);
                    handleReportEvent();
                  }}
                >
                  <Flag size={20} color="#EF4444" />
                  <Text style={[styles.moreOptionText, { color: '#EF4444' }]}>
                    Report Event
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '95%',
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
    overflow: 'hidden',
  },
  dragHandle: {
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  dragIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  headerImageContainer: {
    position: 'relative',
    height: 280,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerControls: {
    position: 'absolute',
    top: 24,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRightControls: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(10px)',
  },
  eventTypeBadge: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(10px)',
  },
  eventTypeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  priceBadge: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 158, 11, 0.9)',
    backdropFilter: 'blur(10px)',
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  content: {
    padding: 24,
    paddingTop: 20,
    backgroundColor: 'inherit',
  },
  titleSection: {
    marginBottom: 24,
  },
  eventTitle: {
    fontSize: 26,
    fontFamily: 'Inter-Bold',
    lineHeight: 32,
    marginBottom: 16,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailsSection: {
    marginBottom: 24,
    gap: 18,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 2,
  },
  detailText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  linkText: {
    textDecorationLine: 'underline',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 26,
  },
  organizerSection: {
    marginBottom: 24,
  },
  organizerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  organizerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  organizerDetails: {
    marginLeft: 16,
    flex: 1,
  },
  organizerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  organizerName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  verifiedBadge: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Inter-Bold',
  },
  organizerRole: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
    opacity: 0.8,
  },
  onlineActionsSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  onlineActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  onlineActionText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  bottomActions: {
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: 'inherit',
  },
  attendButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  attendButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    letterSpacing: 0.5,
  },
  moreOptionsMenu: {
    position: 'absolute',
    top: 90,
    right: 16,
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 180,
    backdropFilter: 'blur(10px)',
  },
  moreOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
    borderRadius: 12,
  },
  moreOptionText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
});
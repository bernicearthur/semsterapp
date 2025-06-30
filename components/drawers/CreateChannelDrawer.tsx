import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Camera, Globe, Lock, Users, Link, Copy, Check } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  runOnJS
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface CreateChannelDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const visibilityOptions = [
  {
    id: 'public',
    icon: <Globe size={24} color="#3B82F6" />,
    title: 'Public',
    description: 'Anyone can find and join this channel',
  },
  {
    id: 'private',
    icon: <Lock size={24} color="#3B82F6" />,
    title: 'Private',
    description: 'Only invited members can join',
  },
  {
    id: 'restricted',
    icon: <Users size={24} color="#3B82F6" />,
    title: 'Restricted',
    description: 'Members need approval to join',
  },
];

export function CreateChannelDrawer({ isOpen, onClose }: CreateChannelDrawerProps) {
  const { isDark } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const [channelName, setChannelName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [copied, setCopied] = useState(false);
  const [channelLink, setChannelLink] = useState('https://semster.app/channels/join/xyz123');
  
  const translateX = useSharedValue(screenWidth);

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
    
    // Reset form when drawer opens
    if (isOpen) {
      setChannelName('');
      setDescription('');
      setVisibility('public');
      setCopied(false);
      // Generate a random channel link
      const randomId = Math.random().toString(36).substring(2, 10);
      setChannelLink(`https://semster.app/channels/join/${randomId}`);
    }
  }, [isOpen]);

  const handleCopyLink = () => {
    // In a real app, use Clipboard.setString(channelLink)
    setCopied(true);
    Alert.alert('Link Copied', 'Channel link copied to clipboard');
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleGenerateNewLink = () => {
    const randomId = Math.random().toString(36).substring(2, 10);
    setChannelLink(`https://semster.app/channels/join/${randomId}`);
    Alert.alert('New Link Generated', 'A new invite link has been created');
  };

  const handleCreateChannel = () => {
    if (!channelName.trim()) {
      Alert.alert('Error', 'Please enter a channel name');
      return;
    }
    
    // Add the new channel to messages
    const newChannel = {
      id: Date.now().toString(),
      type: 'channel',
      name: channelName.trim(),
      avatar: 'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=100',
      lastMessage: `You created this channel with ${visibility} visibility`,
      time: 'now',
      unread: false,
    };
    
    // In a real app, you would update a global state or context
    // For this demo, we'll use a mock implementation
    global.messages = global.messages || [];
    global.messages.unshift(newChannel);
    
    Alert.alert(
      'Channel Created',
      `"${channelName}" has been created with ${visibility} visibility`,
      [
        {
          text: 'OK',
          onPress: onClose
        }
      ]
    );
  };

  if (!isOpen) return null;

  return (
    <View style={[StyleSheet.absoluteFill, styles.container]}>
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
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color={isDark ? '#E5E7EB' : '#4B5563'} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Create Channel
              </Text>
              <TouchableOpacity 
                style={[
                  styles.createButton,
                  { opacity: channelName ? 1 : 0.5 }
                ]}
                onPress={handleCreateChannel}
                disabled={!channelName}
              >
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
              <View style={styles.channelInfoSection}>
                <TouchableOpacity 
                  style={[styles.channelImageButton, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF' }]}
                  onPress={() => Alert.alert('Select Image', 'Image picker would open here')}
                >
                  <Camera size={32} color={isDark ? '#60A5FA' : '#3B82F6'} />
                </TouchableOpacity>
                
                <View style={styles.channelInputs}>
                  <TextInput
                    style={[
                      styles.channelNameInput,
                      { color: isDark ? '#FFFFFF' : '#111827' }
                    ]}
                    placeholder="Channel name"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={channelName}
                    onChangeText={setChannelName}
                  />
                  <TextInput
                    style={[
                      styles.descriptionInput,
                      { color: isDark ? '#E5E7EB' : '#4B5563' }
                    ]}
                    placeholder="Description (optional)"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                  />
                </View>
              </View>

              <View style={styles.visibilitySection}>
                <Text style={[
                  styles.sectionTitle,
                  { color: isDark ? '#FFFFFF' : '#111827' }
                ]}>
                  Channel Visibility
                </Text>
                {visibilityOptions.map(option => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.visibilityOption,
                      { 
                        backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                        borderColor: visibility === option.id ? '#3B82F6' : 'transparent',
                      }
                    ]}
                    onPress={() => setVisibility(option.id)}
                  >
                    <View style={[styles.visibilityIcon, { backgroundColor: isDark ? '#0F172A' : '#EFF6FF' }]}>
                      {option.icon}
                    </View>
                    <View style={styles.visibilityContent}>
                      <Text style={[
                        styles.visibilityTitle,
                        { color: isDark ? '#FFFFFF' : '#111827' }
                      ]}>
                        {option.title}
                      </Text>
                      <Text style={[
                        styles.visibilityDescription,
                        { color: isDark ? '#9CA3AF' : '#6B7280' }
                      ]}>
                        {option.description}
                      </Text>
                    </View>
                    <View style={[
                      styles.radioButton,
                      { borderColor: isDark ? '#4B5563' : '#D1D5DB' },
                      visibility === option.id && styles.radioButtonSelected
                    ]} />
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.linkSection}>
                <View style={styles.linkHeader}>
                  <View style={styles.linkTitleContainer}>
                    <Link size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    <Text style={[
                      styles.linkTitle,
                      { color: isDark ? '#FFFFFF' : '#111827' }
                    ]}>
                      Channel Link
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.generateButton,
                      { backgroundColor: isDark ? '#1E293B' : '#F3F4F6' }
                    ]}
                    onPress={handleGenerateNewLink}
                  >
                    <Text style={[
                      styles.generateButtonText,
                      { color: isDark ? '#60A5FA' : '#3B82F6' }
                    ]}>
                      Generate New
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={[
                  styles.linkContainer,
                  { backgroundColor: isDark ? '#1E293B' : '#F3F4F6' }
                ]}>
                  <Text style={[
                    styles.linkText,
                    { color: isDark ? '#E5E7EB' : '#4B5563' }
                  ]}>
                    {channelLink}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.copyButton,
                      { backgroundColor: copied ? '#059669' : '#3B82F6' }
                    ]}
                    onPress={handleCopyLink}
                  >
                    {copied ? (
                      <Check size={18} color="#FFFFFF" />
                    ) : (
                      <Copy size={18} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                </View>

                <Text style={[
                  styles.linkDescription,
                  { color: isDark ? '#9CA3AF' : '#6B7280' }
                ]}>
                  Share this link with others to invite them to your channel
                </Text>
              </View>
              
              <View style={styles.infoSection}>
                <Text style={[styles.infoTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  About Channels
                </Text>
                <Text style={[styles.infoText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  Channels are spaces for organized discussions around specific topics. 
                  They can be used for announcements, course discussions, or interest groups.
                </Text>
              </View>
            </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
  createButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  channelInfoSection: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  channelImageButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  channelInputs: {
    flex: 1,
  },
  channelNameInput: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 8,
  },
  descriptionInput: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  visibilitySection: {
    padding: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 16,
  },
  visibilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
  },
  visibilityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  visibilityContent: {
    flex: 1,
    marginLeft: 12,
  },
  visibilityTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  visibilityDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginLeft: 12,
  },
  radioButtonSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  linkSection: {
    padding: 16,
  },
  linkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  linkTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  linkTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  generateButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  generateButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  linkText: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginRight: 12,
  },
  copyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  infoSection: {
    padding: 16,
    marginTop: 16,
  },
  infoTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 8,
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
});
import { useState, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Image as ImageIcon, X, Globe, Users, BookOpen, GraduationCap, Clock, Plus, Minus, Hash, AtSign, Paperclip, BarChart3 } from 'lucide-react-native';
import { router } from 'expo-router';
import { SwipeGestureWrapper } from '@/components/SwipeGestureWrapper';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';

interface Mention {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

interface Hashtag {
  id: string;
  name: string;
  count: number;
}

const suggestedMentions: Mention[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    username: 'sarahc',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
  },
  {
    id: '2',
    name: 'Michael Brown',
    username: 'michaelb',
    avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100',
  },
  {
    id: '3',
    name: 'Emma Wilson',
    username: 'emmaw',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
  },
  {
    id: '4',
    name: 'David Kim',
    username: 'davidk',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100',
  },
];

const suggestedHashtags: Hashtag[] = [
  { id: '1', name: 'ComputerScience', count: 1234 },
  { id: '2', name: 'StudyGroup', count: 856 },
  { id: '3', name: 'CampusLife', count: 2341 },
  { id: '4', name: 'Research', count: 567 },
  { id: '5', name: 'Finals', count: 1890 },
  { id: '6', name: 'Programming', count: 945 },
  { id: '7', name: 'University', count: 3456 },
  { id: '8', name: 'Education', count: 2134 },
];

export default function CreatePostScreen() {
  const { isDark } = useTheme();
  const [postText, setPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showAudienceModal, setShowAudienceModal] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState<'public' | 'connections' | 'course' | 'yeargroup'>('public');
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollDuration, setPollDuration] = useState(24);
  const [showMentions, setShowMentions] = useState(false);
  const [showHashtags, setShowHashtags] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [hashtagQuery, setHashtagQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectedMentions, setSelectedMentions] = useState<Mention[]>([]);
  const [selectedHashtags, setSelectedHashtags] = useState<Hashtag[]>([]);
  const textInputRef = useRef<TextInput>(null);
  
  const handleAddPhoto = () => {
    // Simulate image picker
    const images = [
      'https://images.pexels.com/photos/3755761/pexels-photo-3755761.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
    ];
    const randomImage = images[Math.floor(Math.random() * images.length)];
    setSelectedImage(randomImage);
  };
  
  const handleRemovePhoto = () => {
    setSelectedImage(null);
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handleUpdatePollOption = (text: string, index: number) => {
    const newOptions = [...pollOptions];
    newOptions[index] = text;
    setPollOptions(newOptions);
  };

  const handleTextChange = (text: string) => {
    setPostText(text);
    
    // Check for @ mentions
    const atIndex = text.lastIndexOf('@', cursorPosition);
    const spaceAfterAt = text.indexOf(' ', atIndex);
    const isTypingMention = atIndex !== -1 && (spaceAfterAt === -1 || spaceAfterAt > cursorPosition);
    
    if (isTypingMention) {
      const query = text.substring(atIndex + 1, cursorPosition);
      setMentionQuery(query);
      setShowMentions(true);
      setShowHashtags(false);
    } else {
      // Check for # hashtags
      const hashIndex = text.lastIndexOf('#', cursorPosition);
      const spaceAfterHash = text.indexOf(' ', hashIndex);
      const isTypingHashtag = hashIndex !== -1 && (spaceAfterHash === -1 || spaceAfterHash > cursorPosition);
      
      if (isTypingHashtag) {
        const query = text.substring(hashIndex + 1, cursorPosition);
        setHashtagQuery(query);
        setShowHashtags(true);
        setShowMentions(false);
      } else {
        setShowMentions(false);
        setShowHashtags(false);
      }
    }
  };

  const handleSelectionChange = (event: any) => {
    setCursorPosition(event.nativeEvent.selection.start);
  };

  const insertMention = (mention: Mention) => {
    const atIndex = postText.lastIndexOf('@', cursorPosition);
    const beforeAt = postText.substring(0, atIndex);
    const afterCursor = postText.substring(cursorPosition);
    const newText = `${beforeAt}@${mention.username} ${afterCursor}`;
    
    setPostText(newText);
    setShowMentions(false);
    setMentionQuery('');
    
    // Add to selected mentions if not already added
    if (!selectedMentions.find(m => m.id === mention.id)) {
      setSelectedMentions([...selectedMentions, mention]);
    }
    
    // Focus back to text input
    setTimeout(() => {
      textInputRef.current?.focus();
    }, 100);
  };

  const insertHashtag = (hashtag: Hashtag) => {
    const hashIndex = postText.lastIndexOf('#', cursorPosition);
    const beforeHash = postText.substring(0, hashIndex);
    const afterCursor = postText.substring(cursorPosition);
    const newText = `${beforeHash}#${hashtag.name} ${afterCursor}`;
    
    setPostText(newText);
    setShowHashtags(false);
    setHashtagQuery('');
    
    // Add to selected hashtags if not already added
    if (!selectedHashtags.find(h => h.id === hashtag.id)) {
      setSelectedHashtags([...selectedHashtags, hashtag]);
    }
    
    // Focus back to text input
    setTimeout(() => {
      textInputRef.current?.focus();
    }, 100);
  };

  const filteredMentions = suggestedMentions.filter(mention =>
    mention.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    mention.username.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const filteredHashtags = suggestedHashtags.filter(hashtag =>
    hashtag.name.toLowerCase().includes(hashtagQuery.toLowerCase())
  );
  
  const handlePost = () => {
    if (!showPollCreator && postText.trim() === '' && !selectedImage) {
      Alert.alert('Empty Post', 'Please add some content to your post.');
      return;
    }
    
    if (showPollCreator && (pollQuestion.trim() === '' || pollOptions.some(opt => opt.trim() === ''))) {
      Alert.alert('Incomplete Poll', 'Please fill in the poll question and all options.');
      return;
    }
    
    // Simulate posting
    Alert.alert(
      'Post Created!', 
      `Your ${showPollCreator ? 'poll' : 'post'} has been posted successfully.`,
      [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setPostText('');
            setSelectedImage(null);
            setPollQuestion('');
            setPollOptions(['', '']);
            setSelectedMentions([]);
            setSelectedHashtags([]);
            setShowPollCreator(false);
            router.replace('/');
          }
        }
      ]
    );
  };

  const audienceOptions = [
    {
      id: 'public',
      icon: <Globe size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />,
      title: 'Public',
      description: 'Anyone can see this post',
    },
    {
      id: 'connections',
      icon: <Users size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />,
      title: 'Connections',
      description: 'Only your connections can see this post',
    },
    {
      id: 'course',
      icon: <BookOpen size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />,
      title: 'Course',
      description: 'Only students in your course can see this post',
    },
    {
      id: 'yeargroup',
      icon: <GraduationCap size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />,
      title: 'Year Group',
      description: 'Only students in your year can see this post',
    },
  ];

  const getAudienceIcon = () => {
    switch (selectedAudience) {
      case 'public':
        return <Globe size={22} color={isDark ? '#60A5FA' : '#3B82F6'} />;
      case 'connections':
        return <Users size={22} color={isDark ? '#60A5FA' : '#3B82F6'} />;
      case 'course':
        return <BookOpen size={22} color={isDark ? '#60A5FA' : '#3B82F6'} />;
      case 'yeargroup':
        return <GraduationCap size={22} color={isDark ? '#60A5FA' : '#3B82F6'} />;
    }
  };

  const getAudienceTitle = () => {
    switch (selectedAudience) {
      case 'public':
        return 'Public';
      case 'connections':
        return 'Connections';
      case 'course':
        return 'Course';
      case 'yeargroup':
        return 'Year Group';
    }
  };

  return (
    <SwipeGestureWrapper>
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={[styles.card, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
              <View style={styles.header}>
                <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Create Post
                </Text>
                
                <TouchableOpacity
                  style={[styles.audienceSelector, { backgroundColor: isDark ? '#0F172A' : '#F3F4F6' }]}
                  onPress={() => setShowAudienceModal(true)}
                >
                  {getAudienceIcon()}
                  <Text style={[styles.audienceText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    {getAudienceTitle()}
                  </Text>
                </TouchableOpacity>
              </View>

              {!showPollCreator ? (
                <>
                  <View style={styles.textInputContainer}>
                    <TextInput
                      ref={textInputRef}
                      style={[
                        styles.textInput, 
                        { backgroundColor: isDark ? '#0F172A' : '#F9FAFB', color: isDark ? '#E5E7EB' : '#1F2937' }
                      ]}
                      placeholder="What's on your mind? Use @ to mention people and # for hashtags"
                      placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                      multiline
                      value={postText}
                      onChangeText={handleTextChange}
                      onSelectionChange={handleSelectionChange}
                    />
                    
                    {/* Selected mentions and hashtags display */}
                    {(selectedMentions.length > 0 || selectedHashtags.length > 0) && (
                      <View style={styles.selectedTagsContainer}>
                        {selectedMentions.map((mention) => (
                          <View key={mention.id} style={[styles.selectedTag, { backgroundColor: '#3B82F6' }]}>
                            <AtSign size={14} color="#FFFFFF" />
                            <Text style={styles.selectedTagText}>{mention.username}</Text>
                          </View>
                        ))}
                        {selectedHashtags.map((hashtag) => (
                          <View key={hashtag.id} style={[styles.selectedTag, { backgroundColor: '#10B981' }]}>
                            <Hash size={14} color="#FFFFFF" />
                            <Text style={styles.selectedTagText}>{hashtag.name}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                  
                  {selectedImage && (
                    <View style={styles.imageContainer}>
                      <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                      <TouchableOpacity 
                        style={styles.removeImageButton}
                        onPress={handleRemovePhoto}
                      >
                        <X size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.pollContainer}>
                  <TextInput
                    style={[
                      styles.pollQuestionInput,
                      { backgroundColor: isDark ? '#0F172A' : '#F9FAFB', color: isDark ? '#E5E7EB' : '#1F2937' }
                    ]}
                    placeholder="Ask a question..."
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={pollQuestion}
                    onChangeText={setPollQuestion}
                  />

                  <View style={styles.pollOptionsContainer}>
                    {pollOptions.map((option, index) => (
                      <View key={index} style={styles.pollOptionRow}>
                        <TextInput
                          style={[
                            styles.pollOptionInput,
                            { backgroundColor: isDark ? '#0F172A' : '#F9FAFB', color: isDark ? '#E5E7EB' : '#1F2937' }
                          ]}
                          placeholder={`Option ${index + 1}`}
                          placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                          value={option}
                          onChangeText={(text) => handleUpdatePollOption(text, index)}
                        />
                        {pollOptions.length > 2 && (
                          <TouchableOpacity
                            style={[styles.removeOptionButton, { backgroundColor: isDark ? '#0F172A' : '#F3F4F6' }]}
                            onPress={() => handleRemovePollOption(index)}
                          >
                            <Minus size={16} color={isDark ? '#E5E7EB' : '#4B5563'} />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}

                    {pollOptions.length < 4 && (
                      <TouchableOpacity
                        style={[styles.addOptionButton, { backgroundColor: isDark ? '#0F172A' : '#F3F4F6' }]}
                        onPress={handleAddPollOption}
                      >
                        <Plus size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
                        <Text style={[styles.addOptionText, { color: isDark ? '#60A5FA' : '#3B82F6' }]}>
                          Add Option
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.pollDurationContainer}>
                    <Clock size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    <Text style={[styles.pollDurationLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                      Poll Duration:
                    </Text>
                    <View style={styles.pollDurationOptions}>
                      {[24, 48, 72].map((hours) => (
                        <TouchableOpacity
                          key={hours}
                          style={[
                            styles.pollDurationOption,
                            { 
                              backgroundColor: pollDuration === hours ? 
                                '#3B82F6' : 
                                (isDark ? '#0F172A' : '#F3F4F6')
                            }
                          ]}
                          onPress={() => setPollDuration(hours)}
                        >
                          <Text
                            style={[
                              styles.pollDurationText,
                              { 
                                color: pollDuration === hours ? 
                                  '#FFFFFF' : 
                                  (isDark ? '#E5E7EB' : '#4B5563')
                              }
                            ]}
                          >
                            {hours}h
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              )}
              
              <View style={styles.actionsContainer}>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}
                  onPress={handleAddPhoto}
                >
                  <Camera size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}
                  onPress={() => {
                    // Handle attachment
                    Alert.alert('Attachment', 'File attachment feature coming soon!');
                  }}
                >
                  <Paperclip size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.actionButton, 
                    { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' },
                    showPollCreator && { backgroundColor: '#3B82F6' }
                  ]}
                  onPress={() => setShowPollCreator(!showPollCreator)}
                >
                  <BarChart3 size={20} color={showPollCreator ? '#FFFFFF' : (isDark ? '#60A5FA' : '#3B82F6')} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}
                  onPress={() => {
                    const currentText = postText;
                    const newText = currentText + (currentText.endsWith(' ') || currentText === '' ? '@' : ' @');
                    setPostText(newText);
                    setCursorPosition(newText.length);
                    setShowMentions(true);
                    textInputRef.current?.focus();
                  }}
                >
                  <AtSign size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}
                  onPress={() => {
                    const currentText = postText;
                    const newText = currentText + (currentText.endsWith(' ') || currentText === '' ? '#' : ' #');
                    setPostText(newText);
                    setCursorPosition(newText.length);
                    setShowHashtags(true);
                    textInputRef.current?.focus();
                  }}
                >
                  <Hash size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={[
                  styles.postButton, 
                  { 
                    backgroundColor: (
                      (!showPollCreator && postText.trim() === '' && !selectedImage) ||
                      (showPollCreator && (pollQuestion.trim() === '' || pollOptions.some(opt => opt.trim() === '')))
                    ) ? 
                      (isDark ? '#1F2937' : '#E5E7EB') : 
                      '#3B82F6',
                    opacity: (
                      (!showPollCreator && postText.trim() === '' && !selectedImage) ||
                      (showPollCreator && (pollQuestion.trim() === '' || pollOptions.some(opt => opt.trim() === '')))
                    ) ? 0.5 : 1
                  }
                ]}
                onPress={handlePost}
                disabled={
                  (!showPollCreator && postText.trim() === '' && !selectedImage) ||
                  (showPollCreator && (pollQuestion.trim() === '' || pollOptions.some(opt => opt.trim() === '')))
                }
              >
                <Text style={[
                  styles.postButtonText, 
                  { 
                    color: (
                      (!showPollCreator && postText.trim() === '' && !selectedImage) ||
                      (showPollCreator && (pollQuestion.trim() === '' || pollOptions.some(opt => opt.trim() === '')))
                    ) ? 
                      (isDark ? '#9CA3AF' : '#6B7280') : 
                      '#FFFFFF' 
                  }
                ]}>
                  Post
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Mentions Suggestions */}
        {showMentions && (
          <Animated.View 
            entering={FadeIn}
            style={[
              styles.suggestionsContainer,
              { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }
            ]}
          >
            <View style={styles.suggestionsHeader}>
              <AtSign size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
              <Text style={[styles.suggestionsTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Mention People
              </Text>
            </View>
            <ScrollView style={styles.suggestionsList} showsVerticalScrollIndicator={false}>
              {filteredMentions.map((mention) => (
                <TouchableOpacity
                  key={mention.id}
                  style={styles.suggestionItem}
                  onPress={() => insertMention(mention)}
                >
                  <Image source={{ uri: mention.avatar }} style={styles.suggestionAvatar} />
                  <View style={styles.suggestionInfo}>
                    <Text style={[styles.suggestionName, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                      {mention.name}
                    </Text>
                    <Text style={[styles.suggestionUsername, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                      @{mention.username}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Hashtags Suggestions */}
        {showHashtags && (
          <Animated.View 
            entering={FadeIn}
            style={[
              styles.suggestionsContainer,
              { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }
            ]}
          >
            <View style={styles.suggestionsHeader}>
              <Hash size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
              <Text style={[styles.suggestionsTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Add Hashtags
              </Text>
            </View>
            <ScrollView style={styles.suggestionsList} showsVerticalScrollIndicator={false}>
              {filteredHashtags.map((hashtag) => (
                <TouchableOpacity
                  key={hashtag.id}
                  style={styles.suggestionItem}
                  onPress={() => insertHashtag(hashtag)}
                >
                  <View style={[styles.hashtagIcon, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                    <Hash size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                  </View>
                  <View style={styles.suggestionInfo}>
                    <Text style={[styles.suggestionName, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                      #{hashtag.name}
                    </Text>
                    <Text style={[styles.suggestionUsername, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                      {hashtag.count.toLocaleString()} posts
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Audience Modal */}
        {showAudienceModal && (
          <Animated.View 
            entering={FadeIn}
            style={[
              StyleSheet.absoluteFill,
              styles.modalOverlay,
              { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
            ]}
          >
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              onPress={() => setShowAudienceModal(false)}
            />
            <Animated.View
              entering={FadeInDown}
              style={[
                styles.modalContent,
                { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }
              ]}
            >
              <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Choose Audience
              </Text>
              {audienceOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.audienceOption,
                    selectedAudience === option.id && styles.selectedAudienceOption,
                    { backgroundColor: isDark ? '#0F172A' : '#F3F4F6' }
                  ]}
                  onPress={() => {
                    setSelectedAudience(option.id as typeof selectedAudience);
                    setShowAudienceModal(false);
                  }}
                >
                  <View style={styles.audienceOptionIcon}>
                    {option.icon}
                  </View>
                  <View style={styles.audienceOptionText}>
                    <Text style={[styles.audienceOptionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                      {option.title}
                    </Text>
                    <Text style={[styles.audienceOptionDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                      {option.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </Animated.View>
          </Animated.View>
        )}
      </SafeAreaView>
    </SwipeGestureWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
  audienceSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  audienceText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 8,
  },
  textInputContainer: {
    marginBottom: 16,
  },
  textInput: {
    height: 150,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlignVertical: 'top',
  },
  selectedTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  selectedTagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  imageContainer: {
    marginTop: 16,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 4,
  },
  pollContainer: {
    gap: 16,
  },
  pollQuestionInput: {
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  pollOptionsContainer: {
    gap: 12,
  },
  pollOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pollOptionInput: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  removeOptionButton: {
    padding: 8,
    borderRadius: 8,
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  addOptionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  pollDurationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pollDurationLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  pollDurationOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  pollDurationOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pollDurationText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  suggestionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: 300,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  suggestionsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginLeft: 8,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  suggestionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  hashtagIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionInfo: {
    marginLeft: 12,
    flex: 1,
  },
  suggestionName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  suggestionUsername: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: 2,
  },
  modalOverlay: {
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    marginBottom: 16,
  },
  audienceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  selectedAudienceOption: {
    backgroundColor: '#3B82F6',
  },
  audienceOptionIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audienceOptionText: {
    flex: 1,
    marginLeft: 12,
  },
  audienceOptionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 2,
  },
  audienceOptionDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
});
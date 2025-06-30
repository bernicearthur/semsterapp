import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Camera, Tag, FileText, Paperclip, Bookmark, Share2, Palette, Bold, Italic, List, ListOrdered, Link, Image as ImageIcon } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  runOnJS
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface CreateNoteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNote: (note: {
    title: string;
    content: string;
    subject: string;
    tags: string[];
    image?: string;
  }) => void;
}

const subjects = [
  'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 
  'History', 'Literature', 'Economics', 'Psychology', 'Business', 'Other'
];

const backgroundColors = [
  '#FFFFFF', '#F3F4F6', '#FEF3C7', '#DCFCE7', '#DBEAFE', 
  '#F3E8FF', '#FCE7F3', '#FEF2F2', '#ECFDF5', '#EFF6FF'
];

export function CreateNoteDrawer({ isOpen, onClose, onCreateNote }: CreateNoteDrawerProps) {
  const { isDark } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [selectedColor, setSelectedColor] = useState(backgroundColors[0]);
  const [showFormatting, setShowFormatting] = useState(false);
  
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
  }, [isOpen]);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setSelectedSubject('');
    setTags([]);
    setTagInput('');
    setSelectedColor(backgroundColors[0]);
    setShowFormatting(false);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleCreateNote = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your note');
      return;
    }
    
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content for your note');
      return;
    }
    
    if (!selectedSubject) {
      Alert.alert('Error', 'Please select a subject for your note');
      return;
    }

    const noteData = {
      title: title.trim(),
      content: content.trim(),
      subject: selectedSubject,
      tags: [...tags],
      image: 'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=800',
    };

    onCreateNote(noteData);
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFormatting = (type: string) => {
    // In a real app, this would apply formatting to the selected text
    // For this demo, we'll just show an alert
    Alert.alert('Formatting', `Applied ${type} formatting`);
  };

  const handleAddImage = () => {
    // Simulate adding an image
    Alert.alert('Add Image', 'Image picker would open here');
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
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: isDark ? '#334155' : '#E5E7EB' }]}>
              <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
                <X size={24} color={isDark ? '#E5E7EB' : '#4B5563'} />
              </TouchableOpacity>
              
              <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Create Note
              </Text>
              
              <TouchableOpacity 
                style={[
                  styles.saveButton,
                  { 
                    backgroundColor: title && content && selectedSubject ? '#3B82F6' : (isDark ? '#374151' : '#E5E7EB'),
                    opacity: title && content && selectedSubject ? 1 : 0.5
                  }
                ]}
                onPress={handleCreateNote}
                disabled={!title || !content || !selectedSubject}
              >
                <Text style={[
                  styles.saveButtonText,
                  { color: title && content && selectedSubject ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#6B7280') }
                ]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Note Image */}
              <TouchableOpacity 
                style={[
                  styles.imageUpload, 
                  { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }
                ]}
                onPress={handleAddImage}
              >
                <Camera size={32} color={isDark ? '#60A5FA' : '#3B82F6'} />
                <Text style={[styles.imageUploadText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                  Add Cover Image
                </Text>
              </TouchableOpacity>

              {/* Note Title */}
              <View style={styles.inputGroup}>
                <TextInput
                  style={[
                    styles.titleInput,
                    { 
                      backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                      color: isDark ? '#FFFFFF' : '#111827',
                      borderColor: isDark ? '#374151' : '#E5E7EB'
                    }
                  ]}
                  placeholder="Note Title"
                  placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              {/* Subject Selection */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                  Subject
                </Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.subjectsContainer}
                >
                  {subjects.map((subject) => (
                    <TouchableOpacity
                      key={subject}
                      style={[
                        styles.subjectChip,
                        { 
                          backgroundColor: selectedSubject === subject ? '#3B82F6' : (isDark ? '#374151' : '#F3F4F6'),
                          borderColor: selectedSubject === subject ? '#3B82F6' : 'transparent'
                        }
                      ]}
                      onPress={() => setSelectedSubject(subject)}
                    >
                      <Text style={[
                        styles.subjectChipText,
                        { color: selectedSubject === subject ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#4B5563') }
                      ]}>
                        {subject}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Formatting Tools */}
              <View style={styles.formattingContainer}>
                <TouchableOpacity 
                  style={[
                    styles.formattingToggle,
                    { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }
                  ]}
                  onPress={() => setShowFormatting(!showFormatting)}
                >
                  <Text style={[styles.formattingToggleText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    {showFormatting ? 'Hide Formatting' : 'Show Formatting'}
                  </Text>
                </TouchableOpacity>
                
                {showFormatting && (
                  <View style={[
                    styles.formattingToolbar,
                    { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }
                  ]}>
                    <TouchableOpacity 
                      style={styles.formattingButton}
                      onPress={() => handleFormatting('bold')}
                    >
                      <Bold size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.formattingButton}
                      onPress={() => handleFormatting('italic')}
                    >
                      <Italic size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.formattingButton}
                      onPress={() => handleFormatting('bullet list')}
                    >
                      <List size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.formattingButton}
                      onPress={() => handleFormatting('numbered list')}
                    >
                      <ListOrdered size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.formattingButton}
                      onPress={() => handleFormatting('link')}
                    >
                      <Link size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.formattingButton}
                      onPress={handleAddImage}
                    >
                      <ImageIcon size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.formattingButton}
                      onPress={() => handleFormatting('attachment')}
                    >
                      <Paperclip size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Note Content */}
              <View style={styles.inputGroup}>
                <TextInput
                  style={[
                    styles.contentInput,
                    { 
                      backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                      color: isDark ? '#E5E7EB' : '#1F2937',
                      borderColor: isDark ? '#374151' : '#E5E7EB'
                    }
                  ]}
                  placeholder="Start writing your note here..."
                  placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                  value={content}
                  onChangeText={setContent}
                  multiline
                  textAlignVertical="top"
                />
              </View>

              {/* Tags */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                  Tags
                </Text>
                
                <View style={styles.tagsContainer}>
                  {tags.map((tag) => (
                    <View 
                      key={tag} 
                      style={[
                        styles.tagChip,
                        { backgroundColor: isDark ? '#374151' : '#F3F4F6' }
                      ]}
                    >
                      <Text style={[styles.tagChipText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                        {tag}
                      </Text>
                      <TouchableOpacity
                        style={styles.removeTagButton}
                        onPress={() => handleRemoveTag(tag)}
                      >
                        <X size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
                
                <View style={styles.tagInputContainer}>
                  <TextInput
                    style={[
                      styles.tagInput,
                      { 
                        backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                        color: isDark ? '#E5E7EB' : '#1F2937',
                        borderColor: isDark ? '#374151' : '#E5E7EB'
                      }
                    ]}
                    placeholder="Add a tag..."
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={tagInput}
                    onChangeText={setTagInput}
                    onSubmitEditing={handleAddTag}
                    returnKeyType="done"
                  />
                  <TouchableOpacity 
                    style={[
                      styles.addTagButton,
                      { backgroundColor: '#3B82F6' }
                    ]}
                    onPress={handleAddTag}
                  >
                    <Text style={styles.addTagButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Background Color */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                  Background Color
                </Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.colorsContainer}
                >
                  {backgroundColors.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        selectedColor === color && styles.selectedColorOption
                      ]}
                      onPress={() => setSelectedColor(color)}
                    />
                  ))}
                </ScrollView>
              </View>

              {/* Additional Actions */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity 
                  style={[
                    styles.actionButton,
                    { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }
                  ]}
                >
                  <Bookmark size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                  <Text style={[styles.actionButtonText, { color: isDark ? '#60A5FA' : '#3B82F6' }]}>
                    Save to Favorites
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.actionButton,
                    { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }
                  ]}
                >
                  <Share2 size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                  <Text style={[styles.actionButtonText, { color: isDark ? '#60A5FA' : '#3B82F6' }]}>
                    Share Note
                  </Text>
                </TouchableOpacity>
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
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  imageUpload: {
    height: 120,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
  },
  imageUploadText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  titleInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  subjectsContainer: {
    gap: 8,
  },
  subjectChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  subjectChipText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  formattingContainer: {
    marginBottom: 20,
  },
  formattingToggle: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  formattingToggleText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  formattingToolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 12,
    padding: 8,
    marginTop: 8,
  },
  formattingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    minHeight: 200,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  tagChipText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  removeTagButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  addTagButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTagButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  colorsContainer: {
    gap: 12,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
});
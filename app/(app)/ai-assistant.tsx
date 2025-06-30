import { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SwipeGestureWrapper } from '@/components/SwipeGestureWrapper';
import { useTheme } from '@/context/ThemeContext';
import { Send, Mic, Camera, Paperclip, Bot, Lightbulb, BookOpen, FileText, Sparkles, X, ChevronDown, ChevronUp, Clock, Bookmark, Share2, ThumbsUp, ThumbsDown, Copy, MoreVertical } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, SlideInRight } from 'react-native-reanimated';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  attachments?: {
    type: 'image' | 'document';
    url: string;
    name?: string;
  }[];
  isLoading?: boolean;
  isSaved?: boolean;
}

interface Suggestion {
  id: string;
  text: string;
  icon: React.ReactNode;
}

export default function AIAssistantScreen() {
  const { isDark } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI study assistant. How can I help you today?",
      sender: 'assistant',
      timestamp: '9:30 AM',
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const screenWidth = Dimensions.get('window').width;

  const suggestions: Suggestion[] = [
    {
      id: '1',
      text: 'Explain quantum computing',
      icon: <Lightbulb size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
    },
    {
      id: '2',
      text: 'Summarize this chapter',
      icon: <BookOpen size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
    },
    {
      id: '3',
      text: 'Help me prepare for exams',
      icon: <FileText size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
    },
    {
      id: '4',
      text: 'Create a study plan',
      icon: <Clock size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
    }
  ];

  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      setRecordingTime(0);
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecording]);

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: inputText.trim(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');
    setShowSuggestions(false);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Simulate assistant typing
    const loadingMessage: Message = {
      id: `loading-${Date.now()}`,
      content: '',
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isLoading: true,
    };

    setMessages(prev => [...prev, loadingMessage]);

    // Simulate response after delay
    setTimeout(() => {
      const responses = [
        "I'd be happy to help with that! Let me provide some detailed information on this topic.",
        "Great question! Here's what you need to know about this subject.",
        "I've analyzed your question and here's a comprehensive explanation.",
        "Let me break this down for you in a way that's easy to understand.",
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setMessages(prev => 
        prev.filter(msg => !msg.isLoading).concat({
          id: Date.now().toString(),
          content: randomResponse + " " + generateLoremIpsum(),
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })
      );

      // Scroll to bottom again after response
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1500);
  };

  const handleSuggestionPress = (suggestion: Suggestion) => {
    setInputText(suggestion.text);
    
    // Focus the input
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    
    if (isRecording) {
      // Simulate voice transcription
      setInputText("This is a transcribed voice message");
      
      setTimeout(() => {
        handleSendMessage();
      }, 500);
    }
  };

  const handleAttachment = (type: 'image' | 'document') => {
    setShowAttachmentOptions(false);
    
    // Simulate attachment
    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: type === 'image' ? "I've attached an image for reference." : "I've attached a document for reference.",
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: [{
        type,
        url: type === 'image' 
          ? 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=800'
          : 'https://example.com/document.pdf',
        name: type === 'document' ? 'study_notes.pdf' : undefined
      }]
    };

    setMessages(prev => [...prev, newUserMessage]);
    
    // Simulate assistant response
    setTimeout(() => {
      const loadingMessage: Message = {
        id: `loading-${Date.now()}`,
        content: '',
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isLoading: true,
      };
  
      setMessages(prev => [...prev, loadingMessage]);
    }, 500);

    setTimeout(() => {
      const response = type === 'image' 
        ? "I've analyzed the image you sent. This appears to be a study group session. Would you like me to help you prepare similar study materials?"
        : "I've reviewed the document you shared. These study notes cover important concepts. Would you like me to explain any specific part in more detail?";
      
      setMessages(prev => 
        prev.filter(msg => !msg.isLoading).concat({
          id: Date.now().toString(),
          content: response,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })
      );
    }, 2000);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleMessageAction = (messageId: string, action: 'save' | 'copy' | 'share' | 'thumbsUp' | 'thumbsDown') => {
    switch (action) {
      case 'save':
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId ? { ...msg, isSaved: !msg.isSaved } : msg
          )
        );
        break;
      case 'copy':
        const message = messages.find(msg => msg.id === messageId);
        if (message) {
          // In a real app, use Clipboard.setString(message.content)
          alert('Message copied to clipboard');
        }
        break;
      case 'share':
        alert('Share functionality would be implemented here');
        break;
      case 'thumbsUp':
        alert('Feedback recorded: Helpful');
        break;
      case 'thumbsDown':
        alert('Feedback recorded: Not helpful');
        break;
    }
    setSelectedMessage(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Helper function to generate lorem ipsum text
  const generateLoremIpsum = () => {
    return "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
  };

  return (
    <SwipeGestureWrapper>
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {/* Header */}
          <View style={[styles.header, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
            <View style={styles.headerContent}>
              <View style={[styles.aiAvatar, { backgroundColor: '#3B82F6' }]}>
                <Bot size={24} color="#FFFFFF" />
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  AI Study Assistant
                </Text>
                <Text style={[styles.headerSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  Powered by Claude 4 Sonnet
                </Text>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.headerButton}>
                  <Bookmark size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerButton}>
                  <MoreVertical size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Chat Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((message) => (
              <Animated.View
                key={message.id}
                entering={FadeInDown.duration(300)}
                style={[
                  styles.messageWrapper,
                  message.sender === 'user' ? styles.userMessageWrapper : styles.assistantMessageWrapper
                ]}
              >
                {message.sender === 'assistant' && (
                  <View style={[styles.assistantAvatar, { backgroundColor: '#3B82F6' }]}>
                    <Bot size={20} color="#FFFFFF" />
                  </View>
                )}
                
                <View style={[
                  styles.messageBubble,
                  message.sender === 'user' 
                    ? [styles.userBubble, { backgroundColor: '#3B82F6' }] 
                    : [styles.assistantBubble, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]
                ]}>
                  {message.isLoading ? (
                    <View style={styles.loadingContainer}>
                      <View style={styles.loadingDots}>
                        <Animated.View 
                          style={[
                            styles.loadingDot, 
                            { backgroundColor: isDark ? '#60A5FA' : '#3B82F6' }
                          ]} 
                        />
                        <Animated.View 
                          style={[
                            styles.loadingDot, 
                            { backgroundColor: isDark ? '#60A5FA' : '#3B82F6' },
                            { animationDelay: '0.2s' }
                          ]} 
                        />
                        <Animated.View 
                          style={[
                            styles.loadingDot, 
                            { backgroundColor: isDark ? '#60A5FA' : '#3B82F6' },
                            { animationDelay: '0.4s' }
                          ]} 
                        />
                      </View>
                      <Text style={[styles.loadingText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                        Thinking...
                      </Text>
                    </View>
                  ) : (
                    <>
                      <Text style={[
                        styles.messageText,
                        { color: message.sender === 'user' ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#1F2937') }
                      ]}>
                        {message.content}
                      </Text>
                      
                      {message.attachments && message.attachments.length > 0 && (
                        <View style={styles.attachmentsContainer}>
                          {message.attachments.map((attachment, index) => (
                            <View key={index} style={styles.attachment}>
                              {attachment.type === 'image' ? (
                                <Image 
                                  source={{ uri: attachment.url }} 
                                  style={styles.attachmentImage} 
                                  resizeMode="cover"
                                />
                              ) : (
                                <View style={[
                                  styles.documentAttachment,
                                  { backgroundColor: isDark ? '#374151' : '#F3F4F6' }
                                ]}>
                                  <FileText size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />
                                  <Text style={[
                                    styles.documentName,
                                    { color: isDark ? '#E5E7EB' : '#1F2937' }
                                  ]}>
                                    {attachment.name}
                                  </Text>
                                </View>
                              )}
                            </View>
                          ))}
                        </View>
                      )}
                      
                      <View style={styles.messageFooter}>
                        <Text style={[
                          styles.timestamp,
                          { color: message.sender === 'user' ? 'rgba(255, 255, 255, 0.7)' : (isDark ? '#9CA3AF' : '#6B7280') }
                        ]}>
                          {message.timestamp}
                        </Text>
                        
                        {message.sender === 'assistant' && (
                          <TouchableOpacity 
                            style={styles.messageActions}
                            onPress={() => setSelectedMessage(selectedMessage === message.id ? null : message.id)}
                          >
                            <MoreVertical 
                              size={16} 
                              color={message.sender === 'user' ? 'rgba(255, 255, 255, 0.7)' : (isDark ? '#9CA3AF' : '#6B7280')} 
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                      
                      {selectedMessage === message.id && message.sender === 'assistant' && (
                        <Animated.View 
                          entering={FadeIn.duration(200)}
                          style={[
                            styles.messageActionsMenu,
                            { backgroundColor: isDark ? '#374151' : '#F3F4F6' }
                          ]}
                        >
                          <TouchableOpacity 
                            style={styles.messageActionItem}
                            onPress={() => handleMessageAction(message.id, 'save')}
                          >
                            <Bookmark 
                              size={18} 
                              color={message.isSaved ? '#F59E0B' : (isDark ? '#E5E7EB' : '#4B5563')}
                              fill={message.isSaved ? '#F59E0B' : 'none'}
                            />
                            <Text style={[
                              styles.messageActionText,
                              { color: message.isSaved ? '#F59E0B' : (isDark ? '#E5E7EB' : '#4B5563') }
                            ]}>
                              {message.isSaved ? 'Saved' : 'Save'}
                            </Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                            style={styles.messageActionItem}
                            onPress={() => handleMessageAction(message.id, 'copy')}
                          >
                            <Copy size={18} color={isDark ? '#E5E7EB' : '#4B5563'} />
                            <Text style={[styles.messageActionText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                              Copy
                            </Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                            style={styles.messageActionItem}
                            onPress={() => handleMessageAction(message.id, 'share')}
                          >
                            <Share2 size={18} color={isDark ? '#E5E7EB' : '#4B5563'} />
                            <Text style={[styles.messageActionText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                              Share
                            </Text>
                          </TouchableOpacity>
                          
                          <View style={styles.feedbackContainer}>
                            <TouchableOpacity 
                              style={styles.feedbackButton}
                              onPress={() => handleMessageAction(message.id, 'thumbsUp')}
                            >
                              <ThumbsUp size={18} color={isDark ? '#E5E7EB' : '#4B5563'} />
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                              style={styles.feedbackButton}
                              onPress={() => handleMessageAction(message.id, 'thumbsDown')}
                            >
                              <ThumbsDown size={18} color={isDark ? '#E5E7EB' : '#4B5563'} />
                            </TouchableOpacity>
                          </View>
                        </Animated.View>
                      )}
                    </>
                  )}
                </View>
              </Animated.View>
            ))}
          </ScrollView>

          {/* Suggestions */}
          {showSuggestions && messages.length < 3 && (
            <Animated.View 
              entering={FadeInDown.duration(300)}
              exiting={FadeOut.duration(200)}
              style={[
                styles.suggestionsContainer,
                { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }
              ]}
            >
              <View style={styles.suggestionsHeader}>
                <Sparkles size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
                <Text style={[styles.suggestionsTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Suggested Prompts
                </Text>
              </View>
              
              <View style={styles.suggestionsList}>
                {suggestions.map((suggestion) => (
                  <TouchableOpacity
                    key={suggestion.id}
                    style={[
                      styles.suggestionItem,
                      { backgroundColor: isDark ? '#0F172A' : '#F3F4F6' }
                    ]}
                    onPress={() => handleSuggestionPress(suggestion)}
                  >
                    {suggestion.icon}
                    <Text style={[styles.suggestionText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                      {suggestion.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Input Area */}
          <View style={[
            styles.inputContainer,
            { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }
          ]}>
            {isRecording ? (
              <View style={styles.recordingContainer}>
                <View style={styles.recordingIndicator}>
                  <View style={styles.recordingDot} />
                  <Text style={[styles.recordingText, { color: isDark ? '#E5E7EB' : '#1F2937' }]}>
                    Recording... {formatTime(recordingTime)}
                  </Text>
                </View>
                
                <TouchableOpacity 
                  style={[styles.cancelRecordingButton, { backgroundColor: '#EF4444' }]}
                  onPress={() => setIsRecording(false)}
                >
                  <X size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={[
                  styles.inputWrapper,
                  { backgroundColor: isDark ? '#0F172A' : '#F3F4F6' }
                ]}>
                  <TextInput
                    style={[styles.textInput, { color: isDark ? '#E5E7EB' : '#1F2937' }]}
                    placeholder="Ask me anything..."
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                  />
                  
                  <View style={styles.inputActions}>
                    <TouchableOpacity 
                      style={styles.attachButton}
                      onPress={() => setShowAttachmentOptions(!showAttachmentOptions)}
                    >
                      <Paperclip size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    </TouchableOpacity>
                  </View>
                </View>
                
                {inputText.trim() ? (
                  <TouchableOpacity 
                    style={[styles.sendButton, { backgroundColor: '#3B82F6' }]}
                    onPress={handleSendMessage}
                  >
                    <Send size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={[styles.micButton, { backgroundColor: '#3B82F6' }]}
                    onPress={handleVoiceRecord}
                  >
                    <Mic size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

          {/* Attachment Options */}
          {showAttachmentOptions && (
            <Animated.View 
              entering={SlideInRight.duration(300)}
              style={[
                styles.attachmentOptions,
                { 
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  width: screenWidth
                }
              ]}
            >
              <TouchableOpacity 
                style={styles.attachmentOption}
                onPress={() => handleAttachment('image')}
              >
                <View style={[styles.attachmentIconContainer, { backgroundColor: '#10B981' }]}>
                  <Camera size={24} color="#FFFFFF" />
                </View>
                <Text style={[styles.attachmentText, { color: isDark ? '#E5E7EB' : '#1F2937' }]}>
                  Image
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.attachmentOption}
                onPress={() => handleAttachment('document')}
              >
                <View style={[styles.attachmentIconContainer, { backgroundColor: '#F59E0B' }]}>
                  <FileText size={24} color="#FFFFFF" />
                </View>
                <Text style={[styles.attachmentText, { color: isDark ? '#E5E7EB' : '#1F2937' }]}>
                  Document
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.closeAttachmentsButton, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}
                onPress={() => setShowAttachmentOptions(false)}
              >
                <X size={20} color={isDark ? '#E5E7EB' : '#4B5563'} />
              </TouchableOpacity>
            </Animated.View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SwipeGestureWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    padding: 4,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageWrapper: {
    marginBottom: 16,
    flexDirection: 'row',
    maxWidth: '85%',
  },
  userMessageWrapper: {
    alignSelf: 'flex-end',
  },
  assistantMessageWrapper: {
    alignSelf: 'flex-start',
  },
  assistantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 20,
    padding: 12,
    maxWidth: '100%',
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  messageActions: {
    padding: 4,
  },
  messageActionsMenu: {
    position: 'absolute',
    right: 0,
    bottom: 30,
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    minWidth: 120,
  },
  messageActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  messageActionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  feedbackContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  feedbackButton: {
    padding: 8,
  },
  attachmentsContainer: {
    marginTop: 12,
    gap: 8,
  },
  attachment: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  attachmentImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
  },
  documentAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  documentName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.6,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  suggestionsContainer: {
    padding: 16,
    borderRadius: 16,
    margin: 16,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  suggestionsList: {
    gap: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    maxHeight: 100,
    paddingTop: 8,
    paddingBottom: 8,
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachButton: {
    padding: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
    opacity: 0.8,
  },
  recordingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  cancelRecordingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentOptions: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    flexDirection: 'row',
    padding: 16,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  attachmentOption: {
    alignItems: 'center',
    gap: 8,
  },
  attachmentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  closeAttachmentsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 16,
    top: 16,
  },
});
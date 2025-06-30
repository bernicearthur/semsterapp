import { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SwipeGestureWrapper } from '@/components/SwipeGestureWrapper';
import { useTheme } from '@/context/ThemeContext';
import { Search, Filter, Clock, MapPin, Plus, Tag, Calendar, User, Phone, Mail } from 'lucide-react-native';
import { ReportItemDrawer } from '@/components/drawers/ReportItemDrawer';

interface LostItem {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  reward?: string;
  image: string;
  type: 'lost' | 'found';
  contact?: {
    name: string;
    email: string;
    phone?: string;
  };
  timestamp: string;
}

const initialItems: LostItem[] = [
  {
    id: '1',
    title: 'MacBook Pro Laptop',
    description: 'Space Gray MacBook Pro 13", last seen in the library study room',
    category: 'Electronics',
    location: 'Main Library',
    date: 'Lost today',
    reward: '$100',
    image: 'https://images.pexels.com/photos/812264/pexels-photo-812264.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'lost',
    contact: {
      name: 'Alex Johnson',
      email: 'alex@example.com',
      phone: '555-123-4567'
    },
    timestamp: '2023-12-01T12:00:00Z'
  },
  {
    id: '2',
    title: 'Student ID Card',
    description: 'Found near the cafeteria entrance',
    category: 'Documents',
    location: 'Student Center',
    date: 'Found yesterday',
    image: 'https://images.pexels.com/photos/6457579/pexels-photo-6457579.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'found',
    contact: {
      name: 'Emma Wilson',
      email: 'emma@example.com'
    },
    timestamp: '2023-11-30T15:30:00Z'
  },
  {
    id: '3',
    title: 'Blue Hydroflask',
    description: '32oz Blue Hydroflask water bottle with stickers',
    category: 'Personal Items',
    location: 'Gym',
    date: 'Lost 2 days ago',
    image: 'https://images.pexels.com/photos/4495798/pexels-photo-4495798.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'lost',
    contact: {
      name: 'Michael Brown',
      email: 'michael@example.com',
      phone: '555-987-6543'
    },
    timestamp: '2023-11-29T09:15:00Z'
  },
];

const categories = [
  'All', 'Electronics', 'Documents', 'Personal Items', 'Clothing', 'Accessories', 'Books', 'Other'
];

export default function LostFoundScreen() {
  const { isDark } = useTheme();
  const [items, setItems] = useState<LostItem[]>(initialItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [isReportDrawerOpen, setIsReportDrawerOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const handleReportItem = (itemData: LostItem) => {
    setItems(prevItems => [itemData, ...prevItems]);
    setIsReportDrawerOpen(false);
    Alert.alert('Success', `Your ${itemData.type} item report has been submitted.`);
  };

  const handleContactOwner = (item: LostItem) => {
    Alert.alert(
      `Contact ${item.type === 'lost' ? 'Owner' : 'Finder'}`,
      `Would you like to contact ${item.contact?.name} about this ${item.type} item?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Email', 
          onPress: () => Alert.alert('Email Sent', `An email has been sent to ${item.contact?.email}`) 
        },
        item.contact?.phone ? { 
          text: 'Call', 
          onPress: () => Alert.alert('Calling', `Calling ${item.contact?.phone}`) 
        } : undefined,
      ].filter(Boolean) as any
    );
  };

  const filteredItems = items.filter(item => {
    // Category filter
    if (selectedCategory !== 'All' && item.category !== selectedCategory) {
      return false;
    }

    // Type filter
    if (selectedFilter !== 'all' && item.type !== selectedFilter) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query)
      );
    }

    return true;
  });

  return (
    <SwipeGestureWrapper>
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.searchContainer}>
            <View style={[styles.searchBar, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
              <Search size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
              <TextInput
                style={[styles.searchInput, { color: isDark ? '#E5E7EB' : '#1F2937' }]}
                placeholder="Search lost & found items"
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            
            <TouchableOpacity 
              style={[
                styles.filterButton, 
                { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' },
                showFilters && { backgroundColor: '#3B82F6' }
              ]}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Filter size={20} color={showFilters ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#6B7280')} />
            </TouchableOpacity>
          </View>

          {showFilters && (
            <View style={styles.filtersContainer}>
              <Text style={[styles.filterLabel, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Item Status:
              </Text>
              <View style={styles.filterOptions}>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    { backgroundColor: selectedFilter === 'all' ? '#3B82F6' : (isDark ? '#374151' : '#F3F4F6') }
                  ]}
                  onPress={() => setSelectedFilter('all')}
                >
                  <Text style={[
                    styles.filterOptionText,
                    { color: selectedFilter === 'all' ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#4B5563') }
                  ]}>
                    All Items
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    { backgroundColor: selectedFilter === 'lost' ? '#EF4444' : (isDark ? '#374151' : '#F3F4F6') }
                  ]}
                  onPress={() => setSelectedFilter('lost')}
                >
                  <Text style={[
                    styles.filterOptionText,
                    { color: selectedFilter === 'lost' ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#4B5563') }
                  ]}>
                    Lost Items
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    { backgroundColor: selectedFilter === 'found' ? '#10B981' : (isDark ? '#374151' : '#F3F4F6') }
                  ]}
                  onPress={() => setSelectedFilter('found')}
                >
                  <Text style={[
                    styles.filterOptionText,
                    { color: selectedFilter === 'found' ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#4B5563') }
                  ]}>
                    Found Items
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.categoryButton,
                  { 
                    backgroundColor: selectedCategory === category ? 
                      '#3B82F6' : 
                      (isDark ? '#1E293B' : '#FFFFFF') 
                  }
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryText, 
                  { 
                    color: selectedCategory === category ? 
                      '#FFFFFF' : 
                      (isDark ? '#E5E7EB' : '#4B5563') 
                  }
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.itemsContainer}>
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.itemCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}
                  onPress={() => handleContactOwner(item)}
                >
                  <Image source={{ uri: item.image }} style={styles.itemImage} />
                  <View style={styles.itemContent}>
                    <View style={styles.itemHeader}>
                      <Text style={[styles.itemTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                        {item.title}
                      </Text>
                      <View style={[
                        styles.itemType,
                        { backgroundColor: item.type === 'lost' ? '#EF4444' : '#10B981' }
                      ]}>
                        <Text style={styles.itemTypeText}>
                          {item.type === 'lost' ? 'Lost' : 'Found'}
                        </Text>
                      </View>
                    </View>

                    <Text style={[styles.itemDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                      {item.description}
                    </Text>
                    
                    <View style={styles.itemDetails}>
                      <View style={styles.detailItem}>
                        <Tag size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
                        <Text style={[styles.detailText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                          {item.category}
                        </Text>
                      </View>
                      
                      <View style={styles.detailItem}>
                        <MapPin size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
                        <Text style={[styles.detailText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                          {item.location}
                        </Text>
                      </View>
                      
                      <View style={styles.detailItem}>
                        <Calendar size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
                        <Text style={[styles.detailText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                          {item.date}
                        </Text>
                      </View>

                      {item.reward && (
                        <View style={styles.rewardTag}>
                          <Text style={styles.rewardText}>Reward: {item.reward}</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.contactInfo}>
                      <View style={styles.contactHeader}>
                        <Text style={[styles.contactTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                          Contact {item.type === 'lost' ? 'Owner' : 'Finder'}:
                        </Text>
                      </View>
                      <View style={styles.contactDetails}>
                        <View style={styles.contactItem}>
                          <User size={14} color={isDark ? '#60A5FA' : '#3B82F6'} />
                          <Text style={[styles.contactText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                            {item.contact?.name}
                          </Text>
                        </View>
                        <View style={styles.contactItem}>
                          <Mail size={14} color={isDark ? '#60A5FA' : '#3B82F6'} />
                          <Text style={[styles.contactText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                            {item.contact?.email}
                          </Text>
                        </View>
                        {item.contact?.phone && (
                          <View style={styles.contactItem}>
                            <Phone size={14} color={isDark ? '#60A5FA' : '#3B82F6'} />
                            <Text style={[styles.contactText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                              {item.contact.phone}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <TouchableOpacity 
                      style={[styles.contactButton, { backgroundColor: '#3B82F6' }]}
                      onPress={() => handleContactOwner(item)}
                    >
                      <Text style={styles.contactButtonText}>Contact</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Tag size={48} color={isDark ? '#9CA3AF' : '#6B7280'} />
                <Text style={[styles.emptyStateTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  No items found
                </Text>
                <Text style={[styles.emptyStateText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  Try adjusting your filters or search terms
                </Text>
                <TouchableOpacity 
                  style={[styles.reportEmptyButton, { backgroundColor: '#3B82F6' }]}
                  onPress={() => setIsReportDrawerOpen(true)}
                >
                  <Plus size={20} color="#FFFFFF" />
                  <Text style={styles.reportEmptyButtonText}>Report Item</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>

        <TouchableOpacity 
          style={[styles.fab, { backgroundColor: '#3B82F6' }]}
          onPress={() => setIsReportDrawerOpen(true)}
        >
          <Plus size={24} color="#FFFFFF" />
          <Text style={styles.fabText}>Report Item</Text>
        </TouchableOpacity>

        <ReportItemDrawer
          isOpen={isReportDrawerOpen}
          onClose={() => setIsReportDrawerOpen(false)}
          onReportItem={handleReportItem}
        />
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
    paddingBottom: 100,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  filterButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterOptionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  categoriesContainer: {
    paddingBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  categoryText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  itemsContainer: {
    gap: 16,
  },
  itemCard: {
    borderRadius: 16,
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
  itemImage: {
    width: '100%',
    height: 200,
  },
  itemContent: {
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  itemType: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  itemTypeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  itemDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
    lineHeight: 20,
  },
  itemDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  rewardTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  rewardText: {
    color: '#D97706',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  contactInfo: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  contactHeader: {
    marginBottom: 8,
  },
  contactTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  contactDetails: {
    gap: 6,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
  },
  contactButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 24,
  },
  reportEmptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    gap: 8,
  },
  reportEmptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
});
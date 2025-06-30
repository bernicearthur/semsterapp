import { useState, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SwipeGestureWrapper } from '@/components/SwipeGestureWrapper';
import { useTheme } from '@/context/ThemeContext';
import { Search, Filter, Tag, DollarSign, MapPin, Clock, Plus, Camera, MessageCircle, Heart, Share2, Bookmark, ChevronDown, ChevronUp, User, Star } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { CreateListingDrawer } from '@/components/drawers/CreateListingDrawer';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition?: string;
  location: string;
  postedDate: string;
  images: string[];
  seller: {
    name: string;
    avatar: string;
    rating: number;
    verified: boolean;
  };
  isSaved: boolean;
  isLiked: boolean;
}

const initialListings: Listing[] = [
  {
    id: '1',
    title: 'Textbooks Bundle - Computer Science',
    description: 'Set of 5 textbooks for CS courses including Data Structures, Algorithms, and Database Systems. All in excellent condition with minimal highlighting.',
    price: 120,
    category: 'Books',
    condition: 'Good',
    location: 'North Campus',
    postedDate: '2 days ago',
    images: [
      'https://images.pexels.com/photos/5834/nature-grass-leaf-green.jpg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/5834/nature-grass-leaf-green.jpg?auto=compress&cs=tinysrgb&w=800'
    ],
    seller: {
      name: 'Michael Brown',
      avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100',
      rating: 4.8,
      verified: true
    },
    isSaved: true,
    isLiked: false
  },
  {
    id: '2',
    title: 'Graphing Calculator - TI-84 Plus',
    description: 'TI-84 Plus graphing calculator in perfect working condition. Includes charging cable and case. Perfect for calculus and statistics courses.',
    price: 75,
    category: 'Electronics',
    condition: 'Like New',
    location: 'Engineering Building',
    postedDate: '1 week ago',
    images: [
      'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    seller: {
      name: 'Sarah Chen',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
      rating: 4.9,
      verified: true
    },
    isSaved: false,
    isLiked: true
  },
  {
    id: '3',
    title: 'Dorm Room Furniture Set',
    description: 'Moving out sale! Includes desk, chair, small bookshelf, and bedside lamp. All items in good condition. Must pick up from South Dorms.',
    price: 200,
    category: 'Furniture',
    condition: 'Used',
    location: 'South Dorms',
    postedDate: '3 days ago',
    images: [
      'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    seller: {
      name: 'Emma Wilson',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
      rating: 4.5,
      verified: false
    },
    isSaved: false,
    isLiked: false
  },
  {
    id: '4',
    title: 'Mountain Bike - Trek 3500',
    description: 'Trek 3500 mountain bike in great condition. 21-speed, recently tuned up with new brakes and tires. Perfect for getting around campus.',
    price: 350,
    category: 'Sports',
    condition: 'Good',
    location: 'Fitness Center',
    postedDate: '5 days ago',
    images: [
      'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    seller: {
      name: 'David Kim',
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100',
      rating: 4.7,
      verified: true
    },
    isSaved: true,
    isLiked: true
  },
  {
    id: '5',
    title: 'iPad Pro 11" (2021) with Apple Pencil',
    description: 'iPad Pro 11" (2021) with 256GB storage. Includes Apple Pencil 2nd gen and Smart Keyboard Folio. Perfect for note-taking and digital art.',
    price: 800,
    category: 'Electronics',
    condition: 'Like New',
    location: 'Library',
    postedDate: '1 day ago',
    images: [
      'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    seller: {
      name: 'Alex Johnson',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
      rating: 5.0,
      verified: true
    },
    isSaved: false,
    isLiked: false
  }
];

const categories = [
  'All', 'Books', 'Electronics', 'Furniture', 'Clothing', 'Sports', 'Other'
];

const conditions = [
  'All Conditions', 'New', 'Like New', 'Good', 'Used', 'For Parts'
];

const priceRanges = [
  'Any Price', 'Under $50', '$50-$100', '$100-$500', '$500+'
];

export default function MarketplaceScreen() {
  const { isDark } = useTheme();
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All Conditions');
  const [selectedPriceRange, setSelectedPriceRange] = useState('Any Price');
  const [showFilters, setShowFilters] = useState(false);
  const [isCreateListingOpen, setIsCreateListingOpen] = useState(false);
  const [expandedListing, setExpandedListing] = useState<string | null>(null);

  const toggleListingSaved = (listingId: string) => {
    setListings(prevListings =>
      prevListings.map(listing =>
        listing.id === listingId ? { ...listing, isSaved: !listing.isSaved } : listing
      )
    );
  };

  const toggleListingLiked = (listingId: string) => {
    setListings(prevListings =>
      prevListings.map(listing =>
        listing.id === listingId ? { ...listing, isLiked: !listing.isLiked } : listing
      )
    );
  };

  const handleCreateListing = (newListing: Omit<Listing, 'id' | 'postedDate' | 'seller' | 'isSaved' | 'isLiked'>) => {
    const listing: Listing = {
      ...newListing,
      id: Date.now().toString(),
      postedDate: 'Just now',
      seller: {
        name: 'You',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
        rating: 5.0,
        verified: true
      },
      isSaved: false,
      isLiked: false
    };
    
    setListings(prevListings => [listing, ...prevListings]);
    setIsCreateListingOpen(false);
    Alert.alert('Success', 'Your listing has been posted!');
  };

  const handleContactSeller = (listing: Listing) => {
    Alert.alert(
      'Contact Seller',
      `Would you like to message ${listing.seller.name} about "${listing.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Message', onPress: () => Alert.alert('Message Sent', 'Your message has been sent to the seller.') }
      ]
    );
  };

  const toggleExpandListing = (listingId: string) => {
    setExpandedListing(prev => prev === listingId ? null : listingId);
  };

  const filteredListings = listings.filter(listing => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!listing.title.toLowerCase().includes(query) &&
          !listing.description.toLowerCase().includes(query) &&
          !listing.category.toLowerCase().includes(query)) {
        return false;
      }
    }

    // Category filter
    if (selectedCategory !== 'All' && listing.category !== selectedCategory) {
      return false;
    }

    // Condition filter
    if (selectedCondition !== 'All Conditions' && listing.condition !== selectedCondition) {
      return false;
    }

    // Price filter
    if (selectedPriceRange !== 'Any Price') {
      if (selectedPriceRange === 'Under $50' && listing.price >= 50) return false;
      if (selectedPriceRange === '$50-$100' && (listing.price < 50 || listing.price > 100)) return false;
      if (selectedPriceRange === '$100-$500' && (listing.price < 100 || listing.price > 500)) return false;
      if (selectedPriceRange === '$500+' && listing.price < 500) return false;
    }

    return true;
  });

  const renderListing = (listing: Listing) => {
    const isExpanded = expandedListing === listing.id;
    
    return (
      <TouchableOpacity
        key={listing.id}
        style={[styles.listingCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}
        onPress={() => toggleExpandListing(listing.id)}
        activeOpacity={0.9}
      >
        <View style={styles.listingImageContainer}>
          <Image source={{ uri: listing.images[0] }} style={styles.listingImage} />
          
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => toggleListingSaved(listing.id)}
          >
            <Bookmark
              size={20}
              color={listing.isSaved ? '#F59E0B' : '#FFFFFF'}
              fill={listing.isSaved ? '#F59E0B' : 'none'}
            />
          </TouchableOpacity>
          
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>${listing.price}</Text>
          </View>
        </View>
        
        <View style={styles.listingContent}>
          <View style={styles.listingHeader}>
            <Text style={[styles.listingTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
              {listing.title}
            </Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{listing.category}</Text>
            </View>
          </View>
          
          <Text 
            style={[
              styles.listingDescription, 
              { color: isDark ? '#9CA3AF' : '#6B7280' },
              !isExpanded && { numberOfLines: 2 }
            ]}
            numberOfLines={isExpanded ? undefined : 2}
          >
            {listing.description}
          </Text>
          
          <View style={styles.listingDetails}>
            {listing.condition && (
              <View style={styles.detailItem}>
                <Tag size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
                <Text style={[styles.detailText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                  {listing.condition}
                </Text>
              </View>
            )}
            
            <View style={styles.detailItem}>
              <MapPin size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
              <Text style={[styles.detailText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                {listing.location}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Clock size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
              <Text style={[styles.detailText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                {listing.postedDate}
              </Text>
            </View>
          </View>
          
          <View style={styles.listingFooter}>
            <View style={styles.sellerInfo}>
              <Image source={{ uri: listing.seller.avatar }} style={styles.sellerAvatar} />
              <View style={styles.sellerDetails}>
                <View style={styles.sellerNameRow}>
                  <Text style={[styles.sellerName, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                    {listing.seller.name}
                  </Text>
                  {listing.seller.verified && (
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedText}>✓</Text>
                    </View>
                  )}
                </View>
                <View style={styles.ratingContainer}>
                  <Star size={14} color="#F59E0B" fill="#F59E0B" />
                  <Text style={[styles.ratingText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                    {listing.seller.rating.toFixed(1)}
                  </Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.contactButton, { backgroundColor: '#3B82F6' }]}
              onPress={() => handleContactSeller(listing)}
            >
              <Text style={styles.contactButtonText}>Contact</Text>
            </TouchableOpacity>
          </View>
          
          {isExpanded && (
            <Animated.View 
              entering={FadeInDown}
              style={styles.expandedContent}
            >
              {listing.images.length > 1 && (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.imageGallery}
                >
                  {listing.images.map((image, index) => (
                    <Image 
                      key={index}
                      source={{ uri: image }} 
                      style={styles.galleryImage}
                    />
                  ))}
                </ScrollView>
              )}
              
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => toggleListingLiked(listing.id)}
                >
                  <Heart 
                    size={20} 
                    color={listing.isLiked ? '#EF4444' : (isDark ? '#9CA3AF' : '#6B7280')}
                    fill={listing.isLiked ? '#EF4444' : 'none'}
                  />
                  <Text style={[
                    styles.actionButtonText,
                    { color: listing.isLiked ? '#EF4444' : (isDark ? '#9CA3AF' : '#6B7280') }
                  ]}>
                    Like
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton}>
                  <MessageCircle size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  <Text style={[styles.actionButtonText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                    Message
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton}>
                  <Share2 size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  <Text style={[styles.actionButtonText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                    Share
                  </Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={[styles.collapseButton, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}
                onPress={() => toggleExpandListing(listing.id)}
              >
                <ChevronUp size={20} color={isDark ? '#E5E7EB' : '#4B5563'} />
                <Text style={[styles.collapseButtonText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                  Collapse
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
          
          {!isExpanded && (
            <TouchableOpacity 
              style={[styles.expandButton, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}
              onPress={() => toggleExpandListing(listing.id)}
            >
              <ChevronDown size={20} color={isDark ? '#E5E7EB' : '#4B5563'} />
              <Text style={[styles.expandButtonText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                View Details
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SwipeGestureWrapper>
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={[styles.header, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
            <View style={styles.headerTop}>
              <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Marketplace
              </Text>
              <Text style={[styles.headerSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                {filteredListings.length} items available
              </Text>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <View style={[styles.searchBar, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
                <Search size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                <TextInput
                  style={[styles.searchInput, { color: isDark ? '#E5E7EB' : '#1F2937' }]}
                  placeholder="Search items, categories, or keywords"
                  placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              
              <TouchableOpacity 
                style={[
                  styles.filterButton,
                  { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' },
                  showFilters && { backgroundColor: '#3B82F6' }
                ]}
                onPress={() => setShowFilters(!showFilters)}
              >
                <Filter size={20} color={showFilters ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#6B7280')} />
              </TouchableOpacity>
            </View>

            {/* Filters */}
            {showFilters && (
              <View style={styles.filtersContainer}>
                <View style={styles.filterSection}>
                  <Text style={[styles.filterLabel, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    Category
                  </Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterOptions}
                  >
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.filterOption,
                          { 
                            backgroundColor: selectedCategory === category ? 
                              '#3B82F6' : 
                              (isDark ? '#374151' : '#F3F4F6')
                          }
                        ]}
                        onPress={() => setSelectedCategory(category)}
                      >
                        <Text style={[
                          styles.filterOptionText,
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
                </View>

                <View style={styles.filterSection}>
                  <Text style={[styles.filterLabel, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    Condition
                  </Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterOptions}
                  >
                    {conditions.map((condition) => (
                      <TouchableOpacity
                        key={condition}
                        style={[
                          styles.filterOption,
                          { 
                            backgroundColor: selectedCondition === condition ? 
                              '#3B82F6' : 
                              (isDark ? '#374151' : '#F3F4F6')
                          }
                        ]}
                        onPress={() => setSelectedCondition(condition)}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          { 
                            color: selectedCondition === condition ? 
                              '#FFFFFF' : 
                              (isDark ? '#E5E7EB' : '#4B5563')
                          }
                        ]}>
                          {condition}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.filterSection}>
                  <Text style={[styles.filterLabel, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    Price Range
                  </Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterOptions}
                  >
                    {priceRanges.map((range) => (
                      <TouchableOpacity
                        key={range}
                        style={[
                          styles.filterOption,
                          { 
                            backgroundColor: selectedPriceRange === range ? 
                              '#3B82F6' : 
                              (isDark ? '#374151' : '#F3F4F6')
                          }
                        ]}
                        onPress={() => setSelectedPriceRange(range)}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          { 
                            color: selectedPriceRange === range ? 
                              '#FFFFFF' : 
                              (isDark ? '#E5E7EB' : '#4B5563')
                          }
                        ]}>
                          {range}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            )}
          </View>

          {/* Listings */}
          <View style={styles.listingsContainer}>
            {filteredListings.length > 0 ? (
              filteredListings.map(renderListing)
            ) : (
              <View style={styles.emptyState}>
                <Tag size={48} color={isDark ? '#9CA3AF' : '#6B7280'} />
                <Text style={[styles.emptyStateTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  No listings found
                </Text>
                <Text style={[styles.emptyStateText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  Try adjusting your filters or search terms
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Floating Action Button */}
        <TouchableOpacity 
          style={[styles.fab, { backgroundColor: '#3B82F6' }]}
          onPress={() => setIsCreateListingOpen(true)}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Create Listing Drawer */}
        <CreateListingDrawer
          isOpen={isCreateListingOpen}
          onClose={() => setIsCreateListingOpen(false)}
          onCreateListing={handleCreateListing}
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
    paddingBottom: 100,
  },
  header: {
    padding: 16,
    borderRadius: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTop: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
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
  },
  filtersContainer: {
    gap: 16,
  },
  filterSection: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  filterOptions: {
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterOptionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  listingsContainer: {
    padding: 16,
    gap: 16,
  },
  listingCard: {
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
    marginBottom: 16,
  },
  listingImageContainer: {
    position: 'relative',
  },
  listingImage: {
    width: '100%',
    height: 200,
  },
  saveButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  listingContent: {
    padding: 16,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  listingTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
    marginRight: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#3B82F6',
  },
  listingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 12,
  },
  listingDetails: {
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
  listingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  sellerDetails: {
    flex: 1,
  },
  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  verifiedBadge: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  contactButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  expandedContent: {
    marginTop: 16,
  },
  imageGallery: {
    paddingBottom: 16,
  },
  galleryImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    gap: 4,
  },
  expandButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  collapseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  collapseButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
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
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
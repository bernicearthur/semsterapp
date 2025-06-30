import { useState, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SwipeGestureWrapper } from '@/components/SwipeGestureWrapper';
import { useTheme } from '@/context/ThemeContext';
import { Search, Filter, Briefcase, MapPin, Clock, Building2, DollarSign, Plus, Users, Calendar, Star, BookmarkIcon, Share2, ExternalLink } from 'lucide-react-native';
import { PostJobDrawer } from '@/components/drawers/PostJobDrawer';
import { JobApplicationDrawer } from '@/components/drawers/JobApplicationDrawer';

interface Job {
  id: string;
  title: string;
  company: string;
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
  location: string;
  salary: string;
  posted: string;
  deadline: string;
  description: string;
  requirements: string[];
  benefits: string[];
  image: string;
  isRemote: boolean;
  experienceLevel: 'Entry' | 'Mid' | 'Senior';
  department: string;
  applicants: number;
  isSaved: boolean;
  isApplied: boolean;
  contactEmail: string;
  companyWebsite?: string;
}

const initialJobs: Job[] = [
  {
    id: '1',
    title: 'Research Assistant',
    company: 'Department of Computer Science',
    type: 'Part-time',
    location: 'Main Campus',
    salary: '$15-20/hr',
    posted: '2 days ago',
    deadline: 'Applications due in 5 days',
    description: 'Assist faculty with ongoing research projects in machine learning and data analysis. This position offers hands-on experience with cutting-edge AI technologies and the opportunity to contribute to published research.',
    requirements: [
      'Currently enrolled in Computer Science or related field',
      'Strong programming skills in Python or R',
      'Basic understanding of machine learning concepts',
      'Excellent analytical and problem-solving skills',
      'Ability to work independently and in teams'
    ],
    benefits: [
      'Flexible working hours',
      'Research publication opportunities',
      'Mentorship from faculty',
      'Access to advanced computing resources'
    ],
    image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800',
    isRemote: false,
    experienceLevel: 'Entry',
    department: 'Computer Science',
    applicants: 23,
    isSaved: false,
    isApplied: false,
    contactEmail: 'research@university.edu',
    companyWebsite: 'https://cs.university.edu'
  },
  {
    id: '2',
    title: 'Library Student Worker',
    company: 'University Library',
    type: 'Part-time',
    location: 'Main Library',
    salary: '$12/hr',
    posted: '1 week ago',
    deadline: 'Applications due in 2 weeks',
    description: 'Help maintain library resources and assist visitors with their needs. Perfect opportunity to develop customer service skills while working in an academic environment.',
    requirements: [
      'Enrolled as a full-time student',
      'Strong communication skills',
      'Attention to detail',
      'Basic computer literacy',
      'Ability to lift up to 25 pounds'
    ],
    benefits: [
      'Study time during quiet periods',
      'Professional development workshops',
      'Employee discounts',
      'Networking opportunities'
    ],
    image: 'https://images.pexels.com/photos/590493/pexels-photo-590493.jpeg?auto=compress&cs=tinysrgb&w=800',
    isRemote: false,
    experienceLevel: 'Entry',
    department: 'Library Services',
    applicants: 45,
    isSaved: true,
    isApplied: false,
    contactEmail: 'library-jobs@university.edu'
  },
  {
    id: '3',
    title: 'Marketing Intern',
    company: 'University Communications',
    type: 'Internship',
    location: 'Admin Building',
    salary: '$14/hr',
    posted: '3 days ago',
    deadline: 'Applications due in 1 week',
    description: 'Assist in creating and managing social media content for university events. Gain valuable experience in digital marketing and content creation.',
    requirements: [
      'Marketing, Communications, or related major',
      'Social media savvy',
      'Creative writing skills',
      'Adobe Creative Suite knowledge preferred',
      'Portfolio of previous work'
    ],
    benefits: [
      'Portfolio building opportunities',
      'Professional mentorship',
      'Event planning experience',
      'Letter of recommendation'
    ],
    image: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=800',
    isRemote: true,
    experienceLevel: 'Entry',
    department: 'Communications',
    applicants: 67,
    isSaved: false,
    isApplied: true,
    contactEmail: 'marketing@university.edu',
    companyWebsite: 'https://communications.university.edu'
  },
  {
    id: '4',
    title: 'Software Development Intern',
    company: 'IT Services',
    type: 'Internship',
    location: 'Technology Center',
    salary: '$18-22/hr',
    posted: '5 days ago',
    deadline: 'Applications due in 10 days',
    description: 'Work on real-world software projects that support university operations. Collaborate with experienced developers on web applications and system integrations.',
    requirements: [
      'Computer Science or Software Engineering major',
      'Proficiency in JavaScript, Python, or Java',
      'Understanding of web development frameworks',
      'Database knowledge (SQL)',
      'Version control experience (Git)'
    ],
    benefits: [
      'Real-world project experience',
      'Code review and mentorship',
      'Agile development exposure',
      'Potential for full-time offer'
    ],
    image: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
    isRemote: false,
    experienceLevel: 'Mid',
    department: 'Information Technology',
    applicants: 89,
    isSaved: true,
    isApplied: false,
    contactEmail: 'it-jobs@university.edu'
  },
  {
    id: '5',
    title: 'Teaching Assistant',
    company: 'Mathematics Department',
    type: 'Part-time',
    location: 'Math Building',
    salary: '$16/hr',
    posted: '1 day ago',
    deadline: 'Applications due in 3 days',
    description: 'Assist professors with undergraduate mathematics courses. Help students during office hours and grade assignments.',
    requirements: [
      'Mathematics major with 3.5+ GPA',
      'Completed Calculus III or higher',
      'Strong communication skills',
      'Previous tutoring experience preferred',
      'Patience and enthusiasm for teaching'
    ],
    benefits: [
      'Teaching experience',
      'Graduate school preparation',
      'Faculty recommendations',
      'Academic skill development'
    ],
    image: 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=800',
    isRemote: false,
    experienceLevel: 'Mid',
    department: 'Mathematics',
    applicants: 34,
    isSaved: false,
    isApplied: false,
    contactEmail: 'math-ta@university.edu'
  }
];

const categories = [
  'All', 'Part-time', 'Full-time', 'Internship', 'Research', 'Teaching', 'Remote'
];

const experienceLevels = [
  'All Levels', 'Entry', 'Mid', 'Senior'
];

const departments = [
  'All Departments', 'Computer Science', 'Engineering', 'Business', 'Liberal Arts', 'Sciences', 'Library', 'Administration'
];

export default function JobBoardScreen() {
  const { isDark } = useTheme();
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedExperience, setSelectedExperience] = useState('All Levels');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [showFilters, setShowFilters] = useState(false);
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);

  const toggleJobSaved = (jobId: string) => {
    setJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId ? { ...job, isSaved: !job.isSaved } : job
      )
    );
  };

  const handleApplyToJob = (job: Job) => {
    setSelectedJob(job);
    setIsApplicationOpen(true);
  };

  const handleJobApplication = (applicationData: any) => {
    if (selectedJob) {
      setJobs(prevJobs =>
        prevJobs.map(job =>
          job.id === selectedJob.id 
            ? { ...job, isApplied: true, applicants: job.applicants + 1 }
            : job
        )
      );
      Alert.alert('Application Submitted', 'Your application has been submitted successfully!');
    }
    setIsApplicationOpen(false);
    setSelectedJob(null);
  };

  const handlePostJob = (jobData: any) => {
    const newJob: Job = {
      id: Date.now().toString(),
      ...jobData,
      posted: 'Just now',
      applicants: 0,
      isSaved: false,
      isApplied: false,
    };
    setJobs(prevJobs => [newJob, ...prevJobs]);
    setIsPostJobOpen(false);
    Alert.alert('Job Posted', 'Your job posting has been published successfully!');
  };

  const filteredJobs = jobs.filter(job => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!job.title.toLowerCase().includes(query) &&
          !job.company.toLowerCase().includes(query) &&
          !job.description.toLowerCase().includes(query)) {
        return false;
      }
    }

    // Category filter
    if (selectedCategory !== 'All') {
      if (selectedCategory === 'Remote' && !job.isRemote) return false;
      if (selectedCategory !== 'Remote' && job.type !== selectedCategory) return false;
    }

    // Experience filter
    if (selectedExperience !== 'All Levels' && job.experienceLevel !== selectedExperience) {
      return false;
    }

    // Department filter
    if (selectedDepartment !== 'All Departments' && job.department !== selectedDepartment) {
      return false;
    }

    return true;
  });

  const renderJobCard = (job: Job) => (
    <TouchableOpacity
      key={job.id}
      style={[styles.jobCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}
      onPress={() => handleApplyToJob(job)}
    >
      <Image source={{ uri: job.image }} style={styles.jobImage} />
      
      <View style={styles.jobContent}>
        <View style={styles.jobHeader}>
          <View style={styles.jobTitleContainer}>
            <Text style={[styles.jobTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
              {job.title}
            </Text>
            <View style={styles.jobBadges}>
              <View style={[
                styles.jobType,
                { backgroundColor: isDark ? '#374151' : '#F3F4F6' }
              ]}>
                <Text style={[styles.jobTypeText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                  {job.type}
                </Text>
              </View>
              {job.isRemote && (
                <View style={[styles.remoteBadge, { backgroundColor: '#10B981' }]}>
                  <Text style={styles.remoteBadgeText}>Remote</Text>
                </View>
              )}
              {job.isApplied && (
                <View style={[styles.appliedBadge, { backgroundColor: '#3B82F6' }]}>
                  <Text style={styles.appliedBadgeText}>Applied</Text>
                </View>
              )}
            </View>
          </View>
          
          <TouchableOpacity onPress={() => toggleJobSaved(job.id)}>
            <BookmarkIcon
              size={24}
              color={job.isSaved ? '#F59E0B' : (isDark ? '#9CA3AF' : '#6B7280')}
              fill={job.isSaved ? '#F59E0B' : 'none'}
            />
          </TouchableOpacity>
        </View>

        <Text style={[styles.jobDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          {job.description}
        </Text>
        
        <View style={styles.jobDetails}>
          <View style={styles.detailItem}>
            <Building2 size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
            <Text style={[styles.detailText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
              {job.company}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <MapPin size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
            <Text style={[styles.detailText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
              {job.location}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <DollarSign size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
            <Text style={[styles.detailText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
              {job.salary}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Users size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
            <Text style={[styles.detailText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
              {job.applicants} applicants
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Clock size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
            <Text style={[styles.detailText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
              {job.deadline}
            </Text>
          </View>
        </View>

        <View style={styles.jobFooter}>
          <View style={styles.jobMeta}>
            <Text style={[styles.postedTime, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Posted {job.posted}
            </Text>
            <View style={[
              styles.experienceLevel,
              { backgroundColor: isDark ? '#374151' : '#F3F4F6' }
            ]}>
              <Star size={12} color={isDark ? '#60A5FA' : '#3B82F6'} />
              <Text style={[styles.experienceLevelText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
                {job.experienceLevel}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[
              styles.applyButton, 
              { 
                backgroundColor: job.isApplied ? '#10B981' : '#3B82F6',
                opacity: job.isApplied ? 0.7 : 1
              }
            ]}
            onPress={() => handleApplyToJob(job)}
            disabled={job.isApplied}
          >
            <Text style={styles.applyButtonText}>
              {job.isApplied ? 'Applied' : 'Apply Now'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

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
                Job Board
              </Text>
              <Text style={[styles.headerSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                {filteredJobs.length} opportunities available
              </Text>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <View style={[styles.searchBar, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
                <Search size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                <TextInput
                  style={[styles.searchInput, { color: isDark ? '#E5E7EB' : '#1F2937' }]}
                  placeholder="Search jobs, companies, or keywords"
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
                    Job Type
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
                    Experience Level
                  </Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterOptions}
                  >
                    {experienceLevels.map((level) => (
                      <TouchableOpacity
                        key={level}
                        style={[
                          styles.filterOption,
                          { 
                            backgroundColor: selectedExperience === level ? 
                              '#3B82F6' : 
                              (isDark ? '#374151' : '#F3F4F6')
                          }
                        ]}
                        onPress={() => setSelectedExperience(level)}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          { 
                            color: selectedExperience === level ? 
                              '#FFFFFF' : 
                              (isDark ? '#E5E7EB' : '#4B5563')
                          }
                        ]}>
                          {level}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            )}
          </View>

          {/* Jobs List */}
          <View style={styles.jobsContainer}>
            {filteredJobs.length > 0 ? (
              filteredJobs.map(renderJobCard)
            ) : (
              <View style={styles.emptyState}>
                <Briefcase size={48} color={isDark ? '#9CA3AF' : '#6B7280'} />
                <Text style={[styles.emptyStateTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  No jobs found
                </Text>
                <Text style={[styles.emptyStateText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  Try adjusting your search criteria or check back later for new opportunities
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Floating Action Button */}
        <TouchableOpacity 
          style={[styles.fab, { backgroundColor: '#3B82F6' }]}
          onPress={() => setIsPostJobOpen(true)}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Post Job Drawer */}
        <PostJobDrawer
          isOpen={isPostJobOpen}
          onClose={() => setIsPostJobOpen(false)}
          onPostJob={handlePostJob}
        />

        {/* Job Application Drawer */}
        <JobApplicationDrawer
          isOpen={isApplicationOpen}
          onClose={() => {
            setIsApplicationOpen(false);
            setSelectedJob(null);
          }}
          job={selectedJob}
          onSubmitApplication={handleJobApplication}
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
  },
  filterOptionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  jobsContainer: {
    padding: 16,
    gap: 16,
  },
  jobCard: {
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
  jobImage: {
    width: '100%',
    height: 160,
  },
  jobContent: {
    padding: 16,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  jobTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  jobBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  jobType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  jobTypeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  remoteBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  remoteBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  appliedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  appliedBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  jobDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 12,
  },
  jobDetails: {
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
    flex: 1,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobMeta: {
    flex: 1,
    gap: 8,
  },
  postedTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  experienceLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  experienceLevelText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  applyButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginLeft: 12,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
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
    lineHeight: 20,
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
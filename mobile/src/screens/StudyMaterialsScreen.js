import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator, 
  RefreshControl,
  SafeAreaView,
  Dimensions,
  Platform,
  StatusBar
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getAllUploads } from '../services/api';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function StudyMaterialsScreen({ navigation }) {
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Data States
  const [guides, setGuides] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [availableModules, setAvailableModules] = useState({});

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('All Courses');
  const [selectedModule, setSelectedModule] = useState('All Modules');
  const [selectedDate, setSelectedDate] = useState(null);

  // Calendar States
  const [calendarDate, setCalendarDate] = useState(new Date());

  const fetchStudyMaterials = async () => {
    try {
      setError(null);
      const res = await getAllUploads();
      const uploads = res.data || [];
      
      const sessionGroups = {};
      const coursesMap = new Set();
      const modulesMap = {};

      uploads.forEach(upload => {
        if (!upload.courseId || !upload.sessionId) return;

        const sessionId = upload.sessionId._id;
        const courseTitle = upload.courseId.title;
        const moduleTitle = upload.sessionId.moduleId?.title || 'General Module';

        coursesMap.add(courseTitle);
        if (!modulesMap[courseTitle]) modulesMap[courseTitle] = new Set();
        modulesMap[courseTitle].add(moduleTitle);

        // Group uploads by session; prioritize processed ones
        if (!sessionGroups[sessionId] || upload.isProcessed) {
          sessionGroups[sessionId] = {
            id: upload._id,
            sessionId,
            uploadId: upload._id,
            course: courseTitle,
            module: moduleTitle,
            title: upload.sessionId.title || upload.originalname,
            date: new Date(upload.sessionId.date),
            stats: {
              cards: upload.stats?.flashcards || 0,
              questions: upload.stats?.interview || 0,
              quiz: upload.stats?.quiz || 0
            },
            isProcessed: upload.isProcessed
          };
        }
      });

      const finalModules = {};
      for (const [course, modSet] of Object.entries(modulesMap)) {
        finalModules[course] = Array.from(modSet);
      }

      setGuides(Object.values(sessionGroups));
      setAvailableCourses(Array.from(coursesMap));
      setAvailableModules(finalModules);
    } catch (err) {
      console.error('Error fetching student study materials:', err);
      setError('Failed to load study materials.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudyMaterials();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStudyMaterials();
  };

  // Filter Logic
  const filteredGuides = guides.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === 'All Courses' || guide.course === selectedCourse;
    const matchesModule = selectedModule === 'All Modules' || guide.module === selectedModule;
    
    const matchesDate = !selectedDate || (
      guide.date.getFullYear() === selectedDate.getFullYear() &&
      guide.date.getMonth() === selectedDate.getMonth() &&
      guide.date.getDate() === selectedDate.getDate()
    );

    return matchesSearch && matchesCourse && matchesModule && matchesDate;
  });

  // Calendar Helper Functions
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const currentYear = calendarDate.getFullYear();
  const currentMonth = calendarDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

  // Check if a day has active guides matching search filters
  const hasGuideOnDay = (day) => {
    return guides.some(guide => {
      const guideDate = guide.date;
      const matchesCourse = selectedCourse === 'All Courses' || guide.course === selectedCourse;
      const matchesModule = selectedModule === 'All Modules' || guide.module === selectedModule;
      
      return (
        guideDate.getDate() === day &&
        guideDate.getMonth() === currentMonth &&
        guideDate.getFullYear() === currentYear &&
        matchesCourse &&
        matchesModule
      );
    });
  };

  const handlePrevMonth = () => {
    setCalendarDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Clear all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCourse('All Courses');
    setSelectedModule('All Modules');
    setSelectedDate(null);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgMain }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Study Materials</Text>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]}>Access all your AI-generated learning content</Text>
        </View>

        {/* Search Bar Widget */}
        <View style={[styles.searchBox, { borderColor: theme.border, backgroundColor: theme.bgCard }]}>
          <Feather name="search" size={18} color={theme.textMuted} style={{ marginRight: 10 }} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder="Search study guides..."
            placeholderTextColor={theme.textMuted}
            value={searchTerm}
            onChangeText={(text) => {
              setSearchTerm(text);
              setSelectedDate(null); // Clear selected date filter on text search
            }}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <Feather name="x" size={16} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Premium Horizontal Course Tag Filters */}
        <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>COURSES</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.tagsContainer}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          <TouchableOpacity
            style={[
              styles.tagButton, 
              { borderColor: theme.border, backgroundColor: theme.bgCard },
              selectedCourse === 'All Courses' ? { backgroundColor: theme.primarySurface, borderColor: theme.primary } : null
            ]}
            onPress={() => {
              setSelectedCourse('All Courses');
              setSelectedModule('All Modules');
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.tagText, { color: theme.textSecondary }, selectedCourse === 'All Courses' ? { color: theme.primary, fontWeight: '700' } : null]}>
              All Courses
            </Text>
          </TouchableOpacity>
          {availableCourses.map(course => (
            <TouchableOpacity
              key={course}
              style={[
                styles.tagButton, 
                { borderColor: theme.border, backgroundColor: theme.bgCard },
                selectedCourse === course ? { backgroundColor: theme.primarySurface, borderColor: theme.primary } : null
              ]}
              onPress={() => {
                setSelectedCourse(course);
                setSelectedModule('All Modules');
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.tagText, { color: theme.textSecondary }, selectedCourse === course ? { color: theme.primary, fontWeight: '700' } : null]} numberOfLines={1}>
                {course}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Premium Horizontal Module Tag Filters (Visible only if Course selected) */}
        {selectedCourse !== 'All Courses' && (
          <>
            <Text style={[styles.filterLabel, { color: theme.textSecondary, marginTop: 12 }]}>MODULES</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.tagsContainer}
              contentContainerStyle={{ paddingRight: 20 }}
            >
              <TouchableOpacity
                style={[
                  styles.tagButton, 
                  { borderColor: theme.border, backgroundColor: theme.bgCard },
                  selectedModule === 'All Modules' ? { backgroundColor: theme.primarySurface, borderColor: theme.primary } : null
                ]}
                onPress={() => setSelectedModule('All Modules')}
                activeOpacity={0.8}
              >
                <Text style={[styles.tagText, { color: theme.textSecondary }, selectedModule === 'All Modules' ? { color: theme.primary, fontWeight: '700' } : null]}>
                  All Modules
                </Text>
              </TouchableOpacity>
              {(availableModules[selectedCourse] || []).map(mod => (
                <TouchableOpacity
                  key={mod}
                  style={[
                    styles.tagButton, 
                    { borderColor: theme.border, backgroundColor: theme.bgCard },
                    selectedModule === mod ? { backgroundColor: theme.primarySurface, borderColor: theme.primary } : null
                  ]}
                  onPress={() => setSelectedModule(mod)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tagText, { color: theme.textSecondary }, selectedModule === mod ? { color: theme.primary, fontWeight: '700' } : null]} numberOfLines={1}>
                    {mod}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Calendar Retrieval Section */}
        <View style={[styles.calendarCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          {/* Calendar Header Switcher */}
          <View style={styles.calendarHeaderRow}>
            <Text style={[styles.calendarTitle, { color: theme.textPrimary }]}>
              {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </Text>
            
            <View style={styles.calendarNav}>
              <TouchableOpacity onPress={handlePrevMonth} style={[styles.navBtn, { borderColor: theme.border, backgroundColor: theme.bgMain }]}>
                <Feather name="chevron-left" size={16} color={theme.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleNextMonth} style={[styles.navBtn, { borderColor: theme.border, backgroundColor: theme.bgMain }]}>
                <Feather name="chevron-right" size={16} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Grid Layout */}
          <View style={styles.calendarGrid}>
            {/* Weekdays Header */}
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <View key={day} style={styles.weekdayCell}>
                <Text style={[styles.weekdayText, { color: theme.textMuted }]}>{day}</Text>
              </View>
            ))}

            {/* Calendar Days */}
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
              <View key={`empty-${idx}`} style={styles.dayCell} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const dateOfCell = new Date(currentYear, currentMonth, day);
              const hasGuide = hasGuideOnDay(day);
              
              const isSelected = selectedDate &&
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === currentMonth &&
                selectedDate.getFullYear() === currentYear;

              const today = new Date();
              const isToday = day === today.getDate() &&
                currentMonth === today.getMonth() &&
                currentYear === today.getFullYear();

              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayCell,
                    isToday ? { backgroundColor: theme.primary, borderRadius: 20 } : null,
                    isSelected ? { borderWidth: 2, borderColor: theme.primary, borderRadius: 20 } : null,
                    (hasGuide && !isToday && !isSelected) ? { backgroundColor: 'rgba(79, 70, 229, 0.08)', borderRadius: 20 } : null
                  ]}
                  onPress={() => {
                    setSelectedDate(isSelected ? null : dateOfCell);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.dayText, 
                    { color: theme.textSecondary },
                    isToday ? { color: '#0F172A', fontWeight: '900' } : null,
                    hasGuide ? { color: theme.primary, fontWeight: '700' } : null,
                    isSelected ? { color: theme.primary, fontWeight: '800' } : null
                  ]}>
                    {day}
                  </Text>
                  {hasGuide && !isToday && (
                    <View style={[styles.guideDot, { backgroundColor: theme.primary }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={[styles.calendarHint, { color: theme.textMuted }]}>
            Dates highlighted in gold have study guides. Tap a date to filter.
          </Text>
        </View>

        {/* Selected Date Filter Ribbon */}
        {selectedDate && (
          <View style={[styles.activeFilterBadge, { backgroundColor: theme.primarySurface, borderColor: theme.primary }]}>
            <Feather name="calendar" size={14} color={theme.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.activeFilterText, { color: theme.primary }]}>
              Filtered by: {selectedDate.toLocaleDateString()}
            </Text>
            <TouchableOpacity onPress={() => setSelectedDate(null)} style={styles.clearFilterBtn}>
              <Feather name="x" size={14} color={theme.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Guides List */}
        <View style={styles.listHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Study Guides ({filteredGuides.length})
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 20 }} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
            <TouchableOpacity style={[styles.retryButton, { backgroundColor: theme.primary }]} onPress={fetchStudyMaterials}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredGuides.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <Feather name="book-open" size={40} color={theme.textMuted} style={{ marginBottom: 12 }} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Guides Found</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Try adjusting your search terms or course tags, or tap another calendar day to view active summaries.
            </Text>
            {(searchTerm || selectedCourse !== 'All Courses' || selectedDate) && (
              <TouchableOpacity style={[styles.resetBtn, { backgroundColor: theme.primary }]} onPress={resetFilters}>
                <Text style={styles.resetBtnText}>Clear All Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredGuides.map((guide) => (
            <TouchableOpacity
              key={guide.id}
              style={[styles.guideCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
              onPress={() => navigation.navigate('StudyGuide', { sessionId: guide.sessionId, uploadId: guide.uploadId })}
              activeOpacity={0.8}
            >
              {/* Card Header Info */}
              <View style={styles.guideCardHeader}>
                <View style={[styles.bookIconBox, { backgroundColor: theme.primarySurface }]}>
                  <Feather name="book-open" size={20} color={theme.primary} />
                </View>
                
                <View style={styles.guideTextDetails}>
                  <View style={styles.badgeRow}>
                    <View style={[styles.courseBadge, { backgroundColor: 'rgba(255,255,255,0.04)' }]}>
                      <Text style={[styles.courseBadgeText, { color: theme.textSecondary }]}>
                        {guide.course}
                      </Text>
                    </View>
                    <View style={[styles.moduleBadge, { backgroundColor: 'rgba(79, 70, 229, 0.08)' }]}>
                      <Text style={[styles.moduleBadgeText, { color: theme.primary }]}>
                        {guide.module}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={[styles.guideTitleText, { color: theme.textPrimary }]} numberOfLines={1}>
                    {guide.title}
                  </Text>
                  
                  <Text style={[styles.guideDateText, { color: theme.textMuted }]}>
                    {guide.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                </View>

                <Feather name="chevron-right" size={18} color={theme.textMuted} style={{ alignSelf: 'center' }} />
              </View>

              {/* Stats Indicators Row */}
              <View style={[styles.statsDivider, { borderTopColor: theme.border }]} />
              
              <View style={styles.statsRow}>
                <View style={styles.statPill}>
                  <Feather name="zap" size={12} color={theme.primary} style={{ marginRight: 4 }} />
                  <Text style={[styles.statText, { color: theme.textSecondary }]}>
                    {guide.stats.cards} Flashcards
                  </Text>
                </View>
                
                <View style={styles.statPill}>
                  <Feather name="message-square" size={12} color={theme.primary} style={{ marginRight: 4 }} />
                  <Text style={[styles.statText, { color: theme.textSecondary }]}>
                    {guide.stats.questions} Q&As
                  </Text>
                </View>

                <View style={styles.statPill}>
                  <Feather name="help-circle" size={12} color={theme.primary} style={{ marginRight: 4 }} />
                  <Text style={[styles.statText, { color: theme.textSecondary }]}>
                    {guide.stats.quiz} Quizzes
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    marginTop: Platform.OS === 'ios' ? 8 : 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 14,
    fontWeight: '500',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
    padding: 0,
  },
  filterLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tagButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  calendarCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 2,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  calendarNav: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  weekdayCell: {
    width: '14.28%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekdayText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1.1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    position: 'relative',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '500',
  },
  guideDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: 4,
  },
  calendarHint: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 12,
  },
  activeFilterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  activeFilterText: {
    fontSize: 12,
    fontWeight: '700',
  },
  clearFilterBtn: {
    marginLeft: 8,
    padding: 2,
  },
  listHeaderRow: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  guideCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  guideCardHeader: {
    flexDirection: 'row',
  },
  bookIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  guideTextDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  courseBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  courseBadgeText: {
    fontSize: 9,
    fontWeight: '600',
  },
  moduleBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginBottom: 4,
  },
  moduleBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  guideTitleText: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  guideDateText: {
    fontSize: 11,
    fontWeight: '500',
  },
  statsDivider: {
    borderTopWidth: 1,
    marginTop: 14,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    marginVertical: 2,
  },
  statText: {
    fontSize: 11,
    fontWeight: '600',
  },
  errorContainer: {
    padding: 30,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  resetBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  resetBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
});

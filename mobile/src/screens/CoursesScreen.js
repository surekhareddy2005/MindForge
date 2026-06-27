import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  RefreshControl,
  SafeAreaView,
  Dimensions,
  Image,
  Platform,
  StatusBar
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getMyCourses } from '../services/api';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function CoursesScreen({ navigation }) {
  const { theme, isDarkMode } = useTheme();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const fetchCourses = async () => {
    try {
      setError(null);
      const res = await getMyCourses();
      const userCourses = res.data || [];
      setCourses(userCourses);
      setFilteredCourses(userCourses);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSearch = (text) => {
    setSearch(text);
    if (!text) {
      setFilteredCourses(courses);
      return;
    }
    const filtered = courses.filter(course => 
      course.title.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredCourses(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCourses();
  };

  const getImageForCourse = (courseName) => {
    const name = courseName.toLowerCase();
    if (name.includes('owl')) return require('../../assets/owlcoder.png');
    if (name.includes('dsa')) return require('../../assets/dsa.png');
    return null;
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.bgMain }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgMain }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>My Courses</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Browse and enter your enrolled courses</Text>
        
        {/* Search Bar */}
        <View style={[styles.searchWrapper, { borderColor: theme.border, backgroundColor: theme.bgCard }]}>
          <Feather name="search" size={18} color={theme.textMuted} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder="Search enrolled courses..."
            placeholderTextColor={theme.textMuted}
            value={search}
            onChangeText={handleSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Feather name="x" size={18} color={theme.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: theme.primary }]} onPress={fetchCourses}>
            <Text style={[styles.retryText, { color: isDarkMode ? '#000' : '#fff' }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredCourses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="book-open" size={50} color={theme.textMuted} style={{ marginBottom: 16 }} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            {search ? `No courses match "${search}"` : 'You are not enrolled in any courses yet.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredCourses}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
          }
          renderItem={({ item }) => {
            const courseImg = getImageForCourse(item.title);
            return (
              <TouchableOpacity 
                style={[styles.courseCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('CourseDetails', { courseId: item._id })}
              >
                {courseImg ? (
                  <View style={styles.imageWrapper}>
                    <Image source={courseImg} style={styles.cardImage} resizeMode="cover" />
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>ENROLLED</Text>
                    </View>
                  </View>
                ) : (
                  <LinearGradient
                    colors={isDarkMode ? ['#1E293B', '#1a1a1f'] : ['#4F46E5', '#1a365d']}
                    style={styles.gradientWrapper}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>ENROLLED</Text>
                    </View>
                  </LinearGradient>
                )}

                <View style={styles.detailsContainer}>
                  <Text style={[styles.courseTitle, { color: theme.textPrimary }]} numberOfLines={2}>
                    {item.title}
                  </Text>
                  
                  <View style={styles.cardFooter}>
                    <Text style={[styles.mentorText, { color: theme.textSecondary }]}>
                      View Modules & Lectures
                    </Text>
                    <Feather name="arrow-right" size={16} color={theme.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 20,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 14,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 100,
  },
  courseCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  imageWrapper: {
    height: 140,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  gradientWrapper: {
    height: 120,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  detailsContainer: {
    padding: 16,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 12,
  },
  mentorText: {
    fontSize: 12,
    fontWeight: '500',
  },
  errorContainer: {
    padding: 30,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

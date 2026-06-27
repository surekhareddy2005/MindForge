import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  RefreshControl,
  SafeAreaView,
  Dimensions,
  Platform,
  StatusBar,
  Alert
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getMyCourses, getModules } from '../services/api';
import Logo from '../components/Logo';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // Ensure gradient looks rich

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const { theme, isDarkMode, toggleTheme } = useTheme();

  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    coursesEnrolled: 0,
    modulesAvailable: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const coursesResponse = await getMyCourses();
      const userCourses = coursesResponse.data || [];
      setCourses(userCourses);

      const moduleResults = await Promise.all(
        userCourses.map(async (course) => {
          try {
            const modulesRes = await getModules(course._id);
            return (modulesRes.data || []).length;
          } catch (err) {
            return 0;
          }
        })
      );
      const totalModules = moduleResults.reduce((sum, count) => sum + count, 0);

      setStats({
        coursesEnrolled: userCourses.length,
        modulesAvailable: totalModules,
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
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
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Logo size={42} showText={true} />
          
          <View style={styles.headerRight}>
            {/* Logout */}
            <TouchableOpacity 
              style={[styles.iconButton, { borderColor: theme.border, backgroundColor: theme.bgSurface }]} 
              onPress={logout}
            >
              <Feather name="log-out" size={18} color={theme.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeText, { color: theme.textSecondary }]}>Welcome back,</Text>
          <Text style={[styles.nameText, { color: theme.textPrimary }]}>{user?.name || 'Student'}</Text>
        </View>

        {/* Error Alert */}
        {error && (
          <View style={[styles.errorContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: theme.error }]}>
            <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
          </View>
        )}

        {/* Stats Section */}
        <View style={styles.statsRow}>
          {/* Stats Card 1 */}
          <View style={[styles.statCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>COURSES ENROLLED</Text>
            <Text style={[styles.statValue, { color: theme.primary }]}>{stats.coursesEnrolled}</Text>
          </View>

          {/* Stats Card 2 */}
          <View style={[styles.statCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>MODULES AVAILABLE</Text>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{stats.modulesAvailable}</Text>
          </View>
        </View>

        {/* Active Courses Section */}
        <View style={styles.coursesSection}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            {courses.length > 0 ? 'My Active Courses' : 'No Enrolled Courses'}
          </Text>

          {courses.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
              <Feather name="book-open" size={40} color={theme.textMuted} style={{ marginBottom: 12 }} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Your course list is currently empty. Contact your administrator to enroll in a course.
              </Text>
            </View>
          ) : (
            courses.map((course) => {
              const courseImg = getImageForCourse(course.title);
              return (
                <View 
                  key={course._id} 
                  style={[styles.courseCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
                >
                  {/* Course Image Area */}
                  {courseImg ? (
                    <View style={styles.courseImageWrapper}>
                      <Image source={courseImg} style={styles.courseImage} resizeMode="cover" />
                      <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>ENROLLED</Text>
                      </View>
                    </View>
                  ) : (
                    <LinearGradient
                      colors={isDarkMode ? ['#1E293B', '#1a1a1f'] : ['#4F46E5', '#1a365d']}
                      style={styles.courseGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>ENROLLED</Text>
                      </View>
                    </LinearGradient>
                  )}

                  {/* Course Details Area */}
                  <View style={styles.courseDetails}>
                    <Text style={[styles.courseTitle, { color: theme.textPrimary }]} numberOfLines={2}>
                      {course.title}
                    </Text>
                    
                    <TouchableOpacity 
                      style={[styles.enterButton, { backgroundColor: theme.primary }]}
                      onPress={() => navigation.navigate('CourseDetails', { courseId: course._id })}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.enterButtonText, { color: isDarkMode ? '#000' : '#fff' }]}>
                        Enter Course
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>

      </ScrollView>
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
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 10,
    borderRadius: 50,
    borderWidth: 1,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeSection: {
    marginBottom: 28,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  nameText: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
  errorContainer: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    width: (width - 52) / 2,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 36,
    fontWeight: '800',
  },
  coursesSection: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  courseCard: {
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 3,
  },
  courseImageWrapper: {
    height: 180,
    position: 'relative',
  },
  courseImage: {
    width: '100%',
    height: '100%',
  },
  courseGradient: {
    height: 140,
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  courseDetails: {
    padding: 20,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 16,
    height: 48,
  },
  enterButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enterButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

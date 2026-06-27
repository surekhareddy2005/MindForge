import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  SafeAreaView,
  Dimensions,
  Platform,
  StatusBar
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getModules, getSessions, getMyCourses } from '../services/api';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function CourseDetailsScreen({ route, navigation }) {
  const { courseId } = route.params;
  const { theme } = useTheme();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchCourseDetails = async () => {
    try {
      setError(null);
      
      const [coursesRes, modulesRes, sessionsRes] = await Promise.all([
        getMyCourses(),
        getModules(courseId),
        getSessions(courseId)
      ]);

      const allCourses = coursesRes.data || [];
      const currentCourse = allCourses.find(c => c._id === courseId);

      setCourse(currentCourse || null);
      setModules(modulesRes.data || []);
      setSessions(sessionsRes.data || []);
    } catch (err) {
      console.error('Error fetching course details:', err);
      setError('Failed to load course details.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCourseDetails();
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]} numberOfLines={1}>
          {course?.title || 'Course Details'}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
            <TouchableOpacity style={[styles.retryButton, { backgroundColor: theme.primary }]} onPress={fetchCourseDetails}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Course Summary Banner */}
            <View style={[styles.summaryCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
              <Text style={[styles.summaryTitle, { color: theme.textPrimary }]}>Course Summary</Text>
              
              <View style={styles.statsRow}>
                <View style={styles.statCol}>
                  <Text style={[styles.statValue, { color: theme.primary }]}>{modules.length}</Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>MODULES</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                <View style={styles.statCol}>
                  <Text style={[styles.statValue, { color: theme.textPrimary }]}>{sessions.length}</Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>SESSIONS</Text>
                </View>
              </View>
            </View>

            {/* Modules List Header */}
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Course Modules</Text>

            {modules.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                <Feather name="layers" size={32} color={theme.textMuted} style={{ marginBottom: 12 }} />
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  No modules have been created for this course yet.
                </Text>
              </View>
            ) : (
              modules.map((module) => {
                const moduleSessions = sessions.filter(s => s.moduleId?._id === module._id || s.moduleId === module._id || s.module === module._id);
                return (
                  <TouchableOpacity
                    key={module._id}
                    style={[styles.moduleCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('ModuleDetails', { courseId, moduleId: module._id })}
                  >
                    {/* Left Accent Pill */}
                    <View style={[styles.moduleLeftAccent, { backgroundColor: theme.primary }]} />

                    <View style={styles.moduleCardLeft}>
                      <View style={[styles.iconWrapper, { backgroundColor: theme.primarySurface }]}>
                        <Feather name="folder" size={18} color={theme.primary} />
                      </View>
                      <View style={styles.moduleInfo}>
                        <Text style={[styles.moduleTitle, { color: theme.textPrimary }]}>{module.title}</Text>
                        <Text style={[styles.moduleSub, { color: theme.textSecondary }]}>
                          {moduleSessions.length} {moduleSessions.length === 1 ? 'Lecture' : 'Lectures'} • Study Suite Ready
                        </Text>
                      </View>
                    </View>
                    <Feather name="chevron-right" size={18} color={theme.textMuted} />
                  </TouchableOpacity>
                );
              })
            )}
          </>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  backButton: {
    padding: 10,
    borderRadius: 50,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginLeft: 0,
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  summaryCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginBottom: 28,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 14,
  },
  moduleCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  moduleSub: {
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
});

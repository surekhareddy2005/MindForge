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
import { getSessions, getModules, getUploads } from '../services/api';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function ModuleDetailsScreen({ route, navigation }) {
  const { courseId, moduleId } = route.params;
  const { theme } = useTheme();

  const [moduleName, setModuleName] = useState('');
  const [sessions, setSessions] = useState([]);
  const [sessionUploads, setSessionUploads] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchModuleDetails = async () => {
    try {
      setError(null);
      
      const [modulesRes, sessionsRes] = await Promise.all([
        getModules(courseId),
        getSessions(courseId)
      ]);

      const currentModule = (modulesRes.data || []).find(m => m._id === moduleId);
      if (currentModule) {
        setModuleName(currentModule.title);
      }

      const moduleSessions = (sessionsRes.data || []).filter(s => 
        s.moduleId?._id === moduleId || s.moduleId === moduleId || s.module === moduleId
      );
      
      // Sort sessions by date (earliest to latest for learning path)
      moduleSessions.sort((a, b) => new Date(a.date) - new Date(b.date));
      setSessions(moduleSessions);

      // Fetch uploads associated with each session to display exact study material details
      const uploadsMap = {};
      await Promise.all(
        moduleSessions.map(async (session) => {
          try {
            const uploadsRes = await getUploads(session._id);
            uploadsMap[session._id] = uploadsRes.data || [];
          } catch (e) {
            uploadsMap[session._id] = [];
          }
        })
      );
      setSessionUploads(uploadsMap);
    } catch (err) {
      console.error('Error fetching module details:', err);
      setError('Failed to load sessions.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchModuleDetails();
  }, [courseId, moduleId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchModuleDetails();
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
          {moduleName || 'Module Details'}
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
            <TouchableOpacity style={[styles.retryButton, { backgroundColor: theme.primary }]} onPress={fetchModuleDetails}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.timelineSummary}>
              <Feather name="trending-up" size={16} color={theme.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.timelineSummaryText, { color: theme.textSecondary }]}>
                LEARNING PATHWAY • {sessions.length} {sessions.length === 1 ? 'STEP' : 'STEPS'}
              </Text>
            </View>
            
            {sessions.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                <Feather name="compass" size={40} color={theme.textMuted} style={{ marginBottom: 12 }} />
                <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Sessions Added</Text>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  Your mentor hasn't added any lecture sessions or workspace materials to this module yet.
                </Text>
              </View>
            ) : (
              <View style={styles.timelineWrapper}>
                {sessions.map((session, index) => {
                  const formattedDate = new Date(session.date).toLocaleDateString(undefined, { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  });

                  const uploads = sessionUploads[session._id] || [];
                  const processedGuidesCount = uploads.filter(u => u.isProcessed).length;
                  const isLastItem = index === sessions.length - 1;

                  return (
                    <View key={session._id} style={styles.timelineItemRow}>
                      
                      {/* Left Visual Timeline Connector */}
                      <View style={styles.leftTimelineTrack}>
                        <View style={[styles.stepNode, { backgroundColor: theme.primarySurface, borderColor: theme.primary }]}>
                          <Text style={[styles.stepNodeText, { color: theme.primary }]}>
                            {(index + 1).toString().padStart(2, '0')}
                          </Text>
                        </View>
                        {!isLastItem && (
                          <View style={[styles.trackLine, { backgroundColor: 'rgba(79, 70, 229, 0.15)' }]} />
                        )}
                      </View>

                      {/* Right Interactive Session Card */}
                      <TouchableOpacity
                        style={[styles.sessionCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('Session', { sessionId: session._id })}
                      >
                        <View style={styles.cardHeaderRow}>
                          <View style={[styles.statusBadge, { backgroundColor: 'rgba(255, 255, 255, 0.04)' }]}>
                            <Feather name="calendar" size={12} color={theme.textMuted} style={{ marginRight: 5 }} />
                            <Text style={[styles.statusText, { color: theme.textSecondary }]}>
                              {formattedDate}
                            </Text>
                          </View>

                          <View style={[styles.guidePill, processedGuidesCount > 0 ? { backgroundColor: 'rgba(34, 197, 94, 0.08)' } : { backgroundColor: 'rgba(255, 179, 0, 0.08)' }]}>
                            <Text style={[styles.guidePillText, processedGuidesCount > 0 ? { color: theme.success } : { color: '#ffb300' }]}>
                              {processedGuidesCount > 0 ? `${processedGuidesCount} Guide${processedGuidesCount > 1 ? 's' : ''} Ready` : 'No Summaries'}
                            </Text>
                          </View>
                        </View>

                        <Text style={[styles.sessionTitleText, { color: theme.textPrimary }]}>
                          {session.title}
                        </Text>

                        <Text style={[styles.sessionDescription, { color: theme.textSecondary }]} numberOfLines={2}>
                          Interactive summary, audio recording playback, flashcard decks, and instant quizzes generated by AI.
                        </Text>

                        <View style={styles.cardFooterRow}>
                          <View style={styles.metricsRow}>
                            {processedGuidesCount > 0 && (
                              <>
                                <View style={styles.metricItem}>
                                  <Feather name="zap" size={12} color={theme.primary} style={{ marginRight: 4 }} />
                                  <Text style={[styles.metricText, { color: theme.textMuted }]}>Flashcards</Text>
                                </View>
                                <View style={styles.metricItem}>
                                  <Feather name="help-circle" size={12} color={theme.primary} style={{ marginRight: 4 }} />
                                  <Text style={[styles.metricText, { color: theme.textMuted }]}>Quiz</Text>
                                </View>
                              </>
                            )}
                          </View>
                          
                          <View style={[styles.arrowCircle, { backgroundColor: theme.primarySurface }]}>
                            <Feather name="chevron-right" size={16} color={theme.primary} />
                          </View>
                        </View>
                      </TouchableOpacity>

                    </View>
                  );
                })}
              </View>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginLeft: 0,
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 80, // Leaves room for the floating bottom navigation bar
  },
  timelineSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  timelineSummaryText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 40,
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
  },
  timelineWrapper: {
    position: 'relative',
  },
  timelineItemRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  leftTimelineTrack: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  stepNode: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  stepNodeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  trackLine: {
    position: 'absolute',
    top: 32,
    bottom: -24,
    width: 2,
    zIndex: 1,
  },
  sessionCard: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  guidePill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  guidePillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  sessionTitleText: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  sessionDescription: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metricText: {
    fontSize: 11,
    fontWeight: '600',
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
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

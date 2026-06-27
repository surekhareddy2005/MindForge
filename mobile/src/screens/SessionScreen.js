import React, { useState, useEffect, useCallback } from 'react';
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
import { useAlert } from '../context/AlertContext';
import { getMyCourses, getSessions, getUploads } from '../services/api';
import { Feather } from '@expo/vector-icons';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');

// Luxury Audio Player Deck
function AudioPlayer({ url }) {
  const { theme } = useTheme();
  const { showAlert } = useAlert();
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffering, setBuffering] = useState(false);

  const normalizeUrl = (u) => {
    if (!u) return '';
    // Maps local development localhost URL strings to active LAN network host address
    return u.replace('localhost:5000', '192.168.55.104:5000');
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Capture hardware state updates
  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setCurrentTime(status.positionMillis / 1000);
      if (status.durationMillis) {
        setDuration(status.durationMillis / 1000);
      }
      setIsPlaying(status.isPlaying);
      setBuffering(status.isBuffering);
      if (status.didJustFinish) {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    } else if (status.error) {
      console.error('expo-av playback error:', status.error);
    }
  };

  const handlePlayPause = async () => {
    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
        } else {
          await sound.playAsync();
        }
      } else {
        const streamUrl = normalizeUrl(url);
        console.log('Streaming audio from:', streamUrl);

        // Configure phone hardware profile
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldRouteThroughEarpieceIOS: false,
          staysActiveInBackground: true,
        });

        setBuffering(true);
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: streamUrl },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );
        setSound(newSound);
      }
    } catch (err) {
      console.error('Failed to configure audio player:', err);
      showAlert(
        'Connection Failed',
        'Could not establish audio stream. Make sure the server is online and reachable on your network.',
        'error'
      );
    } finally {
      setBuffering(false);
    }
  };

  useEffect(() => {
    return sound
      ? () => {
          console.log('Cleaning audio streams...');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <View style={[styles.playerContainer, { backgroundColor: theme.bgMain, borderColor: theme.border }]}>
      <View style={styles.playerMetaRow}>
        <View style={styles.liveIndicator}>
          <View style={[styles.livePulse, isPlaying ? { backgroundColor: '#4F46E5' } : null]} />
          <Text style={[styles.playerTitle, { color: theme.textSecondary }]}>
            {isPlaying ? 'PLAYING LECTURE STREAM' : 'LECTURE AUDIO RECORDING'}
          </Text>
        </View>
        <Feather name="headphones" size={14} color={theme.primary} />
      </View>
      
      <View style={styles.playerControlsRow}>
        <TouchableOpacity 
          style={[styles.playButton, { backgroundColor: theme.primary }]} 
          onPress={handlePlayPause}
          activeOpacity={0.8}
          disabled={buffering}
        >
          {buffering ? (
            <ActivityIndicator size="small" color="#0F172A" />
          ) : (
            <Feather 
              name={isPlaying ? 'pause' : 'play'} 
              size={18} 
              color="#0F172A" 
              style={!isPlaying ? { marginLeft: 2 } : null}
            />
          )}
        </TouchableOpacity>

        <View style={styles.progressBarWrapper}>
          <View style={styles.timestamps}>
            <Text style={[styles.timeText, { color: theme.textPrimary }]}>{formatTime(currentTime)}</Text>
            <Text style={[styles.timeText, { color: theme.textMuted }]}>{formatTime(duration || 180)}</Text>
          </View>
          
          <View style={[styles.barBackground, { backgroundColor: theme.border }]}>
            <View 
              style={[
                styles.barProgress, 
                { 
                  backgroundColor: theme.primary,
                  width: `${progressPercent || 0}%`
                }
              ]} 
            />
          </View>
        </View>
      </View>
    </View>
  );
}

export default function SessionScreen({ route, navigation }) {
  const { sessionId } = route.params;
  const { theme } = useTheme();
  const { showAlert } = useAlert();

  const [session, setSession] = useState(null);
  const [course, setCourse] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchSessionData = useCallback(async () => {
    try {
      setError(null);
      const coursesRes = await getMyCourses();
      const enrolledCourses = coursesRes.data || [];
      
      let foundSession = null;
      let foundCourse = null;

      // Find the course session
      for (const c of enrolledCourses) {
        try {
          const sessionsRes = await getSessions(c._id);
          foundSession = (sessionsRes.data || []).find(s => s._id === sessionId);
          if (foundSession) {
            foundCourse = c;
            break;
          }
        } catch (e) {
          // Continue searching
        }
      }

      if (!foundSession) {
        setError('Session details could not be found.');
        setLoading(false);
        return;
      }

      setSession(foundSession);
      setCourse(foundCourse);

      // Fetch uploads associated with this session
      const uploadsRes = await getUploads(sessionId);
      setUploadedFiles(uploadsRes.data || []);
    } catch (err) {
      console.error('Error fetching session details:', err);
      setError('Failed to load session study materials.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSessionData();
  }, [fetchSessionData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSessionData();
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.bgMain }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const formattedDate = session?.date 
    ? new Date(session.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgMain }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]} numberOfLines={1}>
            {session?.title || 'Session Content'}
          </Text>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]} numberOfLines={1}>
            {course?.title || 'Course'}
          </Text>
        </View>
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
            <TouchableOpacity style={[styles.retryButton, { backgroundColor: theme.primary }]} onPress={fetchSessionData}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Session Overview Card Banner */}
            <View style={[styles.overviewCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
              <View style={styles.overviewMeta}>
                <View style={[styles.iconWrapper, { backgroundColor: theme.primarySurface }]}>
                  <Feather name="hash" size={16} color={theme.primary} />
                </View>
                <View>
                  <Text style={[styles.overviewLabel, { color: theme.textMuted }]}>LECTURE TIMELINE</Text>
                  <Text style={[styles.overviewDate, { color: theme.textPrimary }]}>{formattedDate}</Text>
                </View>
              </View>
              <Text style={[styles.overviewDesc, { color: theme.textSecondary }]}>
                Below are the AI-powered learning resources generated for this lecture. Switch to the study guide to access interactive flashcards, Q&As, and custom quizzes.
              </Text>
            </View>

            {/* List Header */}
            <View style={styles.titleRow}>
              <View style={[styles.accentBar, { backgroundColor: theme.primary }]} />
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>AI Workspaces</Text>
            </View>

            {uploadedFiles.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                <Feather name="folder-minus" size={40} color={theme.textMuted} style={{ marginBottom: 12 }} />
                <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Workspaces Ready</Text>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  Your mentor hasn't uploaded study summaries or recording materials for this session yet.
                </Text>
              </View>
            ) : (
              uploadedFiles.map((file) => {
                const isAudio = file.mimetype?.startsWith('audio/');
                
                return (
                  <View 
                    key={file._id} 
                    style={[styles.materialCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
                  >
                    {/* File Header */}
                    <View style={styles.cardHeader}>
                      <View style={[styles.fileIconWrapper, { backgroundColor: theme.primarySurface }]}>
                        <Feather name={isAudio ? 'mic' : 'file-text'} size={22} color={theme.primary} />
                      </View>
                      
                      <View style={styles.fileInfo}>
                        <Text style={[styles.fileName, { color: theme.textPrimary }]} numberOfLines={1}>
                          {file.originalname || 'Study Guide Source'}
                        </Text>
                        <View style={styles.fileMetaRow}>
                          <Text style={[styles.metaText, { color: theme.textMuted }]}>
                            {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Study Guide'}
                          </Text>
                          <Text style={[styles.metaDivider, { color: theme.textMuted }]}>•</Text>
                          <View style={styles.statusBadge}>
                            <View style={[styles.statusDot, { backgroundColor: file.isProcessed ? theme.success : '#ffb300' }]} />
                            <Text style={[styles.statusText, { color: file.isProcessed ? theme.success : '#ffb300' }]}>
                              {file.isProcessed ? 'Processed & Ready' : 'Processing...'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Integrated Audio Deck */}
                    {isAudio && <AudioPlayer url={file.fileUrls?.[0]} />}

                    {/* High-Yield Stat Badges if Processed */}
                    {file.isProcessed && (
                      <View style={styles.statsRow}>
                        <View style={[styles.statBadge, { backgroundColor: 'rgba(255,255,255,0.03)' }]}>
                          <Feather name="zap" size={11} color={theme.primary} style={{ marginRight: 4 }} />
                          <Text style={[styles.statText, { color: theme.textSecondary }]}>
                            {file.stats?.flashcards || 0} Cards
                          </Text>
                        </View>
                        <View style={[styles.statBadge, { backgroundColor: 'rgba(255,255,255,0.03)' }]}>
                          <Feather name="message-square" size={11} color={theme.primary} style={{ marginRight: 4 }} />
                          <Text style={[styles.statText, { color: theme.textSecondary }]}>
                            {file.stats?.interview || 0} Q&As
                          </Text>
                        </View>
                        <View style={[styles.statBadge, { backgroundColor: 'rgba(255,255,255,0.03)' }]}>
                          <Feather name="help-circle" size={11} color={theme.primary} style={{ marginRight: 4 }} />
                          <Text style={[styles.statText, { color: theme.textSecondary }]}>
                            {file.stats?.quiz || 0} Quizzes
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Enter Workspace Button */}
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: theme.primary }]}
                      activeOpacity={0.8}
                      onPress={() => {
                        if (!file.isProcessed) {
                          showAlert('Processing', 'AI is still parsing this study material. Please try again in a few seconds.', 'info');
                        } else {
                          navigation.navigate('StudyGuide', { sessionId, uploadId: file._id });
                        }
                      }}
                    >
                      <Feather 
                        name="book-open" 
                        size={15} 
                        color="#0F172A" 
                        style={{ marginRight: 8 }} 
                      />
                      <Text style={styles.actionButtonText}>
                        Enter AI Study Workspace
                      </Text>
                    </TouchableOpacity>
                  </View>
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
  headerTitleContainer: {
    marginLeft: 0,
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  headerSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 80, // Leaves room for floating navigation bar
  },
  overviewCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    marginBottom: 28,
  },
  overviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  overviewLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  overviewDate: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 1,
  },
  overviewDesc: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  accentBar: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
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
  materialCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14.5,
    fontWeight: '700',
    marginBottom: 4,
  },
  fileMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600',
  },
  metaDivider: {
    marginHorizontal: 6,
    fontSize: 11,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  playerContainer: {
    marginTop: 16,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  playerMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ff4d4d',
    marginRight: 6,
  },
  playerTitle: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  playerControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  progressBarWrapper: {
    flex: 1,
  },
  timestamps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  barBackground: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barProgress: {
    height: '100%',
    borderRadius: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 14,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  statText: {
    fontSize: 10,
    fontWeight: '700',
  },
  actionButton: {
    height: 44,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  actionButtonText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
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

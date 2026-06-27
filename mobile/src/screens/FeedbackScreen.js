import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAlert } from '../context/AlertContext';
import { getMyCourses, getSessions, submitFeedback, getStudentFeedbacks } from '../services/api';
import { Feather } from '@expo/vector-icons';

export default function FeedbackScreen() {
  const { theme, isDarkMode } = useTheme();
  const { showAlert } = useAlert();
  const todayStr = new Date().toISOString().split('T')[0];

  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [submittedSessionIds, setSubmittedSessionIds] = useState([]);
  
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState('');
  
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [showSessionDropdown, setShowSessionDropdown] = useState(false);

  const fetchFeedbackData = async () => {
    try {
      setLoading(true);
      const [coursesRes, feedbacksRes] = await Promise.all([
        getMyCourses(),
        getStudentFeedbacks()
      ]);

      const studentCourses = coursesRes.data || [];
      setCourses(studentCourses);

      // Extract already submitted session IDs to block duplicates
      const feedbackIds = (feedbacksRes.data || []).map(f => f.sessionId || f.session?._id || f.session);
      setSubmittedSessionIds(feedbackIds);

      // Load all sessions for enrolled courses in parallel
      const sessionPromises = studentCourses.map(course => 
        getSessions(course._id)
          .then(res => (res.data || []).map(s => ({
            ...s,
            courseId: course._id,
            courseTitle: course.title,
            mentorName: course.mentors?.[0]?.name || 'Assigned Mentor'
          })))
          .catch(() => [])
      );

      const allSessionsArrays = await Promise.all(sessionPromises);
      const combinedSessions = allSessionsArrays.flat();
      setSessions(combinedSessions);

    } catch (err) {
      console.error('Failed to load feedback details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbackData();
  }, []);

  // Filter sessions occurring today
  const todaysSessions = useMemo(() => {
    return sessions.filter(session => session.date === todayStr);
  }, [sessions, todayStr]);

  // Fallback: If no sessions are scheduled for today, let the student review any session for testing/demo ease.
  const isFallbackMode = todaysSessions.length === 0;
  const activeSessionsList = isFallbackMode ? sessions : todaysSessions;

  // Determine available courses based on sessions list
  const availableCourses = useMemo(() => {
    const courseIds = new Set(activeSessionsList.map(s => s.courseId));
    return courses.filter(c => courseIds.has(c._id));
  }, [courses, activeSessionsList]);

  // Sync selected Course
  useEffect(() => {
    if (availableCourses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(availableCourses[0]._id);
    }
  }, [availableCourses]);

  // Filter sessions for the selected course
  const sessionsForSelectedCourse = useMemo(() => {
    return activeSessionsList.filter(s => s.courseId === selectedCourseId);
  }, [activeSessionsList, selectedCourseId]);

  // Sync selected Session
  useEffect(() => {
    if (sessionsForSelectedCourse.length > 0) {
      setSelectedSessionId(sessionsForSelectedCourse[0]._id);
    } else {
      setSelectedSessionId('');
    }
  }, [sessionsForSelectedCourse]);

  const selectedCourse = courses.find(c => c._id === selectedCourseId);
  const selectedSession = sessions.find(s => s._id === selectedSessionId);
  
  const hasAlreadySubmitted = submittedSessionIds.includes(selectedSessionId);

  const handleSubmit = async () => {
    if (!selectedSessionId) {
      showAlert('Incomplete', 'Please select a session to review.', 'error');
      return;
    }

    if (hasAlreadySubmitted) {
      showAlert('Already Reviewed', 'You have already submitted feedback for this lecture session.', 'info');
      return;
    }

    if (rating === 0) {
      showAlert('Incomplete', 'Please tap a star to select a rating.', 'error');
      return;
    }

    if (!comments.trim()) {
      showAlert('Incomplete', 'Please write your feedback in the comment box.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await submitFeedback({
        sessionId: selectedSessionId,
        rating,
        comment: comments.trim(),
        isAnonymous
      });

      showAlert('Thank You!', 'Your detailed review was securely submitted to your mentor.', 'success');
      
      // Update local state to block double submission
      setSubmittedSessionIds(prev => [...prev, selectedSessionId]);
      setComments('');
      setRating(0);
      setIsAnonymous(false);

    } catch (err) {
      console.error('Feedback submit error:', err);
      showAlert('Error', err.response?.data?.msg || err.response?.data?.message || 'Failed to submit feedback.', 'error');
    } finally {
      setSubmitting(false);
    }
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
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        
        {/* Header */}
        <Text style={[styles.title, { color: theme.textPrimary }]}>Session Feedback</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Submit comments and overall ratings for today's lectures.
        </Text>

        {/* Today's date banner */}
        <View style={[styles.dateBanner, { backgroundColor: theme.primarySurface, borderColor: theme.border }]}>
          <Feather name="calendar" size={16} color={theme.primary} style={{ marginRight: 8 }} />
          <Text style={[styles.dateText, { color: theme.primary }]}>
            Today: {new Date(`${todayStr}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </Text>
        </View>

        {isFallbackMode && sessions.length > 0 && (
          <View style={[styles.infoBanner, { backgroundColor: isDarkMode ? '#1a1005' : '#fff9f0', borderColor: '#d4af37' }]}>
            <Feather name="info" size={14} color="#d4af37" style={{ marginRight: 8 }} />
            <Text style={[styles.infoText, { color: isDarkMode ? '#e0d0b0' : '#8a6d1c' }]}>
              Demo Mode: Showing all sessions (No live sessions scheduled for today).
            </Text>
          </View>
        )}

        {sessions.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <Feather name="alert-circle" size={36} color={theme.textMuted} style={{ marginBottom: 12 }} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Sessions Available</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              There are no lecture sessions registered in your enrolled courses.
            </Text>
          </View>
        ) : (
          <View style={[styles.formCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            
            {/* Course Selector Dropdown */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>COURSE</Text>
              <TouchableOpacity 
                style={[styles.dropdownTrigger, { borderColor: theme.border, backgroundColor: theme.bgMain }]}
                onPress={() => {
                  setShowCourseDropdown(!showCourseDropdown);
                  setShowSessionDropdown(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.dropdownValue, { color: selectedCourseId ? theme.textPrimary : theme.textMuted }]} numberOfLines={1}>
                  {selectedCourse?.title || 'Choose course...'}
                </Text>
                <Feather name={showCourseDropdown ? 'chevron-up' : 'chevron-down'} size={18} color={theme.textSecondary} />
              </TouchableOpacity>

              {showCourseDropdown && (
                <View style={[styles.dropdownMenu, { borderColor: theme.border, backgroundColor: theme.bgMain }]}>
                  {availableCourses.map((c) => (
                    <TouchableOpacity
                      key={c._id}
                      style={[styles.dropdownItem, { borderBottomColor: theme.border }]}
                      onPress={() => {
                        setSelectedCourseId(c._id);
                        setShowCourseDropdown(false);
                      }}
                    >
                      <Text style={[styles.dropdownItemText, { color: theme.textPrimary }]}>{c.title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Session Selector Dropdown */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>SESSION</Text>
              <TouchableOpacity 
                style={[styles.dropdownTrigger, { borderColor: theme.border, backgroundColor: theme.bgMain }]}
                onPress={() => {
                  setShowSessionDropdown(!showSessionDropdown);
                  setShowCourseDropdown(false);
                }}
                activeOpacity={0.8}
                disabled={sessionsForSelectedCourse.length === 0}
              >
                <Text style={[styles.dropdownValue, { color: selectedSessionId ? theme.textPrimary : theme.textMuted }]} numberOfLines={1}>
                  {selectedSession?.title || (sessionsForSelectedCourse.length === 0 ? 'No sessions available' : 'Choose session...')}
                </Text>
                <Feather name={showSessionDropdown ? 'chevron-up' : 'chevron-down'} size={18} color={theme.textSecondary} />
              </TouchableOpacity>

              {showSessionDropdown && (
                <View style={[styles.dropdownMenu, { borderColor: theme.border, backgroundColor: theme.bgMain }]}>
                  {sessionsForSelectedCourse.map((s) => (
                    <TouchableOpacity
                      key={s._id}
                      style={[styles.dropdownItem, { borderBottomColor: theme.border }]}
                      onPress={() => {
                        setSelectedSessionId(s._id);
                        setShowSessionDropdown(false);
                      }}
                    >
                      <Text style={[styles.dropdownItemText, { color: theme.textPrimary }]}>{s.title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Mentor Badge Display */}
            {selectedSession && (
              <View style={[styles.mentorBadge, { backgroundColor: theme.bgMain, borderColor: theme.border }]}>
                <Feather name="user" size={14} color={theme.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.mentorText, { color: theme.textSecondary }]}>
                  Mentor: <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>{selectedSession.mentorName}</Text>
                </Text>
              </View>
            )}

            {/* Rating Stars Deck */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>OVERALL RATING</Text>
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const isGold = star <= rating;
                  return (
                    <TouchableOpacity
                      key={star}
                      onPress={() => {
                        if (!hasAlreadySubmitted) setRating(star);
                      }}
                      activeOpacity={0.7}
                      disabled={hasAlreadySubmitted}
                      style={styles.starTouch}
                    >
                      <Feather 
                        name="star" 
                        size={32} 
                        color={isGold ? '#4F46E5' : theme.textMuted} 
                        fill={isGold ? '#4F46E5' : 'transparent'} 
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
              {rating > 0 && (
                <Text style={[styles.ratingCaption, { color: theme.primary }]}>
                  {rating === 1 ? 'Poor 😞' : rating === 2 ? 'Fair 😐' : rating === 3 ? 'Good 🙂' : rating === 4 ? 'Very Good 😃' : 'Excellent! 🤩'}
                </Text>
              )}
            </View>

            {/* Comments Input */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>DETAILED FEEDBACK</Text>
              <TextInput
                style={[
                  styles.commentBox, 
                  { 
                    borderColor: theme.border, 
                    backgroundColor: theme.bgMain,
                    color: theme.textPrimary
                  }
                ]}
                placeholder="What did you think of today's session? Any suggestions for improvement?"
                placeholderTextColor={theme.textMuted}
                multiline={true}
                numberOfLines={6}
                value={comments}
                onChangeText={setComments}
                textAlignVertical="top"
                editable={!hasAlreadySubmitted}
              />
            </View>

            {/* Anonymous Toggle Box */}
            <TouchableOpacity
              style={[styles.anonymousCard, { backgroundColor: theme.primarySurface, borderColor: theme.border }]}
              onPress={() => {
                if (!hasAlreadySubmitted) setIsAnonymous(!isAnonymous);
              }}
              activeOpacity={0.8}
              disabled={hasAlreadySubmitted}
            >
              <View style={styles.anonymousLeft}>
                <View style={[styles.shieldIconBox, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.7)' }]}>
                  <Feather name="shield" size={16} color={theme.primary} />
                </View>
                <View style={styles.anonymousTextWrapper}>
                  <Text style={[styles.anonymousTitle, { color: theme.textPrimary }]}>Submit Anonymously</Text>
                  <Text style={[styles.anonymousSub, { color: theme.textSecondary }]}>
                    Protect your privacy while sharing honest thoughts.
                  </Text>
                </View>
              </View>
              <View style={[
                styles.checkbox, 
                { 
                  borderColor: theme.primary, 
                  backgroundColor: isAnonymous ? theme.primary : 'transparent' 
                }
              ]}>
                {isAnonymous && <Feather name="check" size={14} color={isDarkMode ? '#0F172A' : '#ffffff'} strokeWidth={3} />}
              </View>
            </TouchableOpacity>

            {/* Double Review Safeguard Banner */}
            {hasAlreadySubmitted && (
              <View style={[styles.submittedBadge, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' }]}>
                <Feather name="check-circle" size={16} color={theme.success} style={{ marginRight: 8 }} />
                <Text style={[styles.submittedText, { color: theme.success }]}>
                  You have already submitted feedback for this session.
                </Text>
              </View>
            )}

            {/* Submit button */}
            <TouchableOpacity
              style={[
                styles.submitButton, 
                { backgroundColor: theme.primary },
                (submitting || !selectedSessionId || hasAlreadySubmitted) ? { opacity: 0.5 } : null
              ]}
              onPress={handleSubmit}
              disabled={submitting || !selectedSessionId || hasAlreadySubmitted}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator color={isDarkMode ? '#000' : '#fff'} />
              ) : (
                <View style={styles.buttonContent}>
                  <Feather name="send" size={16} color={isDarkMode ? '#000' : '#fff'} style={{ marginRight: 8 }} />
                  <Text style={[styles.submitText, { color: isDarkMode ? '#000' : '#fff' }]}>
                    {hasAlreadySubmitted ? 'Feedback Submitted' : 'Submit Feedback'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

          </View>
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
  scrollContainer: {
    padding: 20,
    paddingTop: 20,
    paddingBottom: 100,
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
  dateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
  },
  infoText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
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
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  formCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 14,
  },
  dropdownValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  dropdownMenu: {
    borderWidth: 1,
    borderRadius: 14,
    marginTop: 8,
    overflow: 'hidden',
    zIndex: 100,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '500',
  },
  mentorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginTop: -8,
    marginBottom: 20,
  },
  mentorText: {
    fontSize: 12,
    fontWeight: '500',
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starTouch: {
    marginRight: 10,
  },
  ratingCaption: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  commentBox: {
    borderWidth: 1,
    borderRadius: 16,
    height: 120,
    padding: 14,
    fontSize: 14,
    lineHeight: 20,
  },
  anonymousCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  anonymousLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  shieldIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  anonymousTextWrapper: {
    flex: 1,
  },
  anonymousTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  anonymousSub: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submittedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 20,
  },
  submittedText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  submitButton: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitText: {
    fontSize: 15,
    fontWeight: '700',
  },
});

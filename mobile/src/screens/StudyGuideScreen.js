import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  SafeAreaView,
  Dimensions,
  Animated,
  Platform,
  StatusBar,
  Linking
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAlert } from '../context/AlertContext';
import { getUploadStatus, getFlashcards, getInterviewQuestions, getQuiz } from '../services/api';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// 3D Flip Card Component for Flashcards using native Animated API
function FlipCard({ question, answer }) {
  const { theme, isDarkMode } = useTheme();
  const [isFlipped, setIsFlipped] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const value = useRef(0);

  useEffect(() => {
    animatedValue.addListener(({ value: val }) => {
      value.current = val;
    });
    return () => animatedValue.removeAllListeners();
  }, []);

  // Set card flip state based on current card updates
  useEffect(() => {
    setIsFlipped(false);
    animatedValue.setValue(0);
  }, [question, answer]);

  const flipCard = () => {
    if (isFlipped) {
      Animated.spring(animatedValue, {
        toValue: 0,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(animatedValue, {
        toValue: 180,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start();
    }
    setIsFlipped(!isFlipped);
  };

  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  return (
    <TouchableOpacity 
      style={styles.cardContainer} 
      onPress={flipCard} 
      activeOpacity={0.95}
    >
      <View style={styles.cardWrapper}>
        {/* Front Card */}
        <Animated.View 
          style={[
            styles.flipCardSide, 
            frontAnimatedStyle, 
            { 
              backgroundColor: isDarkMode ? '#111111' : '#ffffff', 
              borderColor: theme.border,
              shadowColor: isDarkMode ? '#0F172A' : theme.primaryGlow
            }
          ]}
        >
          <View style={[styles.goldBar, { backgroundColor: theme.primary }]} />
          <Text style={[styles.cardRoleLabel, { color: theme.primary }]}>QUESTION</Text>
          <ScrollView 
            style={styles.cardScrollView} 
            contentContainerStyle={styles.cardScrollContent} 
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.cardTitleText, { color: theme.textPrimary }]}>
              {question}
            </Text>
          </ScrollView>
          <Text style={[styles.tapToFlipText, { color: theme.textMuted }]}>
            Tap Card to Flip
          </Text>
        </Animated.View>

        {/* Back Card */}
        <Animated.View 
          style={[
            styles.flipCardSide, 
            styles.flipCardBack, 
            backAnimatedStyle, 
            { 
              backgroundColor: isDarkMode ? '#1a1208' : '#faf5eb', 
              borderColor: theme.primary,
              shadowColor: isDarkMode ? '#0F172A' : theme.primaryGlow
            }
          ]}
        >
          <View style={[styles.goldBar, { backgroundColor: theme.primary }]} />
          <Text style={[styles.cardRoleLabel, { color: theme.primary }]}>ANSWER</Text>
          <ScrollView 
            style={styles.cardScrollView} 
            contentContainerStyle={styles.cardScrollContent} 
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.cardBodyText, { color: isDarkMode ? '#e0d0b0' : theme.textPrimary }]}>
              {answer}
            </Text>
          </ScrollView>
          <Text style={[styles.tapToFlipText, { color: theme.textMuted }]}>
            Tap Card to Flip
          </Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

// Accordion Item Component for Interview Prep
function InterviewAccordionItem({ index, question, answer }) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;

  const toggleAccordion = () => {
    if (isOpen) {
      Animated.timing(animatedHeight, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(animatedHeight, {
        toValue: 120, // Approximate height for answers, scrollable anyway
        duration: 250,
        useNativeDriver: false,
      }).start();
    }
    setIsOpen(!isOpen);
  };

  return (
    <View 
      style={[
        styles.accordionCard, 
        { 
          backgroundColor: isOpen ? theme.primarySurface : theme.bgCard,
          borderColor: isOpen ? theme.primary : theme.border 
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.accordionHeader} 
        onPress={toggleAccordion}
        activeOpacity={0.8}
      >
        <View style={styles.accordionLeft}>
          <View style={[styles.accordionIndexWrapper, { backgroundColor: theme.border }]}>
            <Text style={[styles.accordionIndex, { color: theme.textSecondary }]}>
              {(index + 1).toString().padStart(2, '0')}
            </Text>
          </View>
          <Text style={[styles.accordionQuestion, { color: theme.textPrimary }]}>
            {question}
          </Text>
        </View>
        <Feather name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={theme.textSecondary} />
      </TouchableOpacity>

      {isOpen && (
        <View style={[styles.accordionContent, { borderLeftColor: theme.primary }]}>
          <Text style={[styles.accordionAnswerText, { color: theme.textSecondary }]}>
            {answer}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function StudyGuideScreen({ route, navigation }) {
  const { sessionId, uploadId } = route.params;
  const { theme, isDarkMode } = useTheme();
  const { showAlert } = useAlert();

  // Active Workspace Tab
  const [activeTab, setActiveTab] = useState('summary'); // summary, flashcards, interview, quiz

  // Data states
  const [upload, setUpload] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(true);

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState({}); // { questionIndex: selectedOptionIndex }
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const fetchStudyData = async () => {
    try {
      setLoading(true);
      
      // Fetch Upload Status
      const uploadRes = await getUploadStatus(uploadId);
      setUpload(uploadRes.data);

      // Fetch Flashcards
      try {
        const fcRes = await getFlashcards(sessionId);
        const data = fcRes.data;
        const cardsArray = data.cards || data.flashcards || (Array.isArray(data) ? data : []);
        const mappedCards = cardsArray.map(c => ({
          question: c.topic || c.question || 'No Question',
          answer: c.description || c.answer || 'No Answer'
        }));
        setFlashcards(mappedCards);
      } catch (e) {
        console.log('No flashcards generated yet');
      }

      // Fetch Interview
      try {
        const intRes = await getInterviewQuestions(sessionId);
        const questionsArray = intRes.data.questions || (Array.isArray(intRes.data) ? intRes.data : []);
        setInterviewQuestions(questionsArray);
      } catch (e) {
        console.log('No interview prep questions yet');
      }

      // Fetch Quiz
      try {
        const quizRes = await getQuiz(sessionId);
        const questionsArray = quizRes.data.questions || (Array.isArray(quizRes.data) ? quizRes.data : []);
        const mappedQuiz = questionsArray.map(q => {
          let correctIdx = q.options?.indexOf(q.correctAnswer) ?? -1;
          if (correctIdx === -1 && q.correct !== undefined) correctIdx = q.correct;
          return { ...q, correct: correctIdx };
        });
        setQuiz(mappedQuiz);
      } catch (e) {
        console.log('No quiz generated yet');
      }

    } catch (err) {
      console.error('Error fetching study guide details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudyData();
  }, [sessionId, uploadId]);

  const handleOpenPdf = () => {
    if (upload?.pdfUrl) {
      Linking.openURL(upload.pdfUrl).catch((err) => 
        showAlert('Error', 'Unable to open PDF link. Please check your browser.', 'error')
      );
    } else {
      showAlert('Unavailable', 'PDF study guide is still being generated. Please check back shortly.', 'info');
    }
  };

  const handleQuizSelect = (questionIndex, optionIndex) => {
    if (quizSubmitted) return;
    setQuizAnswers({
      ...quizAnswers,
      [questionIndex]: optionIndex
    });
  };

  const submitQuiz = () => {
    if (Object.keys(quizAnswers).length < quiz.length) {
      showAlert('Incomplete', 'Please answer all questions before submitting.', 'error');
      return;
    }
    
    let score = 0;
    quiz.forEach((q, i) => {
      if (quizAnswers[i] === q.correct) {
        score++;
      }
    });

    setQuizScore(score);
    setQuizSubmitted(true);
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
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
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>AI Study Guide</Text>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]} numberOfLines={1}>
            {upload?.originalname || 'Study Materials'}
          </Text>
        </View>
      </View>

      {/* Tab Segment Selector */}
      <View style={[styles.tabSelector, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        {[
          { id: 'summary', icon: 'file-text', label: 'Summary' },
          { id: 'flashcards', icon: 'zap', label: 'Cards' },
          { id: 'interview', icon: 'message-square', label: 'Interview' },
          { id: 'quiz', icon: 'help-circle', label: 'Quiz' }
        ].map(tab => {
          const isSelected = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabButton, 
                isSelected ? { backgroundColor: theme.primary } : null
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Feather 
                name={tab.icon} 
                size={14} 
                color={isSelected ? (isDarkMode ? '#0F172A' : '#ffffff') : theme.textSecondary} 
              />
              <Text 
                style={[
                  styles.tabLabel, 
                  { color: isSelected ? (isDarkMode ? '#0F172A' : '#ffffff') : theme.textSecondary }
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Main Study Workspace */}
      <ScrollView contentContainerStyle={styles.workspace}>
        {activeTab === 'summary' && (
          <View style={styles.summaryWorkspace}>
            <View style={[styles.summaryBannerCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
              <View style={[styles.summaryIconBox, { backgroundColor: theme.primarySurface }]}>
                <Feather name="file-text" size={32} color={theme.primary} />
              </View>
              <Text style={[styles.bannerTitle, { color: theme.textPrimary }]}>Summary PDF Generated</Text>
              <Text style={[styles.bannerSubtitle, { color: theme.textSecondary }]}>
                A professional high-yield study sheet has been generated for this session lecture.
              </Text>

              <TouchableOpacity 
                style={[styles.pdfButton, { backgroundColor: theme.primary }]}
                onPress={handleOpenPdf}
              >
                <Feather 
                  name="external-link" 
                  size={16} 
                  color={theme.bgMain === '#0F172A' ? '#0F172A' : '#ffffff'} 
                  style={{ marginRight: 8 }} 
                />
                <Text style={[styles.pdfButtonText, { color: theme.bgMain === '#0F172A' ? '#0F172A' : '#ffffff' }]}>
                  View Full Study Guide PDF
                </Text>
              </TouchableOpacity>
            </View>

            {/* In-app Text Transcript Review */}
            {upload?.transcript ? (
              <View style={[styles.transcriptCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                <Text style={[styles.transcriptTitle, { color: theme.textPrimary }]}>Lecture Transcript Preview</Text>
                <View style={[styles.transcriptScrollArea, { backgroundColor: theme.bgMain, borderColor: theme.border }]}>
                  <ScrollView nestedScrollEnabled={true}>
                    <Text style={[styles.transcriptText, { color: theme.textSecondary }]}>
                      {upload.transcript}
                    </Text>
                  </ScrollView>
                </View>
              </View>
            ) : null}
          </View>
        )}

        {activeTab === 'flashcards' && (
          <View style={styles.flashcardsWorkspace}>
            {flashcards.length > 0 ? (
              <View style={styles.cardsPlayground}>
                <View style={styles.cardsHeader}>
                  <Text style={[styles.cardsMeta, { color: theme.textMuted }]}>
                    CARD {currentCardIndex + 1} OF {flashcards.length}
                  </Text>
                </View>

                {/* Animated 3D flip card */}
                <FlipCard 
                  question={flashcards[currentCardIndex].question} 
                  answer={flashcards[currentCardIndex].answer} 
                />

                {/* Navigation Buttons */}
                <View style={styles.cardsNavRow}>
                  <TouchableOpacity
                    style={[styles.circleNavButton, { borderColor: theme.border, backgroundColor: theme.bgCard }]}
                    onPress={() => setCurrentCardIndex(prev => (prev - 1 + flashcards.length) % flashcards.length)}
                  >
                    <Feather name="chevron-left" size={24} color={theme.textPrimary} />
                  </TouchableOpacity>

                  <View style={styles.dotDeck}>
                    {flashcards.map((_, idx) => (
                      <View 
                        key={idx} 
                        style={[
                          styles.deckDot, 
                          { 
                            backgroundColor: idx === currentCardIndex ? theme.primary : theme.border,
                            width: idx === currentCardIndex ? 18 : 6
                          }
                        ]} 
                      />
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[styles.circleNavButton, { backgroundColor: theme.primary }]}
                    onPress={() => setCurrentCardIndex(prev => (prev + 1) % flashcards.length)}
                  >
                    <Feather 
                      name="chevron-right" 
                      size={24} 
                      color={theme.bgMain === '#0F172A' ? '#0F172A' : '#ffffff'} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={[styles.emptyWorkspaceCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                <Feather name="zap" size={36} color={theme.textMuted} style={{ marginBottom: 12 }} />
                <Text style={[styles.emptyWorkspaceTitle, { color: theme.textPrimary }]}>Flashcards Pending</Text>
                <Text style={[styles.emptyWorkspaceText, { color: theme.textSecondary }]}>
                  AI is still processing the study cards for this session transcript.
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'interview' && (
          <View style={styles.interviewWorkspace}>
            <View style={styles.sectionHeaderBox}>
              <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Interview Mastery</Text>
              <Text style={[styles.sectionSubHeading, { color: theme.textSecondary }]}>
                Accordion prep questions generated directly from your lecture.
              </Text>
            </View>

            {interviewQuestions.length > 0 ? (
              interviewQuestions.map((q, idx) => {
                const answerEntry = Object.entries(q).find(([key, val]) => key !== '_id' && key !== 'question' && typeof val === 'string');
                const answerText = q.answer || q.idealAnswer || q.ideal_answer || q.response || q.expected_answer || (answerEntry ? answerEntry[1] : null) || 'No ideal answer available.';
                return (
                  <InterviewAccordionItem 
                    key={idx} 
                    index={idx} 
                    question={q.question} 
                    answer={answerText} 
                  />
                );
              })
            ) : (
              <View style={[styles.emptyWorkspaceCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                <Feather name="message-square" size={36} color={theme.textMuted} style={{ marginBottom: 12 }} />
                <Text style={[styles.emptyWorkspaceTitle, { color: theme.textPrimary }]}>Interview Questions Pending</Text>
                <Text style={[styles.emptyWorkspaceText, { color: theme.textSecondary }]}>
                  Our interview specialists are curating optimal lecture questions.
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'quiz' && (
          <View style={styles.quizWorkspace}>
            <View style={styles.sectionHeaderBox}>
              <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Practice Quiz</Text>
              <Text style={[styles.sectionSubHeading, { color: theme.textSecondary }]}>
                Test your knowledge and receive immediate feedback.
              </Text>
            </View>

            {quiz.length > 0 ? (
              <>
                {quiz.map((q, qIdx) => {
                  const selectedOption = quizAnswers[qIdx];
                  const hasAnswered = selectedOption !== undefined;

                  return (
                    <View 
                      key={qIdx} 
                      style={[styles.quizCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
                    >
                      <Text style={[styles.quizIndex, { color: theme.primary }]}>
                        QUESTION {(qIdx + 1).toString().padStart(2, '0')}
                      </Text>
                      <Text style={[styles.quizQuestionText, { color: theme.textPrimary }]}>
                        {q.question}
                      </Text>

                      <View style={styles.quizOptionsDeck}>
                        {q.options?.map((opt, oIdx) => {
                          const isSelected = selectedOption === oIdx;
                          let optionBgColor = theme.bgMain;
                          let optionBorderColor = theme.border;

                          if (isSelected) {
                            optionBgColor = theme.primarySurface;
                            optionBorderColor = theme.primary;
                          }

                          if (quizSubmitted) {
                            if (oIdx === q.correct) {
                              optionBgColor = 'rgba(16, 185, 129, 0.15)';
                              optionBorderColor = theme.success;
                            } else if (isSelected) {
                              optionBgColor = 'rgba(239, 68, 68, 0.15)';
                              optionBorderColor = theme.error;
                            }
                          }

                          return (
                            <TouchableOpacity
                              key={oIdx}
                              style={[
                                styles.quizOptionRow, 
                                { 
                                  backgroundColor: optionBgColor, 
                                  borderColor: optionBorderColor 
                                }
                              ]}
                              onPress={() => handleQuizSelect(qIdx, oIdx)}
                              activeOpacity={0.8}
                              disabled={quizSubmitted}
                            >
                              <View 
                                style={[
                                  styles.optionBullet, 
                                  { 
                                    borderColor: isSelected ? theme.primary : theme.textMuted,
                                    backgroundColor: isSelected ? theme.primary : 'transparent'
                                  }
                                ]}
                              >
                                {isSelected && (
                                  <View style={[styles.optionBulletInner, { backgroundColor: isDarkMode ? '#0F172A' : '#ffffff' }]} />
                                )}
                              </View>
                              <Text style={[styles.optionText, { color: theme.textPrimary }]}>
                                {opt}
                              </Text>

                              {quizSubmitted && oIdx === q.correct && (
                                <Feather name="check" size={16} color={theme.success} style={{ marginLeft: 'auto' }} />
                              )}
                              {quizSubmitted && isSelected && oIdx !== q.correct && (
                                <Feather name="x" size={16} color={theme.error} style={{ marginLeft: 'auto' }} />
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}

                {/* Score panel / submit */}
                {!quizSubmitted ? (
                  <TouchableOpacity
                    style={[styles.submitQuizButton, { backgroundColor: theme.primary }]}
                    onPress={submitQuiz}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.submitQuizText, { color: isDarkMode ? '#0F172A' : '#ffffff' }]}>
                      Submit Assessment
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={[styles.scoreCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                    <Feather name="award" size={40} color={theme.primary} style={{ marginBottom: 12 }} />
                    <Text style={[styles.scoreTitle, { color: theme.textPrimary }]}>Assessment Score</Text>
                    <Text style={[styles.scoreLabel, { color: theme.primary }]}>
                      {quizScore} / {quiz.length} Correct
                    </Text>
                    <Text style={[styles.scorePercent, { color: theme.textSecondary }]}>
                      {Math.round((quizScore / quiz.length) * 100)}% Passing Rate
                    </Text>

                    <TouchableOpacity
                      style={[styles.retakeButton, { borderColor: theme.primary }]}
                      onPress={resetQuiz}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.retakeButtonText, { color: theme.primary }]}>Retake Quiz</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            ) : (
              <View style={[styles.emptyWorkspaceCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                <Feather name="help-circle" size={36} color={theme.textMuted} style={{ marginBottom: 12 }} />
                <Text style={[styles.emptyWorkspaceTitle, { color: theme.textPrimary }]}>Quiz Pending</Text>
                <Text style={[styles.emptyWorkspaceText, { color: theme.textSecondary }]}>
                  AI is currently drafting practice assessment questions for this material.
                </Text>
              </View>
            )}
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
  headerTitleContainer: {
    marginLeft: 0,
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  headerSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  tabSelector: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    justifyContent: 'space-between',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 5,
  },
  workspace: {
    padding: 20,
    paddingBottom: 40,
  },
  summaryWorkspace: {
    width: '100%',
  },
  summaryBannerCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryIconBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  pdfButton: {
    height: 46,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  pdfButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  transcriptCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  transcriptTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 14,
  },
  transcriptScrollArea: {
    height: 300,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  transcriptText: {
    fontSize: 13,
    lineHeight: 22,
  },
  flashcardsWorkspace: {
    width: '100%',
  },
  cardsPlayground: {
    alignItems: 'center',
  },
  cardsHeader: {
    marginBottom: 12,
  },
  cardsMeta: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  cardContainer: {
    width: width - 40,
    height: 340,
    perspective: 1000,
  },
  cardWrapper: {
    flex: 1,
  },
  flipCardSide: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backfaceVisibility: 'hidden',
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 3,
  },
  flipCardBack: {
    transform: [{ rotateY: '180deg' }],
  },
  goldBar: {
    width: 40,
    height: 3,
    borderRadius: 1.5,
    position: 'absolute',
    top: 24,
  },
  cardRoleLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    position: 'absolute',
    top: 40,
  },
  cardTitleText: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 28,
  },
  cardScrollView: {
    width: '100%',
    marginTop: 44,
    marginBottom: 20,
  },
  cardScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  cardBodyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
  tapToFlipText: {
    fontSize: 11,
    fontWeight: '600',
    position: 'absolute',
    bottom: 24,
  },
  cardsNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  circleNavButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotDeck: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  deckDot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  interviewWorkspace: {
    width: '100%',
  },
  sectionHeaderBox: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  sectionSubHeading: {
    fontSize: 13,
    lineHeight: 18,
  },
  accordionCard: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 14,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  accordionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  accordionIndexWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accordionIndex: {
    fontSize: 12,
    fontWeight: '700',
  },
  accordionQuestion: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
  accordionContent: {
    padding: 16,
    paddingTop: 0,
    paddingLeft: 56,
    borderLeftWidth: 2,
    marginLeft: 16,
    marginBottom: 16,
  },
  accordionAnswerText: {
    fontSize: 13,
    lineHeight: 20,
  },
  quizWorkspace: {
    width: '100%',
  },
  quizCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 1,
  },
  quizIndex: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  quizQuestionText: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 16,
  },
  quizOptionsDeck: {
    gap: 10,
  },
  quizOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  optionBullet: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionBulletInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  optionText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  submitQuizButton: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitQuizText: {
    fontSize: 15,
    fontWeight: '700',
  },
  scoreCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  scoreLabel: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  scorePercent: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 20,
  },
  retakeButton: {
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  retakeButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyWorkspaceCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyWorkspaceTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyWorkspaceText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});

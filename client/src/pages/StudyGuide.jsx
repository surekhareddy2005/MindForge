import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  BookOpen, 
  FileText, 
  HelpCircle, 
  MessageSquare, 
  Zap,
  Brain,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Maximize2,
  Minimize2,
  Download,
  ExternalLink,
  Search
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Chatbot from '../components/Chatbot';
import { getUploadStatus, getFlashcards, getInterviewQuestions, getQuiz, getUploadPdf } from '../services/api';
import DotsLoader from '../components/DotsLoader';

const InterviewAccordionItem = ({ question, answer, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      initial={false}
      animate={{ 
        backgroundColor: isOpen ? 'rgba(79, 70, 229, 0.05)' : 'rgba(255,255,255,0.01)',
        borderColor: isOpen ? 'rgba(79, 70, 229, 0.3)' : 'rgba(255,255,255,0.05)'
      }}
      whileHover={!isOpen ? { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)' } : {}}
      style={{ 
        marginBottom: '1rem',
        borderRadius: '20px',
        border: '1px solid',
        overflow: 'hidden',
        transition: 'all 0.3s ease'
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
          <div style={{ 
            color: isOpen ? 'var(--primary)' : 'var(--text-muted)', 
            fontSize: '0.9rem', 
            fontWeight: 800, 
            fontFamily: 'Montserrat, sans-serif',
            background: isOpen ? 'rgba(79, 70, 229, 0.1)' : 'rgba(255,255,255,0.05)',
            padding: '4px 12px',
            borderRadius: '12px',
            transition: 'all 0.3s ease'
          }}>
            {(index + 1).toString().padStart(2, '0')}
          </div>
          <h4 style={{ 
            fontFamily: 'Montserrat, sans-serif', 
            fontSize: '1.1rem', 
            color: isOpen ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: 500,
            transition: 'color 0.3s ease',
            lineHeight: 1.6,
            margin: 0,
            paddingTop: '2px'
          }}>
            {question}
          </h4>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          style={{ 
            color: isOpen ? 'var(--primary)' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingLeft: '1rem'
          }}
        >
          <ChevronDown size={20} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div style={{ 
              padding: '0 2rem 2.5rem 6.5rem', 
              color: 'var(--text-secondary)',
              lineHeight: 1.8,
              fontSize: '1.05rem',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              <div style={{ 
                borderLeft: '2px solid rgba(79, 70, 229, 0.5)', 
                paddingLeft: '1.5rem',
                opacity: 0.9
              }}>
                {answer}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const EmptyState = ({ title, subtitle }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '4rem', 
      textAlign: 'center',
      gap: '1.5rem'
    }}
  >
    <div style={{
      width: '80px',
      height: '80px',
      background: 'rgba(79, 70, 229, 0.05)',
      borderRadius: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--primary)',
      border: '1px solid rgba(79, 70, 229, 0.1)',
      marginBottom: '1rem'
    }}>
      <Brain size={40} />
    </div>
    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: 'var(--text-primary)' }}>{title}</h3>
    <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: 1.6 }}>{subtitle}</p>
  </motion.div>
);

const StudyGuide = () => {
  const { sessionId, uploadId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const backToSessionPath = user.role === 'student' ? `/student/session/${sessionId}` : `/session/${sessionId}`;
  const queryParams = new URLSearchParams(window.location.search);
  const initialTab = queryParams.get('tab') || 'summary';
  const [activeTab, setActiveTab] = useState(initialTab === 'pdf' ? 'summary' : initialTab);

  // Dynamic Data States
  const [flashcards, setFlashcards] = useState([]);
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [quiz, setQuiz] = useState([]);
  const [pdfUrl, setPdfUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Component States
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [currentInterviewPage, setCurrentInterviewPage] = useState(0);
  const [currentQuizPage, setCurrentQuizPage] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchStudyData = async () => {
      try {
        setLoading(true);
        if (!uploadId) return;
        
        // Fetch upload status for PDF
        try {
          const statusRes = await getUploadStatus(uploadId);
          if (statusRes.data && statusRes.data.pdfUrl) setPdfUrl(statusRes.data.pdfUrl);
        } catch (e) { console.log('Could not fetch status', e); }

        // Fetch Flashcards
        try {
          const fcRes = await getFlashcards(sessionId);
          const data = fcRes.data;
          const cardsArray = data.cards || data.flashcards || (Array.isArray(data) ? data : []);
          
          if (cardsArray.length > 0) {
            const mappedCards = cardsArray.map(c => ({
              question: c.topic || c.question || 'No Question',
              answer: c.description || c.answer || 'No Answer'
            }));
            setFlashcards(mappedCards);
          }
        } catch (e) { console.log('No flashcards yet'); }

        // Fetch Interview
        try {
          const intRes = await getInterviewQuestions(sessionId);
          const intData = intRes.data;
          const intQuestions = intData.questions || (Array.isArray(intData) ? intData : []);
          setInterviewQuestions(intQuestions);
        } catch (e) { console.log('No interview yet'); }

        // Fetch Quiz
        try {
          const quizRes = await getQuiz(sessionId);
          const qData = quizRes.data;
          const qQuestions = qData.questions || (Array.isArray(qData) ? qData : []);
          
          if (qQuestions.length > 0) {
            const mappedQuiz = qQuestions.map(q => {
              let correctIndex = -1;
              if (q.options && q.correctAnswer) {
                // Exact match (case-insensitive)
                correctIndex = q.options.findIndex(opt => 
                  opt.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
                );
                // Partial match
                if (correctIndex === -1) {
                  correctIndex = q.options.findIndex(opt =>
                    opt.trim().toLowerCase().includes(q.correctAnswer.trim().toLowerCase()) ||
                    q.correctAnswer.trim().toLowerCase().includes(opt.trim().toLowerCase())
                  );
                }
              }
              // Fallback to numeric correct field
              if (correctIndex === -1 && typeof q.correct === 'number') correctIndex = q.correct;
              // If still -1 (old data without correctAnswer), mark as -1 so no answer is highlighted
              return {
                ...q,
                correct: correctIndex,
                hasCorrectAnswer: correctIndex !== -1
              };
            });
            setQuiz(mappedQuiz);
          }
        } catch (e) { console.log('No quiz yet'); }

      } catch (error) {
        console.error("Error fetching study materials:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudyData();
  }, [uploadId]);

  const handleDownload = async () => {
    if (!uploadId) return;
    try {
      setDownloadingPdf(true);
      // Use the backend proxy route which now forces an 'attachment' header
      console.log("Starting download for uploadId:", uploadId);
      const response = await getUploadPdf(uploadId);
      
      // Creating blob from response data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `MindForge_Study_Guide_${uploadId.substring(0, 6)}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
    } catch (error) {
      console.error("Detailed Download Error:", error);
      // Last resort fallback
      if (pdfUrl) window.open(pdfUrl, '_blank');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const toggleFullScreen = () => {
    const element = document.getElementById('study-guide-content');
    if (!isFullScreen) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  const handleNextCard = () => {
    setShowAnswer(false);
    setCurrentFlashcard((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevCard = () => {
    setShowAnswer(false);
    setCurrentFlashcard((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const handleQuizSelect = (qIdx, oIdx) => {
    if (showResults) return;
    setQuizAnswers({ ...quizAnswers, [qIdx]: oIdx });
  };

  const calculateScore = () => {
    let score = 0;
    quiz.forEach((q, i) => {
      if (quizAnswers[i] === q.correct) score++;
    });
    return score;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2rem 3rem' }}>
        <Header title="Study Guide" subtitle="Interactive learning materials generated from your lecture" />

        <div style={{ marginBottom: '2rem' }}>
        </div>

        {loading ? (
          <DotsLoader label="Retrieving study materials..." sublabel="Loading the PDF, flashcards, interview questions, and quiz data." minHeight="50vh" />
        ) : (
          <div id="study-guide-content" style={{ 
            maxWidth: isFullScreen ? 'none' : '1000px', 
            width: '100%',
            background: isFullScreen ? 'var(--bg-main)' : 'transparent',
            padding: isFullScreen ? '3rem' : '0',
            overflowY: 'auto',
            maxHeight: isFullScreen ? '100vh' : 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem'
          }}>
          {/* Navigation Tabs & Fullscreen Toggle (Centered) */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2rem' }}>
            <div className="glass" style={{ display: 'inline-flex', padding: '6px', borderRadius: '14px', gap: '8px', border: '1px solid var(--border)' }}>
              {[
                { id: 'summary', icon: <FileText size={18} />, label: 'Summary PDF' },
                { id: 'flashcards', icon: <Zap size={18} />, label: 'Flashcards' },
                { id: 'interview', icon: <MessageSquare size={18} />, label: 'Interview Qs' },
                { id: 'quiz', icon: <HelpCircle size={18} />, label: 'Quiz' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                    color: activeTab === tab.id ? '#1a1a1a' : 'var(--text-secondary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>


            <button
              onClick={toggleFullScreen}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '12px',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                background: 'rgba(255,255,255,0.03)',
                color: 'var(--primary)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
                transition: 'none'
              }}
            >
              {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              {isFullScreen ? 'Minimize' : 'Full Screen'}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'summary' && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '2rem' }}
              >
                <div className="glass" style={{ 
                  width: '100%', 
                  maxWidth: '600px', 
                  padding: '4rem 3rem', 
                  borderRadius: '32px', 
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'rgba(79, 70, 229, 0.05)',
                    borderRadius: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                    margin: '0 auto 2.5rem',
                    border: '1px solid rgba(79, 70, 229, 0.1)'
                  }}>
                    <FileText size={40} />
                  </div>

                  <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                    Summary Ready
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.1rem' }}>
                    Your session summary has been generated and is ready for review.
                  </p>

                  <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                    <button 
                      onClick={() => window.open(pdfUrl || '#', '_blank')}
                      className="feature-card"
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '10px', 
                        padding: '14px 28px', borderRadius: '14px', fontSize: '0.95rem',
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                        color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600
                      }}
                    >
                      <ExternalLink size={20} /> View Full PDF
                    </button>
                    
                    <button 
                      onClick={handleDownload}
                      disabled={downloadingPdf}
                      className="glow-btn"
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '10px', 
                        padding: '14px 28px', borderRadius: '14px', fontSize: '0.95rem',
                        cursor: downloadingPdf ? 'not-allowed' : 'pointer',
                        opacity: downloadingPdf ? 0.75 : 1
                      }}
                    >
                      {downloadingPdf ? <DotsLoader compact size={18} label="Preparing PDF..." /> : <><Download size={20} /> Download</>}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'flashcards' && (
              <motion.div
                key="flashcards"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ width: '100%' }}
              >
                {flashcards.length > 0 ? (
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: '2.5rem', 
                    padding: '1rem 0 4rem',
                    width: '100%'
                  }}>
                    {/* Counter & Progress */}
                    <div style={{ width: '100%', maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '2px' }}>
                          CARD {currentFlashcard + 1} / {flashcards.length}
                        </span>
                        <span style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600 }}>
                          {showAnswer ? 'Answer' : 'Question'}
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '3px', background: '#27272a', borderRadius: '10px', overflow: 'hidden' }}>
                        <motion.div 
                          animate={{ width: `${((currentFlashcard + 1) / flashcards.length) * 100}%` }}
                          transition={{ duration: 0.4 }}
                          style={{ height: '100%', background: 'var(--primary)', borderRadius: '10px' }}
                        />
                      </div>
                    </div>

                    {/* 3D Flip Card */}
                    <div
                      onClick={() => setShowAnswer(!showAnswer)}
                      style={{
                        width: '100%',
                        maxWidth: '720px',
                        height: '360px',
                        perspective: '1200px',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{
                        width: '100%',
                        height: '100%',
                        position: 'relative',
                        transformStyle: 'preserve-3d',
                        transition: 'transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: showAnswer ? 'rotateY(180deg)' : 'rotateY(0deg)',
                      }}>
                        {/* FRONT — Question/Topic */}
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                          borderRadius: '28px',
                          background: 'linear-gradient(135deg, #111111 0%, #1a1a1a 100%)',
                          border: '1px solid rgba(79, 70, 229, 0.2)',
                          boxShadow: '0 25px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '3rem',
                          gap: '1.5rem',
                          textAlign: 'center',
                        }}>
                          {/* Gold accent line */}
                          <div style={{ width: '48px', height: '3px', background: 'var(--primary)', borderRadius: '10px', marginBottom: '0.5rem' }} />
                          <h2 style={{ 
                            fontFamily: 'Playfair Display, serif', 
                            fontSize: '1.9rem', 
                            fontWeight: 700, 
                            color: 'var(--text-primary)',
                            lineHeight: 1.3,
                          }}>
                            {flashcards[currentFlashcard]?.question}
                          </h2>
                          <p style={{ color: 'var(--primary)', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.7 }}>
                            Click to flip
                          </p>
                        </div>

                        {/* BACK — Answer/Description */}
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)',
                          borderRadius: '28px',
                          background: 'linear-gradient(135deg, #1a1208 0%, #201808 100%)',
                          border: '1px solid rgba(79, 70, 229, 0.35)',
                          boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(79, 70, 229, 0.07)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '3rem',
                          gap: '1.25rem',
                          textAlign: 'center',
                        }}>
                          <div style={{ width: '48px', height: '3px', background: 'var(--primary)', borderRadius: '10px', marginBottom: '0.25rem' }} />
                          <p style={{ 
                            fontSize: '1.1rem', 
                            color: '#e0d0b0',
                            lineHeight: 1.8,
                            fontWeight: 400,
                          }}>
                            {flashcards[currentFlashcard]?.answer}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Navigation */}
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handlePrevCard(); }} 
                        style={{ 
                          width: '56px', height: '56px', borderRadius: '50%', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: '1px solid #27272a', color: 'var(--text-primary)', cursor: 'pointer',
                          background: '#18181b', transition: 'all 0.2s ease'
                        }}
                      >
                        <ChevronLeft size={24} />
                      </button>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {flashcards.map((_, i) => (
                          <div 
                            key={i} 
                            onClick={(e) => { e.stopPropagation(); setShowAnswer(false); setCurrentFlashcard(i); }}
                            style={{ 
                              width: i === currentFlashcard ? '20px' : '6px', 
                              height: '6px', 
                              borderRadius: '10px', 
                              background: i === currentFlashcard ? 'var(--primary)' : '#3f3f46',
                              transition: 'all 0.3s ease',
                              cursor: 'pointer'
                            }} 
                          />
                        ))}
                      </div>

                      <button 
                        onClick={(e) => { e.stopPropagation(); handleNextCard(); }} 
                        style={{ 
                          width: '56px', height: '56px', borderRadius: '50%', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: 'none', color: 'black', cursor: 'pointer',
                          background: 'var(--primary)', boxShadow: '0 0 20px rgba(79, 70, 229, 0.2)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <ChevronRight size={24} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <EmptyState 
                    title="No Flashcards Yet" 
                    subtitle="We are still processing your lecture transcript to generate these flashcards."
                  />
                )}
              </motion.div>
            )}


            {activeTab === 'interview' && (
              <motion.div
                key="interview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ width: '100%', maxWidth: '850px', margin: '0 auto' }}
              >
                {interviewQuestions.length > 0 ? (
                  <>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                      <div className="capsule-label" style={{ marginBottom: '1rem' }}>ELITE PREPARATION</div>
                      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', color: 'var(--text-primary)', fontWeight: 800 }}>
                        Interview <span style={{ color: 'var(--primary)' }}>Mastery</span>
                      </h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {interviewQuestions
                        .slice(currentInterviewPage * itemsPerPage, (currentInterviewPage + 1) * itemsPerPage)
                        .map((q, i) => {
                          // Dynamically find the answer property, avoiding MongoDB '_id' fields
                          const answerEntry = Object.entries(q).find(([key, val]) => key !== '_id' && key !== 'question' && typeof val === 'string');
                          const answerText = q.answer || q.idealAnswer || q.ideal_answer || q.response || q.expected_answer || (answerEntry ? answerEntry[1] : null) || 'Answer not generated correctly.';
                          return (
                            <InterviewAccordionItem key={i} question={q.question} answer={answerText} index={currentInterviewPage * itemsPerPage + i} />
                          );
                        })}
                    </div>

                    {interviewQuestions.length > itemsPerPage && (
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3rem', marginTop: '4rem' }}>
                        <button 
                          onClick={() => setCurrentInterviewPage(prev => Math.max(0, prev - 1))}
                          disabled={currentInterviewPage === 0}
                          style={{ 
                            width: '56px', height: '56px', borderRadius: '50%', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '1px solid #27272a', color: 'var(--text-primary)', cursor: 'pointer',
                            background: '#18181b', transition: 'all 0.2s ease',
                            opacity: currentInterviewPage === 0 ? 0.3 : 1
                          }}
                        >
                          <ChevronLeft size={24} />
                        </button>
                        
                        <div style={{ display: 'flex', gap: '12px' }}>
                          {Array.from({ length: Math.ceil(interviewQuestions.length / itemsPerPage) }).map((_, idx) => (
                            <div 
                              key={idx}
                              style={{ 
                                width: idx === currentInterviewPage ? '12px' : '8px', 
                                height: idx === currentInterviewPage ? '12px' : '8px', 
                                borderRadius: '50%', 
                                background: idx === currentInterviewPage ? 'var(--primary)' : 'rgba(255,255,255,0.2)',
                                transition: 'all 0.3s ease'
                              }}
                            />
                          ))}
                        </div>

                        <button 
                          onClick={() => setCurrentInterviewPage(prev => Math.min(Math.ceil(interviewQuestions.length / itemsPerPage) - 1, prev + 1))}
                          disabled={currentInterviewPage === Math.ceil(interviewQuestions.length / itemsPerPage) - 1}
                          style={{ 
                            width: '56px', height: '56px', borderRadius: '50%', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: 'none', color: 'black', cursor: 'pointer',
                            background: currentInterviewPage === Math.ceil(interviewQuestions.length / itemsPerPage) - 1 ? '#18181b' : 'var(--primary)',
                            boxShadow: currentInterviewPage === Math.ceil(interviewQuestions.length / itemsPerPage) - 1 ? 'none' : '0 0 20px rgba(79, 70, 229, 0.2)',
                            transition: 'all 0.2s ease',
                            opacity: currentInterviewPage === Math.ceil(interviewQuestions.length / itemsPerPage) - 1 ? 0.3 : 1
                          }}
                        >
                          <ChevronRight size={24} />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <EmptyState 
                    title="Questions Pending" 
                    subtitle="Our interview specialists are curating the best questions from your lecture."
                  />
                )}
              </motion.div>
            )}

            {activeTab === 'quiz' && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}
              >
                {quiz.length > 0 ? (
                  <>
                    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                      <div className="capsule-label" style={{ marginBottom: '1rem' }}>KNOWLEDGE CHECK</div>
                      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', color: 'var(--text-primary)' }}>Dynamic Assessment</h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', marginTop: '2rem' }}>
                      {quiz
                        .slice(currentQuizPage * itemsPerPage, (currentQuizPage + 1) * itemsPerPage)
                        .map((q, relativeIdx) => {
                          const qIdx = currentQuizPage * itemsPerPage + relativeIdx;
                          const selectedOption = quizAnswers[qIdx];
                          const hasAnswered = selectedOption !== undefined;

                          return (
                            <motion.div 
                              key={qIdx} 
                              className="glass" 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              style={{ 
                                padding: '3rem', 
                                borderRadius: '28px', 
                                border: '1px solid rgba(255,255,255,0.05)',
                                background: 'rgba(255,255,255,0.01)',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '2px' }}>
                                  QUESTION {(qIdx + 1).toString().padStart(2, '0')}
                                </span>
                              </div>

                              <h3 style={{ 
                                fontFamily: 'Playfair Display, serif', 
                                fontSize: '1.6rem', 
                                color: 'var(--text-primary)', 
                                lineHeight: 1.4,
                                marginBottom: '2.5rem'
                              }}>
                                {q.question}
                              </h3>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                {q.options.map((option, oIdx) => {
                                  const isSelected = selectedOption === oIdx;
                                  const isCorrect = q.correct === oIdx;
                                  
                                  let border = '1px solid rgba(255,255,255,0.05)';
                                  let bg = 'rgba(255,255,255,0.02)';
                                  let color = 'var(--text-secondary)';

                                  if (showResults) {
                                    if (isCorrect) {
                                      // Always highlight correct answer green
                                      border = '2px solid #22c55e';
                                      bg = 'rgba(34, 197, 94, 0.15)';
                                      color = '#22c55e';
                                    } else if (isSelected && !isCorrect) {
                                      // Wrong selected answer red
                                      border = '2px solid #ef4444';
                                      bg = 'rgba(239, 68, 68, 0.15)';
                                      color = '#ef4444';
                                    } else {
                                      // Other options dim
                                      border = '1px solid rgba(255,255,255,0.03)';
                                      bg = 'rgba(255,255,255,0.01)';
                                      color = 'var(--text-muted)';
                                    }
                                  } else if (isSelected) {
                                    border = '2px solid var(--primary)';
                                    bg = 'rgba(79, 70, 229, 0.1)';
                                    color = 'var(--primary)';
                                  }

                                  return (
                                    <motion.button
                                      key={oIdx}
                                      disabled={showResults}
                                      onClick={() => handleQuizSelect(qIdx, oIdx)}
                                      whileHover={!showResults && !isSelected ? { scale: 1.02, background: 'rgba(255,255,255,0.05)', borderColor: 'var(--primary)' } : {}}
                                      style={{
                                        padding: '1.2rem 1.5rem',
                                        borderRadius: '16px',
                                        textAlign: 'left',
                                        background: bg,
                                        border: border,
                                        color: color,
                                        cursor: showResults ? 'default' : 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        transition: 'all 0.2s ease',
                                        opacity: showResults && !isCorrect && !isSelected ? 0.5 : 1
                                      }}
                                    >
                                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{ 
                                          width: '32px', height: '32px', borderRadius: '8px', 
                                          background: showResults ? (isCorrect ? '#22c55e' : (isSelected ? '#ef4444' : 'rgba(255,255,255,0.05)')) : (isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.05)'),
                                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                                          fontSize: '0.8rem', fontWeight: 900, color: showResults ? (isCorrect ? 'white' : (isSelected ? 'white' : 'var(--text-muted)')) : (isSelected ? 'white' : 'var(--text-muted)')
                                        }}>
                                          {String.fromCharCode(65 + oIdx)}
                                        </div>
                                        <span style={{ fontSize: '1.05rem', fontWeight: 500 }}>{option}</span>
                                      </div>
                                      {showResults && isCorrect && <CheckCircle2 size={20} color="#22c55e" />}
                                      {showResults && isSelected && !isCorrect && <XCircle size={20} color="#ef4444" />}
                                    </motion.button>
                                  );
                                })}
                              </div>
                            </motion.div>
                          );
                        })}
                    </div>

                    {quiz.length > itemsPerPage && (
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3rem', marginTop: '4rem' }}>
                        <button 
                          onClick={() => setCurrentQuizPage(prev => Math.max(0, prev - 1))}
                          disabled={currentQuizPage === 0}
                          style={{ 
                            width: '56px', height: '56px', borderRadius: '50%', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '1px solid #27272a', color: 'var(--text-primary)', cursor: 'pointer',
                            background: '#18181b', transition: 'all 0.2s ease',
                            opacity: currentQuizPage === 0 ? 0.3 : 1
                          }}
                        >
                          <ChevronLeft size={24} />
                        </button>
                        
                        <div style={{ display: 'flex', gap: '12px' }}>
                          {Array.from({ length: Math.ceil(quiz.length / itemsPerPage) }).map((_, idx) => (
                            <div 
                              key={idx}
                              style={{ 
                                width: idx === currentQuizPage ? '12px' : '8px', 
                                height: idx === currentQuizPage ? '12px' : '8px', 
                                borderRadius: '50%', 
                                background: idx === currentQuizPage ? 'var(--primary)' : 'rgba(255,255,255,0.2)',
                                transition: 'all 0.3s ease'
                              }}
                            />
                          ))}
                        </div>

                        <button 
                          onClick={() => setCurrentQuizPage(prev => Math.min(Math.ceil(quiz.length / itemsPerPage) - 1, prev + 1))}
                          disabled={currentQuizPage === Math.ceil(quiz.length / itemsPerPage) - 1}
                          style={{ 
                            width: '56px', height: '56px', borderRadius: '50%', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: 'none', color: 'black', cursor: 'pointer',
                            background: currentQuizPage === Math.ceil(quiz.length / itemsPerPage) - 1 ? '#18181b' : 'var(--primary)',
                            boxShadow: currentQuizPage === Math.ceil(quiz.length / itemsPerPage) - 1 ? 'none' : '0 0 20px rgba(79, 70, 229, 0.2)',
                            transition: 'all 0.2s ease',
                            opacity: currentQuizPage === Math.ceil(quiz.length / itemsPerPage) - 1 ? 0.3 : 1
                          }}
                        >
                          <ChevronRight size={24} />
                        </button>
                      </div>
                    )}

                    <div style={{ textAlign: 'center', marginTop: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                      {showResults && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          style={{ background: 'rgba(79, 70, 229, 0.05)', border: '1px solid var(--primary)', padding: '2rem 3rem', borderRadius: '24px', width: '100%', maxWidth: '600px' }}
                        >
                          <h3 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '1rem', fontFamily: 'Playfair Display, serif' }}>Quiz Results</h3>
                          <p style={{ fontSize: '1.3rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            You scored <strong style={{ color: 'var(--primary)', fontSize: '1.8rem', margin: '0 8px' }}>{calculateScore()}</strong> out of <strong>{quiz.length}</strong>
                          </p>
                          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', padding: '6px 18px', borderRadius: '20px', fontWeight: 700, fontSize: '0.95rem' }}>
                              ✓ {calculateScore()} Correct
                            </span>
                            <span style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', padding: '6px 18px', borderRadius: '20px', fontWeight: 700, fontSize: '0.95rem' }}>
                              ✗ {Object.keys(quizAnswers).filter(i => quizAnswers[i] !== quiz[i]?.correct).length} Wrong
                            </span>
                            <span style={{ background: 'rgba(148,163,184,0.15)', color: '#94A3B8', padding: '6px 18px', borderRadius: '20px', fontWeight: 700, fontSize: '0.95rem' }}>
                              ○ {quiz.length - Object.keys(quizAnswers).length} Unattempted
                            </span>
                          </div>
                        </motion.div>
                      )}

                      <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                        {!showResults && (
                          <button 
                            className="glow-btn" 
                            onClick={() => { setShowResults(true); setCurrentQuizPage(0); }}
                            style={{ padding: '14px 32px', fontSize: '1rem', fontWeight: 700 }}
                          >
                            Submit Quiz
                          </button>
                        )}

                        {showResults && (
                          <button 
                            className="glow-btn" 
                            onClick={() => { setQuizAnswers({}); setShowResults(false); setCurrentQuizPage(0); }}
                            style={{ padding: '12px 30px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: 'none' }}
                          >
                            <RefreshCw size={18} /> Retake Quiz
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <EmptyState 
                    title="Quiz Coming Soon" 
                    subtitle="We are crafting a tailored assessment to test your understanding. Hang tight, it's almost ready."
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </main>
    {['student', 'mentor'].includes(user.role) && <Chatbot sessionId={sessionId} sessionTitle="Study Guide" />}
  </div>
);
};

export default StudyGuide;
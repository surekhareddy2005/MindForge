import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, CheckCircle, MessageSquare, ShieldCheck, Star } from 'lucide-react';
import { getMyCourses, getSessions, submitFeedback, getStudentFeedbacks } from '../../services/api';
import DotsLoader from '../../components/DotsLoader';
import StudentSidebar from '../../components/student/StudentSidebar';
import Header from '../../components/Header';
import CustomSelect from '../../components/ui/CustomSelect';

const StudentFeedback = () => {
  const today = new Date().toISOString().split('T')[0];
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [submittedSessionIds, setSubmittedSessionIds] = useState([]);

  useEffect(() => {
    const fetchStudentSessions = async () => {
      try {
        setLoading(true);
        const [coursesRes, feedbacksRes] = await Promise.all([
          getMyCourses(),
          getStudentFeedbacks()
        ]);

        const studentCourses = coursesRes.data || [];
        setCourses(studentCourses);
        
        // Keep track of sessions already reviewed
        const feedbackIds = (feedbacksRes.data || []).map(f => f.sessionId);
        setSubmittedSessionIds(feedbackIds);

        const sessionResults = await Promise.allSettled(
          studentCourses.map(course => getSessions(course._id))
        );

        const allSessions = [];
        sessionResults.forEach((result, index) => {
          if (result.status !== 'fulfilled') return;
          const course = studentCourses[index];
          (result.value.data || []).forEach(session => {
            allSessions.push({
              ...session,
              courseId: course._id,
              courseTitle: course.title,
              mentorName: course.mentors?.[0]?.name || 'Assigned Mentor'
            });
          });
        });

        setSessions(allSessions);
      } catch (err) {
        console.error('Failed to load feedback sessions:', err);
        setMessage({ type: 'error', text: 'Failed to load your sessions.' });
      } finally {
        setLoading(false);
      }
    };

    fetchStudentSessions();
  }, []);

  const todaysSessions = useMemo(() => {
    return sessions.filter(session => session.date === today);
  }, [sessions, today]);

  const coursesForDate = useMemo(() => {
    const courseIds = new Set(todaysSessions.map(session => session.courseId));
    return courses.filter(course => courseIds.has(course._id));
  }, [courses, todaysSessions]);

  const sessionsForCourseAndDate = useMemo(() => {
    return todaysSessions.filter(session => session.courseId === selectedCourseId);
  }, [todaysSessions, selectedCourseId]);

  useEffect(() => {
    const firstCourse = coursesForDate[0]?._id || '';
    setSelectedCourseId(firstCourse);
  }, [coursesForDate]);

  useEffect(() => {
    setSelectedSessionId(sessionsForCourseAndDate[0]?._id || '');
  }, [sessionsForCourseAndDate]);

  const selectedSession = sessions.find(session => session._id === selectedSessionId);
  const hasSubmitted = submittedSessionIds.includes(selectedSessionId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!selectedSessionId) {
      setMessage({ type: 'error', text: 'Select a session before submitting feedback.' });
      return;
    }

    if (hasSubmitted) {
      setMessage({ type: 'error', text: 'You have already submitted feedback for this session.' });
      return;
    }

    if (!rating) {
      setMessage({ type: 'error', text: 'Please select a rating.' });
      return;
    }

    if (!comment.trim()) {
      setMessage({ type: 'error', text: 'Please write your feedback before submitting.' });
      return;
    }

    try {
      setSubmitting(true);
      await submitFeedback({
        sessionId: selectedSessionId,
        rating,
        comment: comment.trim(),
        isAnonymous
      });

      setComment('');
      setRating(0);
      setIsAnonymous(false);
      setSubmittedSessionIds(prev => [...prev, selectedSessionId]);
      setMessage({ type: 'success', text: 'Feedback submitted for this session.' });
    } catch (error) {
      console.error('Failed to submit feedback', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.msg || error.response?.data?.error || 'Failed to submit feedback.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
        <StudentSidebar />
        <main style={{ flex: 1, padding: '2rem 3rem' }}>
          <Header title="Session Feedback" subtitle="Loading your sessions..." />
          <DotsLoader />
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <StudentSidebar />
      <main style={{ flex: 1, padding: '2rem 3rem' }}>
        <Header 
          title="Session Feedback" 
          subtitle="Feedback is available only for today’s sessions. Select the course and session you attended today."
        />
        
        <div style={{ marginTop: '2rem' }}>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass"
          style={{ padding: '3rem', borderRadius: '32px', border: '1px solid var(--border)' }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.95rem 1rem',
            borderRadius: '16px',
            background: 'var(--primary-surface)',
            border: '1px solid rgba(212, 175, 55, 0.16)',
            color: 'var(--primary)',
            marginBottom: '1.5rem',
            width: 'fit-content'
          }}>
            <Calendar size={18} />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              Today: {new Date(`${today}T00:00:00`).toLocaleDateString()}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Course Selection</span>
              <CustomSelect
                value={selectedCourseId}
                onChange={setSelectedCourseId}
                options={coursesForDate.map(c => ({ label: c.title, value: c._id }))}
                placeholder={coursesForDate.length === 0 ? "No courses today" : "Select Course"}
                disabled={coursesForDate.length === 0}
                icon={<BookOpen size={18} />}
              />
            </label>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Session Selection</span>
            <CustomSelect
              value={selectedSessionId}
              onChange={setSelectedSessionId}
              options={sessionsForCourseAndDate.map(s => ({ label: s.title, value: s._id }))}
              placeholder={sessionsForCourseAndDate.length === 0 ? "No sessions available" : "Select Session"}
              disabled={sessionsForCourseAndDate.length === 0}
              icon={<MessageSquare size={18} />}
            />
          </label>

          <div style={{ marginBottom: '2rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '1rem' }}>Overall Rating</span>
            <div
              style={{ display: 'flex', gap: '0.75rem' }}
              onMouseLeave={() => setHoverRating(0)}
            >
              {[1, 2, 3, 4, 5].map(value => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoverRating(value)}
                  title={`${value} star${value > 1 ? 's' : ''}`}
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '16px',
                    border: value <= (hoverRating || rating) ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
                    background: value <= (hoverRating || rating) ? 'var(--primary-surface)' : 'rgba(255,255,255,0.02)',
                    color: value <= (hoverRating || rating) ? 'var(--primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: value <= (hoverRating || rating) ? '0 0 15px rgba(79, 70, 229, 0.15)' : 'none'
                  }}
                >
                  <Star size={24} fill={value <= (hoverRating || rating) ? 'var(--primary)' : 'transparent'} strokeWidth={1.5} />
                </button>
              ))}
            </div>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '2rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Detailed Feedback</span>
            <textarea
              rows="6"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you think of today's session? Any suggestions for improvement?"
              style={{
                width: '100%',
                padding: '1.25rem',
                border: '1px solid rgba(79, 70, 229, 0.15)',
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.01)',
                color: 'var(--text-primary)',
                outline: 'none',
                resize: 'none',
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                fontSize: '0.95rem',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(79, 70, 229, 0.15)'}
            />
          </label>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            padding: '1.25rem',
            borderRadius: '20px',
            background: 'var(--primary-surface)',
            border: '1px solid rgba(79, 70, 229, 0.1)',
            marginBottom: '2rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '12px', 
                background: 'rgba(0,0,0,0.2)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <ShieldCheck size={20} color="var(--primary)" />
              </div>
              <div>
                <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem' }}>Submit Anonymously</p>
                <p style={{ margin: '2px 0 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  Protect your privacy while sharing honest thoughts.
                </p>
              </div>
            </div>
            <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                border: '2px solid var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isAnonymous ? 'var(--primary)' : 'transparent',
                transition: 'all 0.2s ease'
            }}>
                {isAnonymous && <Check size={16} color="var(--bg-main)" strokeWidth={3} />}
                <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    style={{ position: 'absolute', opacity: 0, cursor: 'pointer' }}
                />
            </div>
          </label>

          {hasSubmitted && !message.text && (
            <div style={{
              padding: '0.9rem 1rem',
              borderRadius: '14px',
              marginBottom: '1.25rem',
              color: 'var(--primary)',
              background: 'rgba(212, 175, 55, 0.08)',
              border: '1px solid rgba(212, 175, 55, 0.16)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <CheckCircle size={18} />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>You have already submitted feedback for this session.</span>
            </div>
          )}

          {message.text && (
            <div style={{
              padding: '0.9rem 1rem',
              borderRadius: '14px',
              marginBottom: '1.25rem',
              color: message.type === 'success' ? '#22c55e' : '#ef4444',
              background: message.type === 'success' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
              border: message.type === 'success' ? '1px solid rgba(34, 197, 94, 0.16)' : '1px solid rgba(239, 68, 68, 0.16)'
            }}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            className="glow-btn"
            disabled={submitting || !selectedSessionId || hasSubmitted}
            style={{ 
              padding: '12px 28px', 
              opacity: (submitting || !selectedSessionId || hasSubmitted) ? 0.55 : 1, 
              cursor: (submitting || !selectedSessionId || hasSubmitted) ? 'not-allowed' : 'pointer' 
            }}
          >
            {submitting ? 'Submitting...' : hasSubmitted ? 'Feedback Submitted' : 'Submit Feedback'}
          </button>
        </motion.form>
      </div>
        </div>
      </main>
    </div>
  );
};

export default StudentFeedback;

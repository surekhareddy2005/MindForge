import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { getMentorFeedback } from '../services/api';
import { Star, MessageSquare, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import DotsLoader from '../components/DotsLoader';

const MentorFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination & Filter States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await getMentorFeedback();
        setFeedbacks(response.data);
      } catch (err) {
        setError('Failed to load feedback');
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, []);

  // Filter Logic
  const filteredFeedbacks = feedbacks.filter(fb => {
    if (!selectedDate) return true;
    const fbDate = new Date(fb.createdAt);
    return fbDate.getFullYear() === selectedDate.getFullYear() &&
           fbDate.getMonth() === selectedDate.getMonth() &&
           fbDate.getDate() === selectedDate.getDate();
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);
  const paginatedFeedbacks = filteredFeedbacks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate]);

  // Calendar Helpers
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2rem 3rem', display: 'flex', flexDirection: 'column' }}>
        <Header title="Student Feedback" subtitle="Review what your students are saying about your courses" />

        {loading ? (
          <DotsLoader />
        ) : error ? (
          <div style={{ margin: '2rem auto', color: '#ef4444' }}>{error}</div>
        ) : (
          <div style={{ display: 'flex', gap: '3rem', margin: '2rem auto 0', width: '100%', maxWidth: '1200px' }}>
            
            {/* Main Feed Column */}
            <div style={{ flex: 1 }}>
              {filteredFeedbacks.length === 0 ? (
                <div className="glass" style={{ padding: '3rem', textAlign: 'center', borderRadius: '24px' }}>
                  <MessageSquare size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', display: 'block' }} />
                  <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No feedback found</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    {selectedDate ? "There is no feedback for this specific date." : "When students leave feedback, it will appear here."}
                  </p>
                  {selectedDate && (
                    <button 
                      onClick={() => setSelectedDate(null)}
                      style={{ marginTop: '1rem', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      Clear Filter
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: '3rem' }}>
                  {selectedDate && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', padding: '8px 16px', background: 'rgba(79, 70, 229, 0.1)', borderRadius: '8px', width: 'fit-content' }}>
                      <CalendarIcon size={16} color="var(--primary)" />
                      <span style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>Showing feedback for {selectedDate.toLocaleDateString()}</span>
                      <button onClick={() => setSelectedDate(null)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', marginLeft: '8px', fontSize: '1rem' }}>×</button>
                    </div>
                  )}
                  
                  {paginatedFeedbacks.map((fb, index) => (
                    <div key={index} style={{ 
                      padding: '2rem 0', 
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex',
                      gap: '2.5rem',
                      alignItems: 'flex-start'
                    }}>
                      {/* Meta Data Column */}
                      <div style={{ width: '280px', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                          <div style={{ 
                            width: '36px', height: '36px', borderRadius: '50%', 
                            background: 'rgba(79, 70, 229, 0.1)', border: '1px solid var(--primary)',
                            color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            fontWeight: 'bold', fontSize: '1rem' 
                          }}>
                            {(fb.studentId?.name || 'A').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem', margin: 0, fontWeight: 600 }}>{fb.studentId?.name || 'Anonymous Student'}</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '2px 0 0 0' }}>{fb.sessionId?.title || 'Session Feedback'}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '2px', paddingLeft: '48px', marginBottom: '8px' }}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < fb.rating ? "var(--primary)" : "transparent"} color={i < fb.rating ? "var(--primary)" : "rgba(255,255,255,0.15)"} />
                          ))}
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', paddingLeft: '48px', margin: 0 }}>
                          {new Date(fb.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Comment Column */}
                      <div style={{ flex: 1, paddingTop: '4px' }}>
                        <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, fontSize: '0.95rem', margin: 0 }}>
                          {fb.comment || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No additional comments provided.</span>}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '2.5rem', alignItems: 'center' }}>
                      <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        style={{ 
                          width: '40px', height: '40px', borderRadius: '50%', 
                          background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', 
                          color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                          opacity: currentPage === 1 ? 0.4 : 1
                        }}
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Page <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{currentPage}</span> of {totalPages}
                      </div>
                      <button 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        style={{ 
                          width: '40px', height: '40px', borderRadius: '50%', 
                          background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', 
                          color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                          opacity: currentPage === totalPages ? 0.4 : 1
                        }}
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Interactive Calendar Filter */}
            <div style={{ width: '300px', flexShrink: 0 }}>
              <div className="glass" style={{ padding: '1.5rem', borderRadius: '24px', position: 'sticky', top: '100px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', margin: 0, fontWeight: 600 }}>
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handlePrevMonth} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', padding: '4px', cursor: 'pointer', color: 'var(--text-primary)' }}>
                      <ChevronLeft size={18} />
                    </button>
                    <button onClick={handleNextMonth} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', padding: '4px', cursor: 'pointer', color: 'var(--text-primary)' }}>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center' }}>
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <div key={d} style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, paddingBottom: '8px' }}>{d}</div>
                  ))}
                  
                  {Array.from({ length: getFirstDayOfMonth(currentDate) }).map((_, i) => <div key={`empty-${i}`} />)}
                  
                  {Array.from({ length: getDaysInMonth(currentDate) }).map((_, i) => {
                    const day = i + 1;
                    const dateOfCell = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    
                    // Check if any feedback exists for this date
                    const hasFeedback = feedbacks.some(fb => {
                      const d = new Date(fb.createdAt);
                      return d.getFullYear() === dateOfCell.getFullYear() && 
                             d.getMonth() === dateOfCell.getMonth() && 
                             d.getDate() === dateOfCell.getDate();
                    });

                    const isSelected = selectedDate && 
                      selectedDate.getDate() === day && 
                      selectedDate.getMonth() === currentDate.getMonth() && 
                      selectedDate.getFullYear() === currentDate.getFullYear();

                    const today = new Date();
                    const isToday = day === today.getDate() && 
                      currentDate.getMonth() === today.getMonth() && 
                      currentDate.getFullYear() === today.getFullYear();

                    return (
                      <div 
                        key={day}
                        onClick={() => setSelectedDate(isSelected ? null : dateOfCell)}
                        style={{
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          background: isToday ? 'var(--primary)' : hasFeedback && !isSelected ? 'rgba(79, 70, 229, 0.15)' : 'transparent',
                          color: isToday ? 'var(--bg-main)' : hasFeedback ? 'var(--primary)' : 'var(--text-secondary)',
                          border: isSelected ? '2px solid var(--primary)' : hasFeedback && !isToday ? '1px solid rgba(79, 70, 229, 0.4)' : '1px solid transparent',
                          fontWeight: isToday || isSelected || hasFeedback ? 700 : 400
                        }}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '1.5rem', marginBottom: 0 }}>
                  Dates highlighted in gold have feedback. Click to filter.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MentorFeedback;

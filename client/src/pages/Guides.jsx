import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Brain,
  Zap,
  HelpCircle,
  MessageSquare,
  ChevronLeft
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { getAllUploads } from '../services/api';
import DotsLoader from '../components/DotsLoader';
import CustomSelect from '../components/ui/CustomSelect';
import SearchBar from '../components/ui/SearchBar';

const EmptyState = ({ title, subtitle, hasFilter }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '4rem 2rem', 
      textAlign: 'center',
      gap: '1rem',
      background: 'rgba(255,255,255,0.01)',
      borderRadius: '24px',
      border: '1px solid rgba(255,255,255,0.03)',
      marginTop: '1rem'
    }}
  >
    <div style={{
      width: '60px',
      height: '60px',
      background: 'rgba(79, 70, 229, 0.05)',
      borderRadius: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--primary)',
      border: '1px solid rgba(79, 70, 229, 0.1)',
      marginBottom: '0.5rem',
      boxShadow: '0 0 30px rgba(79, 70, 229, 0.1)'
    }}>
      <Brain size={30} />
    </div>
    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: 'var(--text-primary)', margin: 0 }}>{title}</h3>
    <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: 1.6, fontSize: '0.95rem', margin: 0 }}>{subtitle}</p>
    {!hasFilter && (
      <button 
        onClick={() => window.location.href = '/dashboard'}
        className="glow-btn"
        style={{ marginTop: '1.5rem', padding: '12px 24px', fontSize: '0.9rem' }}
      >
        Initialize Generation
      </button>
    )}
  </motion.div>
);

const Guides = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('All Courses');
  const [selectedModule, setSelectedModule] = useState('All Modules');
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [availableModules, setAvailableModules] = useState({});

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        setLoading(true);
        const res = await getAllUploads();
        const uploads = res.data;

        const sessionGroups = {}; 
        const coursesMap = new Set();
        const modulesMap = {};

        uploads.forEach(u => {
          if (!u.courseId || !u.sessionId) return;
          
          const sId = u.sessionId._id;
          const courseTitle = u.courseId.title;
          const moduleTitle = u.sessionId.moduleId?.title || 'General Module';
          
          coursesMap.add(courseTitle);
          if (!modulesMap[courseTitle]) modulesMap[courseTitle] = new Set();
          modulesMap[courseTitle].add(moduleTitle);

          if (!sessionGroups[sId] || u.isProcessed) {
            sessionGroups[sId] = {
              id: u._id,
              sessionId: sId,
              uploadId: u._id,
              course: courseTitle,
              module: moduleTitle,
              title: u.sessionId.title || u.originalname,
              date: new Date(u.sessionId.date),
              stats: { 
                cards: u.stats?.flashcards || 0, 
                questions: u.stats?.interview || 0, 
                quiz: u.stats?.quiz || 0 
              },
              isProcessed: u.isProcessed,
              pdfUrl: u.pdfUrl
            };
          }
        });

        const formattedGuides = Object.values(sessionGroups);

        const finalCourses = Array.from(coursesMap);
        const finalModules = {};
        for (const [course, modSet] of Object.entries(modulesMap)) {
          finalModules[course] = Array.from(modSet);
        }

        setAvailableCourses(finalCourses);
        setAvailableModules(finalModules);
        setGuides(formattedGuides);

      } catch (err) {
        console.error('Error fetching guides:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGuides();
  }, []);

  const calendarGuides = guides.filter(g => {
    const matchesSearch = g.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === 'All Courses' || g.course === selectedCourse;
    const matchesModule = selectedModule === 'All Modules' || g.module === selectedModule;
    return matchesSearch && matchesCourse && matchesModule;
  });

  const filteredGuides = calendarGuides.filter(g => {
    return !selectedDate || (
      g.date.getFullYear() === selectedDate.getFullYear() &&
      g.date.getMonth() === selectedDate.getMonth() &&
      g.date.getDate() === selectedDate.getDate()
    );
  });

  const totalPages = Math.ceil(filteredGuides.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentGuides = filteredGuides.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setSelectedModule('All Modules');
    setCurrentPage(1);
  }, [selectedCourse]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate, searchTerm, selectedModule]);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDayOfMonth = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  
  const hasGuideOnDay = (day) => {
    return calendarGuides.some(g => 
      g.date.getDate() === day && 
      g.date.getMonth() === currentDate.getMonth() && 
      g.date.getFullYear() === currentDate.getFullYear()
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '2rem 3rem' }}>
          <Header title="Study Archive" subtitle="Your intellectual library" />
          <DotsLoader />
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2rem 3rem', display: 'flex', flexDirection: 'column' }}>
        <Header title="Study Archive" subtitle="Your intellectual library" />

        <div style={{ display: 'flex', gap: '3rem', margin: '2rem auto 0', width: '100%', maxWidth: '1200px' }}>
          
          <div style={{ flex: 1 }}>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <SearchBar 
                value={searchTerm} 
                onChange={setSearchTerm} 
                placeholder="Search study guides..." 
              />

              <CustomSelect 
                value={selectedCourse} 
                onChange={setSelectedCourse} 
                options={['All Courses', ...availableCourses]} 
                placeholder="All Courses"
              />

              <CustomSelect 
                value={selectedModule} 
                onChange={setSelectedModule} 
                options={['All Modules', ...(availableModules[selectedCourse] || [])]} 
                placeholder="All Modules"
                disabled={selectedCourse === 'All Courses'}
              />
            </div>

            {selectedDate && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', padding: '8px 16px', background: 'var(--primary-surface)', borderRadius: '8px', width: 'fit-content' }}>
                <CalendarIcon size={16} color="var(--primary)" />
                <span style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>Filtered by {selectedDate.toLocaleDateString()}</span>
                <button onClick={() => setSelectedDate(null)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', marginLeft: '8px', fontSize: '1rem' }}>×</button>
              </div>
            )}

            {currentGuides.length === 0 ? (
              <EmptyState 
                title="No Guides Found" 
                subtitle={selectedDate ? "There are no study guides generated for this specific date." : "Try adjusting your search terms or generate a new study guide."} 
                hasFilter={!!selectedDate || searchTerm.length > 0}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: '3rem' }}>
                {currentGuides.map((guide, index) => (
                  <motion.div 
                    key={guide.id}
                    onClick={() => navigate(`/study-guide/${guide.sessionId}/${guide.uploadId}`)}
                    style={{ 
                      padding: '1.5rem', 
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.5rem',
                      cursor: 'pointer',
                      borderRadius: '16px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ 
                      width: '48px', height: '48px', borderRadius: '14px', 
                      background: 'rgba(79, 70, 229, 0.05)', border: '1px solid rgba(79, 70, 229, 0.1)',
                      color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <BookOpen size={22} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <span style={{ 
                        display: 'inline-block',
                        padding: '3px 8px', 
                        borderRadius: '6px', 
                        background: 'rgba(255,255,255,0.05)', 
                        color: 'var(--text-secondary)', 
                        fontSize: '0.65rem', 
                        fontWeight: 600, 
                        letterSpacing: '0.5px', 
                        textTransform: 'uppercase',
                        marginBottom: '8px'
                      }}>
                        {guide.module}
                      </span>
                      <h3 style={{ color: 'var(--text-primary)', fontSize: '1.15rem', margin: '0 0 6px 0', fontWeight: 600 }}>
                        {guide.title}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {guide.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <Zap size={12} color="var(--primary)" /> {guide.stats.cards} Flashcards
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <MessageSquare size={12} color="var(--primary)" /> {guide.stats.questions} Q&A
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <HelpCircle size={12} color="var(--primary)" /> {guide.stats.quiz} Quiz
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '8px', 
                        background: 'rgba(79, 70, 229, 0.08)', 
                        color: 'var(--primary)', 
                        fontSize: '0.65rem', 
                        fontWeight: 700, 
                        letterSpacing: '0.5px', 
                        textTransform: 'uppercase' 
                      }}>
                        {guide.course}
                      </span>
                      <ChevronRight color="var(--text-muted)" size={20} />
                    </div>
                  </motion.div>
                ))}

                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '2.5rem', alignItems: 'center' }}>
                    <button 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      style={{ 
                        width: '40px', height: '40px', borderRadius: '50%', 
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
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
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
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

          <div style={{ width: '300px', flexShrink: 0 }}>
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '24px', position: 'sticky', top: '100px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', margin: 0, fontWeight: 600 }}>
                  {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', padding: '4px', cursor: 'pointer', color: 'var(--text-primary)' }}>
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', padding: '4px', cursor: 'pointer', color: 'var(--text-primary)' }}>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center' }}>
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                  <div key={d} style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, paddingBottom: '8px' }}>{d}</div>
                ))}
                
                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateOfCell = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                  const hasGuide = hasGuideOnDay(day);

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
                        background: isToday ? 'var(--primary)' : hasGuide && !isSelected ? 'rgba(79, 70, 229, 0.15)' : 'transparent',
                        color: isToday ? 'var(--bg-main)' : hasGuide ? 'var(--primary)' : 'var(--text-secondary)',
                        border: isSelected ? '2px solid var(--primary)' : hasGuide && !isToday ? '1px solid rgba(79, 70, 229, 0.4)' : '1px solid transparent',
                        fontWeight: isToday || isSelected || hasGuide ? 700 : 400
                      }}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '1.5rem', marginBottom: 0 }}>
                Dates highlighted in gold have generated guides. Click to filter.
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Guides;

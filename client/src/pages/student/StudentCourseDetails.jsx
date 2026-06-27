import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Layers,
  Play,
  User,
  ExternalLink
} from 'lucide-react';
import { getModules, getMyCourses, getSessions } from '../../services/api';
import DotsLoader from '../../components/DotsLoader';
import SearchBar from '../../components/ui/SearchBar';
import Header from '../../components/Header';
import StudentSidebar from '../../components/student/StudentSidebar';

const StudentCourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const [coursesResult, modulesResult, sessionsResult] = await Promise.allSettled([
          getMyCourses(),
          getModules(courseId),
          getSessions(courseId)
        ]);

        const courses = coursesResult.status === 'fulfilled' ? coursesResult.value.data || [] : [];
        const currentCourse = courses.find(c => c._id === courseId);
        setCourse(currentCourse || null);
        
        setModules(modulesResult.status === 'fulfilled' ? modulesResult.value.data || [] : []);
        setSessions(sessionsResult.status === 'fulfilled' ? sessionsResult.value.data || [] : []);

        setError('');
        if (courseId) localStorage.setItem('activeCourseId', courseId);
      } catch (err) {
        console.error('Error fetching student course details:', err);
        setError('Failed to fetch course details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  const filteredModules = modules.filter(module =>
    module.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredModules.length / itemsPerPage);
  const paginatedModules = filteredModules.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <StudentSidebar />
      <main style={{ flex: 1, padding: '2rem 3rem' }}>
        <Header title="Loading..." />
        <DotsLoader />
      </main>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <StudentSidebar />
      <main style={{ flex: 1, padding: '2rem 3rem' }}>
        <Header 
          title={course?.title || 'Course Details'} 
          subtitle="Explore your modules and continue learning"
        />

        {error && (
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '12px', marginBottom: '2rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
          {/* Modules List */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                {searchTerm ? `Search Results (${filteredModules.length})` : 'Course Modules'}
              </h2>
              <div style={{ width: '350px' }}>
                <SearchBar 
                  placeholder="Find a module..." 
                  value={searchTerm} 
                  onChange={setSearchTerm} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {filteredModules.length === 0 ? (
                <div className="glass" style={{ padding: '4rem 2rem', borderRadius: '24px', textAlign: 'center', border: '1px solid var(--border)' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                    {searchTerm ? `No modules matching "${searchTerm}"` : 'No modules are available yet for this course.'}
                  </p>
                </div>
              ) : (
                <>
                  {paginatedModules.map((module, i) => (
                    <motion.div
                      key={module._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass"
                      style={{
                        padding: '1.8rem',
                        borderRadius: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: '1px solid var(--border)',
                        cursor: 'pointer',
                        transition: 'border-color 0.3s ease',
                        background: 'var(--bg-secondary)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                      }}
                      onClick={() => navigate(`/student/course/${courseId}/module/${module._id}`)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '14px',
                          background: 'rgba(212, 175, 55, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--primary)',
                          boxShadow: 'inset 0 0 10px rgba(212, 175, 55, 0.1)'
                        }}>
                          <Layers size={26} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)' }}>{module.title}</h3>
                          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '6px' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Calendar size={14} /> Created: {new Date(module.createdAt || Date.now()).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '10px', 
                        background: 'rgba(255,255,255,0.03)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'var(--primary)',
                        border: '1px solid rgba(255,255,255,0.05)'
                      }}>
                        <Play size={18} fill="currentColor" />
                      </div>
                    </motion.div>
                  ))}
                  
                  {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '10px',
                          background: currentPage === 1 ? 'rgba(255,255,255,0.02)' : 'var(--primary-surface)',
                          border: `1px solid ${currentPage === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(212, 175, 55, 0.2)'}`,
                          color: currentPage === 1 ? 'var(--text-muted)' : 'var(--primary)',
                          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Previous
                      </button>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
                        Page <strong style={{ color: 'var(--text-primary)' }}>{currentPage}</strong> of <strong style={{ color: 'var(--text-primary)' }}>{totalPages}</strong>
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '10px',
                          background: currentPage === totalPages ? 'rgba(255,255,255,0.02)' : 'var(--primary-surface)',
                          border: `1px solid ${currentPage === totalPages ? 'rgba(255,255,255,0.05)' : 'rgba(212, 175, 55, 0.2)'}`,
                          color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--primary)',
                          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          {/* Course Summary Sidebar */}
          <aside>
            <div className="glass" style={{ 
              padding: '2.5rem', 
              borderRadius: '28px', 
              border: '1px solid var(--border)', 
              marginBottom: '2rem',
              background: 'linear-gradient(145deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0) 100%)'
            }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '2rem', fontFamily: 'Playfair Display, serif' }}>Course Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Total Modules</span>
                  <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{modules.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Available Sessions</span>
                  <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)' }}>{sessions.length}</span>
                </div>
              </div>
            </div>


          </aside>
        </div>
      </main>
    </div>
  );
};

export default StudentCourseDetails;

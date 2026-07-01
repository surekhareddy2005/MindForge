import React, { useState, useEffect } from 'react';
import { getMyCourses } from '../../services/api';
import { motion } from 'framer-motion';
import { Search, Code2, Database, Cpu, Globe, BookOpen, Layers, Terminal, Brain } from 'lucide-react';
import DotsLoader from '../../components/DotsLoader';
import StudentSidebar from '../../components/student/StudentSidebar';
import Header from '../../components/Header';
import SearchBar from '../../components/ui/SearchBar';

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getMyCourses();
        setCourses(response.data || []);
      } catch (err) {
        setError('Failed to fetch courses.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getImageForCourse = (courseName) => {
    const name = courseName.toLowerCase();
    if (name.includes('owl')) return '/owlcoder.png';
    if (name.includes('dsa')) return '/dsa.png';
    return null;
  };

  const courseVisuals = [
    { gradient: 'linear-gradient(135deg, #4F46E5 0%, #1E1B4B 100%)', Icon: Code2 },
    { gradient: 'linear-gradient(135deg, #7C3AED 0%, #2E1065 100%)', Icon: Layers },
    { gradient: 'linear-gradient(135deg, #06B6D4 0%, #0E2A3A 100%)', Icon: Terminal },
    { gradient: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)', Icon: Brain },
    { gradient: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)', Icon: Database },
    { gradient: 'linear-gradient(135deg, #1E293B 0%, #4F46E5 100%)', Icon: Globe },
    { gradient: 'linear-gradient(135deg, #0F172A 0%, #7C3AED 100%)', Icon: Cpu },
    { gradient: 'linear-gradient(135deg, #1E1B4B 0%, #06B6D4 100%)', Icon: BookOpen },
  ];

  const getVisualForCourse = (courseName) => {
    let hash = 0;
    for (let i = 0; i < courseName.length; i++) {
      hash = courseName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return courseVisuals[Math.abs(hash) % courseVisuals.length];
  };

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <StudentSidebar />
      <main style={{ flex: 1, padding: '2rem 3rem' }}>
        <Header title="My Courses" />
        <DotsLoader />
      </main>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <StudentSidebar />
      <main style={{ flex: 1, padding: '2rem 3rem' }}>
        <Header title="My Courses" subtitle="Manage and access your learning path" />

        {error && (
          <div style={{
            padding: '1rem',
            marginBottom: '2rem',
            background: 'rgba(255, 77, 77, 0.1)',
            border: '1px solid rgb(255, 77, 77)',
            borderRadius: '12px',
            color: 'rgb(255, 100, 100)'
          }}>
            {error}
          </div>
        )}

        <div style={{ 
          marginBottom: '3rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '2rem'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            padding: '12px 20px', 
            borderRadius: '16px',
            width: '100%',
            maxWidth: '450px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.3)'
          }}>
            <Search size={20} color="var(--primary)" />
            <input 
              type="text" 
              placeholder="Search your courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                background: 'none', border: 'none', color: 'var(--text-primary)', width: '100%', 
                outline: 'none', fontSize: '1rem', fontFamily: 'Montserrat, sans-serif'
              }}
            />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
            {filteredCourses.length > 0 ? `My Courses (${filteredCourses.length})` : 'Catalog Search'}
          </h2>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="glass" style={{
            padding: '6rem 2rem',
            borderRadius: '32px',
            border: '1px solid var(--border)',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            background: 'rgba(255,255,255,0.01)'
          }}>
            <div style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '20px', 
                background: 'rgba(255,255,255,0.02)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 1.5rem',
                color: 'rgba(255,255,255,0.1)'
            }}>
                <Search size={32} />
            </div>
            <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No matching courses</p>
            <p style={{ fontSize: '1rem', opacity: 0.7 }}>Try adjusting your search query or check back later.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2.5rem' }}>
            {filteredCourses.map((course, index) => (
              <motion.div 
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass" 
                style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border)', cursor: 'pointer' }}
                onClick={() => window.location.href = `/student/course/${course._id}`}
              >
                <div style={{ 
                  height: '200px', 
                  background: getImageForCourse(course.title) 
                    ? `url(${getImageForCourse(course.title)})` 
                    : getVisualForCourse(course.title).gradient,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {!getImageForCourse(course.title) && (
                    (() => {
                      const { Icon } = getVisualForCourse(course.title);
                      return <Icon size={56} color="rgba(248,250,252,0.25)" strokeWidth={1.5} />;
                    })()
                  )}
                  <div style={{ position: 'absolute', bottom: '12px', left: '12px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '6px', background: 'var(--primary-surface)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600 }}>ACTIVE</span>
                  </div>
                </div>
                <div style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>{course.title}</h3>
                  <button 
                    className="glow-btn" 
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/student/course/${course._id}`;
                    }}
                    style={{ 
                      padding: '8px 16px', 
                      fontSize: '0.85rem', 
                      cursor: 'pointer', 
                      width: 'auto',
                      background: 'var(--primary)',
                      border: 'none',
                      borderRadius: '6px',
                      color: 'var(--bg-main)',
                      fontWeight: '600',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px var(--primary-glow)',
                      transform: 'translateY(0)',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px var(--primary-glow)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px var(--primary-glow)';
                    }}
                  >
                    View Course
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentCourses;
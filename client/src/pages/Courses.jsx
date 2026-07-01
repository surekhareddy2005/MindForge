import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { getMyCourses } from '../services/api';
import { Search, Code2, Database, Cpu, Globe, BookOpen, Layers, Terminal, Brain } from 'lucide-react';
import DotsLoader from '../components/DotsLoader';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const coursesResponse = await getMyCourses();
        const userCourses = coursesResponse.data || [];
        setCourses(userCourses);
        setError(null);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again later.');
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

  // Deterministic brand-colored gradient + icon for courses without a custom image
  const courseVisuals = [
    { gradient: 'linear-gradient(135deg, #4F46E5 0%, #0F172A 100%)', Icon: Code2 },
    { gradient: 'linear-gradient(135deg, #7C3AED 0%, #0F172A 100%)', Icon: Layers },
    { gradient: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', Icon: Terminal },
    { gradient: 'linear-gradient(135deg, #1E1B4B 0%, #4F46E5 100%)', Icon: Brain },
    { gradient: 'linear-gradient(135deg, #2E1065 0%, #7C3AED 100%)', Icon: Database },
    { gradient: 'linear-gradient(135deg, #0F172A 0%, #4F46E5 100%)', Icon: Globe },
    { gradient: 'linear-gradient(135deg, #1E293B 0%, #7C3AED 100%)', Icon: Cpu },
    { gradient: 'linear-gradient(135deg, #312E81 0%, #4F46E5 100%)', Icon: BookOpen },
  ];

  const getVisualForCourse = (courseName) => {
    let hash = 0;
    for (let i = 0; i < courseName.length; i++) {
      hash = courseName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % courseVisuals.length;
    return courseVisuals[index];
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '2rem 3rem' }}>
          <Header />
          <DotsLoader />
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Sidebar />

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem 3rem' }}>
        <Header />

        {error && (
          <div style={{ 
            padding: '1rem', 
            marginBottom: '2rem', 
            background: 'rgba(255, 77, 77, 0.1)', 
            border: '1px solid rgb(255, 77, 77)',
            borderRadius: '8px',
            color: 'rgb(255, 100, 100)'
          }}>
            {error}
          </div>
        )}

        {/* Search Bar */}
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

        {/* Courses Section */}
        <section>
          {filteredCourses.length === 0 ? (
            <div className="glass" style={{ 
              padding: '4rem 2rem', 
              borderRadius: '24px', 
              border: '1px solid var(--border)',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No matching courses found.</p>
              <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Try adjusting your search query.</p>
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
                  onClick={() => window.location.href = `/course/${course._id}`}
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
                      <span style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(255,255,255,0.3)' }}>ACTIVE</span>
                    </div>
                  </div>
                  <div style={{ padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>{course.title}</h3>
                    <button 
                      className="glow-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/course/${course._id}`;
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
        </section>
      </main>
    </div>
  );
};

export default Courses;
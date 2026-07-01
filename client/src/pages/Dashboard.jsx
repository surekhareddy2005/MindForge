import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { getMyCourses, getModules, getSessions, getChats, getAverageRating } from '../services/api';
import DotsLoader from '../components/DotsLoader';
import { Code2, Database, Cpu, Globe, BookOpen, Layers, Terminal, Brain } from 'lucide-react';

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    coursesEnrolled: 0,
    modulesFinished: 0,
    rating: 0,
    activeDays: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Get current user ID from localStorage
        const userString = localStorage.getItem('user');
        const user = userString ? JSON.parse(userString) : null;
        const userId = user?._id || user?.id;

        // Fetch courses and rating in parallel (independent requests)
        const [coursesResponse, ratingResult] = await Promise.allSettled([
          getMyCourses(),
          userId ? getAverageRating(userId) : Promise.resolve(null)
        ]);

        const userCourses = coursesResponse.status === 'fulfilled' 
          ? (coursesResponse.value.data || []) 
          : [];
        setCourses(userCourses);

        // Calculate stats
        let totalModules = 0;
        let averageRating = 0;
        let uniqueDates = new Set();

        if (ratingResult.status === 'fulfilled' && ratingResult.value) {
          averageRating = ratingResult.value.data?.averageRating || 0;
        }

        // Fetch modules and sessions for all courses in parallel
        const courseDataPromises = userCourses.map(async (course) => {
          try {
            const [modulesRes, sessionsRes] = await Promise.all([
              getModules(course._id),
              getSessions(course._id)
            ]);
            return {
              modules: modulesRes.data || [],
              sessions: sessionsRes.data || []
            };
          } catch (err) {
            console.error('Error fetching modules/sessions for course:', course._id, err);
            return { modules: [], sessions: [] };
          }
        });

        const courseResults = await Promise.all(courseDataPromises);
        courseResults.forEach(({ modules, sessions }) => {
          totalModules += modules.length;
          sessions.forEach(session => {
            if (session.date) {
              uniqueDates.add(session.date);
            }
          });
        });

        setStats({
          coursesEnrolled: userCourses.length,
          modulesFinished: totalModules,
          rating: averageRating,
          activeDays: uniqueDates.size // Count of unique dates
        });

        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '2rem 3rem', display: 'flex', flexDirection: 'column' }}>
          <Header />
          <DotsLoader />
        </main>
      </div>
    );
  }

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

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
          {[
            { label: 'Courses Enrolled', value: stats.coursesEnrolled.toString(), color: 'var(--primary)' },
            { label: 'Modules Finished', value: stats.modulesFinished.toString(), color: 'var(--text-primary)' },
            { label: 'Rating', value: stats.rating.toString(), color: '#3b82f6' },
            { label: 'Active Days', value: stats.activeDays.toString(), color: 'var(--primary)' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass" 
              style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)' }}
            >
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{stat.label}</p>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, color: stat.color }}>{stat.value}</h2>
            </motion.div>
          ))}
        </div>

        {/* Recent Courses Section */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {courses.length > 0 ? 'Your Courses' : 'No Courses Available'}
            </h2>
            {courses.length > 3 && (
              <button 
                onClick={() => window.location.href = '/courses'}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--primary)', 
                  cursor: 'pointer', 
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s ease',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.target.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  e.target.style.opacity = '1';
                }}
              >
                View All →
              </button>
            )}
          </div>

          {courses.length === 0 ? (
            <div className="glass" style={{ 
              padding: '2rem', 
              borderRadius: '24px', 
              border: '1px solid var(--border)',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              <p>You haven't enrolled in any courses yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              {courses.slice(0, 3).map((course, index) => (
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
                    height: '180px', 
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
                        return <Icon size={48} color="rgba(248,250,252,0.25)" strokeWidth={1.5} />;
                      })()
                    )}
                    <div style={{ position: 'absolute', bottom: '12px', left: '12px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '6px', background: 'var(--primary-surface)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600 }}>ACTIVE</span>
                    </div>
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>{course.title}</h3>
                    <button 
                      className="glow-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/course/${course._id}`;
                      }}
                      style={{ 
                        padding: '6px 12px', 
                        fontSize: '0.75rem', 
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

export default Dashboard;
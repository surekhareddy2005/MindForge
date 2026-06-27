import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getMyCourses, getModules } from '../../services/api';
import DotsLoader from '../../components/DotsLoader';
import StudentSidebar from '../../components/student/StudentSidebar';
import Header from '../../components/Header';

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    coursesEnrolled: 0,
    modulesAvailable: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const coursesResponse = await getMyCourses();
        const userCourses = coursesResponse.data || [];
        setCourses(userCourses);

        const moduleResults = await Promise.all(
          userCourses.map(async (course) => {
            try {
              const modulesRes = await getModules(course._id);
              return (modulesRes.data || []).length;
            } catch (err) {
              return 0;
            }
          })
        );
        const totalModules = moduleResults.reduce((sum, count) => sum + count, 0);

        setStats({
          coursesEnrolled: userCourses.length,
          modulesAvailable: totalModules,
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching student dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getImageForCourse = (courseName) => {
    const name = courseName.toLowerCase();
    if (name.includes('owl')) return '/owlcoder.png';
    if (name.includes('dsa')) return '/dsa.png';
    return null;
  };

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <StudentSidebar />
      <main style={{ flex: 1, padding: '2rem 3rem' }}>
        <Header />
        <DotsLoader />
      </main>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <StudentSidebar />
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
          {[
            { label: 'Courses Enrolled', value: stats.coursesEnrolled.toString(), color: 'var(--primary)' },
            { label: 'Modules Available', value: stats.modulesAvailable.toString(), color: 'var(--text-primary)' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass"
              style={{ padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)' }}
            >
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</p>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: stat.color, fontFamily: 'Playfair Display, serif' }}>{stat.value}</h2>
            </motion.div>
          ))}
        </div>

        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Playfair Display, serif' }}>
              {courses.length > 0 ? 'My Active Courses' : 'No Enrolled Courses'}
            </h2>
            {courses.length > 3 && (
              <button
                onClick={() => navigate('/student/courses')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                View All Courses
              </button>
            )}
          </div>

          {courses.length === 0 ? (
            <div className="glass" style={{
              padding: '4rem',
              borderRadius: '32px',
              border: '1px solid var(--border)',
              textAlign: 'center',
              color: 'var(--text-secondary)',
              background: 'rgba(255,255,255,0.01)'
            }}>
              <p style={{ fontSize: '1.1rem' }}>Your course list is currently empty. Contact your administrator to enroll in a course.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
              {courses.slice(0, 6).map((course, index) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass"
                  style={{ borderRadius: '28px', overflow: 'hidden', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.3s ease', background: 'var(--bg-secondary)' }}
                  onClick={() => window.location.href = `/student/course/${course._id}`}
                >
                  <div style={{
                    height: '200px',
                    background: getImageForCourse(course.title)
                      ? `url(${getImageForCourse(course.title)})`
                      : 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                  }}>
                    <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
                      <span style={{ padding: '6px 14px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.9)', color: 'white', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px' }}>ENROLLED</span>
                    </div>
                  </div>
                  <div style={{ padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-primary)', fontWeight: 700, height: '3rem', overflow: 'hidden' }}>{course.title}</h3>
                    <button
                      className="glow-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/student/course/${course._id}`;
                      }}
                      style={{ padding: '10px 24px', fontSize: '0.85rem', width: 'auto' }}
                    >
                      Enter Course
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

export default StudentDashboard;

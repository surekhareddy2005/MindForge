import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Mail,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { getMyCourses } from '../services/api';
import DotsLoader from '../components/DotsLoader';
import CustomSelect from '../components/ui/CustomSelect';
import SearchBar from '../components/ui/SearchBar';

const CourseStudents = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Students');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const coursesResponse = await getMyCourses();
        const currentCourse = coursesResponse.data.find(c => c._id === courseId);
        setCourse(currentCourse);
        if (courseId) localStorage.setItem('activeCourseId', courseId);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to load student list');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  const handleExport = () => {
    if (!course?.students || course.students.length === 0) return;

    const headers = ['Name', 'Email', 'Status'];
    const rows = course.students.map(s => [
      `"${s.name}"`,
      `"${s.email}"`,
      '"Active"'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${course.title.replace(/\s+/g, '_')}_Students.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStudents = course?.students?.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All Students' || statusFilter === 'Active';
    
    return matchesSearch && matchesStatus;
  }) || [];

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '2rem 3rem' }}>
          <Header title="Student Management" />
          <DotsLoader />
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Sidebar />
      
      <main style={{ flex: 1, padding: '2rem 3rem' }}>
        <Header title="Student Roster" subtitle={`Managing ${course?.students?.length || 0} students for ${course?.title}`} />

        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '3rem' }}>
          <button 
            onClick={() => navigate(`/course/${courseId}`)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', 
              color: 'var(--text-secondary)', padding: '10px 20px', borderRadius: '12px',
              cursor: 'pointer', fontWeight: 600
            }}
          >
            <ArrowLeft size={18} /> Back to Course
          </button>
        </div>

        <div style={{ 
          background: 'rgba(255,255,255,0.01)', 
          border: '1px solid rgba(255,255,255,0.05)', 
          borderRadius: '24px',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem', gap: '2rem' }}>
            <SearchBar 
                value={searchTerm} 
                onChange={setSearchTerm} 
                placeholder="Search by name or email..." 
                style={{ maxWidth: '500px' }}
            />
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <CustomSelect 
                value={statusFilter} 
                onChange={setStatusFilter} 
                options={['All Students', 'Active', 'Inactive']} 
                placeholder="All Students"
              />

              <button 
                onClick={handleExport}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '8px', 
                  background: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.2)', 
                  color: 'var(--primary)', padding: '0 24px', borderRadius: '16px', cursor: 'pointer',
                  fontWeight: 600, fontSize: '0.9rem'
                }}
              >
                <Download size={18} /> Export
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>STUDENT NAME</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>EMAIL ADDRESS</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student, i) => (
                    <motion.tr 
                      key={student._id || i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      style={{ 
                        borderBottom: '1px solid rgba(255,255,255,0.02)',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                      <td style={{ padding: '1.2rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ 
                            width: '36px', height: '36px', borderRadius: '10px', 
                            background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: '0.9rem'
                          }}>
                            {student.name?.[0]?.toUpperCase() || 'S'}
                          </div>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{student.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Mail size={14} /> {student.email}
                        </div>
                      </td>
                      <td style={{ padding: '1.2rem 1.5rem' }}>
                        <span style={{ 
                          padding: '4px 12px', borderRadius: '20px', background: 'rgba(34, 197, 94, 0.1)', 
                          color: '#22c55e', fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(34, 197, 94, 0.2)' 
                        }}>
                          Active
                        </span>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No students found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
             <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
               Showing {filteredStudents.length} of {course?.students?.length || 0} students
             </p>
             <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <button 
                  disabled 
                  style={{ 
                    width: '40px', height: '40px', borderRadius: '50%', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-primary)', cursor: 'not-allowed',
                    background: 'rgba(255,255,255,0.02)', opacity: 0.3
                  }}
                >
                  <ChevronLeft size={20} />
                </button>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }} />
                </div>

                <button 
                  disabled 
                  style={{ 
                    width: '40px', height: '40px', borderRadius: '50%', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: 'none', color: 'var(--bg-main)', cursor: 'not-allowed',
                    background: 'rgba(255,255,255,0.02)', opacity: 0.3
                  }}
                >
                  <ChevronRight size={20} />
                </button>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseStudents;

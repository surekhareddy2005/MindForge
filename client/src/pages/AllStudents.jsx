import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail,
  Download,
  Briefcase,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { getMyCourses } from '../services/api';
import DotsLoader from '../components/DotsLoader';
import CustomSelect from '../components/ui/CustomSelect';
import SearchBar from '../components/ui/SearchBar';

const AllStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [courseFilter, setCourseFilter] = useState('All Courses');
  const [currentPage, setCurrentPage] = useState(0);
  const [error, setError] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, statusFilter, courseFilter]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const coursesResponse = await getMyCourses();
        setCourses(coursesResponse.data || []);
        
        const allStudents = [];
        coursesResponse.data.forEach(course => {
          course.students.forEach(student => {
            allStudents.push({
              ...student,
              courseId: course._id,
              courseTitle: course.title
            });
          });
        });
        
        setStudents(allStudents);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load student database');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleExport = () => {
    if (filteredStudents.length === 0) return;
    const headers = ['Name', 'Email', 'Course', 'Status'];
    const rows = filteredStudents.map(s => [
      `"${s.name}"`, 
      `"${s.email}"`, 
      `"${s.courseTitle}"`,
      `"${s.isActive !== false ? 'Active' : 'Inactive'}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Students_Export_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const isStudentActive = student.isActive !== false;
    const matchesStatus = statusFilter === 'All Statuses' || 
                         (statusFilter === 'Active' && isStudentActive) ||
                         (statusFilter === 'Inactive' && !isStudentActive);
    
    const courseObj = courses.find(c => c.title === courseFilter);
    const matchesCourse = courseFilter === 'All Courses' || student.courseId === courseObj?._id;
    
    return matchesSearch && matchesStatus && matchesCourse;
  });

  const paginatedStudents = filteredStudents.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '2rem 3rem' }}>
          <Header title="Student Directory" subtitle="Loading enrollment entries across all courses" />
          <DotsLoader label="Loading students..." sublabel="Fetching your courses and enrollment data." />
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Sidebar />
      
      <main style={{ flex: 1, padding: '2rem 3rem' }}>
        <Header title="Student Directory" subtitle={`Managing ${students.length} enrollment entries across all courses`} />

        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: '2.5rem', gap: '1.5rem' }}>
            <SearchBar 
                value={searchTerm} 
                onChange={setSearchTerm} 
                placeholder="Search by name or email..." 
            />
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <CustomSelect 
                value={courseFilter} 
                onChange={setCourseFilter} 
                options={['All Courses', ...courses.map(c => c.title)]} 
                placeholder="All Courses"
              />

              <CustomSelect 
                value={statusFilter} 
                onChange={setStatusFilter} 
                options={['All Statuses', 'Active', 'Inactive']} 
                placeholder="All Statuses"
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
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>COURSE</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.length > 0 ? (
                  paginatedStudents.map((student, i) => (
                    <motion.tr 
                      key={`${student._id}-${student.courseId}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.01 }}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.2s ease' }}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                          <Briefcase size={14} color="var(--primary)" />
                          {student.courseTitle}
                        </div>
                      </td>
                      <td style={{ padding: '1.2rem 1.5rem' }}>
                        <span style={{ 
                          padding: '4px 12px', borderRadius: '20px', 
                          background: student.isActive !== false ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                          color: student.isActive !== false ? '#22c55e' : '#ef4444', 
                          fontSize: '0.75rem', fontWeight: 600, 
                          border: `1px solid ${student.isActive !== false ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` 
                        }}>
                          {student.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No students found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
             <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
               Showing {paginatedStudents.length} of {filteredStudents.length} results
             </p>

             {filteredStudents.length > itemsPerPage && (
               <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                 <button 
                   onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                   disabled={currentPage === 0}
                   style={{ 
                     width: '40px', height: '40px', borderRadius: '50%', 
                     display: 'flex', alignItems: 'center', justifyContent: 'center',
                     border: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-primary)', cursor: 'pointer',
                     background: 'rgba(255,255,255,0.02)', transition: 'all 0.2s ease',
                     opacity: currentPage === 0 ? 0.3 : 1
                   }}
                 >
                   <ChevronLeft size={20} />
                 </button>
                 
                 <div style={{ display: 'flex', gap: '8px' }}>
                   {Array.from({ length: Math.ceil(filteredStudents.length / itemsPerPage) }).map((_, idx) => (
                     <div 
                       key={idx}
                       style={{ 
                         width: idx === currentPage ? '10px' : '6px', 
                         height: idx === currentPage ? '10px' : '6px', 
                         borderRadius: '50%', 
                         background: idx === currentPage ? 'var(--primary)' : 'rgba(255,255,255,0.2)',
                         transition: 'all 0.3s ease'
                       }}
                     />
                   ))}
                 </div>

                 <button 
                   onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredStudents.length / itemsPerPage) - 1, prev + 1))}
                   disabled={currentPage === Math.ceil(filteredStudents.length / itemsPerPage) - 1}
                   style={{ 
                     width: '40px', height: '40px', borderRadius: '50%', 
                     display: 'flex', alignItems: 'center', justifyContent: 'center',
                     border: 'none', color: 'var(--bg-main)', cursor: 'pointer',
                     background: currentPage === Math.ceil(filteredStudents.length / itemsPerPage) - 1 ? 'rgba(255,255,255,0.05)' : 'var(--primary)',
                     transition: 'all 0.2s ease',
                     opacity: currentPage === Math.ceil(filteredStudents.length / itemsPerPage) - 1 ? 0.3 : 1
                   }}
                 >
                   <ChevronRight size={20} />
                 </button>
               </div>
             )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AllStudents;

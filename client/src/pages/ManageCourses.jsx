import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Trash2, Edit2, X, Check, GraduationCap, Layers, AlertTriangle } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import api from '../services/api';
import SearchBar from '../components/ui/SearchBar';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    title: '',
    mentors: [],
    students: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (statusMsg.text) {
      const timer = setTimeout(() => setStatusMsg({ type: '', text: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMsg]);

  const fetchData = async () => {
    try {
      const [coursesRes, mentorsRes, studentsRes] = await Promise.all([
        api.get('/courses'),
        api.get('/user/mentors'),
        api.get('/user/students')
      ]);
      setCourses(coursesRes.data);
      setMentors(mentorsRes.data);
      setStudents(studentsRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleOpenModal = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        title: course.title,
        mentors: course.mentors.map(m => m._id),
        students: course.students.map(s => s._id)
      });
    } else {
      setEditingCourse(null);
      setFormData({
        title: '',
        mentors: [],
        students: []
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await api.put(`/courses/${editingCourse._id}`, formData);
        setStatusMsg({ type: 'success', text: 'Course updated successfully!' });
      } else {
        await api.post('/courses', formData);
        setStatusMsg({ type: 'success', text: 'New course created successfully!' });
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      setStatusMsg({ type: 'error', text: "Error saving course" });
    }
  };

  const confirmDelete = (course) => {
    setCourseToDelete(course);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!courseToDelete) return;
    try {
      await api.delete(`/courses/${courseToDelete._id}`);
      setStatusMsg({ type: 'success', text: `Course ${courseToDelete.title} deleted.` });
      setShowDeleteModal(false);
      setCourseToDelete(null);
      fetchData();
    } catch (error) {
      setStatusMsg({ type: 'error', text: "Error deleting course" });
    }
  };

  const toggleSelection = (id, type) => {
    setFormData(prev => {
      const current = prev[type];
      const updated = current.includes(id) 
        ? current.filter(i => i !== id) 
        : [...current, id];
      return { ...prev, [type]: updated };
    });
  };

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout title="Manage Courses" subtitle="Create and configure university courses">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        <AnimatePresence>
          {statusMsg.text && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              style={{
                position: 'fixed',
                top: '2rem',
                right: '2rem',
                zIndex: 3000,
                background: statusMsg.type === 'success' ? '#10b981' : '#ef4444',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                fontWeight: 600
              }}
            >
              {statusMsg.type === 'success' ? <Check size={20} /> : <AlertTriangle size={20} />}
              {statusMsg.text}
              <X size={18} style={{ cursor: 'pointer', marginLeft: '1rem' }} onClick={() => setStatusMsg({ type: '', text: '' })} />
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SearchBar 
            value={searchTerm} 
            onChange={setSearchTerm} 
            placeholder="Search courses..." 
            style={{ maxWidth: '400px' }}
          />
          <button 
            onClick={() => handleOpenModal()}
            className="glow-btn" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem' }}
          >
            <Plus size={18} /> Create Course
          </button>
        </div>

        <div style={{ 
          background: 'rgba(255,255,255,0.01)', 
          borderRadius: '24px', 
          border: '1px solid rgba(255,255,255,0.05)',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(79, 70, 229, 0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>COURSE NAME</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>MENTORS</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>STUDENTS</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ padding: '4rem', textAlign: 'center' }}>
                    <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
                    <p style={{ color: 'var(--text-secondary)' }}>Loading courses...</p>
                  </td>
                </tr>
              ) : filteredCourses.length > 0 ? filteredCourses.map((course) => (
                <tr key={course._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '12px', 
                        background: 'rgba(79, 70, 229, 0.1)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'var(--primary)'
                      }}>
                        <BookOpen size={20} />
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{course.title}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                      {course.mentors.map(m => (
                        <span key={m._id} style={{ fontSize: '0.75rem', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                          {m.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      <GraduationCap size={16} /> {course.students.length} Students
                    </div>
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => handleOpenModal(course)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem' }}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => confirmDelete(course)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <Layers size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <p>No courses found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <AnimatePresence>
          {showModal && (
            <div style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
              backdropFilter: 'blur(8px)'
            }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                  background: 'var(--bg-main)',
                  width: '800px',
                  maxHeight: '90vh',
                  borderRadius: '28px',
                  padding: '2.5rem',
                  position: 'relative',
                  border: '1px solid rgba(255,255,255,0.1)',
                  overflowY: 'auto'
                }}
              >
                <button 
                  onClick={() => setShowModal(false)}
                  style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  <X size={24} />
                </button>

                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', fontFamily: 'Playfair Display, serif' }}>
                  {editingCourse ? 'Edit Course' : 'Create New Course'}
                </h2>
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Course Title</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Advanced AI Architecture"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-primary)' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '1rem' }}>Assign Mentors</label>
                      <div style={{ height: '300px', overflowY: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '1rem' }}>
                        {mentors.map(m => (
                          <div 
                            key={m._id} 
                            onClick={() => toggleSelection(m._id, 'mentors')}
                            style={{ 
                              padding: '0.8rem', 
                              borderRadius: '8px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between', 
                              cursor: 'pointer',
                              background: formData.mentors.includes(m._id) ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                              marginBottom: '0.5rem'
                            }}
                          >
                            <span style={{ fontSize: '0.9rem', color: formData.mentors.includes(m._id) ? 'var(--primary)' : 'var(--text-primary)' }}>{m.name}</span>
                            {formData.mentors.includes(m._id) && <Check size={16} color="var(--primary)" />}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '1rem' }}>Assign Students</label>
                      <div style={{ height: '300px', overflowY: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '1rem' }}>
                        {students.map(s => (
                          <div 
                            key={s._id} 
                            onClick={() => toggleSelection(s._id, 'students')}
                            style={{ 
                              padding: '0.8rem', 
                              borderRadius: '8px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between', 
                              cursor: 'pointer',
                              background: formData.students.includes(s._id) ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                              marginBottom: '0.5rem'
                            }}
                          >
                            <span style={{ fontSize: '0.9rem', color: formData.students.includes(s._id) ? 'var(--primary)' : 'var(--text-primary)' }}>{s.name}</span>
                            {formData.students.includes(s._id) && <Check size={16} color="var(--primary)" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="glow-btn" style={{ padding: '1rem', fontWeight: 700 }}>
                    {editingCourse ? 'Save Changes' : 'Launch Course'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showDeleteModal && (
            <div style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
              backdropFilter: 'blur(8px)'
            }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                  background: 'var(--bg-main)',
                  width: '400px',
                  borderRadius: '24px',
                  padding: '2rem',
                  textAlign: 'center',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: '#ef4444',
                  margin: '0 auto 1.5rem auto'
                }}>
                  <Trash2 size={30} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Delete Course?</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.5 }}>
                  Are you sure you want to delete <strong>{courseToDelete?.title}</strong>? This will remove all associated modules.
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={() => setShowDeleteModal(false)}
                    style={{ 
                      flex: 1, 
                      padding: '0.8rem', 
                      borderRadius: '12px', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      background: 'rgba(255,255,255,0.05)', 
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDelete}
                    style={{ 
                      flex: 1, 
                      padding: '0.8rem', 
                      borderRadius: '12px', 
                      border: 'none', 
                      background: '#ef4444', 
                      color: 'white',
                      cursor: 'pointer',
                      fontWeight: 600,
                      boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                    }}
                  >
                    Yes, Delete
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </MainLayout>
  );
};

export default ManageCourses;

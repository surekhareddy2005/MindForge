import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Clock, 
  FileText, 
  MessageCircle, 
  ArrowLeft,
  Calendar,
  Layers,
  User,
  Plus,
  Search,
  X,
  Mail,
  Trash2,
  AlertCircle
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { getModules, createModule, getMyCourses, deleteModule } from '../services/api';
import { toast, Toaster } from 'react-hot-toast';
import DotsLoader from '../components/DotsLoader';

const DeleteModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1100, padding: '20px'
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass"
            style={{
              maxWidth: '450px', width: '100%', padding: '2.5rem',
              borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)',
              textAlign: 'center'
            }}
          >
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <AlertCircle size={30} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>{title}</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>{message}</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={onClose}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)',
                  color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600
                }}
              >
                Cancel
              </button>
              <button 
                onClick={onConfirm}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px',
                  background: '#ef4444', border: 'none',
                  color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600,
                  boxShadow: '0 10px 20px rgba(239, 68, 68, 0.2)'
                }}
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newModuleName, setNewModuleName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalConfig, setDeleteModalConfig] = useState({ isOpen: false, id: null });

  const fetchData = async () => {
    try {
      setLoading(true);
      const coursesResponse = await getMyCourses();
      const currentCourse = coursesResponse.data.find(c => c._id === courseId);
      setCourse(currentCourse);
      if (courseId) localStorage.setItem('activeCourseId', courseId);

      const modulesResponse = await getModules(courseId);
      setModules(modulesResponse.data || []);
    } catch (err) {
      console.error('Error fetching course data:', err);
      setError('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const filteredModules = modules.filter(module =>
    module.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateModule = async (e) => {
    e.preventDefault();
    if (!newModuleName.trim()) return;

    try {
      setIsAdding(true);
      await createModule({ title: newModuleName, courseId });
      toast.success('Module created successfully');
      setNewModuleName('');
      setShowAddForm(false);
      await fetchData();
    } catch (err) {
      console.error('Error creating module:', err);
      toast.error(err.response?.data?.msg || 'Error creating module');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteModuleClick = (e, id) => {
    e.stopPropagation();
    setDeleteModalConfig({ isOpen: true, id });
  };

  const confirmDeleteModule = async () => {
    const id = deleteModalConfig.id;
    setDeleteModalConfig({ isOpen: false, id: null });
    
    try {
      toast.loading('Deleting module and its contents...', { id: 'delete-module' });
      await deleteModule(id);
      toast.success('Module and all sessions deleted', { id: 'delete-module' });
      await fetchData();
    } catch (err) {
      console.error('Error deleting module:', err);
      toast.error('Failed to delete module', { id: 'delete-module' });
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '2rem 3rem' }}>
          <Header title="Course Details" />
          <DotsLoader />
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Toaster position="bottom-right" toastOptions={{ 
        style: { background: '#1a1a1a', color: 'var(--text-primary)', border: '1px solid var(--primary)', borderLeft: '4px solid var(--primary)', boxShadow: '0 4px 15px rgba(79, 70, 229, 0.2)', borderRadius: '12px', fontFamily: 'Montserrat, sans-serif', fontSize: '0.9rem' },
        success: { iconTheme: { primary: 'var(--primary)', secondary: '#1a1a1a' } }
      }} />
      <Sidebar />
      
      <main style={{ flex: 1, padding: '2rem 3rem' }}>
        <Header title={course?.title || 'Course Details'} subtitle="Manage modules and track your progress" />

        <DeleteModal 
          isOpen={deleteModalConfig.isOpen}
          onClose={() => setDeleteModalConfig({ isOpen: false, id: null })}
          onConfirm={confirmDeleteModule}
          title="Delete Module?"
          message="This will permanently delete the module and ALL its sessions, uploaded files, and AI generated content. This action cannot be undone."
        />

        {error && (
          <div style={{ padding: '1rem', background: 'rgba(255,0,0,0.1)', color: 'red', borderRadius: '8px', marginBottom: '2rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
          {/* Modules List */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', gap: '2rem' }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.2rem' }}>
                  {searchTerm ? `Search Results (${filteredModules.length})` : 'Course Modules'}
                </h2>
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
                    placeholder="Find a module..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ 
                      background: 'none', border: 'none', color: 'var(--text-primary)', width: '100%', 
                      outline: 'none', fontSize: '1rem', fontFamily: 'Montserrat, sans-serif'
                    }}
                  />
                </div>
              </div>
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="glow-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '0.9rem', height: 'fit-content' }}
              >
                <Plus size={18} /> Add Module
              </button>
            </div>

            {showAddForm && (
              <motion.form 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleCreateModule}
                className="glass"
                style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)', marginBottom: '2rem' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem' }}>Create New Module</h3>
                  <button 
                    type="button" 
                    onClick={() => setShowAddForm(false)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem' }}
                  >
                    <X size={16} /> Cancel
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input 
                    type="text"
                    value={newModuleName}
                    onChange={(e) => setNewModuleName(e.target.value)}
                    placeholder="Module Title (e.g., Deep Learning Basics)"
                    style={{ 
                      flex: 1, 
                      padding: '12px 16px', 
                      borderRadius: '10px', 
                      background: 'rgba(255,255,255,0.05)', 
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      outline: 'none'
                    }}
                  />
                  <button 
                    disabled={isAdding}
                    type="submit"
                    className="glow-btn"
                    style={{ padding: '0 2rem' }}
                  >
                    {isAdding ? <DotsLoader compact size={18} label="Creating..." /> : 'Create'}
                  </button>
                </div>
              </motion.form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredModules.length === 0 ? (
                <div className="glass" style={{ padding: '3rem', borderRadius: '20px', textAlign: 'center', border: '1px solid var(--border)' }}>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    {searchTerm ? `No modules matching "${searchTerm}"` : 'No modules created yet for this course.'}
                  </p>
                </div>
              ) : (
                filteredModules.map((module, i) => (
                  <motion.div 
                    key={module._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass"
                    style={{ 
                      padding: '1.5rem', 
                      borderRadius: '20px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      border: '1px solid var(--border)',
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate(`/course/${courseId}/module/${module._id}`)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        borderRadius: '12px', 
                        background: 'rgba(212, 175, 55, 0.1)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'var(--primary)'
                      }}>
                        <Layers size={24} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{module.title}</h3>
                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '4px' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={14} /> Created: {new Date(module.createdAt || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <div 
                        onClick={(e) => handleDeleteModuleClick(e, module._id)}
                        style={{ padding: '8px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', cursor: 'pointer' }} 
                        title="Delete Module"
                      >
                         <Trash2 size={18} color="#ef4444" />
                      </div>
                      <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)' }} title="View Module">
                         <Play size={18} color="var(--text-secondary)" />
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </section>

          <aside>
            <div className="glass" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)', marginBottom: '2rem' }}>
               <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.5rem' }}>Course Summary</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Total Modules</span>
                    <span style={{ fontWeight: 600 }}>{modules.length}</span>
                  </div>
                  <div 
                    onClick={() => navigate(`/course/${courseId}/students`)}
                    style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}
                  >
                    <span style={{ color: 'var(--text-secondary)' }}>Active Students</span>
                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{course?.students?.length || 0}</span>
                  </div>
               </div>
            </div>

             {/* Course Details box removed per user request */}
          </aside>
        </div>
      </main>
    </div>
  );
};

export default CourseDetails;

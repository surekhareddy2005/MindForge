import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Video, 
  Layout, 
  ArrowLeft, 
  MoreVertical, 
  PlayCircle, 
  Search,
  Trash2,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { getSessions, createSession, deleteSession } from '../services/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
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

const ModuleDetails = () => {
    const { courseId, moduleId } = useParams();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newSessionTitle, setNewSessionTitle] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [moduleName, setModuleName] = useState('');
    const [deleteModalConfig, setDeleteModalConfig] = useState({ isOpen: false, id: null });

    useEffect(() => {
        fetchSessions();
    }, [courseId, moduleId]);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const { getModules } = await import('../services/api');
            const modulesRes = await getModules(courseId);
            const currentModule = modulesRes.data.find(m => m._id === moduleId);
            if (currentModule) setModuleName(currentModule.title);

            const res = await getSessions(courseId);
            const moduleSessions = res.data.filter(s => s.moduleId?._id === moduleId || s.moduleId === moduleId || s.module === moduleId);
            setSessions(moduleSessions);
        } catch (err) {
            console.error('Error fetching sessions:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredSessions = sessions.filter(session =>
        session.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateSession = async (e) => {
        e.preventDefault();
        try {
            setIsCreating(true);
            await createSession({
                title: newSessionTitle,
                moduleId: moduleId,
                courseId: courseId
            });
            setNewSessionTitle('');
            setShowCreateModal(false);
            await fetchSessions();
            toast.success('Session created successfully');
        } catch (err) {
            console.error('Error creating session:', err);
            toast.error(err.response?.data?.msg || 'Failed to create session');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteSessionClick = (e, id) => {
        e.stopPropagation();
        setDeleteModalConfig({ isOpen: true, id });
    };

    const confirmDeleteSession = async () => {
        const id = deleteModalConfig.id;
        setDeleteModalConfig({ isOpen: false, id: null });
        
        try {
            toast.loading('Deleting session...', { id: 'delete-session' });
            await deleteSession(id);
            toast.success('Session and all contents deleted', { id: 'delete-session' });
            await fetchSessions();
        } catch (err) {
            console.error('Error deleting session:', err);
            toast.error('Failed to delete session', { id: 'delete-session' });
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
            <Toaster position="bottom-right" toastOptions={{ 
                style: { background: '#1a1a1a', color: 'var(--text-primary)', border: '1px solid var(--primary)', borderLeft: '4px solid var(--primary)', boxShadow: '0 4px 15px rgba(79, 70, 229, 0.2)', borderRadius: '12px', fontFamily: 'Montserrat, sans-serif', fontSize: '0.9rem' },
                success: { iconTheme: { primary: 'var(--primary)', secondary: '#1a1a1a' } }
            }} />
            <Sidebar />
            <main style={{ flex: 1, padding: '2rem 3rem' }}>
                <Header title={moduleName || 'Module Details'} subtitle="Manage sessions for this module" />

                <DeleteModal 
                    isOpen={deleteModalConfig.isOpen}
                    onClose={() => setDeleteModalConfig({ isOpen: false, id: null })}
                    onConfirm={confirmDeleteSession}
                    title="Delete Session?"
                    message="This will permanently delete the session and ALL its uploaded files and AI generated content. This cannot be undone."
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', gap: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flex: 1 }}>
                        
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px', 
                            padding: '10px 16px', 
                            borderRadius: '12px',
                            width: '100%',
                            maxWidth: '400px',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <Search size={18} color="var(--primary)" />
                            <input 
                                type="text" 
                                placeholder="Search sessions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ 
                                    background: 'none', border: 'none', color: 'var(--text-primary)', width: '100%', 
                                    outline: 'none', fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif'
                                }}
                            />
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="glow-btn"
                        style={{ 
                            padding: '10px 24px',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            height: 'fit-content'
                        }}
                    >
                        <Plus size={18} /> New Session
                    </button>
                </div>

                {loading ? (
                    <DotsLoader />
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        {filteredSessions.length > 0 ? (
                            filteredSessions.map((session, i) => (
                                <motion.div
                                    key={session._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="glass"
                                    style={{ 
                                        padding: '1.8rem', 
                                        borderRadius: '24px', 
                                        border: '1px solid var(--border)',
                                        cursor: 'pointer',
                                        background: 'var(--bg-secondary)',
                                        position: 'relative'
                                    }}
                                    onClick={() => navigate(`/session/${session._id}`)}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <div style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--primary)', padding: '10px', borderRadius: '12px', display: 'inline-flex' }}>
                                            <PlayCircle size={24} />
                                        </div>
                                        <button 
                                            onClick={(e) => handleDeleteSessionClick(e, session._id)}
                                            style={{ 
                                                background: 'rgba(239, 68, 68, 0.1)', 
                                                border: 'none', 
                                                color: '#ef4444', 
                                                padding: '8px', 
                                                borderRadius: '10px', 
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.4rem', fontWeight: 700, height: '3.2rem', overflow: 'hidden' }}>{session.title}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '1.2rem', opacity: 0.8 }}>
                                        <Calendar size={14} />
                                        <span>Created on {session.date}</span>
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                                        Upload audio or PDF to generate AI study materials.
                                    </p>
                                </motion.div>
                            ))
                        ) : (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem 2rem', background: 'rgba(255,255,255,0.01)', borderRadius: '24px', border: '1px solid var(--border)' }}>
                                <h3 style={{fontSize: '1.3rem', marginBottom: '1rem'}}>
                                    {searchTerm ? `No results for "${searchTerm}"` : 'No Sessions Created'}
                                </h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                    {searchTerm ? 'Try adjusting your search terms.' : 'Initialize your first session to begin the learning journey.'}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {showCreateModal && (
                    <div style={{ 
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                        background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 
                    }}>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass" 
                            style={{ padding: '2rem', borderRadius: '24px', width: '450px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                        >
                            <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Create New Session</h2>
                            <form onSubmit={handleCreateSession}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Session Title</label>
                                    <input 
                                        type="text" 
                                        value={newSessionTitle}
                                        onChange={(e) => setNewSessionTitle(e.target.value)}
                                        required
                                        style={{ 
                                            width: '100%', 
                                            padding: '12px 16px', 
                                            borderRadius: '10px', 
                                            background: 'rgba(255,255,255,0.05)', 
                                            border: '1px solid var(--border)',
                                            color: 'var(--text-primary)',
                                            outline: 'none'
                                        }}
                                        placeholder="e.g. Introduction to React Architecture"
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowCreateModal(false)}
                                        style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)', cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={isCreating}
                                        className="glow-btn"
                                        style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', fontWeight: 600, opacity: isCreating ? 0.7 : 1, cursor: isCreating ? 'not-allowed' : 'pointer' }}
                                    >
                                        {isCreating ? <DotsLoader compact size={18} label="Creating..." /> : 'Create Session'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ModuleDetails;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  PlayCircle, 
  Search,
  Calendar,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { getSessions, getModules } from '../../services/api';
import StudentSidebar from '../../components/student/StudentSidebar';
import Header from '../../components/Header';
import DotsLoader from '../../components/DotsLoader';
import SearchBar from '../../components/ui/SearchBar';

const StudentModuleDetails = () => {
    const { courseId, moduleId } = useParams();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [moduleName, setModuleName] = useState('');

    useEffect(() => {
        fetchSessions();
    }, [courseId, moduleId]);

    const fetchSessions = async () => {
        try {
            setLoading(true);
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

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
            <StudentSidebar />
            <main style={{ flex: 1, padding: '2rem 3rem' }}>
                <Header title={moduleName || 'Module Details'} subtitle="Explore sessions and learning materials" />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', gap: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                        {searchTerm ? `Results for "${searchTerm}"` : 'Module Sessions'}
                    </h2>
                    <div style={{ width: '100%', maxWidth: '400px' }}>
                        <SearchBar 
                            placeholder="Search sessions..."
                            value={searchTerm}
                            onChange={setSearchTerm}
                        />
                    </div>
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
                                        padding: '2rem', 
                                        borderRadius: '28px', 
                                        border: '1px solid var(--border)',
                                        cursor: 'pointer',
                                        background: 'var(--bg-secondary)',
                                        position: 'relative',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--primary)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--border)';
                                    }}
                                    onClick={() => navigate(`/student/session/${session._id}`)}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <div style={{ 
                                            background: 'rgba(212, 175, 55, 0.1)', 
                                            color: 'var(--primary)', 
                                            padding: '12px', 
                                            borderRadius: '14px', 
                                            display: 'inline-flex',
                                            boxShadow: 'inset 0 0 10px rgba(212, 175, 55, 0.05)'
                                        }}>
                                            <PlayCircle size={26} />
                                        </div>
                                        <div style={{ 
                                            background: 'rgba(255,255,255,0.03)', 
                                            padding: '6px 12px', 
                                            borderRadius: '8px', 
                                            fontSize: '0.7rem', 
                                            color: 'var(--text-muted)',
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            Available
                                        </div>
                                    </div>
                                    <h3 style={{ fontSize: '1.3rem', marginBottom: '0.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>{session.title}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1.5rem', opacity: 0.9 }}>
                                        <Calendar size={14} />
                                        <span>{new Date(session.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                                        Interactive learning materials and lecture summaries generated by AI.
                                    </p>
                                </motion.div>
                            ))
                        ) : (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '6rem 2rem', background: 'rgba(255,255,255,0.01)', borderRadius: '32px', border: '1px solid var(--border)' }}>
                                <div style={{ 
                                    width: '64px', 
                                    height: '64px', 
                                    borderRadius: '20px', 
                                    background: 'rgba(255,255,255,0.02)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    margin: '0 auto 1.5rem',
                                    color: 'var(--text-muted)'
                                }}>
                                    <Clock size={32} />
                                </div>
                                <h3 style={{fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem'}}>
                                    {searchTerm ? `No results for "${searchTerm}"` : 'No Sessions Yet'}
                                </h3>
                                <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>
                                    {searchTerm ? 'Try using different keywords to find your session.' : 'Your mentor hasn\'t added any sessions to this module yet.'}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default StudentModuleDetails;

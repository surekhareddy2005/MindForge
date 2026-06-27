import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  FileAudio,
  FileText,
  Pause,
  Play,
} from 'lucide-react';
import StudentSidebar from '../../components/student/StudentSidebar';
import Header from '../../components/Header';
import DotsLoader from '../../components/DotsLoader';
import { getMyCourses, getSessions, getUploads } from '../../services/api';

const AudioPlayer = ({ url }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const formatTime = (time) => {
    if (!Number.isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div style={{ marginTop: '1rem', paddingTop: '1.2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => setIsPlaying(false)}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
        <button
          onClick={togglePlay}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'var(--primary)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: '0 4px 12px var(--primary-glow)',
            transition: 'transform 0.2s ease',
            transform: isPlaying ? 'scale(0.95)' : 'scale(1)'
          }}
        >
          {isPlaying ? <Pause size={18} color="var(--bg-main)" /> : <Play size={18} color="var(--bg-main)" style={{ marginLeft: '2px' }} />}
        </button>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              background: 'var(--primary)',
              width: duration ? `${(currentTime / duration) * 100}%` : '0%',
              transition: 'width 0.1s linear',
              boxShadow: '0 0 10px var(--primary-glow)'
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};

const StudentSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [course, setCourse] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSessionData = useCallback(async () => {
    try {
      setLoading(true);
      const courses = await getMyCourses();
      let foundSession = null;
      let foundCourse = null;

      for (const c of courses.data || []) {
        const sessionsRes = await getSessions(c._id);
        foundSession = (sessionsRes.data || []).find(s => s._id === sessionId);
        if (foundSession) {
          foundCourse = c;
          break;
        }
      }

      setSession(foundSession);
      setCourse(foundCourse);

      if (foundSession) {
        const uploadsRes = await getUploads(foundSession._id);
        setUploadedFiles(uploadsRes.data || []);
      }
    } catch (err) {
      console.error('Error fetching student session:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSessionData();
  }, [fetchSessionData]);

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
        <StudentSidebar />
        <main style={{ flex: 1, padding: '2rem 3rem' }}>
            <Header title="Loading Session..." />
            <DotsLoader label="Fetching Study Materials" />
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <StudentSidebar />
      <main style={{ flex: 1, padding: '2rem 3rem' }}>
        <Header
          title={session?.title || 'Session Content'}
          subtitle={`Part of ${course?.title || 'Course'}`}
        />

        <div style={{ maxWidth: '1200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2.5rem' }}>
            <div style={{ width: '4px', height: '28px', background: 'var(--primary)', borderRadius: '2px', boxShadow: '0 0 10px var(--primary-glow)' }} />
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'Playfair Display, serif' }}>Study Materials</h2>
          </div>

          {uploadedFiles.length === 0 ? (
            <div className="glass" style={{ padding: '6rem 2rem', borderRadius: '32px', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '24px', 
                  background: 'rgba(255,255,255,0.02)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 1.5rem',
                  color: 'rgba(255,255,255,0.1)'
              }}>
                <FileText size={40} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No Materials Found</h3>
              <p>Your mentor hasn't uploaded any study guides or recordings for this session yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '2rem' }}>
              {uploadedFiles.map((file, idx) => {
                const isAudio = file.mimetype?.startsWith('audio/');

                return (
                  <motion.div
                    key={file._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass"
                    style={{
                      padding: '2rem',
                      borderRadius: '24px',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      background: 'var(--bg-secondary)',
                      transition: 'border-color 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem' }}>
                      <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', minWidth: 0 }}>
                        <div style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '16px',
                          background: 'rgba(212, 175, 55, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--primary)',
                          flexShrink: 0,
                          boxShadow: 'inset 0 0 12px rgba(212, 175, 55, 0.1)'
                        }}>
                          {isAudio ? <FileAudio size={28} /> : <FileText size={28} />}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
                            {file.originalname || 'Study Material'}
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
                            <span>{file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Document'}</span>
                            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)' }}>
                              <CheckCircle size={14} />
                              {file.isProcessed ? 'Ready to Study' : 'Processing...'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/study-guide/${sessionId}/${file._id}`)}
                        className="glow-btn"
                        style={{
                          padding: '8px 16px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          flexShrink: 0,
                          width: 'auto'
                        }}
                      >
                        <Eye size={16} /> View Guide
                      </button>
                    </div>

                    {isAudio && file.fileUrls?.[0] && <AudioPlayer url={file.fileUrls[0]} />}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentSession;

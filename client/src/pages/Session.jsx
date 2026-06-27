import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { 
  ArrowLeft, 
  Upload,
  FileText,
  Zap,
  CheckCircle,
  Loader,
  Music,
  Play,
  Pause,
  Headphones,
  Trash2,
  AlertCircle,
  Eye,
  FileAudio,
  ExternalLink,
  X,
  RefreshCw
} from 'lucide-react';
import { getSessions, uploadFiles, getMyCourses, getUploads, generateStudyGuide, generateFlashcards, generateInterview, generateQuiz, generatePdf, getUploadStatus, deleteUpload, deleteSession } from '../services/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Chatbot from '../components/Chatbot';
import DotsLoader from '../components/DotsLoader';
import NotificationCenter from '../components/NotificationCenter';
import NotificationPanel from '../components/NotificationPanel';

const DeleteModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px'
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
                  background: 'var(--primary-surface)', border: '1px solid var(--border)',
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
                  color: 'var(--bg-main)', cursor: 'pointer', fontWeight: 600,
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

const RequestOverlay = ({ show, title, subtitle }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1200,
          background: 'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="glass"
          style={{
            width: 'min(420px, 100%)',
            padding: '2.5rem',
            borderRadius: '24px',
            border: '1px solid var(--border)',
            boxShadow: '0 24px 70px rgba(0,0,0,0.45)'
          }}
        >
          <DotsLoader compact label={title} sublabel={subtitle} />
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const PipelineStages = ({ file, status, onGenerate, onView }) => {
  const stages = [
    { id: 'transcription', label: 'Processed', icon: <Music size={14} />, isComplete: file.isProcessed },
    { id: 'flashcards', label: 'Flashcards', icon: <Zap size={14} />, isComplete: file.flashcardsGenerated, generating: status.generatingFlashcards },
    { id: 'quiz', label: 'Quiz', icon: <Zap size={14} />, isComplete: file.quizGenerated, generating: status.generatingQuiz },
    { id: 'pdf', label: 'Summary PDF', icon: <FileText size={14} />, isComplete: file.pdfGenerated, generating: status.generatingPdf },
    { id: 'interview', label: 'Interview', icon: <Zap size={14} />, isComplete: file.interviewGenerated, generating: status.generatingInterview }
  ];

  return (
    <div style={{ width: '100%', marginTop: '1rem', padding: '1.5rem', background: 'var(--glass)', borderRadius: '20px', border: '1px solid var(--border)' }}>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>
        AI Study Pipeline
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
        {/* Connecting Lines (Background) */}
        <div style={{ position: 'absolute', top: '16px', left: '10%', right: '10%', height: '2px', background: 'rgba(255,255,255,0.05)', zIndex: 0 }} />
        
        {stages.map((stage, idx) => (
          <div key={stage.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, flex: 1, position: 'relative' }}>
            {/* The Node */}
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: stage.isComplete ? '#22c55e' : (stage.generating ? 'var(--primary)' : '#1a1a1a'),
              border: `2px solid ${stage.isComplete ? '#22c55e' : (stage.generating ? 'var(--primary)' : 'rgba(255,255,255,0.1)')}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: stage.isComplete ? 'white' : (stage.generating ? 'black' : 'var(--text-muted)'),
              transition: 'all 0.3s ease',
              boxShadow: stage.generating ? '0 0 15px var(--primary-glow)' : 'none',
              marginBottom: '10px'
            }}>
              {stage.generating ? <Loader size={14} className="animate-spin" /> : (stage.isComplete ? <CheckCircle size={16} /> : stage.icon)}
            </div>

            {/* Label */}
            <span style={{ fontSize: '0.7rem', color: stage.isComplete ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600, textAlign: 'center', marginBottom: '8px' }}>
              {stage.label}
            </span>

            {/* Action Button */}
            {file.isProcessed && !stage.isComplete && stage.id !== 'transcription' && (
              <button 
                onClick={() => onGenerate(file._id, stage.id)}
                disabled={stage.generating}
                style={{ 
                  padding: '5px 10px', borderRadius: '8px', 
                  fontSize: '0.65rem', background: 'var(--primary-surface)', 
                  border: '1px solid var(--border)', color: 'var(--primary)',
                  cursor: 'pointer', fontWeight: 700,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'var(--primary-glow)'}
                onMouseLeave={(e) => e.target.style.background = 'var(--primary-surface)'}
              >
                {stage.generating ? 'Gen...' : 'Generate'}
              </button>
            )}

            {stage.isComplete && stage.id !== 'transcription' && (
              <button
                onClick={() => onView(file._id, stage.id)}
                style={{ 
                  padding: '5px 10px', borderRadius: '8px', 
                  fontSize: '0.65rem', background: 'rgba(34, 197, 94, 0.1)', 
                  border: '1px solid rgba(34, 197, 94, 0.2)', color: '#22c55e',
                  cursor: 'pointer', fontWeight: 700
                }}
              >
                View
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const AudioPlayer = ({ url, title }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const onTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const onLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ 
      background: 'var(--glass)', 
      borderRadius: '16px', 
      padding: '1rem', 
      marginTop: '1rem',
      border: '1px solid var(--border)'
    }}>
      <audio 
        ref={audioRef} 
        src={url} 
        onTimeUpdate={onTimeUpdate} 
        onLoadedMetadata={onLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          onClick={togglePlay}
          style={{ 
            width: '40px', height: '40px', borderRadius: '50%', 
            background: 'var(--primary)', border: 'none', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0
          }}
        >
          {isPlaying ? <Pause size={20} color="var(--bg-main)" /> : <Play size={20} color="var(--bg-main)" style={{ marginLeft: '2px' }} />}
        </button>
        
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ 
              position: 'absolute', left: 0, top: 0, height: '100%', 
              background: 'var(--primary)', width: `${(currentTime / duration) * 100}%`,
              transition: 'width 0.1s linear'
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};

const Session = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [pipelineStatus, setPipelineStatus] = useState({});
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', id: null, title: '', message: '' });
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const fetchSessionData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const courses = await getMyCourses();
      let foundSession = null;
      let foundCourse = null;

      for (const c of courses.data) {
        const sessionsRes = await getSessions(c._id);
        foundSession = sessionsRes.data.find(s => s._id === sessionId);
        if (foundSession) {
          foundCourse = c;
          break;
        }
      }

      setSession(foundSession);
      setCourse(foundCourse);

      if (foundSession) {
        const uploadsRes = await getUploads(foundSession._id);
        setUploadedFiles(uploadsRes.data);
        
        setPipelineStatus(prev => {
            const newStatus = {};
            uploadsRes.data.forEach(file => {
              newStatus[file._id] = {
                generating: prev[file._id]?.generating || (file.status === 'processing'),
                progress: file.isProcessed ? 100 : 0,
                status: file.isProcessed ? 'Completed' : 'Ready to Process',
                flashcardsGenerated: file.flashcardsGenerated,
                interviewGenerated: file.interviewGenerated,
                quizGenerated: file.quizGenerated,
                pdfGenerated: file.pdfGenerated,
                generatingFlashcards: prev[file._id]?.generatingFlashcards || false,
                generatingInterview: prev[file._id]?.generatingInterview || false,
                generatingQuiz: prev[file._id]?.generatingQuiz || false,
                generatingPdf: prev[file._id]?.generatingPdf || false,
                error: file.lastError
              };
            });
            return newStatus;
        });
      }
      
      // Check for unread notifications
      const token = localStorage.getItem('token');
      if (token) {
        const notifRes = await axios.get(`${import.meta.env.VITE_API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHasUnread(notifRes.data.some(n => !n.isRead));
      }

    } catch (err) {
      console.error('Error fetching session:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSessionData();
  }, [fetchSessionData]);

  const handleFileSelection = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length === 0) return;
    setPendingFiles(prev => [...prev, ...selected]);
    e.target.value = '';
  };

  const removePendingFile = (index) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startUpload = async () => {
    if (pendingFiles.length === 0) return;

    const formData = new FormData();
    pendingFiles.forEach(file => formData.append('files', file));
    formData.append('sessionId', sessionId);
    if (course) formData.append('courseId', course._id);

    try {
      setUploading(true);
      setActiveRequest({
        title: `Uploading ${pendingFiles.length} file${pendingFiles.length === 1 ? '' : 's'}...`,
        subtitle: 'Please keep this page open while MindForge sends your material.'
      });
      toast.loading(`Uploading ${pendingFiles.length} files...`, { id: 'upload-toast' });
      await uploadFiles(formData);
      toast.success('Successfully uploaded!', { id: 'upload-toast' });
      setPendingFiles([]);
      await fetchSessionData(true);
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error(err.response?.data?.msg || 'Upload failed.', { id: 'upload-toast' });
    } finally {
      setUploading(false);
      setActiveRequest(null);
    }
  };

  const handleGenerateGuide = async (uploadId) => {
    if (pipelineStatus[uploadId]?.generating) return;

    setPipelineStatus(prev => ({
      ...prev,
      [uploadId]: { ...prev[uploadId], generating: true, status: 'Transcription Started' }
    }));

    try {
      await generateStudyGuide(uploadId);
      toast.success('Transcription started!');
      
      const pollInterval = setInterval(async () => {
        try {
          const res = await getUploadStatus(uploadId);
          if (res.data.isProcessed) {
            clearInterval(pollInterval);
            toast.success('✅ Transcription complete!');
            await fetchSessionData(true);
          } else if (res.data.status === 'failed') {
            clearInterval(pollInterval);
            toast.error('Transcription failed.');
            await fetchSessionData(true);
          }
        } catch (err) {
          clearInterval(pollInterval);
        }
      }, 5000);

      setTimeout(() => clearInterval(pollInterval), 300000);
    } catch (err) {
      toast.error('Failed to start transcription.');
      setPipelineStatus(prev => ({ ...prev, [uploadId]: { ...prev[uploadId], generating: false } }));
    }
  };

  const handleGenerateResource = async (uploadId, type) => {
    const statusKey = `generating${type.charAt(0).toUpperCase() + type.slice(1)}`;
    const generatedKey = `${type}Generated`;
    
    setPipelineStatus(prev => ({
      ...prev,
      [uploadId]: { ...prev[uploadId], [statusKey]: true, error: null }
    }));

    const toastId = toast.loading(`Generating ${type}...`);
    try {
      if (type === 'flashcards') await generateFlashcards(uploadId);
      if (type === 'interview') await generateInterview(uploadId);
      if (type === 'quiz') await generateQuiz(uploadId);
      if (type === 'pdf') await generatePdf(uploadId);
      
      // Fetch fresh session data to clear pipeline.lastError instantly in the UI
      await fetchSessionData(true);
      
      const pollInterval = setInterval(async () => {
        try {
          const res = await getUploadStatus(uploadId);
          if (res.data.lastError) {
            clearInterval(pollInterval);
            toast.error(`Error: ${res.data.lastError}`, { id: toastId });
            await fetchSessionData(true);
          } else if (res.data[generatedKey]) {
            clearInterval(pollInterval);
            toast.success(`${type} ready!`, { id: toastId });
            await fetchSessionData(true);
          }
        } catch (err) {
          clearInterval(pollInterval);
        }
      }, 3000);

      setTimeout(() => clearInterval(pollInterval), 120000);
    } catch (err) {
      toast.error(`Failed to start ${type} generation.`, { id: toastId });
      await fetchSessionData(true);
    }
  };

  const handleDeleteUpload = (uploadId) => {
    setModalConfig({
      isOpen: true,
      type: 'upload',
      id: uploadId,
      title: 'Delete Study Material?',
      message: 'This will permanently remove the file and all generated AI resources.'
    });
  };

  const handleDeleteSession = () => {
    setModalConfig({
      isOpen: true,
      type: 'session',
      id: sessionId,
      title: 'Delete Entire Session?',
      message: 'You are about to delete this entire session and all its associated materials.'
    });
  };

  const confirmDelete = async () => {
    const { type, id } = modalConfig;
    setModalConfig(prev => ({ ...prev, isOpen: false }));
    try {
      if (type === 'upload') {
        await deleteUpload(id);
        toast.success('Material deleted!');
      } else {
        await deleteSession(id);
        toast.success('Session deleted!');
        navigate(`/course/${course._id}`);
      }
      fetchSessionData(true);
    } catch (err) {
      toast.error(`Failed to delete ${type}.`);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
        <Sidebar />
        <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <DotsLoader label="Loading session..." minHeight="100vh" />
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
      <RequestOverlay show={!!activeRequest} title={activeRequest?.title} subtitle={activeRequest?.subtitle} />
      
      <DeleteModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
        title={modalConfig.title}
        message={modalConfig.message}
      />

      <NotificationPanel 
        isOpen={showNotifications} 
        onClose={() => {
          setShowNotifications(false);
          setHasUnread(false); // Assume they saw them
        }} 
      />

      <main style={{ flex: 1, padding: '2rem 3rem' }}>
        <Header 
          title={session?.title || 'Session Content'} 
          subtitle={`Class Material • ${course?.title || 'Course'}`} 
          onNotificationClick={() => setShowNotifications(true)}
          hasNotifications={hasUnread}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
          <button 
            onClick={handleDeleteSession}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', 
              color: '#ef4444', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer',
              fontSize: '0.9rem', fontWeight: 600
            }}
          >
            <Trash2 size={18} /> Delete Entire Session
          </button>
        </div>

        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem' }}>
            
            {uploadedFiles.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass"
                style={{
                  padding: '3rem',
                  borderRadius: '30px',
                  border: '1px dashed var(--border)',
                  textAlign: 'center',
                  background: uploading ? 'var(--primary-surface)' : 'var(--glass)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{
                    width: '70px', height: '70px', borderRadius: '20px',
                    background: 'var(--primary-surface)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    color: 'var(--primary)', margin: '0 auto 1.5rem'
                  }}>
                    <Upload size={30} />
                  </div>
                  <h3>Enhance This Session</h3>
                  <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 2rem' }}>
                    Upload lecture recordings or documents to generate AI study materials.
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <button 
                      onClick={() => document.getElementById('file-input').click()}
                      className="outline-btn"
                    >
                      Choose Files
                    </button>

                    {pendingFiles.length > 0 && (
                      <button 
                        onClick={startUpload}
                        className="glow-btn"
                      >
                        Upload {pendingFiles.length} Files
                      </button>
                    )}
                  </div>
                </div>
                <input id="file-input" type="file" multiple onChange={handleFileSelection} disabled={uploading} style={{ display: 'none' }} />
              </motion.div>
            ) : null}

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
                 <div style={{ width: '4px', height: '24px', background: 'var(--primary)', borderRadius: '2px' }}></div>
                 <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Study Materials</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {uploadedFiles.map((file, idx) => {
                  const status = pipelineStatus[file._id] || {};
                  return (
                    <motion.div
                      key={file._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="glass"
                      style={{
                        padding: '2rem',
                        borderRadius: '24px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <FileAudio size={28} color="var(--primary)" />
                          <div>
                            <h4 style={{ margin: 0 }}>{file.originalname}</h4>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{status.status}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          {file.isProcessed ? (
                            <button onClick={() => navigate(`/study-guide/${sessionId}/${file._id}`)} className="glow-btn" style={{ padding: '8px 16px' }}>
                              <Eye size={16} /> View Guide
                            </button>
                          ) : (
                            <button onClick={() => handleGenerateGuide(file._id)} disabled={status.generating} className="glow-btn" style={{ padding: '8px 16px' }}>
                              {status.generating ? <Loader className="animate-spin" size={16} /> : <Zap size={16} />}
                              Process Content
                            </button>
                          )}
                          <button onClick={() => handleDeleteUpload(file._id)} style={{ padding: '8px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      {file.mimetype.startsWith('audio/') && <AudioPlayer url={file.fileUrls[0]} title={file.originalname} />}
                    </motion.div>
                  );
                })}
              </div>

              <NotificationCenter 
                activePipelines={uploadedFiles}
                pipelineStatus={pipelineStatus}
                onGenerateStep={handleGenerateResource}
                onView={(id, type) => navigate(`/study-guide/${sessionId}/${id}?tab=${type}`)}
              />
            </div>
          </div>
        </div>
      </main>
      {['student', 'mentor'].includes(JSON.parse(localStorage.getItem('user') || '{}').role) && (
        <Chatbot sessionId={sessionId} sessionTitle={session?.title || "Session"} />
      )}
    </div>
  );
};

export default Session;

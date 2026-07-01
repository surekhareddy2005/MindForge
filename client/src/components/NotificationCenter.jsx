import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CheckCircle, 
    Zap, 
    Loader, 
    Music, 
    FileText, 
    AlertCircle, 
    RefreshCw,
    Play,
    Eye,
    ChevronRight,
    ArrowRight
} from 'lucide-react';

const NotificationCenter = ({ activePipelines, pipelineStatus = {}, onGenerateStep, onView }) => {
    if (activePipelines.length === 0) return null;

    return (
        <div style={{ marginTop: '5rem', width: '100%', paddingBottom: '6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2.5rem' }}>
                <div style={{ width: '4px', height: '28px', background: 'var(--primary)', borderRadius: '2px' }}></div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0, fontFamily: 'Playfair Display, serif', color: 'var(--text-primary)' }}>
                    Resource Generation Pipeline
                </h2>
                <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, var(--primary) 0%, transparent 100%)', opacity: 0.2, marginLeft: '1rem' }}></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                {activePipelines.map((pipeline, idx) => (
                    <PipelineItem 
                        key={pipeline.id || pipeline._id} 
                        pipeline={pipeline} 
                        pipelineStatus={pipelineStatus}
                        onGenerate={onGenerateStep}
                        onView={onView}
                        index={idx}
                    />
                ))}
            </div>
        </div>
    );
};

const PipelineItem = ({ pipeline, pipelineStatus = {}, onGenerate, onView, index }) => {
    const status = pipelineStatus[pipeline._id] || {};
    
    const stages = [
        { id: 'transcription', label: 'Transcription', icon: <Music size={14} />, isComplete: pipeline.isProcessed, generating: status.generating },
        { id: 'pdf', label: 'Study Guide', icon: <FileText size={14} />, isComplete: pipeline.pdfGenerated, generating: status.generatingPdf },
        { id: 'flashcards', label: 'Flashcards', icon: <Zap size={14} />, isComplete: pipeline.flashcardsGenerated, generating: status.generatingFlashcards },
        { id: 'quiz', label: 'Quiz', icon: <Zap size={14} />, isComplete: pipeline.quizGenerated, generating: status.generatingQuiz },
        { id: 'interview', label: 'Interview', icon: <Zap size={14} />, isComplete: pipeline.interviewGenerated, generating: status.generatingInterview }
    ];

    const isMainProcessing = pipeline.status === 'processing' || pipeline.status === 'processing_resources';

    return (
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass" 
            style={{ 
                padding: '2rem', 
                borderRadius: '30px', 
                border: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(255,255,255,0.015)',
                position: 'relative',
                boxShadow: '0 15px 35px rgba(0,0,0,0.2)'
            }}
        >
            {/* Header info for the material */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.2rem' }}>
                <div style={{ 
                    width: '36px', height: '36px', borderRadius: '10px', 
                    background: 'rgba(79, 70, 229, 0.1)', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center'
                }}>
                    <Zap size={18} color="var(--primary)" />
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', fontFamily: 'Montserrat, sans-serif' }}>
                    {pipeline.originalname}
                </h4>
                {isMainProcessing && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto', background: 'rgba(79, 70, 229, 0.05)', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(79, 70, 229, 0.1)' }}>
                        <Loader size={14} className="animate-spin" color="var(--primary)" />
                        <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>Processing</span>
                    </div>
                )}
            </div>

            {/* Horizontal Steps */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
                {/* Connecting horizontal line */}
                <div style={{ 
                    position: 'absolute', 
                    top: '20px', 
                    left: '50px', 
                    right: '50px', 
                    height: '2px', 
                    background: 'linear-gradient(90deg, var(--primary) 0%, rgba(255,255,255,0.05) 100%)',
                    zIndex: 0,
                    opacity: 0.3
                }} />

                {stages.map((stage, sIdx) => {
                    const isComplete = stage.isComplete;
                    const isTranscriptionDone = pipeline.isProcessed;
                    const dependencyMet = stage.id === 'transcription' || isTranscriptionDone;
                    const isGenerating = stage.generating;

                    return (
                        <div key={stage.id} style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            gap: '12px',
                            flex: 1,
                            zIndex: 1,
                            position: 'relative'
                        }}>
                            {/* Step Circle */}
                            <div style={{
                                width: '42px', height: '42px', borderRadius: '50%',
                                background: isComplete ? 'var(--primary)' : (isGenerating ? 'rgba(79, 70, 229, 0.15)' : 'var(--bg-main)'),
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: isComplete ? 'var(--bg-main)' : (isGenerating ? 'var(--primary)' : 'var(--text-muted)'),
                                border: `2px solid ${isComplete ? 'var(--primary)' : (isGenerating ? 'var(--primary)' : 'rgba(255,255,255,0.1)')}`,
                                boxShadow: isComplete ? '0 0 15px var(--primary-glow)' : (isGenerating ? '0 0 15px var(--primary-glow)' : 'none'),
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}>
                                {isGenerating ? (
                                    <Loader size={18} className="animate-spin" />
                                ) : (
                                    isComplete ? <CheckCircle size={18} strokeWidth={3} /> : stage.icon
                                )}
                            </div>

                            {/* Label & Status */}
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ 
                                    fontSize: '0.8rem', 
                                    fontWeight: 700, 
                                    margin: '0 0 4px 0',
                                    color: isComplete ? 'var(--text-primary)' : 'var(--text-muted)',
                                    fontFamily: 'Montserrat, sans-serif'
                                }}>
                                    {stage.label}
                                </p>
                                
                                <div style={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {isComplete ? (
                                        <button
                                            onClick={() => stage.id !== 'transcription' && onView(pipeline.id || pipeline._id, stage.id)}
                                            style={{
                                                background: stage.id === 'transcription' ? 'transparent' : 'var(--primary)',
                                                color: stage.id === 'transcription' ? 'var(--primary)' : 'var(--bg-main)',
                                                border: stage.id === 'transcription' ? 'none' : '1px solid var(--primary)',
                                                padding: '4px 10px',
                                                borderRadius: '8px',
                                                fontSize: '0.65rem',
                                                fontWeight: 700,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                cursor: stage.id === 'transcription' ? 'default' : 'pointer',
                                                boxShadow: stage.id === 'transcription' ? 'none' : '0 4px 10px rgba(79, 70, 229, 0.2)'
                                            }}
                                        >
                                            {stage.id === 'transcription' ? 'READY' : <><Eye size={12} strokeWidth={3} /> View</>}
                                        </button>
                                    ) : (
                                        stage.id !== 'transcription' && (
                                        <button
                                            disabled={!dependencyMet || isMainProcessing || isGenerating}
                                            onClick={() => onGenerate(pipeline.id || pipeline._id, stage.id)}
                                            className={(dependencyMet && !isGenerating) ? "glow-on-hover" : ""}
                                            style={{
                                                background: isGenerating ? 'rgba(79, 70, 229, 0.05)' : 'transparent',
                                                color: isGenerating ? 'var(--primary)' : (dependencyMet ? 'var(--primary)' : 'rgba(255,255,255,0.1)'),
                                                border: `1px solid ${isGenerating ? 'var(--primary)' : (dependencyMet ? 'var(--primary)' : 'rgba(255,255,255,0.05)')}`,
                                                padding: '4px 12px',
                                                borderRadius: '8px',
                                                fontSize: '0.65rem',
                                                fontWeight: 700,
                                                cursor: (dependencyMet && !isMainProcessing && !isGenerating) ? 'pointer' : 'not-allowed',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {isGenerating ? 'Generating...' : 'Generate'}
                                        </button>
                                        )
                                    )
                                    }
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {pipeline.lastError && (
                <div style={{ 
                    marginTop: '1.5rem', 
                    padding: '12px 16px', 
                    borderRadius: '14px', 
                    background: 'rgba(239, 68, 68, 0.05)', 
                    display: 'flex', alignItems: 'center', gap: '10px',
                    border: '1px solid rgba(239, 68, 68, 0.1)'
                }}>
                    <AlertCircle size={16} color="#ef4444" />
                    <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600 }}>{pipeline.lastError}</span>
                </div>
            )}
        </motion.div>
    );
};

export default NotificationCenter;
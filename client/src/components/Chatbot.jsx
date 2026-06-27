import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  X, 
  Send, 
  Loader, 
  Bot, 
  User, 
  Trash2, 
  Plus,
  Search,
  Sparkles,
  ChevronDown,
  History,
  Clock,
  ArrowUp
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import API, { getChats, sendMessage, clearChatHistory, deleteChatThread, getCredits } from '../services/api';
import toast from 'react-hot-toast';

const Chatbot = ({ sessionId, sessionTitle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [threads, setThreads] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [credits, setCredits] = useState(50);
  const [deleteTargetId, setDeleteTargetId] = useState(null); // 'all' or specific threadId
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.name || 'Student';
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      fetchThreads();
      fetchCredits();
    }
  }, [isOpen, sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const fetchCredits = async () => {
    try {
      const res = await getCredits();
      setCredits(res.data.creditsLeft);
    } catch (err) {
      console.error('Failed to fetch credits:', err);
    }
  };

  const fetchThreads = async () => {
    try {
      setInitialLoading(true);
      const res = await getChats(sessionId);
      setThreads(res.data || []);
      
      // If there's at least one thread, select the first one by default if none selected
      if (res.data && res.data.length > 0 && !activeChatId) {
        selectThread(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch threads:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  const selectThread = (thread) => {
    setActiveChatId(thread._id);
    setTopic(thread.topic);
    setMessages(thread.messages);
  };

  const startNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setTopic('');
    setInput('');
  };

  const handleDeleteThread = (chatId) => {
    setDeleteTargetId(chatId);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;

    if (deleteTargetId === 'all') {
      try {
        await clearChatHistory(sessionId);
        setThreads([]);
        startNewChat();
        toast.success('All history cleared');
      } catch (err) {
        toast.error('Failed to clear history');
      }
    } else {
      try {
        await deleteChatThread(deleteTargetId);
        toast.success('Conversation deleted');
        
        // If we deleted the active thread, clear active state
        if (activeChatId === deleteTargetId) {
          startNewChat();
        }
        
        fetchThreads();
      } catch (err) {
        toast.error('Failed to delete conversation');
      }
    }
    setDeleteTargetId(null);
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading || credits <= 0) return;
    
    // Topic is no longer mandatory from header, default to session title or general
    const currentTopic = topic || sessionTitle || 'General Discussion';
    const currentChatId = activeChatId;

    const userMessage = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    
    setInput('');
    setLoading(true);

    try {
      const res = await sendMessage({ 
        sessionId, 
        message: currentInput,
        topic: currentTopic,
        chatId: currentChatId
      });
      
      setMessages(res.data.history);
      setActiveChatId(res.data.chatId);
      if (res.data.topic) setTopic(res.data.topic);
      if (res.data.creditsLeft !== undefined) setCredits(res.data.creditsLeft);
      
      // Refresh thread list to show latest topic/message count
      fetchThreads();
    } catch (err) {
      // If server returned a 403 (credits exhausted), fetch latest credits
      if (err.response?.status === 403) {
        fetchCredits();
      }
      toast.error(err.response?.data?.error || 'Failed to get a response. Please try again.');
      console.error('Chat error details:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearAllHistory = () => {
    setDeleteTargetId('all');
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'var(--primary)',
            color: 'var(--bg-main)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 30px var(--primary-glow)',
            zIndex: 1000
          }}
        >
          <MessageSquare size={28} />
        </motion.button>
      )}

      {/* Synchronized UI Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'var(--bg-main)',
              zIndex: 2000,
              display: 'flex',
              color: 'var(--text-primary)',
              fontFamily: "'Montserrat', sans-serif"
            }}
          >
            {/* Sidebar (Left) */}
            <div style={{
              width: '260px',
              background: '#171717',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRight: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ padding: '20px 16px' }}>
                <button 
                  onClick={startNewChat}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'transparent',
                    color: '#ececec',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    fontWeight: 500,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageSquare size={16} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                    <span>New chat</span>
                  </div>
                  <Plus size={14} strokeWidth={2} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 20px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '0 8px', 
                  marginBottom: '12px',
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  <Clock size={12} /> Recent Conversations
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {threads.length === 0 ? (
                    <div style={{ padding: '20px 8px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.3)', fontSize: '0.8rem' }}>
                      No history yet.
                    </div>
                  ) : (
                    threads.map((thread) => (
                      <div
                        key={thread._id}
                        style={{ 
                          padding: '10px 12px',
                          borderRadius: '8px',
                          background: activeChatId === thread._id ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '12px'
                        }}
                        onMouseEnter={(e) => {
                          if (activeChatId !== thread._id) {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (activeChatId !== thread._id) {
                            e.currentTarget.style.background = 'transparent';
                          }
                        }}
                      >
                        <div 
                          onClick={() => selectThread(thread)} 
                          style={{ flex: 1, minWidth: 0 }}
                        >
                          <div style={{ 
                            fontWeight: 500, 
                            fontSize: '0.85rem', 
                            color: '#ececec',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {thread.topic}
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.1, color: '#ef4444' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteThread(thread._id);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'rgba(255, 255, 255, 0.3)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'color 0.2s',
                            opacity: 0.8
                          }}
                        >
                          <Trash2 size={12} />
                        </motion.button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
                <button 
                  onClick={clearAllHistory}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    borderRadius: '10px', 
                    background: 'rgba(239, 68, 68, 0.05)', 
                    color: '#ef4444', 
                    border: '1px solid rgba(239, 68, 68, 0.1)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Trash2 size={14} /> Clear All History
                </button>
              </div>
            </div>

            {/* Main Area (Right) */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#212121', position: 'relative' }}>
              {/* Header */}
              <div style={{
                height: '64px',
                padding: '0 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                background: '#212121'
              }}>
                <div style={{ 
                  width: '36px', height: '36px', borderRadius: '10px', 
                  background: 'rgba(255, 255, 255, 0.05)', color: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <MessageSquare size={18} />
                </div>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <h2 style={{ 
                    fontSize: '1rem', 
                    fontWeight: 600, 
                    color: '#ececec',
                    fontFamily: "'Montserrat', sans-serif",
                    margin: 0
                  }}>
                    Welcome, <span style={{ color: 'var(--primary)' }}>{userName}</span>
                  </h2>
                  <p style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.4)', margin: 0 }}>
                    Your Personal AI Study Assistant
                  </p>
                </div>

                <div style={{ flex: 1 }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    background: credits <= 10 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(79, 70, 229, 0.1)',
                    color: credits <= 10 ? '#ef4444' : 'var(--primary)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    border: credits <= 10 ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(79, 70, 229, 0.2)'
                  }}>
                    {credits} / 50 Chat Credits Left
                  </span>
                </div>
                
                <button 
                  onClick={() => setIsOpen(false)}
                  style={{ 
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: 'var(--bg-surface)', border: '1px solid var(--border)',
                    color: 'var(--text-muted)', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Chat View */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                {messages.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 600, color: '#ffffff', marginBottom: '16px', fontFamily: "'Montserrat', sans-serif" }}>
                      How can I help you, <span style={{ color: 'var(--primary)' }}>{userName.split(' ')[0]}?</span>
                    </h2>
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)', maxWidth: '500px', lineHeight: 1.6, fontSize: '1rem' }}>
                      I've processed the materials for "{sessionTitle}" and I'm ready to answer any related questions.
                    </p>
                  </div>
                ) : (
                  <div style={{ width: '100%', maxWidth: '768px', margin: '0 auto', padding: '40px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                      {messages.map((msg, idx) => (
                        <div 
                          key={idx}
                          style={{ 
                            display: 'flex', 
                            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', 
                            width: '100%' 
                          }}
                        >
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                              maxWidth: msg.role === 'user' ? '70%' : '100%',
                              width: '100%'
                            }}
                          >
                            {msg.role === 'user' ? (
                              <div style={{
                                padding: '10px 20px',
                                borderRadius: '20px',
                                background: '#2f2f2f',
                                color: '#ececec',
                                fontSize: '1rem',
                                lineHeight: 1.5,
                                wordBreak: 'break-word'
                              }}>
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                              </div>
                            ) : (
                              <div style={{
                                width: '100%',
                                color: '#ececec',
                                background: 'transparent',
                                border: 'none',
                                padding: '0',
                                boxShadow: 'none'
                              }}>
                                <div className="markdown-content" style={{ fontSize: '1.05rem', lineHeight: 1.8 }}>
                                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        </div>
                      ))}
                      {loading && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 0' }}>
                          {[0, 1, 2].map(i => (
                            <motion.div 
                              key={i}
                              animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }} 
                              transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }} 
                              style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} 
                            />
                          ))}
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Input Area */}
              <div style={{ padding: '0 20px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ 
                  width: '100%', 
                  maxWidth: '768px', 
                  background: '#2f2f2f',
                  borderRadius: '26px',
                  padding: '8px 8px 8px 20px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '12px'
                }}>
                  <textarea 
                    ref={textareaRef}
                    rows="1"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={credits <= 0 ? "You have exhausted your daily 50 chat credits. Try again tomorrow!" : "Ask anything..."}
                    disabled={credits <= 0}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ececec',
                      flex: 1,
                      outline: 'none',
                      fontSize: '1rem',
                      resize: 'none',
                      fontFamily: 'inherit',
                      maxHeight: '200px',
                      cursor: credits <= 0 ? 'not-allowed' : 'text',
                      padding: '8px 0',
                      margin: 0
                    }}
                  />
                  
                  <button 
                    onClick={handleSend}
                    disabled={loading || !input.trim() || (!topic && messages.length === 0) || credits <= 0}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: input.trim() && (topic || messages.length > 0) && credits > 0 ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
                      color: input.trim() && (topic || messages.length > 0) && credits > 0 ? '#0F172A' : 'rgba(255, 255, 255, 0.3)',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: input.trim() && (topic || messages.length > 0) && credits > 0 ? 'pointer' : 'default',
                      transition: 'all 0.2s ease',
                      flexShrink: 0
                    }}
                  >
                    <ArrowUp size={20} strokeWidth={2.5} />
                  </button>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.4)', marginTop: '8px' }}>
                  MindForge AI can make mistakes. Verify important info.
                </div>
              </div>
            </div>
            
            {/* Custom Modal Confirmation Overlay */}
            <AnimatePresence>
              {deleteTargetId && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px'
                  }}
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '20px',
                      padding: '32px 24px',
                      width: '100%',
                      maxWidth: '400px',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ 
                      width: '56px', height: '56px', borderRadius: '16px', 
                      background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 20px'
                    }}>
                      <Trash2 size={28} />
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
                      {deleteTargetId === 'all' ? 'Clear All Conversations?' : 'Delete Conversation?'}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '28px', lineHeight: 1.6 }}>
                      {deleteTargetId === 'all' 
                        ? 'Are you sure you want to permanently delete all chat history for this lecture session? This action cannot be undone.'
                        : 'Are you sure you want to permanently delete this conversation thread? This action cannot be undone.'
                      }
                    </p>
                    <div style={{ display: 'flex', gap: '14px' }}>
                      <button
                        onClick={() => setDeleteTargetId(null)}
                        style={{
                          flex: 1,
                          padding: '12px',
                          borderRadius: '12px',
                          background: 'var(--bg-main)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-primary)',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={confirmDelete}
                        style={{
                          flex: 1,
                          padding: '12px',
                          borderRadius: '12px',
                          background: '#ef4444',
                          border: 'none',
                          color: 'white',
                          fontWeight: 600,
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                          transition: 'all 0.2s'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .markdown-content p { margin-bottom: 1.2rem; }
        .markdown-content p:last-child { margin-bottom: 0; }
        .markdown-content ul, .markdown-content ol { margin-bottom: 1.2rem; padding-left: 1.5rem; }
        .markdown-content li { margin-bottom: 0.5rem; }
        .markdown-content code { background: var(--primary-surface); color: var(--primary); padding: 0.2rem 0.4rem; borderRadius: 4px; font-size: 0.9em; }
        .markdown-content pre { background: var(--bg-surface); padding: 1.5rem; borderRadius: 12px; border: 1px solid var(--border); overflow-x: auto; margin: 1.5rem 0; }
        .markdown-content h1, .markdown-content h2, .markdown-content h3 { margin: 2rem 0 1rem; color: var(--text-primary); font-family: 'Playfair Display', serif; }
        .markdown-content blockquote { border-left: 3px solid var(--primary); padding-left: 1rem; color: var(--text-muted); font-style: italic; margin: 1.5rem 0; }
      `}</style>
    </>
  );
};

export default Chatbot;

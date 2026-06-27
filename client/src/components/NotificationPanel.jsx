import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, Info, AlertCircle, ExternalLink, Trash2 } from 'lucide-react';
import axios from 'axios';

const NotificationPanel = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) fetchNotifications();
    }, [isOpen]);

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${import.meta.env.VITE_API_URL}/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const deleteNotification = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_URL}/notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(4px)', zIndex: 1100
                        }}
                    />
                    <motion.div
                        initial={{ x: 400, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 400, opacity: 0 }}
                        className="glass"
                        style={{
                            position: 'fixed', right: 0, top: 0, bottom: 0,
                            width: 'min(400px, 100%)', zIndex: 1200,
                            borderLeft: '1px solid var(--border)',
                            display: 'flex', flexDirection: 'column',
                            boxShadow: '-20px 0 50px rgba(0,0,0,0.5)',
                            padding: '1.5rem'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Bell size={20} color="var(--primary)" />
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Notifications</h2>
                            </div>
                            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
                            ) : notifications.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                    No notifications yet.
                                </div>
                            ) : (
                                notifications.map(n => (
                                    <div 
                                        key={n._id}
                                        style={{
                                            padding: '1rem',
                                            borderRadius: '16px',
                                            background: n.isRead ? 'rgba(255,255,255,0.02)' : 'rgba(79, 70, 229,0.05)',
                                            border: `1px solid ${n.isRead ? 'rgba(255,255,255,0.05)' : 'rgba(79, 70, 229,0.1)'}`,
                                            position: 'relative',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {n.type === 'success' && <CheckCircle size={14} color="#22c55e" />}
                                                {n.type === 'info' && <Info size={14} color="var(--primary)" />}
                                                {n.type === 'error' && <AlertCircle size={14} color="#ef4444" />}
                                                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{n.title}</span>
                                            </div>
                                            <button 
                                                onClick={() => deleteNotification(n._id)}
                                                style={{ background: 'none', border: 'none', color: '#ef4444', opacity: 0.5, cursor: 'pointer' }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                            {n.message}
                                        </p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                {!n.isRead && (
                                                    <button 
                                                        onClick={() => markAsRead(n._id)}
                                                        style={{ 
                                                            fontSize: '0.7rem', background: 'none', border: 'none', 
                                                            color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 
                                                        }}
                                                    >
                                                        Mark as Read
                                                    </button>
                                                )}
                                                {n.link && (
                                                    <a 
                                                        href={n.link} 
                                                        style={{ fontSize: '0.7rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: 600 }}
                                                    >
                                                        View <ExternalLink size={10} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NotificationPanel;

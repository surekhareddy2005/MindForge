import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, GraduationCap, Plus, Search, Trash2, Edit2, Shield, UserPlus } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import api from '../services/api';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    mentors: 0,
    students: 0,
    courses: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, coursesRes] = await Promise.all([
        api.get('/user/all'),
        api.get('/courses')
      ]);
      
      const users = usersRes.data;
      const courses = coursesRes.data;

      setStats({
        totalUsers: users.length,
        mentors: users.filter(u => u.role === 'mentor').length,
        students: users.filter(u => u.role === 'student').length,
        courses: courses.length
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: <Users size={24} />, color: '#6366f1' },
    { title: 'Mentors', value: stats.mentors, icon: <Shield size={24} />, color: '#f59e0b' },
    { title: 'Students', value: stats.students, icon: <GraduationCap size={24} />, color: '#10b981' },
    { title: 'Courses', value: stats.courses, icon: <BookOpen size={24} />, color: '#ec4899' },
  ];

  return (
    <MainLayout title="Admin Portal" subtitle="Manage your university's ecosystem">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
          {statCards.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: 'var(--bg-card)',
                padding: '1.5rem',
                borderRadius: '20px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '1.2rem',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ 
                background: `${stat.color}15`, 
                color: stat.color,
                padding: '0.8rem',
                borderRadius: '12px',
                display: 'flex'
              }}>
                {stat.icon}
              </div>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.2rem' }}>{stat.title}</p>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{stat.value}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <Link to="/admin/users" style={{ textDecoration: 'none' }}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                padding: '2rem',
                borderRadius: '24px',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Manage Users</h3>
                <p style={{ opacity: 0.9 }}>Add, edit, or remove mentors and students</p>
              </div>
              <UserPlus size={40} />
            </motion.div>
          </Link>

          <Link to="/admin/courses" style={{ textDecoration: 'none' }}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                padding: '2rem',
                borderRadius: '24px',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Manage Courses</h3>
                <p style={{ opacity: 0.9 }}>Create courses and assign participants</p>
              </div>
              <Plus size={40} />
            </motion.div>
          </Link>
        </div>

      </div>
    </MainLayout>
  );
};

export default AdminDashboard;

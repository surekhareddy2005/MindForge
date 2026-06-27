import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  MessageSquare, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../Logo';

const StudentSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/student/dashboard' },
    { icon: <BookOpen size={20} />, label: 'My Courses', path: '/student/courses' },
    { icon: <GraduationCap size={20} />, label: 'Study Materials', path: '/student/materials' },
    { icon: <MessageSquare size={20} />, label: 'Feedback', path: '/student/feedback' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/student/settings' },
  ];

  return (
    <aside className="glass" style={{ 
      width: '280px', 
      padding: '2rem 1.5rem', 
      display: 'flex', 
      flexDirection: 'column',
      borderRight: '1px solid var(--border)',
      height: '100vh',
      position: 'sticky',
      top: 0,
      flexShrink: 0
    }}>
      <div 
        style={{ marginBottom: '3rem', cursor: 'pointer' }} 
        onClick={() => navigate('/student/dashboard')}
      >
        <Logo size={48} />
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        {navItems.map((item, i) => {
          const isActive = location.pathname === item.path;
          return (
            <div 
              key={i} 
              onClick={() => navigate(item.path)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '12px 16px', 
                borderRadius: '12px',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                background: isActive ? 'var(--primary-surface)' : 'transparent',
                cursor: 'pointer',
                transition: 'var(--transition)',
                fontWeight: isActive ? 600 : 400
              }}
            >
              {item.icon}
              <span style={{ fontSize: '0.95rem' }}>{item.label}</span>
            </div>
          );
        })}
      </nav>

      <button 
        onClick={handleLogout}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          padding: '12px 16px', 
          borderRadius: '12px',
          color: 'var(--text-secondary)',
          background: 'transparent',
          border: '1px solid transparent',
          cursor: 'pointer',
          marginTop: 'auto',
          transition: 'all 0.3s ease',
          fontWeight: 400,
          fontFamily: 'inherit',
          fontSize: '1rem'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--primary)';
          e.currentTarget.style.background = 'var(--primary-surface)';
          e.currentTarget.style.border = '1px solid var(--border)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.border = '1px solid transparent';
        }}
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </aside>
  );
};

export default StudentSidebar;

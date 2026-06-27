import React, { useState, useEffect } from 'react';
import { User as UserIcon, Moon, Sun, Bell, X, Loader, Menu } from 'lucide-react';
import { useTheme } from '../utils/ThemeContext';
import { useNavigate } from 'react-router-dom';

const Header = ({ title, subtitle }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const { isDarkMode, toggleTheme } = useTheme();
  
  useEffect(() => {
    const handleStorageChange = () => {
      setUserData(JSON.parse(localStorage.getItem('user') || '{}'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const settingsPath = userData.role === 'student' ? '/student/settings' : '/settings';

  // Get first name
  const firstName = userData.name ? userData.name.split(' ')[0] : 'User';

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          className="hamburger-menu" 
          onClick={() => window.dispatchEvent(new Event('toggleSidebar'))}
        >
          <Menu size={24} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>{title || `Hello, ${userData.name || 'User'}`}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{subtitle || 'Welcome back to your learning space.'}</p>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }} className="header-actions">

        <div 
          onClick={() => navigate(settingsPath)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            marginLeft: '1rem',
            cursor: 'pointer',
            padding: '4px 12px 4px 4px',
            borderRadius: '16px',
            transition: 'all 0.2s ease'
          }}
          className="profile-hover"
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-surface)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
           <div style={{ 
             width: '40px', 
             height: '40px', 
             borderRadius: '12px', 
             background: userData.profilePicture ? 'transparent' : 'var(--primary)', 
             display: 'flex', 
             alignItems: 'center', 
             justifyContent: 'center',
             boxShadow: userData.profilePicture ? 'none' : '0 4px 12px var(--primary-glow)',
             overflow: 'hidden',
             border: userData.profilePicture ? 'none' : '1px solid var(--border)'
           }}>
              {userData.profilePicture ? (
                <img 
                  src={`${import.meta.env.VITE_API_URL.replace('/api', '').replace(/\/$/, '')}${userData.profilePicture}`} 
                  alt={userData.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <UserIcon color="var(--bg-main)" size={20} />
              )}
           </div>
           <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
             {firstName}
           </span>
        </div>
      </div>
    </header>
  );
};

export default Header;

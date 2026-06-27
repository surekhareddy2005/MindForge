import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Lock, 
  Check, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import DotsLoader from '../components/DotsLoader';
import { updateProfile, updatePassword as apiUpdatePassword } from '../services/api';

const Settings = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  
  // Account States
  const [newName, setNewName] = useState(user.name || '');
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);

  // Sync with server on mount
  React.useEffect(() => {
    const fetchLatestProfile = async () => {
      try {
        const { getProfile } = await import('../services/api');
        const response = await getProfile();
        const latestUser = response.data;
        setUser(latestUser);
        setNewName(latestUser.name);
        localStorage.setItem('user', JSON.stringify(latestUser));
        window.dispatchEvent(new Event('storage'));
      } catch (err) {
        console.error("Failed to sync profile", err);
      }
    };
    fetchLatestProfile();
  }, []);

  // Password States
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setIsUpdatingName(true);
    try {
      const response = await updateProfile({ name: newName });
      const updatedUser = { ...user, name: response.data.name };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess(false);

    if (passwords.new !== passwords.confirm) {
      setPassError('New passwords do not match');
      return;
    }

    if (passwords.new.length < 6) {
      setPassError('Password must be at least 6 characters');
      return;
    }

    setIsUpdatingPass(true);
    try {
      await apiUpdatePassword({ 
        currentPassword: passwords.current, 
        newPassword: passwords.new 
      });
      setPassSuccess(true);
      setPasswords({ current: '', new: '', confirm: '' });
      setTimeout(() => setPassSuccess(false), 3000);
    } catch (error) {
      setPassError(error.response?.data?.message || "Failed to update password");
    } finally {
      setIsUpdatingPass(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2rem 3rem', display: 'flex', flexDirection: 'column' }}>
        <Header title="Settings" subtitle="Manage your account preferences and security" />

        <div style={{ maxWidth: '800px', width: '100%', margin: '2rem auto 0', display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
          
          {/* Profile Summary Header */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass" 
            style={{ 
              padding: '2rem', 
              borderRadius: '24px', 
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '2rem',
              background: 'linear-gradient(90deg, rgba(79, 70, 229, 0.05) 0%, transparent 100%)'
            }}
          >
            <div style={{ position: 'relative' }}>
              <div style={{ 
                width: '100px', height: '100px', borderRadius: '24px', 
                background: user.profilePicture ? 'transparent' : 'var(--primary)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--bg-main)', fontWeight: 800, fontSize: '2.5rem',
                boxShadow: user.profilePicture ? 'none' : '0 10px 20px var(--primary-glow)',
                overflow: 'hidden',
                border: user.profilePicture ? 'none' : '4px solid var(--border)'
              }}>
                {user.profilePicture ? (
                  <img 
                    src={`${import.meta.env.VITE_API_URL.replace('/api', '').replace(/\/$/, '')}${user.profilePicture}`} 
                    alt={user.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <label 
                htmlFor="profile-upload"
                style={{ 
                  position: 'absolute', bottom: '-10px', right: '-10px', 
                  background: 'var(--primary)', color: 'var(--bg-main)',
                  width: '32px', height: '32px', borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', border: '3px solid var(--bg-main)',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <User size={16} />
                <input 
                  id="profile-upload" 
                  type="file" 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const formData = new FormData();
                      formData.append('profilePicture', file);
                      try {
                        const response = await updateProfile(formData);
                        const updatedUser = { ...user, profilePicture: response.data.profilePicture };
                        setUser(updatedUser);
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                        // Force a header refresh by broadcasting a custom event
                        window.dispatchEvent(new Event('storage'));
                      } catch (err) {
                        console.error("Upload failed", err);
                      }
                    }
                  }}
                />
              </label>
            </div>
            <div>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.8rem', marginBottom: '4px', fontFamily: 'Playfair Display, serif' }}>{user.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)} • {user.email}</p>
            </div>
          </motion.div>

          {/* Profile Information Section */}
          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass" 
            style={{ padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--border)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
              <User style={{ color: 'var(--primary)' }} size={24} />
              <h2 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 700 }}>Profile Details</h2>
            </div>
            
            <form onSubmit={handleUpdateName}>
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '10px', fontSize: '0.9rem' }}>Full Name</label>
                  <input 
                    type="text" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    style={{ 
                      width: '100%', padding: '14px 18px', borderRadius: '14px', 
                      background: 'var(--glass)', border: '1px solid var(--border)',
                      color: 'var(--text-primary)', outline: 'none', fontSize: '1rem',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '10px', fontSize: '0.9rem' }}>Email Address</label>
                  <input 
                    type="email" 
                    value={user.email}
                    disabled
                    style={{ 
                      width: '100%', padding: '14px 18px', borderRadius: '14px', 
                      background: 'var(--glass)', border: '1px solid var(--border)',
                      color: 'var(--text-muted)', outline: 'none', fontSize: '1rem',
                      cursor: 'not-allowed',
                      opacity: 0.6
                    }}
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isUpdatingName || newName === user.name}
                className="glow-btn"
                style={{ 
                  padding: '12px 28px', borderRadius: '12px', fontWeight: 700,
                  opacity: (isUpdatingName || newName === user.name) ? 0.5 : 1,
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                {isUpdatingName ? <DotsLoader compact size={18} label="Updating..." /> : nameSuccess ? <><Check size={18} /> Updated</> : 'Save Changes'}
              </button>
            </form>
          </motion.section>

          {/* Security Section */}
          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass" 
            style={{ padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--border)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
              <Lock style={{ color: 'var(--primary)' }} size={24} />
              <h2 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 700 }}>Security</h2>
            </div>

            <form onSubmit={handleUpdatePassword}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '500px' }}>
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.9rem' }}>Current Password</label>
                  <input 
                    type={showPass.current ? 'text' : 'password'}
                    value={passwords.current}
                    onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                    style={{ 
                      width: '100%', padding: '14px 18px', borderRadius: '14px', 
                      background: 'var(--glass)', border: '1px solid var(--border)',
                      color: 'var(--text-primary)', outline: 'none'
                    }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPass({...showPass, current: !showPass.current})}
                    style={{ position: 'absolute', right: '15px', bottom: '15px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {showPass.current ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.9rem' }}>New Password</label>
                  <input 
                    type={showPass.new ? 'text' : 'password'}
                    value={passwords.new}
                    onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                    style={{ 
                      width: '100%', padding: '14px 18px', borderRadius: '14px', 
                      background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
                      color: 'var(--text-primary)', outline: 'none'
                    }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPass({...showPass, new: !showPass.new})}
                    style={{ position: 'absolute', right: '15px', bottom: '15px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {showPass.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.9rem' }}>Confirm New Password</label>
                  <input 
                    type={showPass.confirm ? 'text' : 'password'}
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                    style={{ 
                      width: '100%', padding: '14px 18px', borderRadius: '14px', 
                      background: 'var(--glass)', border: '1px solid var(--border)',
                      color: 'var(--text-primary)', outline: 'none'
                    }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPass({...showPass, confirm: !showPass.confirm})}
                    style={{ position: 'absolute', right: '15px', bottom: '15px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {showPass.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {passError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff4d4d', fontSize: '0.9rem' }}>
                    <AlertCircle size={16} /> {passError}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isUpdatingPass || !passwords.current || !passwords.new}
                  className="glow-btn"
                  style={{ 
                    padding: '12px 28px', borderRadius: '12px', fontWeight: 700, width: 'fit-content', marginTop: '0.5rem',
                    opacity: (isUpdatingPass || !passwords.current || !passwords.new) ? 0.5 : 1,
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  {isUpdatingPass ? <DotsLoader compact size={18} label="Updating..." /> : passSuccess ? <><Check size={18} /> Password Changed</> : 'Update Password'}
                </button>
              </div>
            </form>
          </motion.section>

        </div>
      </main>
    </div>
  );
};

export default Settings;

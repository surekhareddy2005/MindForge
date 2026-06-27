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
import DotsLoader from '../../components/DotsLoader';
import { updateProfile, updatePassword as apiUpdatePassword } from '../../services/api';
import StudentSidebar from '../../components/student/StudentSidebar';
import Header from '../../components/Header';

const StudentSettings = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{"name": "Student", "email": "student@mindforge.edu"}'));
  
  // Account States
  const [newName, setNewName] = useState(user.name);
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);

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
      <StudentSidebar />
      <main style={{ flex: 1, padding: '2rem 3rem' }}>
        <Header title="Settings" subtitle="Manage your profile and account security" />
        
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
              gap: '1.5rem',
              background: 'linear-gradient(90deg, rgba(79, 70, 229, 0.05) 0%, transparent 100%)'
            }}
          >
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--bg-main)', fontWeight: 800, fontSize: '2rem',
              boxShadow: '0 10px 20px var(--primary-glow)'
            }}>
              {user.name.charAt(0)}
            </div>
            <div>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', marginBottom: '4px', fontFamily: 'Playfair Display, serif' }}>{user.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{user.email}</p>
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
                      background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)',
                      color: 'var(--text-secondary)', outline: 'none', fontSize: '1rem',
                      cursor: 'not-allowed'
                    }}
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={isUpdatingName || newName === user.name}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  background: 'var(--primary)',
                  color: 'var(--bg-main)',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: (isUpdatingName || newName === user.name) ? 0.6 : 1,
                  transition: 'all 0.3s ease'
                }}
              >
                {isUpdatingName ? <DotsLoader compact size={18} label="Updating..." /> : (nameSuccess ? <Check size={20}/> : 'Update Profile')}
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
              <h2 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 700 }}>Change Password</h2>
            </div>

            <form onSubmit={handleUpdatePassword}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '10px', fontSize: '0.9rem' }}>Current Password</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showPass.current ? 'text' : 'password'}
                      value={passwords.current}
                      onChange={(e) => setPasswords(p => ({...p, current: e.target.value}))}
                      style={{ 
                        width: '100%', padding: '14px 45px 14px 18px', borderRadius: '14px', 
                        background: 'var(--glass)', border: '1px solid var(--border)',
                        color: 'var(--text-primary)', outline: 'none', fontSize: '1rem'
                      }}
                    />
                    <button type="button" onClick={() => setShowPass(s => ({...s, current: !s.current}))} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      {showPass.current ? <EyeOff size={20}/> : <Eye size={20}/>}
                    </button>
                  </div>
                </div>
                <div></div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '10px', fontSize: '0.9rem' }}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showPass.new ? 'text' : 'password'}
                      value={passwords.new}
                      onChange={(e) => setPasswords(p => ({...p, new: e.target.value}))}
                      style={{ 
                        width: '100%', padding: '14px 45px 14px 18px', borderRadius: '14px', 
                        background: 'var(--glass)', border: '1px solid var(--border)',
                        color: 'var(--text-primary)', outline: 'none', fontSize: '1rem'
                      }}
                    />
                    <button type="button" onClick={() => setShowPass(s => ({...s, new: !s.new}))} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      {showPass.new ? <EyeOff size={20}/> : <Eye size={20}/>}
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '10px', fontSize: '0.9rem' }}>Confirm New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showPass.confirm ? 'text' : 'password'}
                      value={passwords.confirm}
                      onChange={(e) => setPasswords(p => ({...p, confirm: e.target.value}))}
                      style={{ 
                        width: '100%', padding: '14px 45px 14px 18px', borderRadius: '14px', 
                        background: 'var(--glass)', border: '1px solid var(--border)',
                        color: 'var(--text-primary)', outline: 'none', fontSize: '1rem'
                      }}
                    />
                    <button type="button" onClick={() => setShowPass(s => ({...s, confirm: !s.confirm}))} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      {showPass.confirm ? <EyeOff size={20}/> : <Eye size={20}/>}
                    </button>
                  </div>
                </div>
              </div>

              {passError && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff4d4d', marginBottom: '1.5rem' }}
                >
                  <AlertCircle size={18} />
                  <span>{passError}</span>
                </motion.div>
              )}

              <button 
                type="submit"
                disabled={isUpdatingPass}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  background: 'var(--primary)',
                  color: 'var(--bg-main)',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: isUpdatingPass ? 0.6 : 1,
                  transition: 'all 0.3s ease'
                }}
              >
                {isUpdatingPass ? <DotsLoader compact size={18} label="Updating..." /> : (passSuccess ? <Check size={20}/> : 'Update Password')}
              </button>
            </form>
          </motion.section>
        </div>
      </main>
    </div>
  );
};

export default StudentSettings;

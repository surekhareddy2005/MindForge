import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Plus, Trash2, Edit2, X, Check, Mail, User as UserIcon, Shield, GraduationCap, Key, Camera, Image as ImageIcon, Upload, Info, AlertTriangle, RefreshCw } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import api from '../services/api';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'mentor', 'student', 'admin'
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const fileInputRef = useRef(null);
  const bulkFileRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' }); // { type: 'success' | 'error', text: '' }
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    isActive: true
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  // Clear status message after 5 seconds
  useEffect(() => {
    if (statusMsg.text) {
      const timer = setTimeout(() => setStatusMsg({ type: '', text: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMsg]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/user/all');
      setUsers(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        isActive: user.isActive !== undefined ? user.isActive : true
      });
      const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
      setImagePreview(user.profilePicture ? `${baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl}${user.profilePicture}` : null);
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'student',
        isActive: true
      });
      setImagePreview(null);
    }
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('role', formData.role);
      data.append('isActive', formData.isActive);
      if (formData.password) data.append('password', formData.password);
      if (selectedFile) data.append('profilePicture', selectedFile);

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' }
      };

      if (editingUser) {
        await api.put(`/user/${editingUser._id}`, data, config);
        setStatusMsg({ type: 'success', text: 'User updated successfully!' });
      } else {
        await api.post('/user', data, config);
        setStatusMsg({ type: 'success', text: 'New user created successfully!' });
      }
      
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      setStatusMsg({ type: 'error', text: error.response?.data?.message || "Error saving user" });
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const data = new FormData();
      data.append('file', file);
      
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' }
      };

      const res = await api.post('/user/bulk', data, config);
      setStatusMsg({ type: 'success', text: res.data.message });
      setShowBulkModal(false);
      fetchUsers();
    } catch (error) {
      setStatusMsg({ type: 'error', text: error.response?.data?.message || "Error in bulk upload" });
    }
    e.target.value = null; // Reset input
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/user/${userToDelete._id}`);
      setStatusMsg({ type: 'success', text: `User ${userToDelete.name} deleted successfully.` });
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      setStatusMsg({ type: 'error', text: "Error deleting user" });
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const data = new FormData();
      data.append('name', user.name);
      data.append('email', user.email);
      data.append('role', user.role);
      data.append('isActive', user.isActive !== undefined ? !user.isActive : false);

      await api.put(`/user/${user._id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setStatusMsg({
        type: 'success',
        text: `Account for ${user.name} is now ${user.isActive !== false ? 'Inactive' : 'Active'}.`
      });
      fetchUsers();
    } catch (error) {
      setStatusMsg({ type: 'error', text: error.response?.data?.message || "Error updating user status" });
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                         (u.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || u.role === activeTab;
    return matchesSearch && matchesTab;
  });

  const tabs = [
    { id: 'all', label: 'All Users', icon: <Users size={16} /> },
    { id: 'mentor', label: 'Mentors', icon: <Shield size={16} /> },
    { id: 'student', label: 'Students', icon: <GraduationCap size={16} /> },
  ];

  return (
    <MainLayout title="Manage Users" subtitle="Add and configure mentors and students">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Status Notification */}
        <AnimatePresence>
          {statusMsg.text && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              style={{
                position: 'fixed',
                top: '2rem',
                right: '2rem',
                zIndex: 3000,
                background: statusMsg.type === 'success' ? '#10b981' : '#ef4444',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                fontWeight: 600
              }}
            >
              {statusMsg.type === 'success' ? <Check size={20} /> : <AlertTriangle size={20} />}
              {statusMsg.text}
              <X size={18} style={{ cursor: 'pointer', marginLeft: '1rem' }} onClick={() => setStatusMsg({ type: '', text: '' })} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '350px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.8rem 1rem 0.8rem 3rem',
                borderRadius: '14px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => setShowBulkModal(true)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                padding: '0.8rem 1.5rem',
                borderRadius: '14px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
            >
              <Upload size={18} /> Bulk Upload
            </button>
            <button 
              onClick={() => handleOpenModal()}
              className="glow-btn" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem' }}
            >
              <Plus size={18} /> Add New User
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.2rem',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === tab.id ? 'var(--primary-surface)' : 'transparent',
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: activeTab === tab.id ? 600 : 400,
                transition: 'all 0.2s'
              }}
            >
              {tab.icon} {tab.label}
              <span style={{ 
                fontSize: '0.75rem', 
                background: activeTab === tab.id ? 'var(--primary)' : 'var(--border-color)', 
                color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                padding: '0.1rem 0.4rem',
                borderRadius: '6px',
                marginLeft: '0.2rem'
              }}>
                {tab.id === 'all' ? users.length : users.filter(u => u.role === tab.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* Users Table */}
        <div style={{ 
          background: 'var(--bg-card)', 
          borderRadius: '24px', 
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(79, 70, 229, 0.05)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>USER</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>ROLE</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>EMAIL</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>STATUS</th>
                <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ padding: '4rem', textAlign: 'center' }}>
                    <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
                    <p style={{ color: 'var(--text-secondary)' }}>Loading members...</p>
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? filteredUsers.map((user) => (
                <tr key={user._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {user.profilePicture ? (
                        <img 
                          src={`${import.meta.env.VITE_API_URL.replace('/api', '').replace(/\/$/, '')}${user.profilePicture}`} 
                          alt={user.name}
                          style={{ width: '40px', height: '40px', borderRadius: '12px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '12px', 
                          background: 'rgba(79, 70, 229, 0.1)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: 'var(--primary)'
                        }}>
                          <UserIcon size={20} />
                        </div>
                      )}
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    <span style={{ 
                      padding: '0.4rem 0.8rem', 
                      borderRadius: '100px', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      background: user.role === 'admin' ? '#ef444415' : user.role === 'mentor' ? '#f59e0b15' : '#10b98115',
                      color: user.role === 'admin' ? '#ef4444' : user.role === 'mentor' ? '#f59e0b' : '#10b981',
                      border: `1px solid ${user.role === 'admin' ? '#ef444430' : user.role === 'mentor' ? '#f59e0b30' : '#10b98130'}`
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{user.email}</td>
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ 
                        padding: '0.4rem 0.8rem', 
                        borderRadius: '100px', 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        background: (user.isActive !== false) ? '#10b98115' : '#ef444415',
                        color: (user.isActive !== false) ? '#10b981' : '#ef4444',
                        border: `1px solid ${(user.isActive !== false) ? '#10b98130' : '#ef444430'}`
                      }}>
                        {(user.isActive !== false) ? 'Active' : 'Inactive'}
                      </span>
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleStatus(user)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '4px',
                            borderRadius: '6px',
                            transition: 'all 0.2s'
                          }}
                          title={`Click to make ${user.isActive !== false ? 'Inactive' : 'Active'}`}
                        >
                          <RefreshCw size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => handleOpenModal(user)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem' }}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => confirmDelete(user)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <Users size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <p>No users found matching your criteria</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* User Modal */}
        <AnimatePresence>
          {showModal && (
            <div style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
              backdropFilter: 'blur(8px)'
            }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                  background: 'var(--bg-main)',
                  width: '500px',
                  maxHeight: '90vh',
                  borderRadius: '28px',
                  padding: '2.5rem',
                  position: 'relative',
                  border: '1px solid var(--border-color)',
                  overflowY: 'auto'
                }}
              >
                <button 
                  onClick={() => setShowModal(false)}
                  style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  <X size={24} />
                </button>

                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', fontFamily: 'Playfair Display, serif' }}>
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h2>
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
                  
                  {/* Photo Upload Section */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{ 
                        width: '100px', 
                        height: '100px', 
                        borderRadius: '24px', 
                        background: 'var(--bg-card)', 
                        border: '2px dashed var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        cursor: 'pointer'
                      }} onClick={() => fileInputRef.current.click()}>
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <ImageIcon size={32} color="var(--text-muted)" />
                        )}
                      </div>
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        style={{
                          position: 'absolute',
                          bottom: '-10px',
                          right: '-10px',
                          background: 'var(--primary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 4px 10px rgba(79, 70, 229, 0.4)'
                        }}
                      >
                        <Camera size={16} />
                      </button>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageChange} 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                    />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Upload Profile Photo</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <UserIcon size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                      <input 
                        required
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{editingUser ? 'New Password (Optional)' : 'Password'}</label>
                    <div style={{ position: 'relative' }}>
                      <Key size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                      <input 
                        required={!editingUser}
                        type="password" 
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Account Role</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      {[
                        { id: 'student', icon: <GraduationCap size={16} />, label: 'Student' },
                        { id: 'mentor', icon: <Shield size={16} />, label: 'Mentor' }
                      ].map(role => (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => setFormData({...formData, role: role.id})}
                          style={{
                            flex: 1,
                            padding: '0.8rem',
                            borderRadius: '12px',
                            border: '1px solid',
                            borderColor: formData.role === role.id ? 'var(--primary)' : 'var(--border-color)',
                            background: formData.role === role.id ? 'rgba(79, 70, 229, 0.1)' : 'var(--bg-card)',
                            color: formData.role === role.id ? 'var(--primary)' : 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {role.icon} {role.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(!editingUser || editingUser.role !== 'admin') && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Account Status</label>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        {[
                          { id: true, label: 'Active', color: '#10b981' },
                          { id: false, label: 'Inactive', color: '#ef4444' }
                        ].map(statusOpt => (
                          <button
                            key={statusOpt.label}
                            type="button"
                            onClick={() => setFormData({...formData, isActive: statusOpt.id})}
                            style={{
                              flex: 1,
                              padding: '0.8rem',
                              borderRadius: '12px',
                              border: '1px solid',
                              borderColor: formData.isActive === statusOpt.id ? statusOpt.color : 'var(--border-color)',
                              background: formData.isActive === statusOpt.id ? `${statusOpt.color}15` : 'var(--bg-card)',
                              color: formData.isActive === statusOpt.id ? statusOpt.color : 'var(--text-secondary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            {statusOpt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button type="submit" className="glow-btn" style={{ marginTop: '1rem', padding: '1rem' }}>
                    {editingUser ? 'Update Account' : 'Create Account'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Bulk Upload Modal */}
        <AnimatePresence>
          {showBulkModal && (
            <div style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
              backdropFilter: 'blur(8px)'
            }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                  background: 'var(--bg-main)',
                  width: '550px',
                  borderRadius: '28px',
                  padding: '2.5rem',
                  position: 'relative',
                  border: '1px solid var(--border-color)'
                }}
              >
                <button 
                  onClick={() => setShowBulkModal(false)}
                  style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  <X size={24} />
                </button>

                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', fontFamily: 'Playfair Display, serif' }}>
                  Bulk User Upload
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                  Import multiple users at once via CSV or Excel file.
                </p>

                <div style={{ 
                  background: 'rgba(79, 70, 229, 0.05)', 
                  padding: '1.5rem', 
                  borderRadius: '16px', 
                  border: '1px solid var(--border-color)',
                  marginBottom: '2rem'
                }}>
                  <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
                    <Info size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      <p style={{ fontWeight: 700, marginBottom: '0.5rem' }}>File Format (CSV or Excel):</p>
                      <code style={{ background: 'var(--bg-card)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>name, email, password, role</code>
                      <p style={{ marginTop: '0.5rem', opacity: 0.8 }}>Ensure the first row has these headers.</p>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => bulkFileRef.current.click()}
                  style={{ 
                    border: '2px dashed var(--border-color)', 
                    borderRadius: '20px', 
                    padding: '3rem', 
                    textAlign: 'center', 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  <Upload size={40} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Click to select CSV or Excel file</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Supports .csv, .xlsx, .xls</p>
                </div>

                <input 
                  type="file" 
                  ref={bulkFileRef} 
                  onChange={handleBulkUpload} 
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                  style={{ display: 'none' }} 
                />

                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                  <button 
                    onClick={() => setShowBulkModal(false)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Custom Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <div style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
              backdropFilter: 'blur(8px)'
            }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                  background: 'var(--bg-main)',
                  width: '400px',
                  borderRadius: '24px',
                  padding: '2rem',
                  textAlign: 'center',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: '#ef4444',
                  margin: '0 auto 1.5rem auto'
                }}>
                  <Trash2 size={30} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Delete User?</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.5 }}>
                  Are you sure you want to delete <strong>{userToDelete?.name}</strong>? This action cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={() => setShowDeleteModal(false)}
                    style={{ 
                      flex: 1, 
                      padding: '0.8rem', 
                      borderRadius: '12px', 
                      border: '1px solid var(--border-color)', 
                      background: 'var(--bg-card)', 
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDelete}
                    style={{ 
                      flex: 1, 
                      padding: '0.8rem', 
                      borderRadius: '12px', 
                      border: 'none', 
                      background: '#ef4444', 
                      color: 'white',
                      cursor: 'pointer',
                      fontWeight: 600,
                      boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                    }}
                  >
                    Yes, Delete
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </MainLayout>
  );
};

export default ManageUsers;

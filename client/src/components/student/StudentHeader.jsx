import React from 'react';
import { Bell, UserCircle } from 'lucide-react';

const StudentHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem',
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)'
    }}>
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Welcome, {user?.name || 'Student'}!</h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Bell style={{ color: 'var(--text-muted)' }} />
        <UserCircle style={{ color: 'var(--text-muted)' }} size={28} />
      </div>
    </header>
  );
};

export default StudentHeader;

import React from 'react';
import Sidebar from '../Sidebar';
import Header from '../Header';

const StudentLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto' }}>
        <Header />
        {children}
      </main>
    </div>
  );
};

export default StudentLayout;

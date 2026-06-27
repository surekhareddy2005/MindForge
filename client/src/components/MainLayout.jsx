import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = ({ children, title, subtitle }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2rem 3rem', display: 'flex', flexDirection: 'column' }}>
        <Header title={title} subtitle={subtitle} />
        <div style={{ flex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;

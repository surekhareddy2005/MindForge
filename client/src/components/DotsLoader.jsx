import React from 'react';
import { motion } from 'framer-motion';

const DotsLoader = ({ label, sublabel, minHeight = '60vh', compact = false, size }) => {
  const loaderSize = size || (compact ? 34 : 50);

  return (
    <div style={{ 
      display: 'flex', 
      width: compact ? 'auto' : '100%',
      minHeight: compact ? 'auto' : minHeight, 
      alignItems: 'center', 
      justifyContent: 'center',
      flexDirection: compact && !sublabel ? 'row' : 'column',
      gap: compact ? '0.75rem' : '1.25rem',
      textAlign: 'center'
    }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        style={{
          width: `${loaderSize}px`,
          height: `${loaderSize}px`,
          borderRadius: '50%',
          border: '3px solid rgba(79, 70, 229, 0.15)',
          borderTopColor: 'var(--primary)',
          borderRightColor: 'var(--primary)',
          boxShadow: '0 0 20px rgba(79, 70, 229, 0.2)'
        }}
      />
      {(label || sublabel) && (
        <div>
          {label && (
            <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: compact ? '0.9rem' : '1rem', margin: 0 }}>
              {label}
            </p>
          )}
          {sublabel && (
            <p style={{ color: 'var(--text-secondary)', fontSize: compact ? '0.78rem' : '0.9rem', margin: '0.35rem 0 0' }}>
              {sublabel}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default DotsLoader;

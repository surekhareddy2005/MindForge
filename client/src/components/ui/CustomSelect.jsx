import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomSelect = ({ value, onChange, options, placeholder, disabled, labelKey = 'label', valueKey = 'value', icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getOptionLabel = (opt) => {
    if (typeof opt === 'string') return opt;
    return opt[labelKey];
  };

  const getOptionValue = (opt) => {
    if (typeof opt === 'string') return opt;
    return opt[valueKey];
  };

  const selectedOption = options.find(opt => getOptionValue(opt) === value);
  const displayLabel = selectedOption ? getOptionLabel(selectedOption) : placeholder;

  return (
    <div 
      ref={containerRef}
      style={{ 
        position: 'relative', 
        minWidth: '180px', 
        flex: 1,
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto'
      }}
    >
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: '16px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(79, 70, 229, 0.2)',
          color: !value || value === 'All Courses' || value === 'All Modules' ? 'var(--text-muted)' : 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          fontSize: '0.95rem',
          transition: 'all 0.3s ease',
          minHeight: '48px'
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
        onMouseLeave={(e) => {
            if (!isOpen) e.currentTarget.style.borderColor = 'rgba(79, 70, 229, 0.2)';
        }}
      >
        {icon && <div style={{ display: 'flex', alignItems: 'center', color: 'var(--primary)' }}>{icon}</div>}
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayLabel}</span>
        <ChevronDown 
            size={16} 
            color="var(--primary)" 
            style={{ 
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease'
            }} 
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              background: 'rgba(15, 15, 15, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              border: '1px solid rgba(79, 70, 229, 0.3)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              zIndex: 1000,
              overflowY: 'auto',
              maxHeight: '250px',
              padding: '8px'
            }}
          >
            {options.map((option, i) => {
              const optValue = getOptionValue(option);
              const optLabel = getOptionLabel(option);
              const isSelected = value === optValue;

              return (
                <div
                  key={i}
                  onClick={() => {
                    onChange(optValue);
                    setIsOpen(false);
                  }}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '10px',
                    color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                    background: isSelected ? 'var(--primary-surface)' : 'transparent',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease',
                    marginBottom: i === options.length - 1 ? 0 : '4px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--primary-surface)';
                    e.currentTarget.style.color = 'var(--primary)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  {optLabel}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSelect;

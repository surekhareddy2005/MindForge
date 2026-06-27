import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder, style: customStyle }) => {
  return (
    <div style={{ 
      flex: 1,
      display: 'flex', 
      alignItems: 'center', 
      gap: '12px', 
      padding: '12px 16px', 
      borderRadius: '16px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(79, 70, 229, 0.2)',
      minWidth: '250px',
      transition: 'all 0.3s ease',
      ...customStyle
    }}
    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
    onMouseLeave={(e) => {
        if (!e.currentTarget.contains(document.activeElement)) {
            e.currentTarget.style.borderColor = 'rgba(79, 70, 229, 0.2)';
        }
    }}
    >
      <Search size={18} color="var(--primary)" />
      <input 
        type="text" 
        placeholder={placeholder || "Search..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => e.currentTarget.parentElement.style.borderColor = 'var(--primary)'}
        onBlur={(e) => e.currentTarget.parentElement.style.borderColor = 'rgba(79, 70, 229, 0.2)'}
        style={{ 
          background: 'none', 
          border: 'none', 
          color: 'var(--text-primary)', 
          width: '100%', 
          outline: 'none', 
          fontSize: '0.95rem', 
          fontFamily: 'Montserrat, sans-serif'
        }}
      />
    </div>
  );
};

export default SearchBar;

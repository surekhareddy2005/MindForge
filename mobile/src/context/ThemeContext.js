import React, { createContext, useContext } from 'react';
import { darkTheme } from '../constants/theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Enforce premium dark mode strictly, removing light mode and system toggles
  const isDarkMode = true;
  const toggleTheme = () => {}; 
  const theme = darkTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

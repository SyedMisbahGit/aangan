import { useContext } from 'react';
import { AanganThemeContext } from './DreamThemeContext';

export const useAanganTheme = () => {
  const context = useContext(AanganThemeContext);
  if (!context) {
    throw new Error('useAanganTheme must be used within an AanganThemeProvider');
  }
  return context;
};

// Legacy export for backward compatibility
export const useDreamTheme = useAanganTheme; 
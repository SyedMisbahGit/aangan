import { useContext } from 'react';
import { AanganThemeContext } from './DreamThemeContext.context';

export const useAanganTheme = () => {
  const ctx = useContext(AanganThemeContext);
  if (!ctx) throw new Error('useAanganTheme must be used within an AanganThemeProvider');
  return ctx;
};

import React, { useEffect, useState } from 'react';
import type { Theme, AanganThemeContextType, AanganThemeProviderProps } from './DreamThemeContext.types';
import { AanganThemeContext } from './DreamThemeContext.context';
import AanganLoadingScreen from '../components/shared/AanganLoadingScreen';

export const AanganThemeProvider: React.FC<AanganThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('aangan-theme') as Theme;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    
    const initialTheme = savedTheme || systemTheme;
    setThemeState(initialTheme);
    setIsInitialized(true);
  }, []);

  // Apply theme to document and ensure proper z-index stacking
  useEffect(() => {
    if (!isInitialized) return;

    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add new theme class
    root.classList.add(theme);
    
    // Set CSS custom properties for consistent theming
    root.style.setProperty('--theme-mode', theme);
    
    // Ensure proper z-index stacking for dropdowns and modals
    root.style.setProperty('--z-dropdown', '50');
    root.style.setProperty('--z-modal', '100');
    root.style.setProperty('--z-tooltip', '150');
    root.style.setProperty('--z-toast', '200');
    
    // Save to localStorage
    localStorage.setItem('aangan-theme', theme);
    
    // Force reflow to ensure theme changes are applied
    void root.offsetHeight;
  }, [theme, isInitialized]);

  // Listen for system theme changes
  useEffect(() => {
    if (!isInitialized) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme: Theme = e.matches ? 'dark' : 'light';
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem('aangan-theme')) {
        setThemeState(newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isInitialized]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const isDarkMode = theme === 'dark';

  // Prevent hydration mismatch by not rendering until initialized
  if (!isInitialized) {
    return (
      <AanganLoadingScreen 
        message="Warming the Aangan Theme..."
        narratorLine="The colors of the campus are still waking up."
        variant="orbs"
      />
    );
  }

  return (
    <AanganThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      toggleTheme, 
      isDarkMode, 
      isInitialized 
    }}>
      {children}
    </AanganThemeContext.Provider>
  );
};

// Legacy export for backward compatibility
export const DreamThemeProvider = AanganThemeProvider;

export const useAanganTheme = () => {
  const ctx = React.useContext(AanganThemeContext);
  if (!ctx) throw new Error('useAanganTheme must be used within an AanganThemeProvider');
  return ctx;
}; 
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface DreamThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isInitialized: boolean;
}

const DreamThemeContext = createContext<DreamThemeContextType | undefined>(undefined);

export const useDreamTheme = () => {
  const context = useContext(DreamThemeContext);
  if (!context) {
    throw new Error('useDreamTheme must be used within a DreamThemeProvider');
  }
  return context;
};

interface DreamThemeProviderProps {
  children: ReactNode;
}

export const DreamThemeProvider: React.FC<DreamThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('dream-theme') as Theme;
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
    localStorage.setItem('dream-theme', theme);
    
    // Force reflow to ensure theme changes are applied
    root.offsetHeight;
  }, [theme, isInitialized]);

  // Listen for system theme changes
  useEffect(() => {
    if (!isInitialized) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme: Theme = e.matches ? 'dark' : 'light';
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem('dream-theme')) {
        setThemeState(newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isInitialized]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  // Prevent hydration mismatch by not rendering until initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-pulse">Loading theme...</div>
        </div>
      </div>
    );
  }

  return (
    <DreamThemeContext.Provider value={{ theme, toggleTheme, setTheme, isInitialized }}>
      {children}
    </DreamThemeContext.Provider>
  );
}; 
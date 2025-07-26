import { ReactNode } from 'react';

export type Theme = 'light' | 'dark';

export interface AanganThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
  isInitialized: boolean;
}

export interface AanganThemeProviderProps {
  children: ReactNode;
}

export type Theme = 'light' | 'dark';

export interface AanganThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isInitialized: boolean;
}

export interface AanganThemeProviderProps {
  children: React.ReactNode;
} 
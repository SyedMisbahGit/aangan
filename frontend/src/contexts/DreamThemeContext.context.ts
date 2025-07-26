import { createContext } from 'react';
import type { AanganThemeContextType } from './DreamThemeContext.types';

export const AanganThemeContext = createContext<AanganThemeContextType | undefined>(undefined);
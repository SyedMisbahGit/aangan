import { createContext } from 'react';
import type { SummerSoulContextType } from './SummerSoulContext.types';

export const SummerSoulContext = createContext<SummerSoulContextType | undefined>(undefined);
import { createContext } from 'react';
import type { SummerPulseContextType } from './SummerPulseContext.types';

export const SummerPulseContext = createContext<SummerPulseContextType | undefined>(undefined);
import { createContext } from 'react';
import { SummerPulseContextType } from './SummerPulseContext.helpers';

export const SummerPulseContext = createContext<SummerPulseContextType | undefined>(undefined); 
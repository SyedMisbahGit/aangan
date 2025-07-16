import { createContext } from 'react';
import { SummerSoulContextType } from './SummerSoulContext.helpers';

export const SummerSoulContext = createContext<SummerSoulContextType | undefined>(undefined); 
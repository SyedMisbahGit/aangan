import { useContext } from 'react';
import { SummerPulseContext } from './SummerPulseContext.context';
import type { SummerPulseContextType } from './SummerPulseContext.types';

export const useSummerPulse = (): SummerPulseContextType => {
  const ctx = useContext(SummerPulseContext);
  if (!ctx) throw new Error('useSummerPulse must be used within SummerPulseProvider');
  return ctx;
};
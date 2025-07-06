import { useContext } from 'react';
import { SummerPulseContext } from './SummerPulseContext';

export const useSummerPulse = () => {
  const ctx = useContext(SummerPulseContext);
  if (!ctx) throw new Error('useSummerPulse must be used within SummerPulseProvider');
  return ctx;
}; 
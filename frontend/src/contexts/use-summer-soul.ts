import { useContext } from 'react';
import { SummerSoulContext } from './SummerSoulContext';
export type { LocationTag } from './SummerSoulContext';

export const useSummerSoul = () => {
  const ctx = useContext(SummerSoulContext);
  if (!ctx) throw new Error('useSummerSoul must be used within SummerSoulProvider');
  return ctx;
}; 
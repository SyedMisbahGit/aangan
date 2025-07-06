import { useContext } from 'react';
import { SummerSoulContext } from './SummerSoulContext';

export const useSummerSoul = () => {
  const ctx = useContext(SummerSoulContext);
  if (!ctx) throw new Error('useSummerSoul must be used within a SummerSoulProvider');
  return ctx;
}; 
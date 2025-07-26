import { useContext } from 'react';
import { SummerSoulContext } from './SummerSoulContext.context';
import type { SummerSoulContextType } from './SummerSoulContext.types';

export const useSummerSoul = () => {
  const ctx = useContext(SummerSoulContext);
  if (!ctx) throw new Error('useSummerSoul must be used within SummerSoulProvider');
  return ctx;
};
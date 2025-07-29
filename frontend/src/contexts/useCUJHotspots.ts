import { useContext } from 'react';
import { CUJHotspotContext } from './CUJHotspotContext.context';
import type { CUJHotspotContextType } from './CUJHotspotContext.types';

export const useCUJHotspots = (): CUJHotspotContextType => {
  const ctx = useContext(CUJHotspotContext);
  if (!ctx) throw new Error('useCUJHotspots must be used within a CUJHotspotProvider');
  return ctx;
};

import { useContext } from 'react';
import { CUJHotspotContext } from './CUJHotspotContext.context';
import type { CUJHotspotContextType } from './CUJHotspotContext.types';

export const useCUJHotspots = (): CUJHotspotContextType => {
  const context = useContext(CUJHotspotContext);
  if (!context) {
    throw new Error('useCUJHotspots must be used within a CUJHotspotProvider');
  }
  return context;
}; 
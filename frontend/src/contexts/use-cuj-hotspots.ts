import { useContext } from 'react';
import { CUJHotspotContext } from './CUJHotspotContext';
import type { CUJHotspotContextType } from './CUJHotspotContext';

export const useCUJHotspots = (): CUJHotspotContextType => {
  const context = useContext(CUJHotspotContext);
  if (!context) {
    throw new Error('useCUJHotspots must be used within a CUJHotspotProvider');
  }
  return context;
}; 
import { useContext } from 'react';
import { ShhhNarratorContext } from './ShhhNarratorContext';
import type { ShhhNarratorContextType } from './ShhhNarratorContext';

export const useShhhNarrator = (): ShhhNarratorContextType => {
  const context = useContext(ShhhNarratorContext);
  if (!context) {
    throw new Error('useShhhNarrator must be used within a ShhhNarratorProvider');
  }
  return context;
}; 
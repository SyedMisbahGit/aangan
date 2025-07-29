import { useContext } from 'react';
import { ShhhNarratorContext } from './ShhhNarratorContext.context';
import type { ShhhNarratorContextType } from './ShhhNarratorContext.types';

export const useShhhNarrator = (): ShhhNarratorContextType => {
  const ctx = useContext(ShhhNarratorContext);
  if (!ctx) throw new Error('useShhhNarrator must be used within a ShhhNarratorProvider');
  return ctx;
};

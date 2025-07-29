import { useContext } from 'react';
import { ShhhNarratorContext } from '../ShhhNarratorContext.context';
import { ShhhNarratorContextType } from '../ShhhNarratorContext.types';

export const useShhhNarrator = (): ShhhNarratorContextType => {
  const context = useContext(ShhhNarratorContext);
  if (!context) {
    throw new Error('useShhhNarrator must be used within a ShhhNarratorProvider');
  }
  return context;
};

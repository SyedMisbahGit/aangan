import { createContext } from 'react';
import { ShhhNarratorContextType } from './ShhhNarratorContext.types';

export const ShhhNarratorContext = createContext<ShhhNarratorContextType | undefined>(undefined);
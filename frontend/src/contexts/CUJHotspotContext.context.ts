import { createContext } from 'react';
import { CUJHotspotContextType } from './CUJHotspotContext.types';

export const CUJHotspotContext = createContext<CUJHotspotContextType | undefined>(undefined);
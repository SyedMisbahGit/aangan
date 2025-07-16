import { createContext } from 'react';
import { CUJHotspotContextType } from './CUJHotspotContext.helpers';

export const CUJHotspotContext = createContext<CUJHotspotContextType | undefined>(undefined); 
import { createContext } from 'react';
import { RealtimeContextType } from './RealtimeContext.helpers';

export const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined); 
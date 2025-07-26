import { createContext } from 'react';
import type { RealtimeContextType } from './RealtimeContext.types';

export const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);
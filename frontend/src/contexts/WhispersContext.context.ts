import { createContext } from 'react';
import type { WhispersContextType } from './WhispersContext.types';

export const WhispersContext = createContext<WhispersContextType | undefined>(undefined);
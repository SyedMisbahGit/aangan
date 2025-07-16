import { createContext } from 'react';
import { WhispersContextType } from './WhispersContext.helpers';

export const WhispersContext = createContext<WhispersContextType | undefined>(undefined); 
import { createContext } from 'react';
import { AuthContextType } from './AuthContext.helpers';

export const AuthContext = createContext<AuthContextType | undefined>(undefined); 
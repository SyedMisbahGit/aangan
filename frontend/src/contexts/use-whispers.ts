import { useContext } from 'react';
import { WhispersContext } from './WhispersContext';
import type { WhispersContextType } from './WhispersContext';

export const useWhispers = (): WhispersContextType => {
  const ctx = useContext(WhispersContext);
  if (!ctx) throw new Error("useWhispers must be used within a WhispersProvider");
  return ctx;
}; 
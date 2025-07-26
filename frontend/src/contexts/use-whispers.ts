import { useContext } from 'react';
import { WhispersContext } from './WhispersContext.context';
import type { WhispersContextType } from './WhispersContext.types';

export const useWhispers = (): WhispersContextType => {
  const ctx = useContext(WhispersContext);
  if (!ctx) throw new Error("useWhispers must be used within a WhispersProvider");
  return ctx;
};
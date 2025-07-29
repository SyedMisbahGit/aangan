import { useContext } from 'react';
import { WhispersContext } from './WhispersContext.context';

export const useWhispers = () => {
  const ctx = useContext(WhispersContext);
  if (!ctx) throw new Error('useWhispers must be used within a WhispersProvider');
  return ctx;
};

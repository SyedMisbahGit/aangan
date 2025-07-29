import { useContext } from 'react';
import { RealtimeContext } from './RealtimeContext.context';

export const useRealtime = () => {
  const ctx = useContext(RealtimeContext);
  if (!ctx) throw new Error('useRealtime must be used within a RealtimeProvider');
  return ctx;
};

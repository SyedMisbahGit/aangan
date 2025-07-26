import { useContext } from 'react';
import { RealtimeContext } from './RealtimeContext.context';

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}; 
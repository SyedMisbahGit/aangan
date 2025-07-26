import { RealtimeWhisper } from '../services/realtime';
import { ReactNode } from 'react';
import { Socket } from 'socket.io-client';

export interface RealtimeContextType {
  isConnected: boolean;
  connectionStatus: {
    isConnected: boolean;
    reconnectAttempts: number;
    maxReconnectAttempts: number;
  };
  realtimeWhispers: RealtimeWhisper[];
  zoneActivity: Map<string, { users: number; lastActivity: string }>;
  emotionPulse: Map<string, { count: number; lastPulse: string }>;
  totalActiveUsers: number;
  socket: Socket | null;
  joinZone: (zone: string) => void;
  leaveZone: (zone: string) => void;
  sendEmotionPulse: (emotion: string) => void;
  broadcastWhisper: (whisper: RealtimeWhisper) => void;
  connect: () => void;
  disconnect: () => void;
}

export interface RealtimeProviderProps {
  children: ReactNode;
}

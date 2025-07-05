import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import realtimeService, { 
  RealtimeWhisper, 
  ZoneActivity, 
  EmotionPulse, 
  RealtimeActivity 
} from '../services/realtime';

interface RealtimeContextType {
  // Connection status
  isConnected: boolean;
  connectionStatus: {
    isConnected: boolean;
    reconnectAttempts: number;
    maxReconnectAttempts: number;
  };
  
  // Real-time data
  realtimeWhispers: RealtimeWhisper[];
  zoneActivity: Map<string, { users: number; lastActivity: string }>;
  emotionPulse: Map<string, { count: number; lastPulse: string }>;
  totalActiveUsers: number;
  
  // Socket instance
  socket: any;
  
  // Actions
  joinZone: (zone: string) => void;
  leaveZone: (zone: string) => void;
  sendEmotionPulse: (emotion: string) => void;
  broadcastWhisper: (whisper: RealtimeWhisper) => void;
  
  // Connection management
  connect: () => void;
  disconnect: () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

interface RealtimeProviderProps {
  children: ReactNode;
}

export const RealtimeProvider: React.FC<RealtimeProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: false,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5
  });
  
  const [realtimeWhispers, setRealtimeWhispers] = useState<RealtimeWhisper[]>([]);
  const [zoneActivity, setZoneActivity] = useState<Map<string, { users: number; lastActivity: string }>>(new Map());
  const [emotionPulse, setEmotionPulse] = useState<Map<string, { count: number; lastPulse: string }>>(new Map());
  const [totalActiveUsers, setTotalActiveUsers] = useState(0);

  // Connection status updates
  useEffect(() => {
    const handleConnectionChange = (connected: boolean) => {
      setIsConnected(connected);
      setConnectionStatus(realtimeService.getConnectionStatus());
    };

    realtimeService.on('connection-established', () => handleConnectionChange(true));
    realtimeService.on('connection-lost', () => handleConnectionChange(false));
    realtimeService.on('reconnected', () => handleConnectionChange(true));
    
    // Initial status
    setConnectionStatus(realtimeService.getConnectionStatus());
    setIsConnected(realtimeService.isConnectedToServer());

    return () => {
      realtimeService.off('connection-established', () => handleConnectionChange(true));
      realtimeService.off('connection-lost', () => handleConnectionChange(false));
      realtimeService.off('reconnected', () => handleConnectionChange(true));
    };
  }, []);

  // New whisper updates
  useEffect(() => {
    const handleNewWhisper = (whisper: RealtimeWhisper) => {
      setRealtimeWhispers(prev => [whisper, ...prev.slice(0, 49)]); // Keep last 50 whispers
    };

    realtimeService.on('new-whisper', handleNewWhisper);
    
    return () => {
      realtimeService.off('new-whisper', handleNewWhisper);
    };
  }, []);

  // Zone activity updates
  useEffect(() => {
    const handleZoneActivityUpdate = (data: {
      zone: string;
      activity: { users: number; lastActivity: string };
      totalActive: number;
    }) => {
      setZoneActivity(prev => {
        const newMap = new Map(prev);
        newMap.set(data.zone, data.activity);
        return newMap;
      });
      setTotalActiveUsers(data.totalActive);
    };

    realtimeService.on('zone-activity-update', handleZoneActivityUpdate);
    
    return () => {
      realtimeService.off('zone-activity-update', handleZoneActivityUpdate);
    };
  }, []);

  // Emotion pulse updates
  useEffect(() => {
    const handleEmotionPulseUpdate = (data: {
      emotion: string;
      pulse: { count: number; lastPulse: string };
      totalPulses: number;
    }) => {
      setEmotionPulse(prev => {
        const newMap = new Map(prev);
        newMap.set(data.emotion, data.pulse);
        return newMap;
      });
    };

    realtimeService.on('emotion-pulse-update', handleEmotionPulseUpdate);
    
    return () => {
      realtimeService.off('emotion-pulse-update', handleEmotionPulseUpdate);
    };
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (!realtimeService.isConnectedToServer()) {
      realtimeService.connect();
    }
  }, []);

  const value: RealtimeContextType = {
    isConnected,
    connectionStatus,
    realtimeWhispers,
    zoneActivity,
    emotionPulse,
    totalActiveUsers,
    socket: realtimeService.getSocket(),
    joinZone: realtimeService.joinZone.bind(realtimeService),
    leaveZone: realtimeService.leaveZone.bind(realtimeService),
    sendEmotionPulse: realtimeService.sendEmotionPulse.bind(realtimeService),
    broadcastWhisper: realtimeService.broadcastWhisper.bind(realtimeService),
    connect: realtimeService.connect.bind(realtimeService),
    disconnect: realtimeService.disconnect.bind(realtimeService),
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}; 
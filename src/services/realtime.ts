import React from 'react';
import { io, Socket } from 'socket.io-client';

const REALTIME_URL = import.meta.env.VITE_REALTIME_URL || 'https://aangan-production.up.railway.app';

export interface RealtimeWhisper {
  id: string;
  content: string;
  emotion: string;
  zone: string;
  timestamp: string;
  realTime: boolean;
  created_at: string;
}

export interface ZoneActivity {
  zone: string;
  activeUsers: number;
  lastActivity: string;
}

export interface EmotionPulse {
  emotion: string;
  count: number;
  lastPulse: string;
}

export interface RealtimeActivity {
  activeConnections: number;
  zoneActivity: Record<string, { users: number; lastActivity: string }>;
  emotionPulse: Record<string, { count: number; lastPulse: string }>;
  totalActive: number;
}

class RealtimeService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Set<Function>> = new Map();

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    try {
      this.socket = io(REALTIME_URL, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to initialize realtime connection:', error);
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('🔌 Connected to realtime server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connection-established');
      
      // Send initial heartbeat
      this.sendHeartbeat();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from realtime server:', reason);
      this.isConnected = false;
      this.emit('connection-lost', reason);
      
      // Attempt reconnection for certain disconnect reasons
      if (reason === 'io server disconnect' || reason === 'transport close') {
        setTimeout(() => {
          if (!this.isConnected) {
            console.log('🔄 Attempting reconnection...');
            this.connect();
          }
        }, 1000);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Connection error:', error);
      this.reconnectAttempts++;
      this.emit('connection-error', error);
      
      // Exponential backoff for reconnection attempts
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        setTimeout(() => {
          if (!this.isConnected) {
            console.log(`🔄 Reconnection attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts}`);
            this.connect();
          }
        }, delay);
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔌 Reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('reconnected', attemptNumber);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('🔌 Reconnection failed');
      this.emit('reconnection-failed');
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}`);
      this.emit('reconnect-attempt', attemptNumber);
    });

    // Whisper events with error handling
    this.socket.on('new-whisper', (whisper: RealtimeWhisper) => {
      try {
        console.log('📝 New whisper received:', whisper);
        this.emit('new-whisper', whisper);
      } catch (error) {
        console.error('Error handling new whisper:', error);
      }
    });

    this.socket.on('zone-whisper', (whisper: RealtimeWhisper) => {
      try {
        console.log('📍 Zone whisper received:', whisper);
        this.emit('zone-whisper', whisper);
      } catch (error) {
        console.error('Error handling zone whisper:', error);
      }
    });

    // Zone activity events with validation
    this.socket.on('zone-activity-update', (data: {
      zone: string;
      activity: { users: number; lastActivity: string };
      totalActive: number;
    }) => {
      try {
        // Validate data
        if (!data.zone || typeof data.activity?.users !== 'number') {
          console.warn('Invalid zone activity data received:', data);
          return;
        }
        
        console.log('📍 Zone activity update:', data);
        this.emit('zone-activity-update', data);
      } catch (error) {
        console.error('Error handling zone activity update:', error);
      }
    });

    // Emotion pulse events with validation
    this.socket.on('emotion-pulse-update', (data: {
      emotion: string;
      pulse: { count: number; lastPulse: string };
      totalPulses: number;
    }) => {
      try {
        // Validate data
        if (!data.emotion || typeof data.pulse?.count !== 'number') {
          console.warn('Invalid emotion pulse data received:', data);
          return;
        }
        
        console.log('💓 Emotion pulse update:', data);
        this.emit('emotion-pulse-update', data);
      } catch (error) {
        console.error('Error handling emotion pulse update:', error);
      }
    });

    // Error event
    this.socket.on('error', (error) => {
      console.error('🔌 Socket error:', error);
      this.emit('socket-error', error);
    });
  }

  // Send heartbeat to keep connection alive
  private sendHeartbeat() {
    if (this.socket && this.isConnected) {
      this.socket.emit('heartbeat', { timestamp: Date.now() });
    }
  }

  // Start heartbeat interval
  private startHeartbeat() {
    setInterval(() => {
      if (this.isConnected) {
        this.sendHeartbeat();
      }
    }, 30000); // Every 30 seconds
  }

  // Connection management
  connect() {
    if (this.socket && !this.isConnected) {
      this.socket.connect();
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  isConnectedToServer(): boolean {
    return this.isConnected;
  }

  // Zone management
  joinZone(zone: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-zone', zone);
      console.log(`📍 Joining zone: ${zone}`);
    }
  }

  leaveZone(zone: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-zone', zone);
      console.log(`📍 Leaving zone: ${zone}`);
    }
  }

  // Emotion pulse
  sendEmotionPulse(emotion: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('emotion-pulse', emotion);
      console.log(`💓 Sending emotion pulse: ${emotion}`);
    }
  }

  // Whisper creation (for real-time broadcasting)
  broadcastWhisper(whisper: RealtimeWhisper) {
    if (this.socket && this.isConnected) {
      this.socket.emit('whisper-created', whisper);
      console.log(`📝 Broadcasting whisper: ${whisper.id}`);
    }
  }

  // Event listeners
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  private emit(event: string, data?: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Utility methods
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    };
  }
}

// Create singleton instance
export const realtimeService = new RealtimeService();

// React hooks for realtime events
export const useRealtimeWhispers = (callback: (whisper: RealtimeWhisper) => void) => {
  React.useEffect(() => {
    realtimeService.on('new-whisper', callback);
    return () => realtimeService.off('new-whisper', callback);
  }, [callback]);
};

export const useRealtimeZoneActivity = (callback: (data: any) => void) => {
  React.useEffect(() => {
    realtimeService.on('zone-activity-update', callback);
    return () => realtimeService.off('zone-activity-update', callback);
  }, [callback]);
};

export const useRealtimeEmotionPulse = (callback: (data: any) => void) => {
  React.useEffect(() => {
    realtimeService.on('emotion-pulse-update', callback);
    return () => realtimeService.off('emotion-pulse-update', callback);
  }, [callback]);
};

export const useRealtimeConnection = (callback: (status: boolean) => void) => {
  React.useEffect(() => {
    const handleConnect = () => callback(true);
    const handleDisconnect = () => callback(false);
    
    realtimeService.on('connection-established', handleConnect);
    realtimeService.on('connection-lost', handleDisconnect);
    
    return () => {
      realtimeService.off('connection-established', handleConnect);
      realtimeService.off('connection-lost', handleDisconnect);
    };
  }, [callback]);
};

export default realtimeService; 
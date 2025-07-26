import React from 'react';
import { io, Socket } from 'socket.io-client';
import { logger } from '../utils/logger';

// Define event types and their payload types
interface EventTypeMap {
  'connection-established': void;
  'connection-lost': string;
  'connection-error': Error;
  'reconnected': number;
  'reconnection-failed': void;
  'reconnect-attempt': number;
  'new-whisper': RealtimeWhisper;
  'zone-whisper': RealtimeWhisper;
  'zone-activity-update': { 
    zone: string; 
    activity: { users: number; lastActivity: string }; 
    totalActive: number 
  };
  'emotion-pulse-update': { 
    emotion: string; 
    pulse: { count: number; lastPulse: string }; 
    totalPulses: number 
  };
  'new-report': { whisper_id: string; reason: string; guest_id: string; created_at: string };
  'socket-error': Error;
}

// For local dev, set VITE_REALTIME_URL=ws://localhost:3001 in your .env file
const REALTIME_URL = import.meta.env.VITE_REALTIME_URL || (import.meta.env.DEV ? 'ws://localhost:3001' : 'wss://aangan-production.up.railway.app');

// Socket authentication key - should match backend SOCKET_SHARED_KEY
const SOCKET_CLIENT_KEY = import.meta.env.VITE_SOCKET_SHARED_KEY || 'superSecretSocketKey';

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

// Type for event names
type EventName = keyof EventTypeMap;

// Type for event handlers
type EventHandler<T> = (payload: T) => void;

class RealtimeService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  // Store event listeners with proper typing
  private listeners = new Map<EventName, Set<EventHandler<unknown>>>();

  constructor() {
    this.initializeSocket();
  }

  /**
   * Initialize the socket connection with error handling and reconnection logic
   * @private
   */
  private initializeSocket(): void {
    try {
      if (this.socket?.connected) {
        logger.info('Socket already connected, skipping initialization');
        return;
      }

      logger.info('Initializing socket connection', { url: REALTIME_URL });
      
      this.socket = io(REALTIME_URL, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        autoConnect: false, // We'll connect manually after setting up listeners
        auth: {
          clientKey: SOCKET_CLIENT_KEY
        }
      });

      this.setupEventListeners();
      
      // Connect after setting up listeners
      this.socket.connect();
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to initialize realtime connection', { 
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Schedule reconnection attempt
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        this.reconnectAttempts++;
        
        logger.info(`Scheduling reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
        
        setTimeout(() => {
          if (!this.isConnected) {
            this.initializeSocket();
          }
        }, delay);
      } else {
        logger.error('Max reconnection attempts reached, giving up');
        this.emitEvent('reconnection-failed', undefined as never);
      }
    }
  }

  /**
   * Set up all socket event listeners with proper error handling
   * @private
   */
  private setupEventListeners(): void {
    if (!this.socket) {
      logger.warn('Cannot setup event listeners: socket not initialized');
      return;
    }

    // Connection events
    this.socket.on('connect', this.handleConnect.bind(this));
    this.socket.on('disconnect', this.handleDisconnect.bind(this));
    this.socket.on('connect_error', this.handleConnectError.bind(this));
    this.socket.on('reconnect', this.handleReconnect.bind(this));
    this.socket.on('reconnect_failed', this.handleReconnectFailed.bind(this));
    this.socket.on('reconnect_attempt', this.handleReconnectAttempt.bind(this));
    
    // Application-specific events
    this.socket.on('new-whisper', this.handleNewWhisper.bind(this));
    this.socket.on('zone-whisper', this.handleZoneWhisper.bind(this));
    this.socket.on('zone-activity-update', this.handleZoneActivityUpdate.bind(this));
    this.socket.on('emotion-pulse-update', this.handleEmotionPulseUpdate.bind(this));
    this.socket.on('new-report', this.handleNewReport.bind(this));
    this.socket.on('error', this.handleError.bind(this));
  }

  /**
   * Handle socket connection established
   * @private
   */
  private handleConnect(): void {
    logger.info('Socket connected', { socketId: this.socket?.id });
    
    this.isConnected = true;
    this.reconnectAttempts = 0;
    
    // Start the heartbeat interval
    this.startHeartbeat();
    
    // Notify listeners
    this.emitEvent('connection-established', undefined as never);
  }

  /**
   * Handle socket disconnection
   * @param reason Disconnection reason
   * @private
   */
  private handleDisconnect(reason: string): void {
    logger.info('Socket disconnected', { reason });
    
    this.isConnected = false;
    this.emitEvent('connection-lost', reason);
    
    // Attempt reconnection for certain disconnect reasons
    if (reason === 'io server disconnect' || reason === 'transport close') {
      logger.info('Attempting to reconnect...');
      setTimeout(() => {
        if (!this.isConnected && this.socket) {
          this.socket.connect();
        }
      }, 1000);
    }
  }

  /**
   * Handle connection errors
   * @param error Error object
   * @private
   */
  private handleConnectError(error: Error): void {
    logger.error('Socket connection error', { 
      error: error.message, 
      attempt: this.reconnectAttempts + 1,
      stack: error.stack 
    });
    
    this.emitEvent('connection-error', error);
  }

  /**
   * Handle successful reconnection
   * @param attemptNumber Reconnection attempt number
   * @private
   */
  private handleReconnect(attemptNumber: number): void {
    logger.info('Socket reconnected', { attemptNumber });
    
    this.isConnected = true;
    this.reconnectAttempts = 0;
    this.emitEvent('reconnected', attemptNumber);
  }

  /**
   * Handle failed reconnection
   * @private
   */
  private handleReconnectFailed(): void {
    logger.error('Max reconnection attempts reached');
    this.emitEvent('reconnection-failed', undefined as never);
  }

  /**
   * Handle reconnection attempt
   * @param attemptNumber Current attempt number
   * @private
   */
  private handleReconnectAttempt(attemptNumber: number): void {
    logger.info('Reconnection attempt', { attemptNumber });
    this.emitEvent('reconnect-attempt', attemptNumber);
  }

  /**
   * Handle new whisper event
   * @param whisper Whisper data
   * @private
   */
  private handleNewWhisper(whisper: RealtimeWhisper): void {
    try {
      if (!whisper?.id) {
        throw new Error('Invalid whisper data received');
      }
      this.emitEvent('new-whisper', whisper);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error handling new whisper', { 
        error: errorMessage,
        whisperId: whisper?.id,
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  }

  /**
   * Handle zone whisper event
   * @param whisper Whisper data for the zone
   * @private
   */
  private handleZoneWhisper(whisper: RealtimeWhisper): void {
    try {
      if (!whisper?.id || !whisper?.zone) {
        throw new Error('Invalid zone whisper data received');
      }
      this.emitEvent('zone-whisper', whisper);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error handling zone whisper', { 
        error: errorMessage,
        whisperId: whisper?.id,
        zone: whisper?.zone,
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  }

  /**
   * Handle zone activity update
   * @param data Zone activity data
   * @private
   */
  private handleZoneActivityUpdate(data: {
    zone: string;
    activity: { users: number; lastActivity: string };
    totalActive: number;
  }): void {
    try {
      // Validate data
      if (!data?.zone || typeof data.activity?.users !== 'number') {
        throw new Error('Invalid zone activity data');
      }
      
      this.emitEvent('zone-activity-update', data);
    } catch (error) {
      logger.error('Error handling zone activity update', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        zone: data?.zone,
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  }

  /**
   * Handle emotion pulse update
   * @param data Emotion pulse data
   * @private
   */
  private handleEmotionPulseUpdate(data: {
    emotion: string;
    pulse: { count: number; lastPulse: string };
    totalPulses: number;
  }): void {
    try {
      // Validate data
      if (!data?.emotion || typeof data.pulse?.count !== 'number') {
        throw new Error('Invalid emotion pulse data');
      }
      
      this.emitEvent('emotion-pulse-update', data);
    } catch (error) {
      logger.error('Error handling emotion pulse update', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        emotion: data?.emotion,
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  }

  /**
   * Handle new report
   * @param report Report data
   * @private
   */
  private handleNewReport(report: { 
    whisper_id: string; 
    reason: string; 
    guest_id: string; 
    created_at: string 
  }): void {
    try {
      if (!report?.whisper_id || !report.reason) {
        throw new Error('Invalid report data');
      }
      
      this.emitEvent('new-report', report);
    } catch (error) {
      logger.error('Error handling new report', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        whisperId: report?.whisper_id,
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  }

  /**
   * Handle socket errors
   * @param error Error object
   * @private
   */
  private handleError(error: Error): void {
    logger.error('Socket error', { 
      error: error.message,
      stack: error.stack 
    });
    
    this.emitEvent('socket-error', error);
  }

  private heartbeatInterval: NodeJS.Timeout | null = null;

  /**
   * Send a heartbeat to the server to keep the connection alive
   * @private
   */
  private sendHeartbeat(): void {
    try {
      if (this.socket?.connected) {
        const timestamp = Date.now();
        this.socket.emit('heartbeat', { timestamp });
        logger.debug('Heartbeat sent', { timestamp });
      } else {
        logger.warn('Cannot send heartbeat: Socket not connected');
      }
    } catch (error) {
      logger.error('Error sending heartbeat', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  }

  /**
   * Start the heartbeat interval to maintain the connection
   * @private
   */
  private startHeartbeat(): void {
    // Clear any existing interval
    this.stopHeartbeat();
    
    // Send initial heartbeat
    this.sendHeartbeat();
    
    // Set up the interval (every 30 seconds)
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.sendHeartbeat();
      } else {
        // If we're not connected, clear the interval
        this.stopHeartbeat();
      }
    }, 30000);
    
    logger.info('Heartbeat started');
  }

  /**
   * Stop the heartbeat interval
   * @private
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
      logger.info('Heartbeat stopped');
    }
  }

  /**
   * Clean up resources when the service is no longer needed
   * @public
   */
  public destroy(): void {
    this.stopHeartbeat();
    this.disconnect();
    
    // Clear all event listeners
    this.listeners.clear();
    
    logger.info('RealtimeService destroyed');
  }

  /**
   * Get the current connection status
   * @returns Object containing connection status information
   * @public
   */
  public getConnectionStatus(): {
    isConnected: boolean;
    reconnectAttempts: number;
    maxReconnectAttempts: number;
    socketId?: string;
  } {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      socketId: this.socket?.id
    };
  }

  /**
   * Get the underlying socket instance
   * @returns The socket.io client instance or null if not connected
   * @public
   */
  public getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Connect to the realtime server
   * @returns void
   */
  public connect(): void {
    if (!this.socket) {
      this.initializeSocket();
    } else if (!this.isConnected) {
      this.socket.connect();
    }
  }

  /**
   * Disconnect from the realtime server
   * @returns void
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  /**
   * Check if connected to the realtime server
   * @returns boolean indicating connection status
   */
  public isConnectedToServer(): boolean {
    return this.isConnected;
  }

  /**
   * Join a specific zone for realtime updates
   * @param zone The zone name to join
   * @returns void
   */
  public joinZone(zone: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-zone', zone);
    } else {
      logger.warn('Cannot join zone: Not connected to realtime server');
    }
  }

  /**
   * Leave a previously joined zone
   * @param zone The zone name to leave
   * @returns void
   */
  public leaveZone(zone: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-zone', zone);
    } else {
      logger.warn('Cannot leave zone: Not connected to realtime server');
    }
  }

  /**
   * Send an emotion pulse to the server
   * @param emotion The emotion to send
   * @returns void
   */
  public sendEmotionPulse(emotion: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('emotion-pulse', emotion);
    } else {
      logger.warn('Cannot send emotion pulse: Not connected to realtime server');
    }
  }

  /**
   * Broadcast a new whisper to the current zone
   * @param whisper The whisper to broadcast
   * @returns void
   */
  public broadcastWhisper(whisper: RealtimeWhisper): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('whisper-created', whisper);
    } else {
      logger.warn('Cannot broadcast whisper: Not connected to realtime server');
    }
  }

  /**
   * Register an event listener
   * @param eventName Name of the event to listen for
   * @param callback Function to call when the event is emitted
   * @returns Unsubscribe function to remove the listener
   */
  public on<K extends EventName>(
    eventName: K,
    callback: EventHandler<EventTypeMap[K]>
  ): () => void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    
    const eventListeners = this.listeners.get(eventName)!;
    eventListeners.add(callback as EventHandler<unknown>);
    
    // Return unsubscribe function
    return () => this.off(eventName, callback);
  }

  /**
   * Remove an event listener
   * @param eventName Name of the event
   * @param callback Callback function to remove
   */
  public off<K extends EventName>(
    eventName: K,
    callback: EventHandler<EventTypeMap[K]>
  ): void {
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      eventListeners.delete(callback as EventHandler<unknown>);
    }
  }

  /**
   * Emit an event to all registered listeners
   * @param eventName Name of the event to emit
   * @param payload Data to pass to event listeners
   */
  private emitEvent<K extends EventName>(
    eventName: K,
    payload: EventTypeMap[K]
  ): void {
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners && eventListeners.size > 0) {
      // Convert to array to ensure we don't miss any callbacks if the set changes during iteration
      const callbacks = Array.from(eventListeners);
      
      callbacks.forEach((listener) => {
        try {
          // Call the listener with the payload
          (listener as EventHandler<EventTypeMap[K]>)(payload);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          logger.error(`Error in event handler for ${String(eventName)}`, { 
            error: errorMessage,
            event: eventName
          });
        }
      });
    }
  }

  // Note: The utility methods getConnectionStatus() and getSocket() are already defined above
  // with full TypeScript types and JSDoc comments. The duplicate implementations have been removed.
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

export const useRealtimeZoneActivity = (callback: (data: { zone: string; activity: { users: number; lastActivity: string }; totalActive: number }) => void) => {
  React.useEffect(() => {
    realtimeService.on('zone-activity-update', callback);
    return () => realtimeService.off('zone-activity-update', callback);
  }, [callback]);
};

export const useRealtimeEmotionPulse = (callback: (data: { emotion: string; pulse: { count: number; lastPulse: string }; totalPulses: number }) => void) => {
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
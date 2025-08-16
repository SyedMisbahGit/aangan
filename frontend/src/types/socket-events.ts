// Shared Socket.IO Event Types for Frontend
// These types should match the backend socket-events.d.ts

export interface Whisper {
  id: string;
  content: string;
  emotion: string;
  zone: string;
  timestamp: string;
  created_at: string;
  isAnonymous?: boolean;
  likes?: number;
  replies?: number;
}

export interface WhisperCreateInput {
  content: string;
  emotion: string;
  zone: string;
  isAnonymous?: boolean;
}

export interface UserInfo {
  id: string;
  username?: string;
  isAnonymous: boolean;
  zone?: string;
}

// Events sent from server to client
export interface ServerToClientEvents {
  // Whisper events
  'whisper:new': (whisper: Whisper) => void;
  'whisper:update': (whisper: Whisper) => void;
  'whisper:delete': (whisperId: string) => void;
  
  // Zone activity events
  'zone:activity': (data: { zone: string; count: number; emotion?: string }) => void;
  'zone:user_joined': (data: { zone: string; userCount: number }) => void;
  'zone:user_left': (data: { zone: string; userCount: number }) => void;
  
  // System events
  'connection:confirmed': (data: { socketId: string; userId?: string }) => void;
  'error': (error: { message: string; code?: string }) => void;
  
  // Real-time feed events
  'feed:update': (whispers: Whisper[]) => void;
}

// Events sent from client to server
export interface ClientToServerEvents {
  // Whisper events
  'whisper:create': (input: WhisperCreateInput) => void;
  'whisper:like': (whisperId: string) => void;
  'whisper:unlike': (whisperId: string) => void;
  
  // Zone events
  'zone:join': (zone: string) => void;
  'zone:leave': (zone: string) => void;
  
  // User events
  'user:update_info': (userInfo: Partial<UserInfo>) => void;
  
  // Subscription events
  'subscribe:zone': (zone: string) => void;
  'unsubscribe:zone': (zone: string) => void;
  'subscribe:feed': () => void;
  'unsubscribe:feed': () => void;
}

// Typed Socket.IO client for use in React components
import { Socket } from 'socket.io-client';
export type TypedClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

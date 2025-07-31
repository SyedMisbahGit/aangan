// User Types
declare interface User {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'moderator' | 'admin';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  isActive: boolean;
}

// Whisper Types
declare interface Whisper {
  id: string;
  content: string;
  emotion: 'happy' | 'sad' | 'angry' | 'excited' | 'anxious' | 'grateful' | 'hopeful' | 'lonely' | 'stressed' | 'other';
  zone: 'tapri' | 'library' | 'hostel' | 'canteen' | 'auditorium' | 'quad' | 'other';
  authorId: string;
  author?: Pick<User, 'id' | 'username' | 'avatar'>;
  isAnonymous: boolean;
  isAiGenerated: boolean;
  isReported?: boolean;
  reportReason?: string;
  reportCount?: number;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  // Frontend only fields
  timestamp?: string;
  realTime?: boolean;
  reactions?: {
    [key: string]: number;
  };
  userReaction?: string;
}

// Report Types
declare interface Report {
  id: string;
  whisperId: string;
  reporterId: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  whisper?: Whisper;
  reporter?: Pick<User, 'id' | 'username' | 'email'>;
  reviewer?: Pick<User, 'id' | 'username'>;
}

// Notification Types
declare interface Notification {
  id: string;
  userId: string;
  type: 'whisper_reply' | 'whisper_reaction' | 'new_follower' | 'admin_alert' | 'report_resolved';
  message: string;
  isRead: boolean;
  relatedEntityId?: string;
  relatedEntityType?: 'whisper' | 'user' | 'report';
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

// API Response Types
declare interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errorCode?: string;
  timestamp: string;
}

declare interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Form Data Types
declare interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

declare interface RegisterFormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

declare interface CreateWhisperFormData {
  content: string;
  emotion: Whisper['emotion'];
  zone: Whisper['zone'];
  isAnonymous: boolean;
  expiresAt?: string;
}

// WebSocket Types
declare interface WebSocketMessage<T = unknown> {
  event: string;
  payload: T;
  timestamp: string;
}

declare interface WebSocketConnection {
  id: string;
  userId?: string;
  ip: string;
  userAgent: string;
  connectedAt: string;
  lastActivity: string;
  currentZone?: string;
  currentEmotion?: string;
}

// Theme Types
declare type ThemeMode = 'light' | 'dark' | 'system';

declare interface ThemeSettings {
  mode: ThemeMode;
  primaryColor: string;
  secondaryColor: string;
  fontSize: number;
  borderRadius: number;
  isCompact: boolean;
}

// Redux State Types
declare interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

declare interface WhisperState {
  items: Whisper[];
  currentWhisper: Whisper | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    emotion: string | null;
    zone: string | null;
    search: string;
    sortBy: 'newest' | 'popular' | 'controversial';
  };
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

declare interface UiState {
  theme: ThemeSettings;
  isMobile: boolean;
  isDrawerOpen: boolean;
  notifications: Notification[];
  unreadCount: number;
  isOnline: boolean;
  isPageLoading: boolean;
}

declare interface RootState {
  auth: AuthState;
  whispers: WhisperState;
  ui: UiState;
  // Add other slices as needed
}

// API Error Types
declare class ApiError extends Error {
  status: number;
  errorCode: string;
  details?: unknown;

  constructor(message: string, status: number, errorCode: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errorCode = errorCode;
    this.details = details;
    
    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

// Add global type declarations
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    REACT_APP_API_URL: string;
    REACT_APP_WS_URL: string;
    REACT_APP_GA_TRACKING_ID?: string;
    REACT_APP_SENTRY_DSN?: string;
    REACT_APP_VERSION: string;
  }
}

// Extend Window interface if needed
declare interface Window {
  // Example: Google Analytics
  gtag?: (command: string, ...args: unknown[]) => void;
  
  // Example: Environment variables
  env: {
    NODE_ENV: 'development' | 'production' | 'test';
    API_URL: string;
    WS_URL: string;
  };
}

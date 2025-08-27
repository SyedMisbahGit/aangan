import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { logger } from "@/utils/logger";

// Constants
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV 
    ? "http://localhost:3001/api" 
    : "https://aangan-production.up.railway.app/api"
  );
const DEFAULT_TIMEOUT = 10000; // 10 seconds

// Create an AbortController for request cancellation
const createAbortController = () => new AbortController();

// Error classes for better error handling
class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    
    // Maintain proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

class TimeoutError extends Error {
  constructor() {
    super('Request timed out');
    this.name = 'TimeoutError';
  }
}

// Types
export interface Whisper {
  id: string;
  content: string;
  emotion: "joy" | "nostalgia" | "calm" | "anxiety" | "hope" | "love";
  zone: string;
  likes: number;
  replies: number;
  timestamp: string;
  created_at: string;
  is_ai_generated?: boolean;
  isAIGenerated?: boolean;
  echoLabel?: string;
  expires_at?: string;
}

export interface CreateWhisperData {
  content: string;
  emotion: "joy" | "nostalgia" | "calm" | "anxiety" | "hope" | "love";
  zone: string;
  expiresAt?: string;
  guestId?: string;
}

export interface AnalyticsData {
  totalWhispers: number;
  whispersToday: number;
  emotionDistribution: Array<{ emotion: string; count: number }>;
  zoneDistribution: Array<{ zone: string; count: number }>;
}

export interface FeatureToggles {
  shrines: boolean;
  capsules: boolean;
  mirrorMode: boolean;
  murmurs: boolean;
}

// Request timeout helper
const timeout = (ms: number, promise: Promise<Response>): Promise<Response> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new TimeoutError());
    }, ms);

    promise.then(
      (res) => {
        clearTimeout(timeoutId);
        resolve(res);
      },
      (err) => {
        clearTimeout(timeoutId);
        reject(err);
      }
    );
  });
};

/**
 * Enhanced API request handler with better error handling and request cancellation
 */
const apiRequest = async <T = any>(
  endpoint: string, 
  options: RequestInit & { 
    timeout?: number;
    abortController?: AbortController;
  } = {}
): Promise<T> => {
  const {
    timeout: requestTimeout = DEFAULT_TIMEOUT,
    abortController,
    ...fetchOptions
  } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers({
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as HeadersInit),
  });

  // Add auth token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const controller = abortController || createAbortController();
  const signal = controller.signal;

  try {
    const response = await timeout(
      requestTimeout,
      fetch(url, {
        ...fetchOptions,
        headers,
        signal,
        credentials: 'include', // Include cookies for CSRF protection
      })
    );

    // Handle non-2xx responses
    if (!response.ok) {
      let errorData;
      const contentType = response.headers.get('content-type');
      
      try {
        errorData = contentType?.includes('application/json')
          ? await response.json()
          : await response.text();
      } catch (e) {
        errorData = { error: 'Failed to parse error response' };
      }

      throw new ApiError(
        errorData.message || 'An error occurred',
        response.status,
        errorData.code,
        errorData.details
      );
    }

    // Parse response based on content type
    const responseContentType = response.headers.get('content-type') || '';
    if (responseContentType.includes('application/json')) {
      return response.json();
    }
    if (responseContentType.includes('text/')) {
      return response.text() as unknown as T;
    }
    return response.blob() as unknown as T;
  } catch (error) {
    if (error instanceof TimeoutError) {
      logger.warn('Request timed out', { url, options });
      throw new ApiError('Request timed out', 408, 'REQUEST_TIMEOUT');
    }
    
    if (error instanceof TypeError) {
      logger.error('Network error', { url, error: error.message });
      throw new NetworkError('Unable to connect to the server. Please check your internet connection.');
    }

    // Re-throw if it's already an ApiError
    if (error instanceof ApiError) {
      throw error;
    }

    // Log and rethrow other errors
    logger.error('API request failed', { 
      url, 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    throw new ApiError(
      'An unexpected error occurred',
      500,
      'INTERNAL_ERROR',
      error instanceof Error ? error.message : error
    );
  }
};

// Whisper API functions
export interface FetchWhispersParams {
  zone?: string;
  emotion?: string;
  limit?: number;
  offset?: number;
  guestId?: string;
  signal?: AbortSignal;
}

export const fetchWhispers = async ({
  zone,
  emotion,
  limit = 20,
  offset = 0,
  guestId,
  signal,
}: FetchWhispersParams = {}): Promise<Whisper[]> => {
  const searchParams = new URLSearchParams();
  
  if (zone) searchParams.append('zone', zone);
  if (emotion) searchParams.append('emotion', emotion);
  searchParams.append('limit', limit.toString());
  searchParams.append('offset', offset.toString());
  if (guestId) searchParams.append('guestId', guestId);

  const endpoint = `/whispers?${searchParams.toString()}`;
  
  return apiRequest<Whisper[]>(endpoint, {
    signal,
    // Cache response for 5 minutes
    headers: {
      'Cache-Control': 'max-age=300',
    },
  });
};

export const createWhisper = async (
  data: CreateWhisperData,
  signal?: AbortSignal
): Promise<Whisper> => {
  // Handle expiration if needed
  if (data.expiresAt) {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);
    data.expiresAt = expiryDate.toISOString();
  }

  return apiRequest<Whisper>('/whispers', {
    method: 'POST',
    body: JSON.stringify(data),
    signal,
    // Don't cache POST requests
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Content-Type': 'application/json',
    },
  });
};

// Analytics API functions (admin only)
export const fetchAnalytics = async (token: string, signal?: AbortSignal): Promise<AnalyticsData> => {
  return apiRequest<AnalyticsData>("/analytics", {
    signal,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Cache-Control': 'no-cache',
    },
  });
};

export interface ZoneAnalytics {
  zone: string;
  count: number;
  emotions: Array<{ emotion: string; count: number }>;
}

export const fetchZoneAnalytics = async (
  token: string, 
  signal?: AbortSignal
): Promise<ZoneAnalytics[]> => {
  return apiRequest<ZoneAnalytics[]>("/analytics/zones", {
    signal,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Cache-Control': 'no-cache',
    },
  });
};

// Feature toggle API functions
export const fetchFeatureToggles = async (signal?: AbortSignal): Promise<FeatureToggles> => {
  return apiRequest<FeatureToggles>("/features", {
    signal,
    headers: {
      'Cache-Control': 'no-cache',
    },
  });
};

export interface UpdateFeatureToggleParams {
  feature: string;
  enabled: boolean;
  token: string;
  signal?: AbortSignal;
}

export const updateFeatureToggle = async ({
  feature,
  enabled,
  token,
  signal,
}: UpdateFeatureToggleParams): Promise<{ success: boolean }> => {
  return apiRequest<{ success: boolean }>("/features/update", {
    method: "PATCH",
    signal,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ feature, enabled }),
  });
};

// Authentication API functions
export interface LoginResponse {
  token: string;
  user: {
    username: string;
    role: string;
  };
  expiresIn: number;
  refreshToken?: string;
}

export interface LoginParams {
  username: string;
  password: string;
  signal?: AbortSignal;
}

export const loginAdmin = async ({
  username,
  password,
  signal,
}: LoginParams): Promise<LoginResponse> => {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    signal,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
};

export interface VerifyTokenResponse {
  valid: boolean;
  user: {
    username: string;
    role: string;
  };
  expiresIn?: number;
}

export const verifyToken = async (
  token: string,
  signal?: AbortSignal
): Promise<VerifyTokenResponse> => {
  return apiRequest<VerifyTokenResponse>("/auth/verify", {
    signal,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Cache-Control': 'no-cache',
    },
  });
};

// Health check
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  version?: string;
  uptime?: number;
  services?: Record<string, 'ok' | 'degraded' | 'down'>;
}

export const checkHealth = async (signal?: AbortSignal): Promise<HealthCheckResponse> => {
  return apiRequest<HealthCheckResponse>("/health", {
    signal,
    // Cache health check for 30 seconds
    headers: {
      'Cache-Control': 'max-age=30',
    },
  });
};

// React Query hooks
export const useWhispers = (params?: {
  zone?: string;
  emotion?: string;
  limit?: number;
  offset?: number;
  guestId?: string;
}) => {
  return useQuery({
    queryKey: ["whispers", params],
    queryFn: () => fetchWhispers(params),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });
};

export const useCreateWhisper = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWhisper,
    onSuccess: (newWhisper) => {
      // Invalidate and refetch whispers
      queryClient.invalidateQueries({ queryKey: ["whispers"] });
      
      // Add to real-time context if available
      if (typeof window !== 'undefined' && (window as Window & { realtimeService?: { broadcastWhisper: (whisper: Whisper) => void } }).realtimeService) {
        (window as Window & { realtimeService?: { broadcastWhisper: (whisper: Whisper) => void } }).realtimeService!.broadcastWhisper(newWhisper);
      }
      
      // Dispatch whisper created event for milestones
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('whisper-created'));
      }
    },
  });
};

export const useAnalytics = (token: string) => {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: () => fetchAnalytics(token),
    enabled: !!token,
    staleTime: 60000, // 1 minute
  });
};

export const useZoneAnalytics = (token: string) => {
  return useQuery({
    queryKey: ["zoneAnalytics"],
    queryFn: () => fetchZoneAnalytics(token),
    enabled: !!token,
    staleTime: 60000, // 1 minute
  });
};

export const useFeatureToggles = () => {
  return useQuery({
    queryKey: ["featureToggles"],
    queryFn: fetchFeatureToggles,
    staleTime: 300000, // 5 minutes
  });
};

export const useUpdateFeatureToggle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      feature,
      enabled,
      token,
    }: {
      feature: string;
      enabled: boolean;
      token: string;
    }) => updateFeatureToggle(feature, enabled, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featureToggles"] });
    },
  });
};

export const useLoginAdmin = () => {
  return useMutation({
    mutationFn: ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }) => loginAdmin(username, password),
  });
};

export const useVerifyToken = (token: string) => {
  return useQuery({
    queryKey: ["verifyToken"],
    queryFn: () => verifyToken(token),
    enabled: !!token,
    staleTime: 300000, // 5 minutes
  });
};

export const useHealthCheck = () => {
  return useQuery({
    queryKey: ["health"],
    queryFn: checkHealth,
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // 5 minutes
  });
};

// Reaction API functions
export const reactToWhisper = async (
  whisperId: string,
  reactionType: string,
  guestId: string
): Promise<{
  whisperId: string;
  reactions: Record<string, number>;
  guestId: string;
  reactionType: string;
  action: 'added' | 'removed';
}> => {
  const response = await apiRequest(`/whispers/${whisperId}/react`, {
    method: "POST",
    body: JSON.stringify({ reactionType, guestId }),
  });
  return response;
};

export const getWhisperReactions = async (whisperId: string): Promise<{
  whisperId: string;
  reactions: Record<string, number>;
}> => {
  return apiRequest(`/whispers/${whisperId}/reactions`);
};

export const useWhisperReactions = (whisperId: string) => {
  return useQuery({
    queryKey: ["whisper-reactions", whisperId],
    queryFn: () => getWhisperReactions(whisperId),
    enabled: !!whisperId,
  });
};

export const useReactToWhisper = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ whisperId, reactionType, guestId }: {
      whisperId: string;
      reactionType: string;
      guestId: string;
    }) => reactToWhisper(whisperId, reactionType, guestId),
    onSuccess: (data) => {
      // Invalidate reactions for this whisper
      queryClient.invalidateQueries({ queryKey: ["whisper-reactions", data.whisperId] });
    },
  });
};

export const reportWhisper = async (
  whisperId: string,
  reason: string,
  guestId?: string
): Promise<{ success: boolean; message: string }> => {
  return apiRequest(`/whispers/${whisperId}/report`, {
    method: "POST",
    body: JSON.stringify({ reason, guest_id: guestId }),
  });
};

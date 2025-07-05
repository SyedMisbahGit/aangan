import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://aangan-production.up.railway.app/api";

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
}

export interface CreateWhisperData {
  content: string;
  emotion: "joy" | "nostalgia" | "calm" | "anxiety" | "hope" | "love";
  zone: string;
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

// API functions
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Network error" }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Whisper API functions
export const fetchWhispers = async (params?: {
  zone?: string;
  emotion?: string;
  limit?: number;
  offset?: number;
}): Promise<Whisper[]> => {
  const searchParams = new URLSearchParams();
  if (params?.zone) searchParams.append("zone", params.zone);
  if (params?.emotion) searchParams.append("emotion", params.emotion);
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.offset) searchParams.append("offset", params.offset.toString());

  const endpoint = `/whispers${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  return apiRequest(endpoint);
};

export const createWhisper = async (
  data: CreateWhisperData,
): Promise<{ success: boolean; id: string }> => {
  return apiRequest("/whispers", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// Analytics API functions (admin only)
export const fetchAnalytics = async (token: string): Promise<AnalyticsData> => {
  return apiRequest("/analytics/whispers", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const fetchZoneAnalytics = async (token: string) => {
  return apiRequest("/analytics/zones", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Feature toggle API functions
export const fetchFeatureToggles = async (): Promise<FeatureToggles> => {
  return apiRequest("/features/toggles");
};

export const updateFeatureToggle = async (
  feature: string,
  enabled: boolean,
  token: string,
): Promise<{ success: boolean }> => {
  return apiRequest("/features/toggles", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ feature, enabled }),
  });
};

// Authentication API functions
export const loginAdmin = async (
  username: string,
  password: string,
): Promise<{ token: string; user: { username: string; role: string } }> => {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
};

export const verifyToken = async (
  token: string,
): Promise<{ valid: boolean; user: { username: string; role: string } }> => {
  return apiRequest("/auth/verify", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Health check
export const checkHealth = async (): Promise<{
  status: string;
  timestamp: string;
}> => {
  return apiRequest("/health");
};

// React Query hooks
export const useWhispers = (params?: {
  zone?: string;
  emotion?: string;
  limit?: number;
  offset?: number;
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
    onSuccess: () => {
      // Invalidate and refetch whispers
      queryClient.invalidateQueries({ queryKey: ["whispers"] });
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

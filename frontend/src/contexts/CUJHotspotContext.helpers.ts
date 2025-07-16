export interface CUJHotspot {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    zone: string;
  };
  currentEmotion: string;
  activeUsers: number;
  whisperCount: number;
  energyLevel: number;
  description: string;
  tags: string[];
  lastActivity: string;
  dominantMood: string;
  proximity: number; // distance from user in meters
  poeticPersonality?: string;
  oneLiner?: string;
  backgroundTexture?: string;
}

export interface EmotionCluster {
  emotion: string;
  intensity: number;
  count: number;
  hotspots: string[];
  timestamp: string;
}

export interface CUJHotspotContextType {
  hotspots: CUJHotspot[];
  currentLocation: { lat: number; lng: number } | null;
  nearbyHotspots: CUJHotspot[];
  emotionClusters: EmotionCluster[];
  selectedHotspot: CUJHotspot | null;
  systemTime: {
    hour: number;
    minute: number;
    dayOfWeek: number;
    isWeekend: boolean;
    timestamp: string;
  };
  campusActivity: string;
  setSelectedHotspot: (hotspot: CUJHotspot | null) => void;
  getHotspotById: (id: string) => CUJHotspot | undefined;
  getHotspotsByEmotion: (emotion: string) => CUJHotspot[];
  getEmotionTrends: () => EmotionCluster[];
  updateHotspotActivity: (hotspotId: string, activity: Partial<CUJHotspot>) => void;
  isReady: boolean;
}

export interface CUJHotspotProviderProps {
  children: React.ReactNode;
} 
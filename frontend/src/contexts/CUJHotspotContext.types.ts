import { CUJHotspot, EmotionCluster } from './CUJHotspotContext.helpers';

export interface CUJHotspotContextType {
  loading: boolean;
  hotspots: CUJHotspot[];
  emotionClusters: EmotionCluster[];
  nearbyHotspots: CUJHotspot[];
  systemTime: string;
  campusActivity: number;
  currentLocation: { lat: number; lng: number } | null;
  selectedHotspot: CUJHotspot | null;
  setSelectedHotspot: (hotspot: CUJHotspot | null) => void;
  getHotspotById: (id: string) => CUJHotspot | undefined;
  getEmotionTrends: (hotspotId: string) => EmotionCluster[];
  updateHotspotEmotion: (hotspotId: string, emotion: string) => void;
  addWhisperToHotspot: (hotspotId: string) => void;
  getHotspotsByZone: (zone: string) => CUJHotspot[];
  getHotspotsByEmotion: (emotion: string) => CUJHotspot[];
  getHotspotByCoordinates: (lat: number, lng: number) => CUJHotspot | undefined;
  getHotspotsByTag: (tag: string) => CUJHotspot[];
  getHotspotsByActivity: (minActivity: number) => CUJHotspot[];
  getHotspotsByProximity: (maxDistance: number) => CUJHotspot[];
  getHotspotsByEnergyLevel: (minEnergy: number) => CUJHotspot[];
  getHotspotsByMood: (mood: string) => CUJHotspot[];
  getHotspotsByPoeticPersonality: (personality: string) => CUJHotspot[];
  getHotspotsByTagAndZone: (tag: string, zone: string) => CUJHotspot[];
  getHotspotsByEmotionAndZone: (emotion: string, zone: string) => CUJHotspot[];
  getHotspotsByTagAndEmotion: (tag: string, emotion: string) => CUJHotspot[];
  getHotspotsByTagAndMood: (tag: string, mood: string) => CUJHotspot[];
  getHotspotsByEmotionAndMood: (emotion: string, mood: string) => CUJHotspot[];
  getHotspotsByTagAndEmotionAndMood: (tag: string, emotion: string, mood: string) => CUJHotspot[];
  getHotspotsByTagAndEmotionAndZone: (tag: string, emotion: string, zone: string) => CUJHotspot[];
  getHotspotsByTagAndMoodAndZone: (tag: string, mood: string, zone: string) => CUJHotspot[];
  getHotspotsByEmotionAndMoodAndZone: (emotion: string, mood: string, zone: string) => CUJHotspot[];
  getHotspotsByTagAndEmotionAndMoodAndZone: (tag: string, emotion: string, mood: string, zone: string) => CUJHotspot[];
  getHotspotsBySearchQuery: (query: string) => CUJHotspot[];
  getHotspotsByMultipleTags: (tags: string[]) => CUJHotspot[];
  getHotspotsByMultipleEmotions: (emotions: string[]) => CUJHotspot[];
  getHotspotsByMultipleMoods: (moods: string[]) => CUJHotspot[];
  getHotspotsByMultipleZones: (zones: string[]) => CUJHotspot[];
  getHotspotsByMultipleTagsAndZones: (tags: string[], zones: string[]) => CUJHotspot[];
  getHotspotsByMultipleEmotionsAndZones: (emotions: string[], zones: string[]) => CUJHotspot[];
  getHotspotsByMultipleMoodsAndZones: (moods: string[], zones: string[]) => CUJHotspot[];
  getHotspotsByMultipleTagsAndEmotions: (tags: string[], emotions: string[]) => CUJHotspot[];
  getHotspotsByMultipleTagsAndMoods: (tags: string[], moods: string[]) => CUJHotspot[];
  getHotspotsByMultipleEmotionsAndMoods: (emotions: string[], moods: string[]) => CUJHotspot[];
  getHotspotsByMultipleTagsEmotionsAndMoods: (tags: string[], emotions: string[], moods: string[]) => CUJHotspot[];
  getHotspotsByMultipleTagsEmotionsMoodsAndZones: (tags: string[], emotions: string[], moods: string[], zones: string[]) => CUJHotspot[];
  getHotspotsByMultipleSearchQueries: (queries: string[]) => CUJHotspot[];
  getHotspotsByMultipleSearchQueriesAndZones: (queries: string[], zones: string[]) => CUJHotspot[];
  getHotspotsByMultipleSearchQueriesAndEmotions: (queries: string[], emotions: string[]) => CUJHotspot[];
  getHotspotsByMultipleSearchQueriesAndMoods: (queries: string[], moods: string[]) => CUJHotspot[];
  getHotspotsByMultipleSearchQueriesEmotionsAndMoods: (queries: string[], emotions: string[], moods: string[]) => CUJHotspot[];
  getHotspotsByMultipleSearchQueriesEmotionsMoodsAndZones: (queries: string[], emotions: string[], moods: string[], zones: string[]) => CUJHotspot[];
  getHotspotsByMultipleSearchQueriesAndTags: (queries: string[], tags: string[]) => CUJHotspot[];
  getHotspotsByMultipleSearchQueriesTagsAndZones: (queries: string[], tags: string[], zones: string[]) => CUJHotspot[];
  getHotspotsByMultipleSearchQueriesTagsAndEmotions: (queries: string[], tags: string[], emotions: string[]) => CUJHotspot[];
  getHotspotsByMultipleSearchQueriesTagsAndMoods: (queries: string[], tags: string[], moods: string[]) => CUJHotspot[];
  getHotspotsByMultipleSearchQueriesTagsEmotionsAndMoods: (queries: string[], tags: string[], emotions: string[], moods: string[]) => CUJHotspot[];
  getHotspotsByMultipleSearchQueriesTagsEmotionsMoodsAndZones: (queries: string[], tags: string[], emotions: string[], moods: string[], zones: string[]) => CUJHotspot[];
}

export interface CUJHotspotProviderProps {
  children: React.ReactNode;
}

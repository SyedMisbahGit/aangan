import React, { useState, useEffect, useCallback } from 'react';
import { CUJHotspot, EmotionCluster } from './CUJHotspotContext.helpers';
import { CUJHotspotContext } from './CUJHotspotContext.context';
import { CUJHotspotContextType, CUJHotspotProviderProps } from './CUJHotspotContext.types';
import AanganLoadingScreen from '../components/shared/AanganLoadingScreen';

export const CUJHotspotLoadingFallback = () => (
  <AanganLoadingScreen 
    message="Mapping campus hotspots..."
    narratorLine="The pulse of the campus is being felt."
    variant="orbs"
  />
);

export const CUJHotspotProvider: React.FC<CUJHotspotProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [hotspots, setHotspots] = useState<CUJHotspot[]>([
    {
      id: 'tapri',
      name: 'Tapri',
      location: { lat: 28.6139, lng: 77.2090, zone: 'Central Campus' },
      currentEmotion: 'nostalgia',
      activeUsers: 23,
      whisperCount: 45,
      energyLevel: 75,
      description: 'The heart of campus conversations and chai moments',
      tags: ['chai', 'conversations', 'nostalgia', 'social'],
      lastActivity: '2 minutes ago',
      dominantMood: 'warm',
      proximity: 50,
      poeticPersonality: 'The Old Storyteller',
      oneLiner: 'Where steam rises from cups and stories are born.',
      backgroundTexture: 'bg-gradient-to-br from-amber-100 to-orange-200'
    },
    {
      id: 'dde',
      name: 'DDE Building',
      location: { lat: 28.6145, lng: 77.2085, zone: 'Academic' },
      currentEmotion: 'focus',
      activeUsers: 15,
      whisperCount: 28,
      energyLevel: 45,
      description: 'Where academic dreams take shape',
      tags: ['study', 'academic', 'focus', 'learning'],
      lastActivity: '5 minutes ago',
      dominantMood: 'determined',
      proximity: 120,
      poeticPersonality: 'The Silent Scholar',
      oneLiner: 'In the quiet hum of knowledge, futures are written.',
      backgroundTexture: 'bg-gradient-to-br from-blue-100 to-indigo-200'
    },
    {
      id: 'baba-surgal',
      name: 'Baba Surgal Dev Mandir',
      location: { lat: 28.6140, lng: 77.2095, zone: 'Spiritual' },
      currentEmotion: 'peace',
      activeUsers: 8,
      whisperCount: 12,
      energyLevel: 25,
      description: 'A sanctuary for reflection and inner peace',
      tags: ['spiritual', 'peace', 'reflection', 'quiet'],
      lastActivity: '10 minutes ago',
      dominantMood: 'serene',
      proximity: 200,
      poeticPersonality: 'The Gentle Guru',
      oneLiner: 'Listen to the wind, it whispers the secrets of the soul.',
      backgroundTexture: 'bg-gradient-to-br from-green-100 to-teal-200'
    },
    {
      id: 'isro',
      name: 'ISRO Area',
      location: { lat: 28.6150, lng: 77.2075, zone: 'Research' },
      currentEmotion: 'curiosity',
      activeUsers: 12,
      whisperCount: 31,
      energyLevel: 60,
      description: 'Where innovation meets imagination',
      tags: ['research', 'innovation', 'curiosity', 'science'],
      lastActivity: '3 minutes ago',
      dominantMood: 'inspired',
      proximity: 180,
      poeticPersonality: 'The Star Gazer',
      oneLiner: 'The universe in a classroom, the future in a glance.',
      backgroundTexture: 'bg-gradient-to-br from-purple-100 to-pink-200'
    },
    {
      id: 'library',
      name: 'Central Library',
      location: { lat: 28.6142, lng: 77.2088, zone: 'Academic' },
      currentEmotion: 'concentration',
      activeUsers: 35,
      whisperCount: 18,
      energyLevel: 30,
      description: 'The quiet haven for deep learning',
      tags: ['study', 'quiet', 'concentration', 'knowledge'],
      lastActivity: '1 minute ago',
      dominantMood: 'focused',
      proximity: 90,
      poeticPersonality: 'The Keeper of Whispers',
      oneLiner: 'Every book holds a universe, every whisper a world.',
      backgroundTexture: 'bg-gradient-to-br from-gray-100 to-gray-200'
    },
    {
      id: 'quad',
      name: 'Main Quad',
      location: { lat: 28.6135, lng: 77.2092, zone: 'Social' },
      currentEmotion: 'joy',
      activeUsers: 42,
      whisperCount: 67,
      energyLevel: 85,
      description: 'The vibrant center of campus life',
      tags: ['social', 'joy', 'vibrant', 'community'],
      lastActivity: '30 seconds ago',
      dominantMood: 'energetic',
      proximity: 30,
      poeticPersonality: 'The Heartbeat of the Campus',
      oneLiner: 'Where paths cross and stories begin.',
      backgroundTexture: 'bg-gradient-to-br from-yellow-100 to-lime-200'
    }
  ]);

  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<CUJHotspot | null>(null);
  const [systemTime, setSystemTime] = useState<string>(new Date().toISOString());
  const [campusActivity, setCampusActivity] = useState<number>(50); // Default to 50% activity
  const [emotionClusters] = useState<EmotionCluster[]>([
    {
      emotion: 'nostalgia',
      intensity: 0.8,
      count: 23,
      hotspots: ['tapri', 'quad'],
      timestamp: new Date().toISOString()
    },
    {
      emotion: 'focus',
      intensity: 0.7,
      count: 18,
      hotspots: ['dde', 'library'],
      timestamp: new Date().toISOString()
    },
    {
      emotion: 'peace',
      intensity: 0.6,
      count: 12,
      hotspots: ['baba-surgal'],
      timestamp: new Date().toISOString()
    }
  ]);

  // Simulate location updates
  useEffect(() => {
    // Mock current location (in real app, this would use geolocation)
    setCurrentLocation({ lat: 28.6139, lng: 77.2090 });
    
    const interval = setInterval(() => {
      setHotspots(prev => prev.map(hotspot => ({
        ...hotspot,
        activeUsers: Math.max(1, hotspot.activeUsers + Math.floor(Math.random() * 3) - 1),
        whisperCount: hotspot.whisperCount + Math.floor(Math.random() * 2),
        lastActivity: `${Math.floor(Math.random() * 10) + 1} minutes ago`
      })));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Real-time system clock integration
  useEffect(() => {
    const updateSystemTime = () => {
      const now = new Date();
      const hour = now.getHours();
      
      // Determine campus activity level based on time (0-100 scale)
      let newCampusActivity = 50; // Default to 50%
      
      // Adjust activity based on time of day
      if (hour < 6 || hour > 22) newCampusActivity = 20; // Late night/early morning
      else if (hour >= 8 && hour <= 10) newCampusActivity = 80; // Morning classes
      else if (hour >= 12 && hour <= 14) newCampusActivity = 90; // Lunch time
      else if (hour >= 17 && hour <= 19) newCampusActivity = 85; // Evening activities
      
      // Weekend adjustments
      const dayOfWeek = now.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      if (isWeekend) {
        if (hour < 10 || hour > 20) newCampusActivity = 15; // Very quiet on weekend nights
        else newCampusActivity = 60; // Moderate activity during weekend days
      }

      setSystemTime(now.toISOString());
      setCampusActivity(newCampusActivity);
    };

    // Update immediately
    updateSystemTime();
    
    // Update every 5 minutes for zone awareness
    const interval = setInterval(updateSystemTime, 300000);

    return () => clearInterval(interval);
  }, []);

  const nearbyHotspots = hotspots
    .filter(hotspot => hotspot.proximity <= 300)
    .sort((a, b) => a.proximity - b.proximity);

  const getHotspotById = (id: string) => {
    return hotspots.find(hotspot => hotspot.id === id);
  };

  const getHotspotsByEmotion = (emotion: string) => {
    return hotspots.filter(hotspot => 
      hotspot.currentEmotion === emotion || 
      hotspot.tags.includes(emotion)
    );
  };

  const getEmotionTrends = () => {
    return emotionClusters.sort((a, b) => b.intensity - a.intensity);
  };

  const updateHotspotEmotion = (hotspotId: string, emotion: string) => {
    setHotspots(prevHotspots =>
      prevHotspots.map(hotspot =>
        hotspot.id === hotspotId
          ? { ...hotspot, currentEmotion: emotion }
          : hotspot
      )
    );
  };

  const updateHotspotActivity = useCallback((hotspotId: string, activity: Partial<CUJHotspot>): void => {
    setHotspots(prev => 
      prev.map(hotspot => 
        hotspot.id === hotspotId
          ? { ...hotspot, ...activity }
          : hotspot
      )
    );
  }, []);

  // Default implementations for all required methods
  const getHotspotsByZone = useCallback((zone: string): CUJHotspot[] => {
    return hotspots.filter(hotspot => hotspot.zone === zone);
  }, [hotspots]);

  const addWhisperToHotspot = useCallback((hotspotId: string): Promise<void> => {
    setHotspots(prevHotspots => 
      prevHotspots.map(hotspot => 
        hotspot.id === hotspotId
          ? { 
              ...hotspot, 
              whisperCount: (hotspot.whisperCount || 0) + 1,
              lastActivity: new Date().toISOString()
            }
          : hotspot
      )
    );
    return Promise.resolve();
  }, []);

  const getHotspotByCoordinates = useCallback((lat: number, lng: number): CUJHotspot | undefined => {
    return hotspots.find(hotspot => hotspot.lat === lat && hotspot.lng === lng);
  }, [hotspots]);

  const getHotspotsByTag = useCallback((tag: string): CUJHotspot[] => {
    return hotspots.filter(hotspot => hotspot.tags.includes(tag));
  }, [hotspots]);

  const getHotspotsByActivity = useCallback((minActivity: number): CUJHotspot[] => {
    return hotspots.filter(hotspot => hotspot.whisperCount >= minActivity);
  }, [hotspots]);

  const getHotspotsByProximity = useCallback((maxDistance: number): CUJHotspot[] => {
    if (!currentLocation) return [];
    
    return hotspots.filter(hotspot => {
      if (!hotspot.lat || !hotspot.lng) return false;
      
      const distance = Math.sqrt(
        Math.pow(hotspot.lat - currentLocation.lat, 2) +
        Math.pow(hotspot.lng - currentLocation.lng, 2)
      ) * 111; // Convert to kilometers
      
      return distance <= maxDistance;
    });
  }, [currentLocation, hotspots]);

  const getHotspotsByEnergyLevel = useCallback((minEnergy: number): CUJHotspot[] => {
    return hotspots.filter(hotspot => hotspot.energyLevel >= minEnergy);
  }, [hotspots]);

  const getHotspotsByMood = useCallback((mood: string): CUJHotspot[] => {
    return hotspots.filter(hotspot => hotspot.mood === mood);
  }, [hotspots]);

  const getHotspotsByPoeticPersonality = useCallback((personality: string): CUJHotspot[] => {
    return hotspots.filter(hotspot => hotspot.poeticPersonality === personality);
  }, [hotspots]);

  // Helper function for combining multiple filters and applying them to hotspots
  const combineFilters = useCallback((...filters: ((hotspot: CUJHotspot) => boolean)[]): CUJHotspot[] => {
    try {
      return hotspots.filter(hotspot => {
        try {
          return filters.every(filter => filter(hotspot));
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Error in filter function:', e);
          return false;
        }
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error in combineFilters:', e);
      return [];
    }
  }, [hotspots]);

  const value: CUJHotspotContextType = {
    loading,
    isReady: !loading,
    hotspots,
    currentLocation,
    nearbyHotspots,
    emotionClusters,
    selectedHotspot,
    systemTime,
    campusActivity,
    setSelectedHotspot,
    getHotspotById,
    getHotspotsByEmotion,
    getEmotionTrends,
    updateHotspotActivity,
    updateHotspotEmotion,
    addWhisperToHotspot,
    getHotspotsByZone,
    getHotspotByCoordinates,
    getHotspotsByTag,
    getHotspotsByActivity,
    getHotspotsByProximity,
    getHotspotsByEnergyLevel,
    getHotspotsByMood,
    getHotspotsByPoeticPersonality,
    // Implement the remaining methods with default implementations
    getHotspotsByTagAndZone: (tag, zone) => 
      combineFilters(h => h.tags.includes(tag), h => h.zone === zone),
    getHotspotsByEmotionAndZone: (emotion, zone) => 
      combineFilters(h => h.currentEmotion === emotion, h => h.zone === zone),
    getHotspotsByTagAndEmotion: (tag, emotion) => 
      combineFilters(h => h.tags.includes(tag), h => h.currentEmotion === emotion),
    getHotspotsByTagAndMood: (tag, mood) => 
      combineFilters(h => h.tags.includes(tag), h => h.mood === mood),
    getHotspotsByEmotionAndMood: (emotion, mood) => 
      combineFilters(h => h.currentEmotion === emotion, h => h.mood === mood),
    getHotspotsByTagAndEmotionAndMood: (tag, emotion, mood) => 
      combineFilters(
        h => h.tags.includes(tag), 
        h => h.currentEmotion === emotion, 
        h => h.mood === mood
      ),
    getHotspotsByTagAndEmotionAndZone: (tag, emotion, zone) => 
      combineFilters(
        h => h.tags.includes(tag), 
        h => h.currentEmotion === emotion, 
        h => h.zone === zone
      ),
    getHotspotsByTagAndMoodAndZone: (tag, mood, zone) => 
      combineFilters(
        h => h.tags.includes(tag), 
        h => h.mood === mood, 
        h => h.zone === zone
      ),
    getHotspotsByEmotionAndMoodAndZone: (emotion, mood, zone) => 
      combineFilters(
        h => h.currentEmotion === emotion, 
        h => h.mood === mood, 
        h => h.zone === zone
      ),
    getHotspotsByTagAndEmotionAndMoodAndZone: (tag, emotion, mood, zone) => 
      combineFilters(
        h => h.tags.includes(tag), 
        h => h.currentEmotion === emotion, 
        h => (h.mood ?? '') === mood, 
        h => (h.zone ?? '') === zone
      ),
    getHotspotsBySearchQuery: (query) => 
      hotspots.filter(hotspot => 
        hotspot.name.toLowerCase().includes(query.toLowerCase()) ||
        hotspot.description.toLowerCase().includes(query.toLowerCase()) ||
        hotspot.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      ),
    getHotspotsByMultipleTags: (tags) => 
      hotspots.filter(hotspot => tags.some(tag => hotspot.tags.includes(tag))),
    getHotspotsByMultipleEmotions: (emotions) => 
      hotspots.filter(hotspot => emotions.includes(hotspot.currentEmotion)),
    getHotspotsByMultipleMoods: (moods) => 
      hotspots.filter(hotspot => moods.includes(hotspot.mood ?? '')),
    getHotspotsByMultipleZones: (zones) => 
      hotspots.filter(hotspot => zones.includes(hotspot.zone ?? '')),
    getHotspotsByMultipleTagsAndZones: (tags, zones) => 
      combineFilters(
        h => tags.some(tag => h.tags.includes(tag)),
        h => zones.includes(h.zone ?? '')
      ),
    getHotspotsByMultipleEmotionsAndZones: (emotions, zones) => 
      combineFilters(
        h => emotions.includes(h.currentEmotion),
        h => zones.includes(h.zone ?? '')
      ),
    getHotspotsByMultipleMoodsAndZones: (moods, zones) => 
      combineFilters(
        h => moods.includes(h.mood ?? ''),
        h => zones.includes(h.zone ?? '')
      ),
    getHotspotsByMultipleTagsAndEmotions: (tags, emotions) => 
      combineFilters(
        h => tags.some(tag => h.tags.includes(tag)),
        h => emotions.includes(h.currentEmotion)
      ),
    getHotspotsByMultipleTagsAndMoods: (tags, moods) => 
      combineFilters(
        h => tags.some(tag => h.tags.includes(tag)),
        h => moods.includes(h.mood ?? '')
      ),
    getHotspotsByMultipleEmotionsAndMoods: (emotions, moods) => 
      combineFilters(
        h => emotions.includes(h.currentEmotion),
        h => moods.includes(h.mood ?? '')
      ),
    getHotspotsByMultipleTagsEmotionsAndMoods: (tags, emotions, moods) => 
      combineFilters(
        h => tags.some(tag => h.tags.includes(tag)),
        h => emotions.includes(h.currentEmotion),
        h => moods.includes(h.mood ?? '')
      ),
    getHotspotsByMultipleTagsEmotionsMoodsAndZones: (tags, emotions, moods, zones) => 
      combineFilters(
        h => tags.some(tag => h.tags.includes(tag)),
        h => emotions.includes(h.currentEmotion),
        h => moods.includes(h.mood ?? ''),
        h => zones.includes(h.zone ?? '')
      ),
    getHotspotsByMultipleSearchQueries: (queries) => 
      hotspots.filter(hotspot => 
        queries.some(query => 
          hotspot.name.toLowerCase().includes(query.toLowerCase()) ||
          hotspot.description.toLowerCase().includes(query.toLowerCase()) ||
          hotspot.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        )
      ),
    getHotspotsByMultipleSearchQueriesAndZones: (queries, zones) => 
      combineFilters(
        h => queries.some(query => 
          h.name.toLowerCase().includes(query.toLowerCase()) ||
          h.description.toLowerCase().includes(query.toLowerCase()) ||
          h.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        ),
        h => zones.includes(h.zone ?? '')
      ),
    getHotspotsByMultipleSearchQueriesAndEmotions: (queries, emotions) => 
      combineFilters(
        h => queries.some(query => 
          h.name.toLowerCase().includes(query.toLowerCase()) ||
          h.description.toLowerCase().includes(query.toLowerCase()) ||
          h.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        ),
        h => emotions.includes(h.currentEmotion)
      ),
    getHotspotsByMultipleSearchQueriesAndMoods: (queries, moods) => 
      combineFilters(
        h => queries.some(query => 
          h.name.toLowerCase().includes(query.toLowerCase()) ||
          h.description.toLowerCase().includes(query.toLowerCase()) ||
          h.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        ),
        h => moods.includes(h.mood ?? '')
      ),
    getHotspotsByMultipleSearchQueriesEmotionsAndMoods: (queries, emotions, moods) => 
      combineFilters(
        h => queries.some(query => 
          h.name.toLowerCase().includes(query.toLowerCase()) ||
          h.description.toLowerCase().includes(query.toLowerCase()) ||
          h.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        ),
        h => emotions.includes(h.currentEmotion),
        h => moods.includes(h.mood ?? '')
      ),
    getHotspotsByMultipleSearchQueriesEmotionsMoodsAndZones: (queries, emotions, moods, zones) => 
      combineFilters(
        h => queries.some(query => 
          h.name.toLowerCase().includes(query.toLowerCase()) ||
          h.description.toLowerCase().includes(query.toLowerCase()) ||
          h.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        ),
        h => emotions.includes(h.currentEmotion),
        h => moods.includes(h.mood ?? ''),
        h => zones.includes(h.zone ?? '')
      ),
    getHotspotsByMultipleSearchQueriesAndTags: (queries, tags) => 
      combineFilters(
        h => queries.some(query => 
          h.name.toLowerCase().includes(query.toLowerCase()) ||
          h.description.toLowerCase().includes(query.toLowerCase()) ||
          h.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        ),
        h => tags.some(tag => h.tags.includes(tag))
      ),
    getHotspotsByMultipleSearchQueriesTagsAndZones: (queries, tags, zones) => 
      combineFilters(
        h => queries.some(query => 
          h.name.toLowerCase().includes(query.toLowerCase()) ||
          h.description.toLowerCase().includes(query.toLowerCase()) ||
          h.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        ),
        h => tags.some(tag => h.tags.includes(tag)),
        h => zones.includes(h.zone ?? '')
      ),
    getHotspotsByMultipleSearchQueriesTagsAndEmotions: (queries, tags, emotions) => 
      combineFilters(
        h => queries.some(query => 
          h.name.toLowerCase().includes(query.toLowerCase()) ||
          h.description.toLowerCase().includes(query.toLowerCase()) ||
          h.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        ),
        h => tags.some(tag => h.tags.includes(tag)),
        h => emotions.includes(h.currentEmotion)
      ),
    getHotspotsByMultipleSearchQueriesTagsAndMoods: (queries, tags, moods) => 
      combineFilters(
        h => queries.some(query => 
          h.name.toLowerCase().includes(query.toLowerCase()) ||
          h.description.toLowerCase().includes(query.toLowerCase()) ||
          h.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        ),
        h => tags.some(tag => h.tags.includes(tag)),
        h => moods.includes(h.mood ?? '')
      ),
    getHotspotsByMultipleSearchQueriesTagsEmotionsAndMoods: (queries, tags, emotions, moods) => 
      combineFilters(
        h => queries.some(query => 
          h.name.toLowerCase().includes(query.toLowerCase()) ||
          h.description.toLowerCase().includes(query.toLowerCase()) ||
          h.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        ),
        h => tags.some(tag => h.tags.includes(tag)),
        h => emotions.includes(h.currentEmotion),
        h => moods.includes(h.mood ?? '')
      ),
    getHotspotsByMultipleSearchQueriesTagsEmotionsMoodsAndZones: (queries, tags, emotions, moods, zones) => 
      combineFilters(
        h => queries.some(query => 
          h.name.toLowerCase().includes(query.toLowerCase()) ||
          h.description.toLowerCase().includes(query.toLowerCase()) ||
          h.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        ),
        h => tags.some(tag => h.tags.includes(tag)),
        h => emotions.includes(h.currentEmotion),
        h => moods.includes(h.mood ?? ''),
        h => zones.includes(h.zone ?? '')
      )
  };

  useEffect(() => {
    // Simulate async initialization (replace with real async if needed)
    setTimeout(() => {
      setLoading(false);
    }, 300); // Simulate a short delay
  }, []);

  if (loading) return <CUJHotspotLoadingFallback />;

  return (
    <CUJHotspotContext.Provider value={value}>
      {children}
    </CUJHotspotContext.Provider>
  );
};

export const useCUJHotspots = () => {
  const ctx = React.useContext(CUJHotspotContext);
  if (!ctx) throw new Error('useCUJHotspots must be used within a CUJHotspotProvider');
  return ctx;
}; 
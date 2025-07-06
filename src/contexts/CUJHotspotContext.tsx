import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CUJ_HOTSPOTS } from '../constants/cujHotspots';
import { AanganLoadingScreen } from '../App';

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
}

export interface EmotionCluster {
  emotion: string;
  intensity: number;
  count: number;
  hotspots: string[];
  timestamp: string;
}

interface CUJHotspotContextType {
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

const CUJHotspotContext = createContext<CUJHotspotContextType | undefined>(undefined);

interface CUJHotspotProviderProps {
  children: ReactNode;
}

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
      proximity: 50
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
      proximity: 120
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
      proximity: 200
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
      proximity: 180
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
      proximity: 90
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
      proximity: 30
    }
  ]);

  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<CUJHotspot | null>(null);
  const [systemTime, setSystemTime] = useState({
    hour: new Date().getHours(),
    minute: new Date().getMinutes(),
    dayOfWeek: new Date().getDay(),
    isWeekend: new Date().getDay() === 0 || new Date().getDay() === 6,
    timestamp: new Date().toISOString()
  });
  const [campusActivity, setCampusActivity] = useState('moderate');
  const [emotionClusters, setEmotionClusters] = useState<EmotionCluster[]>([
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
      const minute = now.getMinutes();
      const dayOfWeek = now.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Determine campus activity level based on time
      let newCampusActivity = 'moderate';
      if (hour < 7 || hour > 22) newCampusActivity = 'quiet';
      else if (hour >= 8 && hour <= 10) newCampusActivity = 'busy';
      else if (hour >= 12 && hour <= 14) newCampusActivity = 'peak';
      else if (hour >= 17 && hour <= 19) newCampusActivity = 'busy';
      
      // Weekend adjustments
      if (isWeekend) {
        if (hour < 10 || hour > 20) newCampusActivity = 'quiet';
        else newCampusActivity = 'moderate';
      }

      setSystemTime({
        hour,
        minute,
        dayOfWeek,
        isWeekend,
        timestamp: now.toISOString()
      });
      
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

  const updateHotspotActivity = (hotspotId: string, activity: Partial<CUJHotspot>) => {
    setHotspots(prev => prev.map(hotspot => 
      hotspot.id === hotspotId ? { ...hotspot, ...activity } : hotspot
    ));
  };

  const value: CUJHotspotContextType = {
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
    isReady: !loading,
  };

  useEffect(() => {
    // Simulate async initialization (replace with real async if needed)
    setTimeout(() => {
      setLoading(false);
      console.log('CUJHotspotContext ready');
    }, 300); // Simulate a short delay
  }, []);

  if (loading) return <CUJHotspotLoadingFallback />;

  return (
    <CUJHotspotContext.Provider value={value}>
      {children}
    </CUJHotspotContext.Provider>
  );
};

export type { CUJHotspotContextType };
export { CUJHotspotContext };

export const useCUJHotspots = () => {
  const ctx = React.useContext(CUJHotspotContext);
  if (!ctx) throw new Error('useCUJHotspots must be used within a CUJHotspotProvider');
  return ctx;
}; 
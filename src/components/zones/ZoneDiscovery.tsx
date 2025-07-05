import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Users, 
  Sparkles, 
  Star, 
  MessageCircle,
  TrendingUp,
  Heart,
  Clock
} from 'lucide-react';

interface ZoneData {
  id: string;
  name: string;
  description: string;
  activeUsers: number;
  whisperCount: number;
  dominantEmotion: string;
  poeticDescription: string;
  constellation: {
    stars: number;
    brightness: number;
    whispers: string[];
  };
}

interface ZoneDiscoveryProps {
  zones: ZoneData[];
  onZoneSelect: (zoneId: string) => void;
  isVisible: boolean;
}

const zonePoetry = {
  tapri: {
    title: "Tapri is buzzing 💬",
    subtitle: "Where chai meets conversation",
    description: "The heart of campus gossip, casual confessions, and midnight realizations over steaming cups of chai.",
    emotion: "joy",
    color: "from-orange-500 to-yellow-500"
  },
  library: {
    title: "Library remembers 📚",
    subtitle: "Silent thoughts echo here",
    description: "Deep reflections, academic anxieties, and the quiet courage of students facing their fears.",
    emotion: "focus",
    color: "from-blue-500 to-indigo-500"
  },
  dde: {
    title: "DDE is alive 🏛️",
    subtitle: "Where dreams take shape",
    description: "The pulse of ambition, stress, and the beautiful chaos of students chasing their futures.",
    emotion: "determination",
    color: "from-purple-500 to-pink-500"
  },
  quad: {
    title: "Quad is breathing 🌳",
    subtitle: "Open sky, open hearts",
    description: "Where the wind carries whispers of hope, friendship, and the simple joy of being alive.",
    emotion: "peace",
    color: "from-green-500 to-emerald-500"
  },
  hostel: {
    title: "Hostel is dreaming 🏠",
    subtitle: "Home away from home",
    description: "Late night confessions, roommate dramas, and the comfort of shared loneliness.",
    emotion: "nostalgia",
    color: "from-pink-500 to-rose-500"
  }
};

export const ZoneDiscovery: React.FC<ZoneDiscoveryProps> = ({
  zones,
  onZoneSelect,
  isVisible
}) => {
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [showConstellation, setShowConstellation] = useState(false);

  // Auto-rotate through zones if none are active
  useEffect(() => {
    if (!activeZone && zones.length > 0) {
      const interval = setInterval(() => {
        const randomZone = zones[Math.floor(Math.random() * zones.length)];
        setActiveZone(randomZone.id);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [activeZone, zones]);

  const getZonePoetry = (zoneId: string) => {
    return zonePoetry[zoneId as keyof typeof zonePoetry] || {
      title: `${zoneId} is whispering`,
      subtitle: "A place of thoughts",
      description: "Where students share their innermost thoughts and feelings.",
      emotion: "calm",
      color: "from-gray-500 to-slate-500"
    };
  };

  const renderConstellation = (zone: ZoneData) => {
    const stars = Array.from({ length: zone.constellation.stars }, (_, i) => i);
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative w-full h-32 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-lg overflow-hidden"
      >
        {stars.map((star, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: zone.constellation.brightness / 100,
              scale: 1,
              x: Math.random() * 100,
              y: Math.random() * 100
            }}
            transition={{ delay: index * 0.1 }}
            className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-pulse"
            style={{
              left: `${20 + (index * 15) % 80}%`,
              top: `${20 + (index * 10) % 60}%`,
              animationDelay: `${index * 0.2}s`
            }}
          />
        ))}
        
        {/* Whisper fragments floating in constellation */}
        {zone.constellation.whispers.slice(0, 3).map((whisper, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.7, y: 0 }}
            transition={{ delay: index * 0.3 }}
            className="absolute text-xs text-white/60 italic max-w-20 text-center"
            style={{
              left: `${30 + (index * 20) % 60}%`,
              top: `${40 + (index * 15) % 40}%`
            }}
          >
            "{whisper.substring(0, 20)}..."
          </motion.div>
        ))}
      </motion.div>
    );
  };

  if (!isVisible) return null;

  return (
    <div className="space-y-4">
      {/* Zone Discovery Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200/50 rounded-xl p-4"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Discover Zones</h3>
            <p className="text-sm text-gray-600">Each zone has its own personality and stories</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {zones.map((zone) => (
            <Button
              key={zone.id}
              variant="ghost"
              size="sm"
              onClick={() => onZoneSelect(zone.id)}
              className="text-xs h-auto p-2 flex flex-col items-center gap-1"
            >
              <MapPin className="w-3 h-3" />
              <span>{zone.name}</span>
              {zone.activeUsers > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {zone.activeUsers}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Active Zone Poetry */}
      <AnimatePresence>
        {activeZone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative"
          >
            <Card className="bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
              <CardContent className="p-6">
                {(() => {
                  const zone = zones.find(z => z.id === activeZone);
                  const poetry = getZonePoetry(activeZone);
                  
                  if (!zone) return null;
                  
                  return (
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {poetry.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {poetry.subtitle}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowConstellation(!showConstellation)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {poetry.description}
                      </p>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold text-gray-900">{zone.activeUsers}</div>
                          <div className="text-xs text-gray-500">Active now</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-gray-900">{zone.whisperCount}</div>
                          <div className="text-xs text-gray-500">Whispers today</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-gray-900 capitalize">{zone.dominantEmotion}</div>
                          <div className="text-xs text-gray-500">Mood</div>
                        </div>
                      </div>

                      {/* Constellation */}
                      {showConstellation && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4"
                        >
                          <div className="text-center mb-2">
                            <span className="text-xs text-gray-500">Constellation of whispers</span>
                          </div>
                          {renderConstellation(zone)}
                        </motion.div>
                      )}

                      {/* Action */}
                      <Button
                        onClick={() => onZoneSelect(activeZone)}
                        className={`w-full bg-gradient-to-r ${poetry.color} text-white hover:opacity-90`}
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Explore {zone.name}
                      </Button>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zone Activity Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50"
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Zone Activity</span>
        </div>
        
        <div className="space-y-2">
          {zones
            .filter(zone => zone.activeUsers > 0)
            .sort((a, b) => b.activeUsers - a.activeUsers)
            .slice(0, 3)
            .map((zone) => (
              <div key={zone.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{zone.name}</span>
                <div className="flex items-center gap-2">
                  <Users className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-600">{zone.activeUsers} active</span>
                </div>
              </div>
            ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ZoneDiscovery; 
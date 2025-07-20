import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  MapPin, 
  Users, 
  Activity, 
  Clock, 
  Wifi,
  TrendingUp,
  Heart,
  Coffee,
  BookOpen,
  Home,
  Building,
  Loader2
} from 'lucide-react';
import { useRealtime } from '@/contexts/RealtimeContext';

interface ZoneInfo {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
}

const zoneInfo: Record<string, ZoneInfo> = {
  'tapri': {
    name: 'Tapri',
    icon: Coffee,
    description: 'Chai conversations & campus gossip',
    color: 'bg-orange-500/20 text-orange-200 border-orange-400/30'
  },
  'library': {
    name: 'Library',
    icon: BookOpen,
    description: 'Silent study & midnight thoughts',
    color: 'bg-blue-500/20 text-blue-200 border-blue-400/30'
  },
  'hostel': {
    name: 'Hostel',
    icon: Home,
    description: 'Late night confessions & roommate drama',
    color: 'bg-purple-500/20 text-purple-200 border-purple-400/30'
  },
  'canteen': {
    name: 'Canteen',
    icon: Coffee,
    description: 'Food fights & friendship moments',
    color: 'bg-green-500/20 text-green-200 border-green-400/30'
  },
  'auditorium': {
    name: 'Auditorium',
    icon: Building,
    description: 'Performance anxiety & stage dreams',
    color: 'bg-red-500/20 text-red-200 border-red-400/30'
  },
  'quad': {
    name: 'Quad',
    icon: Activity,
    description: 'Open air thoughts & campus life',
    color: 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30'
  }
};

interface LiveZoneActivityProps {
  showDetails?: boolean;
  maxZones?: number;
}

const LiveZoneActivity: React.FC<LiveZoneActivityProps> = ({
  showDetails = true,
  maxZones = 6
}) => {
  const { zoneActivity, totalActiveUsers, isConnected } = useRealtime();
  const [sortedZones, setSortedZones] = useState<Array<[string, { users: number; lastActivity: string }]>>([]);
  const [simulatedTypingZone, setSimulatedTypingZone] = useState<string | null>(null);

  // Sort zones by activity
  useEffect(() => {
    const zones = Array.from(zoneActivity.entries())
      .sort(([, a], [, b]) => b.users - a.users)
      .slice(0, maxZones);
    setSortedZones(zones);
  }, [zoneActivity, maxZones]);

  // Simulate typing in a random zone if all are empty
  useEffect(() => {
    const allEmpty = sortedZones.every(([, activity]) => activity.users === 0);
    let timeout: NodeJS.Timeout;
    if (allEmpty && sortedZones.length > 0) {
      // Pick a random zone to simulate typing
      const randomZone = sortedZones[Math.floor(Math.random() * sortedZones.length)][0];
      setSimulatedTypingZone(randomZone);
      // Remove after 10-20 seconds
      timeout = setTimeout(() => setSimulatedTypingZone(null), 10000 + Math.random() * 10000);
    } else {
      setSimulatedTypingZone(null);
    }
    return () => clearTimeout(timeout);
  }, [sortedZones]);

  const getZoneIcon = (zoneKey: string) => {
    const info = zoneInfo[zoneKey];
    if (info) {
      const Icon = info.icon;
      return <Icon className="w-4 h-4" />;
    }
    return <MapPin className="w-4 h-4" />;
  };

  const getZoneName = (zoneKey: string) => {
    return zoneInfo[zoneKey]?.name || zoneKey;
  };

  const getZoneColor = (zoneKey: string) => {
    return zoneInfo[zoneKey]?.color || 'bg-gray-500/20 text-gray-200 border-gray-400/30';
  };

  const getZoneDescription = (zoneKey: string) => {
    return zoneInfo[zoneKey]?.description || 'Campus zone';
  };

  const formatLastActivity = (timestamp: string) => {
    const now = new Date();
    const lastActivity = new Date(timestamp);
    const diffMs = now.getTime() - lastActivity.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return lastActivity.toLocaleDateString();
  };

  const getActivityLevel = (users: number) => {
    if (users === 0) return { level: 'quiet', color: 'text-gray-400', icon: '🔇' };
    if (users <= 2) return { level: 'whispering', color: 'text-blue-400', icon: '🔈' };
    if (users <= 5) return { level: 'buzzing', color: 'text-yellow-400', icon: '🔉' };
    if (users <= 10) return { level: 'lively', color: 'text-orange-400', icon: '🔊' };
    return { level: 'vibrant', color: 'text-red-400', icon: '🔊' };
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-400" />
            ) : (
              <Wifi className="w-4 h-4 text-red-400" />
            )}
            <span className="text-sm font-medium text-white">
              Live Zone Activity
            </span>
          </div>
          
          <Badge className="bg-purple-500/20 text-purple-200 text-xs">
            {totalActiveUsers} active
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-purple-400" />
          <span className="text-xs text-gray-400">
            Real-time
          </span>
        </div>
      </div>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {sortedZones.map(([zoneKey, activity], index) => {
            const activityLevel = getActivityLevel(activity.users);
            const showTyping = (activity.users > 0) || (simulatedTypingZone === zoneKey);
            
            return (
              <motion.div
                key={zoneKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`bg-gradient-to-r from-purple-900/10 to-indigo-900/10 backdrop-blur-lg border ${getZoneColor(zoneKey)} p-4 hover:border-opacity-60 transition-all duration-300`}>
                  <div className="space-y-3">
                    {/* Zone Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getZoneIcon(zoneKey)}
                        <span className="font-medium text-white">
                          {getZoneName(zoneKey)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-white">
                          {activity.users}
                        </span>
                      </div>
                    </div>

                    {/* Activity Level */}
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{activityLevel.icon}</span>
                      <span className={`text-sm font-medium ${activityLevel.color}`}>{activityLevel.level}</span>
                    </div>
                    {/* Someone is typing animation */}
                    {showTyping && (
                      <div className="flex items-center gap-2 mt-1 animate-pulse text-indigo-300 text-xs">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Someone is typing…</span>
                      </div>
                    )}
                    {/* Description */}
                    {showDetails && (
                      <p className="text-xs text-gray-300">
                        {getZoneDescription(zoneKey)}
                      </p>
                    )}

                    {/* Last Activity */}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Last activity: {formatLastActivity(activity.lastActivity)}</span>
                      </div>
                      
                      {activity.users > 0 && (
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>Live</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {sortedZones.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8 space-y-4"
        >
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
            <MapPin className="h-8 w-8 text-purple-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-white font-medium">
              Campus is Quiet
            </h3>
            <p className="text-gray-400 text-sm">
              No active zones detected. The campus is taking a moment to breathe.
            </p>
          </div>
        </motion.div>
      )}

      {/* Connection Status */}
      <div className="flex items-center justify-between text-xs text-gray-400 p-2">
        <span>
          {isConnected 
            ? `Connected • ${sortedZones.length} active zones`
            : 'Offline • Showing cached data'
          }
        </span>
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
          <span>{isConnected ? 'Live' : 'Offline'}</span>
        </div>
      </div>
    </div>
  );
};

export default LiveZoneActivity; 
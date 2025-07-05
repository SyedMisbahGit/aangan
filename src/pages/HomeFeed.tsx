import React, { useState, useEffect } from "react";
import { DreamLayout } from "../components/shared/DreamLayout";
import { DreamHeader } from "../components/shared/DreamHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { ModularWhisperCard } from "../components/ModularWhisperCard";
import {
  Filter, 
  Search, 
  MapPin, 
  Users, 
  Sparkles,
  Heart,
  MessageCircle,
  Clock,
  TrendingUp,
  Globe,
  Bot
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCUJHotspots } from "../contexts/CUJHotspotContext";
import { ShhhLine } from '../components/ShhhLine';
import { useShhhNarrator } from '../contexts/ShhhNarratorContext';
import { useWhispers } from "../contexts/WhispersContext";
import RealtimeWhisperFeed from "../components/whisper/RealtimeWhisperFeed";
import AIEchoBot from "../components/ai/AIEchoBot";
import LiveZoneActivity from "../components/realtime/LiveZoneActivity";

interface Whisper {
  id: string;
  content: string;
  emotion: string;
  timestamp: string;
  location: string;
  likes: number;
  comments: number;
  isAnonymous: boolean;
  author?: string;
}

const HomeFeed: React.FC = () => {
  const { nearbyHotspots, emotionClusters, systemTime, campusActivity } = useCUJHotspots();
  const { narratorState } = useShhhNarrator();
  const [selectedEmotion, setSelectedEmotion] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHotspot, setSelectedHotspot] = useState("all");
  const { whispers, setWhispers } = useWhispers();
  
  // Real-time context integration
  const isNightTime = systemTime.hour < 6 || systemTime.hour > 22;
  const isWeekend = systemTime.isWeekend;
  const currentActivity = narratorState.userActivity;

  const emotions = [
    { value: "all", label: "All Emotions", icon: "💫" },
    { value: "joy", label: "Joy", icon: "✨" },
    { value: "nostalgia", label: "Nostalgia", icon: "🌸" },
    { value: "peace", label: "Peace", icon: "🌿" },
    { value: "anxiety", label: "Anxiety", icon: "🌧️" },
    { value: "focus", label: "Focus", icon: "🎯" },
    { value: "excitement", label: "Excitement", icon: "🚀" },
    { value: "reflection", label: "Reflection", icon: "🪞" }
  ];

  // Generate sample whispers with real-time context
  useEffect(() => {
    const generateWhispers = () => {
      const sampleWhispers: Whisper[] = [
        {
          id: '1',
          content: isNightTime 
            ? "The campus feels different at night. Quieter, more introspective. Like everyone's thoughts are floating in the air."
            : "Just had the most amazing conversation at Tapri. Sometimes the best ideas come over chai.",
          emotion: isNightTime ? 'reflection' : 'joy',
          timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          location: 'tapri',
          likes: Math.floor(Math.random() * 20) + 5,
          comments: Math.floor(Math.random() * 10) + 2,
          isAnonymous: true
        },
        {
          id: '2',
          content: campusActivity === 'peak' 
            ? "The energy in the quad right now is electric! So many people, so many stories."
            : "Found a quiet corner in the library. Perfect for getting lost in thoughts.",
          emotion: campusActivity === 'peak' ? 'excitement' : 'focus',
          timestamp: new Date(Date.now() - Math.random() * 1800000).toISOString(),
          location: campusActivity === 'peak' ? 'quad' : 'library',
          likes: Math.floor(Math.random() * 15) + 3,
          comments: Math.floor(Math.random() * 8) + 1,
          isAnonymous: true
        },
        {
          id: '3',
          content: isWeekend 
            ? "Weekend vibes hit different. The campus feels more relaxed, more human."
            : "Mid-semester stress is real, but we're all in this together.",
          emotion: isWeekend ? 'peace' : 'anxiety',
          timestamp: new Date(Date.now() - Math.random() * 900000).toISOString(),
          location: 'dde',
          likes: Math.floor(Math.random() * 25) + 8,
          comments: Math.floor(Math.random() * 12) + 3,
          isAnonymous: true
        }
      ];
      setWhispers(sampleWhispers);
    };

    generateWhispers();
    
    // Update whispers every 5 minutes with new real-time context
    const interval = setInterval(generateWhispers, 300000);
    return () => clearInterval(interval);
  }, [isNightTime, campusActivity, isWeekend, setWhispers]);

  const getTimeAwareGreeting = () => {
    if (isNightTime) return 'Night whispers';
    if (systemTime.hour < 12) return 'Morning thoughts';
    if (systemTime.hour < 18) return 'Afternoon musings';
    return 'Evening reflections';
  };

  const getActivityContext = () => {
    if (currentActivity === 'waking') return 'Early morning energy';
    if (currentActivity === 'night-reflection') return 'Late night thoughts';
    if (isWeekend) return 'Weekend vibes';
    return 'Campus pulse';
  };

  const filteredWhispers = whispers.filter(whisper => {
    if (selectedEmotion !== "all" && whisper.emotion !== selectedEmotion) return false;
    if (selectedHotspot !== "all" && whisper.location !== selectedHotspot) return false;
    if (searchTerm && !whisper.content.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getAmbientHeader = () => {
    const activeHotspots = nearbyHotspots.filter(h => h.activeUsers > 0);
    const totalActive = activeHotspots.reduce((sum, h) => sum + h.activeUsers, 0);
    
    if (activeHotspots.length === 0) {
      return "The campus is quiet today. Perfect for reflection.";
    }
    
    const topHotspot = activeHotspots[0];
    const emotion = emotionClusters[0];
    
    if (emotion && emotion.count > 10) {
      return `You & ${emotion.count} others are feeling ${emotion.emotion} today`;
    }
    
    return `You & ${totalActive} others are active near ${topHotspot.name} this afternoon`;
  };

  const getHotspotStats = () => {
    const totalWhispers = whispers.length;
    const totalLikes = whispers.reduce((sum, w) => sum + w.likes, 0);
    const activeHotspots = nearbyHotspots.filter(h => h.activeUsers > 0).length;
    
    return { totalWhispers, totalLikes, activeHotspots };
  };

  const stats = getHotspotStats();

    return (
    <DreamLayout>
      <div className="min-h-screen bg-gradient-to-br from-cloudmist/30 via-dawnlight/20 to-cloudmist/40">
        {/* Poetic AI Narrator */}
        <div className="pt-6 pb-4 px-4">
          <ShhhLine 
            variant="ambient" 
            context="home-feed"
            emotion={narratorState.dominantEmotion}
            zone={campusActivity}
            timeOfDay={narratorState.currentTime}
            userActivity={narratorState.userActivity}
            className="text-center"
          />
        </div>

        {/* Ambient Header */}
        <DreamHeader 
          title={<span className="flex items-center gap-2">Aangan Feed <span className="inline-flex items-center px-2 py-0.5 rounded bg-green-100 text-xs font-semibold text-green-700 ml-2"><Globe className="w-3 h-3 mr-1" />Public</span></span>}
          subtitle="A living constellation of anonymous voices. Your whispers join the campus chorus."
        />

        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Ambient Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-dawnlight/30 to-cloudmist/30 border-inkwell/10 shadow-soft">
              <CardContent className="p-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-inkwell mb-2">
                    {getAmbientHeader()}
                  </h2>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-inkwell">{stats.totalWhispers}</div>
                      <div className="text-sm text-inkwell/70">Whispers Today</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-inkwell">{stats.totalLikes}</div>
                      <div className="text-sm text-inkwell/70">Hearts Shared</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-inkwell">{stats.activeHotspots}</div>
                      <div className="text-sm text-inkwell/70">Active Zones</div>
                    </div>
          </div>
          </div>
              </CardContent>
            </Card>
        </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-inkwell/40 w-4 h-4" />
              <Input
                placeholder="Search whispers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-paper-light border-inkwell/20 focus:border-inkwell/40 text-neutral-900"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-inkwell/70 mb-2 block">Emotion Filter</label>
                <Select value={selectedEmotion} onValueChange={setSelectedEmotion}>
                  <SelectTrigger className="bg-paper-light border-inkwell/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {emotions.map((emotion) => (
                      <SelectItem key={emotion.value} value={emotion.value}>
                        <div className="flex items-center gap-2">
                          <span>{emotion.icon}</span>
                          {emotion.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
      </div>
              
              <div>
                <label className="text-sm text-inkwell/70 mb-2 block">Location Filter</label>
                <Select value={selectedHotspot} onValueChange={setSelectedHotspot}>
                  <SelectTrigger className="bg-paper-light border-inkwell/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {nearbyHotspots.map((hotspot) => (
                      <SelectItem key={hotspot.id} value={hotspot.id}>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          {hotspot.name}
          </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
        </div>
      </div>
          </motion.div>

          {/* Emotion Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-paper-light border-inkwell/10 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-inkwell">
                  <TrendingUp className="w-5 h-5" />
                  Campus Mood
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {emotionClusters.slice(0, 4).map((cluster) => (
                    <div
                      key={cluster.emotion}
                      className="p-3 bg-white/50 rounded-lg border border-inkwell/10 text-center"
                    >
                      <div className="text-lg mb-1">
                        {emotions.find(e => e.value === cluster.emotion)?.icon || "💫"}
                      </div>
                      <div className="text-sm font-medium text-inkwell capitalize">
                        {cluster.emotion}
                      </div>
                      <div className="text-xs text-inkwell/60">
                        {cluster.count} people
                      </div>
                    </div>
                  ))}
                </div>
                {emotionClusters.length === 0 && (
                  <div className="text-center text-neutral-500 py-8 italic">No trending emotions right now. The campus is quietly listening.</div>
                )}
              </CardContent>
            </Card>
      </motion.div>

          {/* Real-time Whisper Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-inkwell flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Live Whispers
            </h2>
            
            <RealtimeWhisperFeed 
              showRealtimeIndicator={true}
              maxWhispers={20}
            />
          </motion.div>

          {/* AI Echo Bot */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-inkwell flex items-center gap-2">
              <Bot className="w-5 h-5" />
              The Listener
            </h3>
            
            <AIEchoBot 
              isActive={true}
              whisperCount={whispers.length}
              dominantEmotion={emotionClusters[0]?.emotion || 'calm'}
            />
          </motion.div>

          {/* Live Zone Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-inkwell flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Live Zone Activity
            </h3>
            
            <LiveZoneActivity />
          </motion.div>
    </div>
      </div>
    </DreamLayout>
  );
};

export default HomeFeed;

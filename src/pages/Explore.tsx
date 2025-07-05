import React, { useState } from 'react';
import { DreamLayout } from '../components/shared/DreamLayout';
import { DreamHeader } from '../components/shared/DreamHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Star, 
  TrendingUp, 
  Users, 
  Heart, 
  MessageCircle,
  Sparkles,
  Globe
} from 'lucide-react';
import { useCUJHotspots } from '../contexts/CUJHotspotContext';
import { useWhispers } from '../contexts/WhispersContext';
import { ZoneEmotionSummary } from '../components/whisper/ZoneEmotionSummary';

const Explore: React.FC = () => {
  const { nearbyHotspots, emotionClusters } = useCUJHotspots();
  const { whispers } = useWhispers();
  const [activeTab, setActiveTab] = useState('spaces');

  // Get trending emotions from recent whispers
  const getTrendingEmotions = () => {
    const emotionCounts: Record<string, number> = {};
    whispers.slice(0, 100).forEach(whisper => {
      emotionCounts[whisper.emotion] = (emotionCounts[whisper.emotion] || 0) + 1;
    });
    
    return Object.entries(emotionCounts)
      .map(([emotion, count]) => ({ emotion, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  };

  const trendingEmotions = getTrendingEmotions();

  const emotionEmojis: Record<string, string> = {
    joy: '💛',
    nostalgia: '🌸',
    anxiety: '💭',
    calm: '🌊',
    excitement: '⚡',
    melancholy: '🌙',
    gratitude: '🙏',
    curiosity: '🔍',
    peace: '🌿',
    focus: '🎯',
    reflection: '🪞'
  };

  const emotionColors: Record<string, string> = {
    joy: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    nostalgia: 'bg-pink-50 text-pink-700 border-pink-200',
    anxiety: 'bg-purple-50 text-purple-700 border-purple-200',
    calm: 'bg-blue-50 text-blue-700 border-blue-200',
    excitement: 'bg-orange-50 text-orange-700 border-orange-200',
    melancholy: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    gratitude: 'bg-green-50 text-green-700 border-green-200',
    curiosity: 'bg-teal-50 text-teal-700 border-teal-200',
    peace: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    focus: 'bg-slate-50 text-slate-700 border-slate-200',
    reflection: 'bg-violet-50 text-violet-700 border-violet-200'
  };

  return (
    <DreamLayout>
      <div className="min-h-screen bg-[#fafaf9]">
        <DreamHeader 
          title="Explore"
          subtitle="Discover spaces, emotions, and trends across campus"
        />

        <div className="max-w-4xl mx-auto px-4 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white border border-neutral-200">
              <TabsTrigger value="spaces" className="text-sm">Spaces</TabsTrigger>
              <TabsTrigger value="stars" className="text-sm">Stars</TabsTrigger>
              <TabsTrigger value="trends" className="text-sm">Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="spaces" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-white border-neutral-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-neutral-800">
                      <MapPin className="w-5 h-5" />
                      Campus Spaces
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {nearbyHotspots.map((hotspot) => (
                        <div
                          key={hotspot.id}
                          className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-neutral-800">{hotspot.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {hotspot.activeUsers} active
                            </Badge>
                          </div>
                          <p className="text-sm text-neutral-600 mb-3">{hotspot.description}</p>
                          <div className="flex items-center gap-4 text-xs text-neutral-500">
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              {hotspot.whisperCount} whispers
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {hotspot.likeCount || 0} hearts
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="stars" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-white border-neutral-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-neutral-800">
                      <Star className="w-5 h-5" />
                      Constellation Map
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {nearbyHotspots.map((hotspot) => (
                        <ZoneEmotionSummary
                          key={hotspot.id}
                          zone={hotspot.name}
                          className="p-4 bg-neutral-50 rounded-lg border border-neutral-200"
                        />
                      ))}
                    </div>
                    {nearbyHotspots.length === 0 && (
                      <div className="text-center py-12 text-neutral-500">
                        <Globe className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                        <p>No spaces discovered yet. Explore campus to find new zones.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-white border-neutral-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-neutral-800">
                      <TrendingUp className="w-5 h-5" />
                      Trending Emotions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {trendingEmotions.map((trend) => (
                        <div
                          key={trend.emotion}
                          className={`p-4 rounded-lg border text-center ${emotionColors[trend.emotion] || 'bg-neutral-50 text-neutral-700 border-neutral-200'}`}
                        >
                          <div className="text-2xl mb-2">
                            {emotionEmojis[trend.emotion] || '💫'}
                          </div>
                          <div className="font-semibold capitalize mb-1">
                            {trend.emotion}
                          </div>
                          <div className="text-xs opacity-75">
                            {trend.count} whispers
                          </div>
                        </div>
                      ))}
                    </div>
                    {trendingEmotions.length === 0 && (
                      <div className="text-center py-12 text-neutral-500">
                        <Sparkles className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                        <p>No trending emotions yet. Start whispering to see what's popular.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DreamLayout>
  );
};

export default Explore; 
import React, { useState } from 'react';
import { DreamLayout } from '../components/shared/DreamLayout';
import { DreamHeader, isUserFacingRoute } from '../components/shared/DreamHeader';
import { useLocation } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Star, 
  Wind, 
  Heart, 
  Sparkles,
  Compass,
  Moon,
  Sun,
  Cloud,
  Leaf,
  Map
} from 'lucide-react';
import { useCUJHotspots } from '../contexts/use-cuj-hotspots';
import WhisperMap from '../components/cuj/WhisperMap';
import ErrorBoundary from "../components/shared/ErrorBoundary";
import { getErrorMessage } from "../lib/errorUtils";
import { useRef } from "react";

const Explore: React.FC = () => {
  const { nearbyHotspots, emotionClusters } = useCUJHotspots();
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (mainRef.current) {
      mainRef.current.focus();
    }
  }, []);

  const location = useLocation();

  // Organic tile sections
  const wanderSpaces = [
    {
      id: 'campus-map',
      title: '🗺️ Campus Map',
      subtitle: 'A poetic view of the campus',
      description: 'Explore the campus and see where whispers are born.',
      icon: Map,
      color: 'from-blue-400 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200',
      content: []
    },
    {
      id: 'near-me',
      title: '🏡 Near Me',
      subtitle: 'Spaces where hearts gather',
      description: 'Discover whispers from places close to your heart',
      icon: MapPin,
      color: 'from-green-400 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      content: nearbyHotspots.map(hotspot => ({
        name: hotspot.name,
        activeUsers: hotspot.activeUsers,
        emotion: emotionClusters.find(e => e.emotion === hotspot.dominantMood)?.emotion || 'peace'
      }))
    },
    {
      id: 'under-stars',
      title: '✨ Under the Stars',
      subtitle: 'Ambient constellations',
      description: 'Whispers that drift through the night air',
      icon: Star,
      color: 'from-purple-400 to-indigo-500',
      bgColor: 'from-purple-50 to-indigo-50',
      borderColor: 'border-purple-200',
      content: [
        { name: 'Midnight Musings', activeUsers: 12, emotion: 'reflection' },
        { name: 'Dream Fragments', activeUsers: 8, emotion: 'nostalgia' },
        { name: 'Starlit Thoughts', activeUsers: 15, emotion: 'wonder' }
      ]
    },
    {
      id: 'whats-felt',
      title: '💭 What\'s Being Felt',
      subtitle: 'Floating moods',
      description: 'The emotional atmosphere of the courtyard',
      icon: Heart,
      color: 'from-rose-400 to-pink-500',
      bgColor: 'from-rose-50 to-pink-50',
      borderColor: 'border-rose-200',
      content: emotionClusters.slice(0, 6).map(cluster => ({
        name: cluster.emotion,
        activeUsers: cluster.count,
        emotion: cluster.emotion
      }))
    }
  ];

  const getEmotionIcon = (emotion: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      joy: Sun,
      peace: Cloud,
      nostalgia: Moon,
      reflection: Wind,
      anxiety: Leaf,
      excitement: Sparkles,
      focus: Compass,
      love: Heart
    };
    return icons[emotion] || Heart;
  };

  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      joy: 'text-yellow-600',
      peace: 'text-blue-600',
      nostalgia: 'text-purple-600',
      reflection: 'text-gray-600',
      anxiety: 'text-orange-600',
      excitement: 'text-red-600',
      focus: 'text-green-600',
      love: 'text-rose-600'
    };
    return colors[emotion] || 'text-neutral-600';
  };

  return (
    <ErrorBoundary narratorLine="A gentle hush falls over the campus. Something went adrift in the explore feed.">
      <DreamLayout>
        <main
          role="main"
          aria-labelledby="page-title"
          tabIndex={-1}
          ref={mainRef}
          className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-blue-50"
        >
          <h1 id="page-title" className="sr-only">Explore</h1>
          {isUserFacingRoute(location.pathname) && (
            <DreamHeader 
              title="Explore"
              subtitle="Discover spaces, emotions, and whispers across the courtyard"
            />
          )}

          <div className="max-w-4xl mx-auto px-4 py-6">
            {/* Organic tiles instead of tabs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {wanderSpaces.map((space, index) => {
                const Icon = space.icon;
                
                return (
                <motion.div
                    key={space.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card 
                      className={`bg-gradient-to-br ${space.bgColor} border ${space.borderColor} hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden`}
                      onClick={() => setSelectedSpace(selectedSpace === space.id ? null : space.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-12 h-12 bg-gradient-to-br ${space.color} rounded-xl flex items-center justify-center`}>
                            <Icon className="w-6 h-6 text-white" />
                            </div>
                          <div>
                            <h3 className="text-lg font-semibold text-neutral-800">
                              {space.title}
                            </h3>
                            <p className="text-sm text-neutral-600">
                              {space.subtitle}
                            </p>
                          </div>
                      </div>
                        
                        <p className="text-sm text-neutral-700 mb-4 leading-relaxed">
                          {space.description}
                        </p>

                        {/* Preview of content */}
                        <div className="space-y-2">
                          {space.content.slice(0, 3).map((item, idx) => {
                            const EmotionIcon = getEmotionIcon(item.emotion);
                            
                            return (
                              <div key={idx} className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <EmotionIcon className={`w-4 h-4 ${getEmotionColor(item.emotion)}`} />
                                  <span className="text-sm text-neutral-700 capitalize">
                                    {item.name}
                                  </span>
                                </div>
                                <span className="text-xs text-neutral-500">
                                  {item.activeUsers} hearts
                                </span>
                      </div>
                            );
                          })}
                        </div>
                    </CardContent>
                  </Card>
                </motion.div>
                );
              })}
            </div>

            {/* Expanded content for selected space */}
            <AnimatePresence>
              {selectedSpace && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-6"
                >
                  <Card className="bg-white/60 backdrop-blur-lg border border-white/40">
                    <CardContent className="p-6">
                      {(() => {
                        if (selectedSpace === 'campus-map') {
                          return <WhisperMap />;
                        }

                        const space = wanderSpaces.find(s => s.id === selectedSpace);
                        if (!space) return null;

                        return (
                          <div>
                            <div className="flex items-center gap-3 mb-6">
                              <div className={`w-10 h-10 bg-gradient-to-br ${space.color} rounded-lg flex items-center justify-center`}>
                                <space.icon className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h2 className="text-xl font-semibold text-neutral-800">
                                  {space.title}
                                </h2>
                                <p className="text-sm text-neutral-600">
                                  {space.subtitle}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {space.content.map((item, idx) => {
                                const EmotionIcon = getEmotionIcon(item.emotion);
                                
                                return (
                                  <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-4 bg-white/50 rounded-xl border border-white/30 hover:bg-white/70 transition-colors"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <EmotionIcon className={`w-5 h-5 ${getEmotionColor(item.emotion)}`} />
                                        <span className="font-medium text-neutral-800 capitalize">
                                          {item.name}
                                        </span>
                                      </div>
                                      <span className="text-sm text-neutral-500">
                                        {item.activeUsers} hearts
                                      </span>
                          </div>
                                  <p className="text-sm text-neutral-600">
                                    {item.emotion} whispers drift through this space
                                  </p>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Poetic footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-12 py-8"
          >
            <div className="text-2xl mb-4">🧭</div>
            <p className="text-neutral-600 italic leading-relaxed">
              "Every corner of the courtyard holds a story. <br />
              Every whisper carries the weight of a thousand hearts."
            </p>
          </motion.div>
        </div>
      </main>
    </DreamLayout>
    </ErrorBoundary>
  );
};

export default Explore;
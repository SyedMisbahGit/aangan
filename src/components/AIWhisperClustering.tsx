import React, { useState, useEffect } from 'react';
import { Brain, Heart, MessageCircle, Users, TrendingUp, Sparkles } from 'lucide-react';

interface Whisper {
  id: string;
  content: string;
  emotion: 'joy' | 'nostalgia' | 'loneliness' | 'calm' | 'anxiety' | 'excitement';
  topic: 'academic' | 'social' | 'romance' | 'family' | 'personal' | 'campus';
  zone: string;
  timestamp: Date;
  intensity: number;
}

interface EmotionCluster {
  id: string;
  emotion: string;
  topic: string;
  whispers: Whisper[];
  size: number;
  color: string;
  description: string;
  isActive: boolean;
}

const AIWhisperClustering: React.FC = () => {
  const [clusters, setClusters] = useState<EmotionCluster[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Sample whispers for demonstration
  const sampleWhispers: Whisper[] = [
    {
      id: '1',
      content: 'Udaan ke baad ka scene? Sab log alag ho gaye...',
      emotion: 'nostalgia',
      topic: 'social',
      zone: 'Udaan Lawn',
      timestamp: new Date(),
      intensity: 8
    },
    {
      id: '2',
      content: 'Library mein padhte padhte aankh lag gayi',
      emotion: 'anxiety',
      topic: 'academic',
      zone: 'Library Silence Zone',
      timestamp: new Date(),
      intensity: 6
    },
    {
      id: '3',
      content: 'Hostel G ke rooftop pe stargazing with friends',
      emotion: 'joy',
      topic: 'social',
      zone: 'PG Hostel Rooftop',
      timestamp: new Date(),
      intensity: 9
    },
    {
      id: '4',
      content: 'Canteen ke chai mein bhi kahani hai',
      emotion: 'calm',
      topic: 'personal',
      zone: 'Canteen Steps',
      timestamp: new Date(),
      intensity: 5
    },
    {
      id: '5',
      content: 'Exam fog mein kho gayi hun',
      emotion: 'loneliness',
      topic: 'academic',
      zone: 'Exam Fog Corner',
      timestamp: new Date(),
      intensity: 7
    }
  ];

  // AI Clustering Logic
  useEffect(() => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const emotionGroups = sampleWhispers.reduce((acc, whisper) => {
        const key = `${whisper.emotion}-${whisper.topic}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(whisper);
        return acc;
      }, {} as Record<string, Whisper[]>);

      const clusterColors = {
        'joy-social': 'from-yellow-400 to-orange-400',
        'nostalgia-social': 'from-pink-400 to-purple-400',
        'loneliness-academic': 'from-blue-400 to-indigo-400',
        'calm-personal': 'from-green-400 to-teal-400',
        'anxiety-academic': 'from-red-400 to-pink-400',
      };

      const clusterDescriptions = {
        'joy-social': 'Celebrating friendships and campus moments',
        'nostalgia-social': 'Missing old times and connections',
        'loneliness-academic': 'Academic pressure and isolation',
        'calm-personal': 'Peaceful reflections and growth',
        'anxiety-academic': 'Exam stress and academic worries',
      };

      const newClusters: EmotionCluster[] = Object.entries(emotionGroups).map(([key, whispers]) => ({
        id: key,
        emotion: key.split('-')[0],
        topic: key.split('-')[1],
        whispers,
        size: whispers.length,
        color: clusterColors[key as keyof typeof clusterColors] || 'from-gray-400 to-gray-600',
        description: clusterDescriptions[key as keyof typeof clusterDescriptions] || 'Mixed emotions',
        isActive: whispers.some(w => w.intensity > 6)
      }));

      setClusters(newClusters);
      setIsAnalyzing(false);
    }, 2000);
  }, []);

  return (
    <div className="whisper-orb floating-orb p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Brain className="w-8 h-8 text-purple-400 animate-pulse" />
          <h2 className="kinetic-text text-3xl font-bold whisper-gradient-text">
            AI Whisper Clustering
          </h2>
          <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
        </div>
        <p className="kinetic-text-slow text-gray-300 max-w-2xl mx-auto">
          AI detects emotion, tone, and topic patterns. Whispers are grouped into emotional zones 
          that adapt to your needs and campus culture.
        </p>
      </div>

      {isAnalyzing ? (
        <div className="text-center py-12">
          <div className="whisper-loading mx-auto mb-4" />
          <p className="text-gray-300">AI is analyzing whisper patterns...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clusters.map(cluster => (
            <div
              key={cluster.id}
              className={`
                whisper-orb emotion-aura p-6 rounded-2xl cursor-pointer
                transition-all duration-500 ease-out
                ${selectedCluster === cluster.id ? 'scale-105 shadow-whisper-glow-primary' : 'scale-100'}
                ${cluster.isActive ? 'ring-2 ring-purple-400/50' : ''}
              `}
              onClick={() => setSelectedCluster(cluster.id === selectedCluster ? null : cluster.id)}
            >
              {/* Cluster Header */}
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${cluster.color} flex items-center justify-center`}>
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{cluster.size}</div>
                  <div className="text-xs text-gray-400">whispers</div>
                </div>
              </div>

              {/* Cluster Info */}
              <h3 className="text-lg font-semibold text-white mb-2 capitalize">
                {cluster.emotion} {cluster.topic}
              </h3>
              <p className="text-sm text-gray-300 mb-4">
                {cluster.description}
              </p>

              {/* Cluster Stats */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Avg Intensity</span>
                  <span className="text-white">
                    {Math.round(cluster.whispers.reduce((sum, w) => sum + w.intensity, 0) / cluster.size)}/10
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Most Active Zone</span>
                  <span className="text-white">
                    {cluster.whispers.reduce((acc, w) => {
                      acc[w.zone] = (acc[w.zone] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)[0] || 'Mixed'}
                  </span>
                </div>
              </div>

              {/* Active Indicator */}
              {cluster.isActive && (
                <div className="mt-4 flex items-center gap-2 text-xs text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Live Activity
                </div>
              )}

              {/* Expanded View */}
              {selectedCluster === cluster.id && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <h4 className="text-sm font-semibold text-white mb-3">Recent Whispers</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {cluster.whispers.slice(0, 3).map(whisper => (
                      <div key={whisper.id} className="text-xs text-gray-300 bg-white/5 p-2 rounded">
                        "{whisper.content.substring(0, 50)}..."
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* AI Insights */}
      <div className="mt-8 p-6 whisper-glass rounded-2xl">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          AI Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Most Common Emotion</span>
              <span className="text-white capitalize">
                {clusters.reduce((max, c) => c.size > max.size ? c : max, clusters[0])?.emotion}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Active Clusters</span>
              <span className="text-white">
                {clusters.filter(c => c.isActive).length}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Total Whispers</span>
              <span className="text-white">
                {clusters.reduce((sum, c) => sum + c.size, 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Campus Mood</span>
              <span className="text-white capitalize">
                {clusters.length > 0 ? 'Mixed' : 'Analyzing...'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIWhisperClustering; 
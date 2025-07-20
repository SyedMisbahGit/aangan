import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Heart, 
  MessageCircle, 
  Clock, 
  MapPin, 
  Sparkles, 
  Wifi,
  WifiOff,
  RefreshCw,
  TrendingUp,
  Users
} from 'lucide-react';
import { useRealtime } from '@/contexts/RealtimeContext';
import { useWhispers } from '../../services/api';
import { useToast } from '@/hooks/use-toast';
import { ModularWhisperCard } from '@/components/ModularWhisperCard';
import type { Whisper } from '../../services/api';

type WhisperWithRealtime = Whisper & { realTime?: boolean };

interface RealtimeWhisperFeedProps {
  zone?: string;
  emotion?: string;
  showRealtimeIndicator?: boolean;
  maxWhispers?: number;
}

// At the top, add helper to get current user's guestId
function getGuestId() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('guestId') || undefined;
  }
  return undefined;
}

const RealtimeWhisperFeed: React.FC<RealtimeWhisperFeedProps> = ({
  zone,
  emotion,
  showRealtimeIndicator = true,
  maxWhispers = 50
}) => {
  const [allWhispers, setAllWhispers] = useState<WhisperWithRealtime[]>([]);
  const [newWhispersCount, setNewWhispersCount] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { 
    realtimeWhispers, 
    isConnected, 
    totalActiveUsers,
    zoneActivity,
    joinZone,
    leaveZone 
  } = useRealtime();
  
  const { data: apiWhispers, isLoading, refetch } = useWhispers({ zone, emotion, limit: maxWhispers });
  const { toast } = useToast();

  // Combine API whispers with real-time whispers
  useEffect(() => {
    if (apiWhispers) {
      setAllWhispers(apiWhispers);
    }
  }, [apiWhispers]);

  // Handle new real-time whispers
  useEffect(() => {
    if (realtimeWhispers.length > 0) {
      const newRealtimeWhispers = realtimeWhispers.filter(
        rw => !allWhispers.some(aw => aw.id === rw.id)
      );

      if (newRealtimeWhispers.length > 0) {
        setNewWhispersCount(prev => prev + newRealtimeWhispers.length);
        
        // Add new whispers to the top
        setAllWhispers(prev => [
          ...newRealtimeWhispers,
          ...prev.slice(0, maxWhispers - newRealtimeWhispers.length)
        ]);

        // --- Notification Feedback Logic ---
        const guestId = getGuestId();
        newRealtimeWhispers.forEach((whisper) => {
          // AI reply to user's whisper
          if ((whisper.isAIGenerated || whisper.is_ai_generated) && whisper.guest_id && guestId && whisper.guest_id === guestId) {
            // Mark as unseen
            const unseen = JSON.parse(localStorage.getItem('aangan_unseen_ai_replies') || '[]');
            if (!unseen.includes(whisper.id)) {
              unseen.push(whisper.id);
              localStorage.setItem('aangan_unseen_ai_replies', JSON.stringify(unseen));
            }
            toast({
              title: '✨ The courtyard replied to your whisper',
              description: whisper.content.substring(0, 60) + '...',
            });
          }
          // Echo event (simulate: if whisper has echoLabel or isEcho)
          if ((whisper.echoLabel || whisper.isEcho) && whisper.guest_id && guestId && whisper.guest_id === guestId) {
            // Mark as unseen
            const unseenEchoes = JSON.parse(localStorage.getItem('aangan_unseen_echoes') || '[]');
            if (!unseenEchoes.includes(whisper.id)) {
              unseenEchoes.push(whisper.id);
              localStorage.setItem('aangan_unseen_echoes', JSON.stringify(unseenEchoes));
            }
            toast({
              title: '✨ Someone gently echoed your whisper',
              description: 'Your thought resonated with someone in the courtyard.',
            });
          }
        });
        // --- End Notification Feedback Logic ---

        // Show notification for new whispers
        if (newRealtimeWhispers.length === 1) {
          toast({
            title: "New whisper appeared",
            description: newRealtimeWhispers[0].content.substring(0, 60) + "...",
          });
        } else {
          toast({
            title: `${newRealtimeWhispers.length} new whispers`,
            description: "Fresh thoughts just arrived in your feed",
          });
        }
      }
    }
  }, [realtimeWhispers, allWhispers, maxWhispers, toast]);

  // Zone management
  useEffect(() => {
    if (zone && isConnected) {
      joinZone(zone);
      return () => leaveZone(zone);
    }
  }, [zone, isConnected, joinZone, leaveZone]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setNewWhispersCount(0);
    setLastRefresh(new Date());
    
    try {
      await refetch();
      toast({
        title: "Feed refreshed",
        description: "Latest whispers loaded",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast]);

  // Filter whispers based on props
  const filteredWhispers = allWhispers.filter(whisper => {
    if (zone && whisper.zone !== zone) return false;
    if (emotion && whisper.emotion !== emotion) return false;
    return true;
  });

  // Get zone activity info
  const currentZoneActivity = zone ? zoneActivity.get(zone) : null;

  return (
    <div className="space-y-6">
      {/* Ambient Presence Line */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50/50 to-blue-50/50 rounded-full border border-green-200/30">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-700/80 font-medium">
            Aangan is listening. {totalActiveUsers} hearts are here right now.
          </span>
        </div>
      </motion.div>

      {/* Real-time Status Bar */}
      {showRealtimeIndicator && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 backdrop-blur-lg border border-purple-400/30 rounded-xl"
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Wifi className="w-4 h-4 text-green-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-400" />
              )}
              <span className="text-sm text-white">
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-white">
                {totalActiveUsers} active
              </span>
            </div>

            {currentZoneActivity && (
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-white">
                  {currentZoneActivity.users} in {zone}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-300">
              Last refresh: {lastRefresh.toLocaleTimeString()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-purple-300 hover:text-white hover:bg-purple-400/20"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </motion.div>
      )}

      {/* New Whispers Banner */}
      {newWhispersCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-md border border-green-400/30 p-4 rounded-xl cursor-pointer hover:from-green-600/30 hover:to-emerald-600/30 transition-all duration-500 animate-pulse"
          onClick={handleRefresh}
        >
          <div className="flex items-center justify-center space-x-3 text-green-200">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">
              {newWhispersCount} new whisper{newWhispersCount > 1 ? 's' : ''} arrived
            </span>
            <Sparkles className="h-4 w-4 animate-pulse" />
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-6 animate-pulse">
                <div className="space-y-4">
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  <div className="h-4 bg-white/10 rounded w-1/2"></div>
                  <div className="h-4 bg-white/10 rounded w-2/3"></div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Whispers Feed */}
      <AnimatePresence>
        {filteredWhispers.length === 0 && !isLoading ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 space-y-4"
          >
            <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <MessageCircle className="h-8 w-8 text-purple-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-medium text-lg">
                {zone ? `No whispers in ${zone} yet` : 'No whispers yet'}
              </h3>
              <p className="text-gray-400 text-sm max-w-md mx-auto">
                {zone 
                  ? `Be the first to share your thoughts in ${zone}. Your voice matters here.`
                  : 'Be the first to whisper something into the void. Your thoughts matter.'
                }
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {filteredWhispers.map((whisper, index) => {
              // Ensure all required properties for ModularWhisperCard
              const completeWhisper: WhisperWithRealtime = {
                ...whisper,
                location: whisper.location ?? whisper.zone ?? '',
                likes: whisper.likes ?? 0,
                comments: whisper.comments ?? 0,
                isAnonymous: whisper.isAnonymous ?? true,
                realTime: whisper.realTime,
              };
              return (
                <motion.div
                  key={whisper.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative"
                >
                  {/* Real-time indicator for new whispers */}
                  {whisper.realTime && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 z-10"
                    >
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </motion.div>
                  )}
                  {/* AI Reply Footer Logic */}
                  {(() => {
                    const now = Date.now();
                    const created = new Date(whisper.timestamp).getTime();
                    const ageSeconds = (now - created) / 1000;
                    let aiReplyState: 'pending' | 'possible' | 'delivered' | 'none' = 'none';
                    if (whisper.isAIGenerated) {
                      aiReplyState = 'delivered';
                    } else if (ageSeconds < 10) {
                      aiReplyState = 'pending';
                    } else if (ageSeconds < 60) {
                      aiReplyState = 'possible';
                    }
                    return (
                      <ModularWhisperCard
                        whisper={completeWhisper}
                        variant={index === 0 ? "featured" : "default"}
                        showHotspot={true}
                        showEmotionTag={true}
                        aiReplyState={aiReplyState}
                      />
                    );
                  })()}
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Connection Status Footer */}
      {showRealtimeIndicator && (
        <div className="flex items-center justify-between text-xs text-gray-400 p-2">
          <span>
            {isConnected 
              ? `Connected • ${filteredWhispers.length} whispers loaded`
              : 'Offline • Showing cached whispers'
            }
          </span>
          <div className="flex items-center space-x-1">
            {isConnected ? (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            ) : (
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            )}
            <span>{isConnected ? 'Live' : 'Offline'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealtimeWhisperFeed; 
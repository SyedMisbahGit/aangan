import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Bot, 
  Heart, 
  Sparkles, 
  MessageCircle, 
  Eye, 
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useRealtime } from '@/contexts/RealtimeContext';
import { useToast } from '@/hooks/use-toast';

interface AIEcho {
  id: string;
  content: string;
  emotion: string;
  triggerWhisperId: string;
  triggerContent: string;
  timestamp: string;
  isVisible: boolean;
  responseType: 'comfort' | 'celebration' | 'reflection' | 'connection';
}

interface AIEchoBotProps {
  isActive?: boolean;
  whisperCount?: number;
  dominantEmotion?: string;
}

const AIEchoBot: React.FC<AIEchoBotProps> = ({ 
  isActive = true, 
  whisperCount = 0,
  dominantEmotion = 'calm'
}) => {
  const [echoes, setEchoes] = useState<AIEcho[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [lastEchoTime, setLastEchoTime] = useState<Date | null>(null);
  const { realtimeWhispers, isConnected, sendEmotionPulse } = useRealtime();
  const { toast } = useToast();

  // AI Echo generation logic
  const generateAIEcho = useCallback((whisper: { id: string; content: string; emotion: string }): AIEcho | null => {
    const now = new Date();
    const timeSinceLastEcho = lastEchoTime ? now.getTime() - lastEchoTime.getTime() : Infinity;
    
    // Don't echo too frequently (minimum 30 seconds between echoes)
    if (timeSinceLastEcho < 30000) return null;
    
    // Only echo certain types of whispers (not all)
    const shouldEcho = Math.random() < 0.3; // 30% chance
    if (!shouldEcho) return null;

    const echoTypes = {
      comfort: [
        "Sometimes the quietest moments hold the loudest truths. You're not alone in feeling this way.",
        "The weight you carry is real, and so is the strength you have to carry it. One breath at a time.",
        "It's okay to not have all the answers right now. The questions themselves are part of the journey.",
        "Your feelings are valid, even when they're complicated. You're doing better than you think."
      ],
      celebration: [
        "This energy you're feeling? It's contagious in the best way. Keep spreading that light.",
        "Small victories are still victories. Celebrate every step forward, no matter how small.",
        "You're creating ripples of positivity that reach further than you know. Keep going.",
        "This moment of joy is yours to savor. Let it fill you up completely."
      ],
      reflection: [
        "There's wisdom in your words that speaks to something deeper. Thank you for sharing it.",
        "Your perspective adds a new color to the campus conversation. Keep painting with your truth.",
        "Sometimes the most profound insights come from the quietest observations. Beautiful.",
        "You've captured something universal in your personal moment. That's the magic of connection."
      ],
      connection: [
        "Someone else needed to hear exactly this today. Your words found their way to the right heart.",
        "You're not the only one feeling this way. Your whisper just created a bridge between souls.",
        "This is what community feels like - shared moments, shared feelings, shared humanity.",
        "Your voice matters more than you know. Keep speaking your truth into the world."
      ]
    };

    // Determine response type based on emotion and content
    let responseType: keyof typeof echoTypes = 'reflection';
    
    if (whisper.emotion === 'anxiety' || whisper.emotion === 'sadness') {
      responseType = 'comfort';
    } else if (whisper.emotion === 'joy' || whisper.emotion === 'hope') {
      responseType = 'celebration';
    } else if (whisper.content.includes('?')) {
      responseType = 'reflection';
    } else if (whisper.content.length > 100) {
      responseType = 'connection';
    }

    const responses = echoTypes[responseType];
    const content = responses[Math.floor(Math.random() * responses.length)];

    const echo: AIEcho = {
      id: `echo-${Date.now()}`,
      content,
      emotion: whisper.emotion,
      triggerWhisperId: whisper.id,
      triggerContent: whisper.content.substring(0, 50) + '...',
      timestamp: new Date().toISOString(),
      isVisible: true,
      responseType
    };

    setLastEchoTime(now);
    return echo;
  }, [lastEchoTime]);

  // Listen for new whispers and generate echoes
  useEffect(() => {
    if (!isActive || !isConnected) return;

    const handleNewWhisper = (whisper: { id: string; content: string; emotion: string }) => {
      setIsListening(true);
      
      // Simulate AI processing time
      setTimeout(() => {
        const echo = generateAIEcho(whisper);
        if (echo) {
          setEchoes(prev => [echo, ...prev.slice(0, 4)]); // Keep last 5 echoes
          
          // Send emotion pulse for the echo
          sendEmotionPulse(echo.emotion);
          
          // Show toast notification
          toast({
            title: "The Listener responds...",
            description: echo.content.substring(0, 60) + "...",
          });
        }
        setIsListening(false);
      }, 2000 + Math.random() * 3000); // 2-5 second delay
    };

    // Listen to real-time whispers
    if (realtimeWhispers.length > 0) {
      const latestWhisper = realtimeWhispers[0];
      if (latestWhisper && !echoes.some(e => e.triggerWhisperId === latestWhisper.id)) {
        handleNewWhisper(latestWhisper);
      }
    }
  }, [realtimeWhispers, isActive, isConnected, generateAIEcho, sendEmotionPulse, toast, echoes]);

  // Auto-hide echoes after some time
  useEffect(() => {
    const interval = setInterval(() => {
      setEchoes(prev => prev.map(echo => ({
        ...echo,
        isVisible: new Date().getTime() - new Date(echo.timestamp).getTime() < 300000 // 5 minutes
      })));
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getResponseTypeIcon = (type: string) => {
    switch (type) {
      case 'comfort': return <Heart className="w-4 h-4" />;
      case 'celebration': return <Sparkles className="w-4 h-4" />;
      case 'reflection': return <Eye className="w-4 h-4" />;
      case 'connection': return <MessageCircle className="w-4 h-4" />;
      default: return <Bot className="w-4 h-4" />;
    }
  };

  const getResponseTypeColor = (type: string) => {
    switch (type) {
      case 'comfort': return 'bg-blue-500/20 text-blue-200 border-blue-400/30';
      case 'celebration': return 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30';
      case 'reflection': return 'bg-purple-500/20 text-purple-200 border-purple-400/30';
      case 'connection': return 'bg-green-500/20 text-green-200 border-green-400/30';
      default: return 'bg-gray-500/20 text-gray-200 border-gray-400/30';
    }
  };

  if (!isActive) return null;

  return (
    <div className="space-y-4">
      {/* AI Bot Status */}
      <Card className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 backdrop-blur-lg border-purple-400/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Bot className={`w-6 h-6 ${isConnected ? 'text-green-400' : 'text-red-400'}`} />
              {isListening && (
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </div>
            <div>
              <h3 className="text-white font-medium">The Listener</h3>
              <p className="text-sm text-gray-300">
                {isListening ? 'Processing whispers...' : 'Listening to campus voices'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-400" />
            )}
            <Badge className="bg-purple-500/20 text-purple-200 text-xs">
              AI Active
            </Badge>
          </div>
        </div>
      </Card>

      {/* AI Echoes */}
      <AnimatePresence>
        {echoes.filter(e => e.isVisible).map((echo, index) => (
          <motion.div
            key={echo.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="bg-gradient-to-r from-purple-800/10 to-indigo-800/10 backdrop-blur-lg border-purple-400/20 p-4 hover:border-purple-400/40 transition-all duration-300">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className={getResponseTypeColor(echo.responseType)}>
                      {getResponseTypeIcon(echo.responseType)}
                      <span className="ml-1 capitalize">{echo.responseType}</span>
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {new Date(echo.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <Bot className="w-4 h-4 text-purple-400" />
                </div>

                {/* Echo Content */}
                <p className="text-white/90 leading-relaxed italic">
                  "{echo.content}"
                </p>

                {/* Trigger Whisper Preview */}
                <div className="text-xs text-gray-400 bg-black/20 rounded-lg p-2">
                  <span className="text-purple-300">Responding to:</span> {echo.triggerContent}
                </div>

                {/* Emotion Tag */}
                <div className="flex items-center justify-between">
                  <Badge className="bg-white/10 text-white/70 text-xs">
                    {echo.emotion} • {echo.responseType}
                  </Badge>
                  <Clock className="w-3 h-3 text-gray-500" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Empty State */}
      {echoes.filter(e => e.isVisible).length === 0 && (
        <Card className="bg-gradient-to-r from-purple-900/10 to-indigo-900/10 backdrop-blur-lg border-purple-400/20 p-6 text-center">
          <Bot className="w-8 h-8 text-purple-400 mx-auto mb-3" />
          <h3 className="text-white font-medium mb-2">The Listener sits in stillness</h3>
          <p className="text-sm text-gray-300">
            {isListening 
              ? "The winds are carrying your words..." 
              : "No one has whispered to the night yet. The Listener waits, gentle and patient."
            }
          </p>
        </Card>
      )}
    </div>
  );
};

export default AIEchoBot; 
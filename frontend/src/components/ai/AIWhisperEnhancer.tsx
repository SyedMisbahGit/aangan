import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { 
  Sparkles, 
  Wand2, 
  RotateCcw, 
  Check, 
  X,
  Brain,
  Heart,
  MessageCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIWhisperEnhancerProps {
  originalContent: string;
  emotion: string;
  onEnhanced: (enhancedContent: string) => void;
  onCancel: () => void;
  isVisible: boolean;
}

const AIWhisperEnhancer: React.FC<AIWhisperEnhancerProps> = ({
  originalContent,
  emotion,
  onEnhanced,
  onCancel,
  isVisible
}) => {
  const [enhancedContent, setEnhancedContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showEnhanced, setShowEnhanced] = useState(false);
  const { toast } = useToast();

  // AI enhancement prompts based on emotion
  const enhancementPrompts = {
    joy: "Add warmth and celebration to this joyful moment",
    hope: "Infuse this with optimism and forward-looking energy",
    calm: "Enhance the peaceful, reflective quality",
    anxiety: "Add gentle reassurance while maintaining authenticity",
    sadness: "Offer comfort and emotional depth",
    love: "Deepen the emotional resonance and connection",
    nostalgia: "Enhance the wistful, memory-rich quality",
    excitement: "Amplify the energetic, vibrant feeling"
  };

  const enhanceWhisper = async () => {
    setIsProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const prompt = enhancementPrompts[emotion as keyof typeof enhancementPrompts] || "Enhance this whisper with emotional depth";
      
      // Simple AI enhancement logic (in real app, this would call an AI API)
      let enhanced = originalContent;
      
      // Add emotional context based on emotion
      switch (emotion) {
        case 'joy':
          enhanced = `✨ ${enhanced} ✨`;
          break;
        case 'hope':
          enhanced = `🌟 ${enhanced} 🌟`;
          break;
        case 'calm':
          enhanced = `☁️ ${enhanced} ☁️`;
          break;
        case 'anxiety':
          enhanced = `💭 ${enhanced} 💭`;
          break;
        case 'sadness':
          enhanced = `💙 ${enhanced} 💙`;
          break;
        case 'love':
          enhanced = `💕 ${enhanced} 💕`;
          break;
        case 'nostalgia':
          enhanced = `📸 ${enhanced} 📸`;
          break;
        case 'excitement':
          enhanced = `🔥 ${enhanced} 🔥`;
          break;
      }
      
      // Add some poetic enhancements
      if (enhanced.length < 100) {
        enhanced += `\n\n${getEmotionalSuffix(emotion)}`;
      }
      
      setEnhancedContent(enhanced);
      setShowEnhanced(true);
      setIsProcessing(false);
      
      toast({
        title: "Whisper enhanced",
        description: "AI has added emotional depth to your whisper",
      });
    }, 2000 + Math.random() * 1000);
  };

  const getEmotionalSuffix = (emotion: string) => {
    const suffixes = {
      joy: "This moment feels like pure magic ✨",
      hope: "Tomorrow holds infinite possibilities 🌅",
      calm: "In this stillness, everything makes sense 🍃",
      anxiety: "You're stronger than you know 💪",
      sadness: "Your feelings are valid and seen 💙",
      love: "Love has a way of finding its home 💕",
      nostalgia: "Memories are the heart's way of holding on 📖",
      excitement: "This energy is contagious and beautiful 🔥"
    };
    return suffixes[emotion as keyof typeof suffixes] || "Your voice matters 💫";
  };

  const handleAccept = () => {
    onEnhanced(enhancedContent);
  };

  const handleReject = () => {
    setShowEnhanced(false);
    setEnhancedContent('');
  };

  const resetEnhancement = () => {
    setShowEnhanced(false);
    setEnhancedContent('');
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      >
        <Card className="w-full max-w-2xl bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-lg border-purple-400/30 p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Brain className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">AI Whisper Enhancement</h3>
                  <p className="text-sm text-gray-300">Let AI add emotional depth to your whisper</p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Original Content */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Original Whisper</label>
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-white/80">{originalContent}</p>
                <Badge className="mt-2 bg-purple-500/20 text-purple-200">
                  {emotion} • {originalContent.length} chars
                </Badge>
              </div>
            </div>

            {/* Enhancement Controls */}
            {!showEnhanced && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Enhancement will add emotional depth and poetic elements</span>
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    onClick={enhanceWhisper}
                    disabled={isProcessing}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                    aria-label="Enhance with AI"
                  >
                    {isProcessing ? (
                      <>
                        <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                        Enhancing...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Enhance with AI
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    className="border-purple-400/30 text-purple-300 hover:bg-purple-400/10"
                    aria-label="Cancel enhancement"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Enhanced Content */}
            <AnimatePresence>
              {showEnhanced && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                      <span>Enhanced Whisper</span>
                    </label>
                    <Textarea
                      value={enhancedContent}
                      onChange={(e) => setEnhancedContent(e.target.value)}
                      className="min-h-[120px] bg-white/5 border-purple-400/30 text-white placeholder-gray-400 resize-none"
                      placeholder="Enhanced whisper content..."
                    />
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{enhancedContent.length} characters</span>
                      <Badge className="bg-green-500/20 text-green-200">
                        AI Enhanced
                      </Badge>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <Button
                      onClick={handleAccept}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Use Enhanced Version
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={handleReject}
                      className="border-red-400/30 text-red-300 hover:bg-red-400/10"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Keep Original
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={resetEnhancement}
                      className="border-purple-400/30 text-purple-300 hover:bg-purple-400/10"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Enhancement Features */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <Heart className="w-5 h-5 text-red-400 mx-auto mb-1" />
                <span className="text-xs text-gray-300">Emotional Depth</span>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <MessageCircle className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <span className="text-xs text-gray-300">Better Flow</span>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <Sparkles className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                <span className="text-xs text-gray-300">Poetic Touch</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIWhisperEnhancer; 
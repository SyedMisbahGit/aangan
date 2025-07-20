import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { 
  BookOpen, 
  MapPin, 
  MessageCircle, 
  Heart, 
  Sparkles,
  X,
  Lightbulb
} from 'lucide-react';

interface TooltipData {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

interface FeatureTooltipProps {
  featureId: string;
  isVisible: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
}

const tooltipData: Record<string, TooltipData> = {
  diary: {
    id: 'diary',
    title: 'Your Private Space',
    description: 'Write whispers that only you can see. Perfect for personal reflections and thoughts you want to keep private.',
    icon: <BookOpen className="w-5 h-5" />,
    color: 'from-purple-500 to-pink-500',
    position: 'bottom'
  },
  zones: {
    id: 'zones',
    title: 'Campus Zones',
    description: 'Each zone has its own personality. Tapri for casual thoughts, Library for deep reflections, DDE for academic stress.',
    icon: <MapPin className="w-5 h-5" />,
    color: 'from-blue-500 to-cyan-500',
    position: 'bottom'
  },
  whisperInput: {
    id: 'whisperInput',
    title: 'Share Your Thoughts',
    description: 'Write what\'s on your mind. Choose an emotion tag to help others connect with your feeling.',
    icon: <MessageCircle className="w-5 h-5" />,
    color: 'from-green-500 to-emerald-500',
    position: 'top'
  },
  reactions: {
    id: 'reactions',
    title: 'React with Hearts',
    description: 'Show you care with heart reactions. It\'s how we connect without words.',
    icon: <Heart className="w-5 h-5" />,
    color: 'from-red-500 to-pink-500',
    position: 'left'
  },
  aiEcho: {
    id: 'aiEcho',
    title: 'AI Echo',
    description: 'Sometimes the courtyard whispers back. AI-generated responses that feel human and warm.',
    icon: <Sparkles className="w-5 h-5" />,
    color: 'from-yellow-500 to-orange-500',
    position: 'top'
  }
};

export const FeatureTooltip: React.FC<FeatureTooltipProps> = ({
  featureId,
  isVisible,
  onDismiss,
  children
}) => {
  const [hasSeenTooltip, setHasSeenTooltip] = useState(false);
  const tooltip = tooltipData[featureId];

  useEffect(() => {
    const seen = localStorage.getItem(`aangan_tooltip_${featureId}`);
    if (seen === 'true') {
      setHasSeenTooltip(true);
    }
  }, [featureId]);

  const handleDismiss = () => {
    localStorage.setItem(`aangan_tooltip_${featureId}`, 'true');
    setHasSeenTooltip(true);
    onDismiss();
  };

  if (!tooltip || hasSeenTooltip || !isVisible) {
    return <>{children}</>;
  }

  const getPositionClasses = () => {
    switch (tooltip.position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  const getArrowClasses = () => {
    switch (tooltip.position) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-800';
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-800';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-l-gray-800';
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-r-gray-800';
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-800';
    }
  };

  return (
    <div className="relative inline-block">
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className={`absolute z-50 ${getPositionClasses()}`}
          >
            {/* Arrow */}
            <div className={`absolute w-0 h-0 border-4 border-transparent ${getArrowClasses()}`} />
            
            {/* Tooltip Content */}
            <Card className="bg-gray-800 text-white border-0 shadow-xl max-w-xs">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${tooltip.color} flex items-center justify-center text-white flex-shrink-0`}>
                    {tooltip.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm mb-1">
                        {tooltip.title}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDismiss}
                        className="text-gray-400 hover:text-white p-0 h-auto"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {tooltip.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeatureTooltip; 
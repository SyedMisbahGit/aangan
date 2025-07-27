import React, { useEffect, useState, useCallback } from 'react';
import { useShhhNarrator } from '../contexts/use-shhh-narrator';
import { useCUJHotspots } from '../contexts/use-cuj-hotspots';
import { logger } from '../utils/logger';
import fallbackLines from '../data/shhhFallbackLines.json';

// Type definitions for the fallback lines JSON structure
interface ZoneLines {
  [key: string]: string[];
}

interface FallbackLines {
  zones: {
    [key: string]: ZoneLines;
  };
  times: {
    [key: string]: string[];
  };
  moods: {
    [key: string]: string[];
  };
  universal: string[];
}

interface ShhhLineProps {
  variant?: 'header' | 'ambient' | 'micro-moment' | 'memory' | 'arc';
  context?: string;
  emotion?: string;
  zone?: string;
  timeOfDay?: string;
  userActivity?: string;
  className?: string;
  showIndicator?: boolean;
}

export const ShhhLine: React.FC<ShhhLineProps> = ({
  variant = 'ambient',
  context,
  emotion,
  zone,
  timeOfDay,
  userActivity,
  className = '',
  showIndicator = false
}) => {
  const { narratorState } = useShhhNarrator();
  const { systemTime: hotspotSystemTime, campusActivity } = useCUJHotspots();
  const [currentLine, setCurrentLine] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Combine real-time data from both contexts
  const realTimeData = {
    timeOfDay: timeOfDay || narratorState.currentTime,
    userActivity: userActivity || narratorState.userActivity,
    emotion: emotion || narratorState.dominantEmotion,
    zone: zone || campusActivity,
    systemTime: narratorState.systemTime,
    campusActivity,
    hotspotSystemTime
  };

  const getLineFromFallback = useCallback(() => {
    const typedFallbackLines = fallbackLines as unknown as FallbackLines;
    
    // Get lines based on different categories with type safety
    const zoneLines = (realTimeData.zone && realTimeData.emotion) 
      ? typedFallbackLines.zones[realTimeData.zone]?.[realTimeData.emotion] || [] 
      : [];
      
    const timeLines = realTimeData.timeOfDay 
      ? typedFallbackLines.times[realTimeData.timeOfDay] || [] 
      : [];
      
    const moodLines = realTimeData.emotion 
      ? typedFallbackLines.moods[realTimeData.emotion] || [] 
      : [];
      
    const universalLines = typedFallbackLines.universal || [];
    
    // Combine all relevant line categories
    const allLines = [...zoneLines, ...timeLines, ...moodLines, ...universalLines];
    
    if (allLines.length === 0) {
      return "The moment holds its breath, waiting for your story to unfold.";
    }
    
    return allLines[Math.floor(Math.random() * allLines.length)];
  }, [realTimeData.zone, realTimeData.emotion, realTimeData.timeOfDay]);

  const generateLine = useCallback(async () => {
    setIsGenerating(true);
    
    try {
      // In a real implementation, this would call an AI API
      // For now, we'll use fallback lines with real-time context
      const line = getLineFromFallback();
      
      // Add real-time context to the line
      let contextualizedLine = line;
      
      // Add time awareness
      if (realTimeData.systemTime.hour < 6) {
        contextualizedLine = `🌙 ${line}`;
      } else if (realTimeData.systemTime.hour < 12) {
        contextualizedLine = `🌅 ${line}`;
      } else if (realTimeData.systemTime.hour < 18) {
        contextualizedLine = `☀️ ${line}`;
      } else {
        contextualizedLine = `🌆 ${line}`;
      }
      
      // Add activity awareness
      if (realTimeData.userActivity === 'waking') {
        contextualizedLine = contextualizedLine.replace(/\.$/, '... as you begin your day');
      } else if (realTimeData.userActivity === 'night-reflection') {
        contextualizedLine = contextualizedLine.replace(/\.$/, '... in the quiet of night');
      }
      
      // Add campus activity awareness
      if (realTimeData.campusActivity === 'quiet') {
        contextualizedLine = contextualizedLine.replace(/\.$/, '... in the peaceful campus');
      } else if (realTimeData.campusActivity === 'peak') {
        contextualizedLine = contextualizedLine.replace(/\.$/, '... amid the campus buzz');
      }
      
      setCurrentLine(contextualizedLine);
    } catch (error) {
      logger.error('Error generating Shhh line:', error as Error);
      setCurrentLine(getLineFromFallback());
    } finally {
      setIsGenerating(false);
    }
  }, [getLineFromFallback, realTimeData.systemTime.hour, realTimeData.userActivity, realTimeData.campusActivity]);

  useEffect(() => {
    generateLine();
  }, [generateLine, variant, context, emotion, zone, timeOfDay, userActivity]);

  // Auto-refresh every 2 minutes for real-time awareness
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isGenerating) {
        generateLine();
      }
    }, 120000);

    return () => clearInterval(interval);
  }, [isGenerating, generateLine]);

  if (isGenerating) {
    return (
      <div className={`text-sm text-muted-foreground/60 italic ${className}`}>
        Shhh is thinking...
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <p className="text-sm text-muted-foreground/80 italic leading-relaxed">
        {currentLine}
      </p>
      {showIndicator && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary/40 rounded-full animate-pulse" />
      )}
    </div>
  );
}; 
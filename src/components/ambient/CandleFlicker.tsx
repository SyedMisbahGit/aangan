import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CandleFlickerProps {
  className?: string;
}

export const CandleFlicker: React.FC<CandleFlickerProps> = ({ className }) => {
  return (
    <div className={cn("fixed bottom-20 right-4 w-12 h-16", className)}>
      {/* Flame */}
      <motion.div
        className="absolute bottom-8 left-1/2 w-4 h-6 bg-amber-flicker rounded-full"
        style={{ transformOrigin: 'bottom center' }}
        animate={{
          scale: [1, 1.05, 0.95, 1.02, 1],
          opacity: [0.8, 0.9, 0.85, 0.95, 0.8],
          y: [0, -2, 0, -1, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        }}
      />
      {/* Wick */}
      <div className="absolute bottom-8 left-1/2 w-1 h-2 bg-night-blue" />
      {/* Wax */}
      <div className="absolute bottom-0 left-0 w-full h-8 bg-aangan-paper rounded-t-full border border-aangan-dusk" />
    </div>
  );
};

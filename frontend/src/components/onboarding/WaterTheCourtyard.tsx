import React from 'react';
import { motion } from 'framer-motion';

const WaterTheCourtyard: React.FC = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 via-white to-blue-50 z-50">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="text-center"
      >
        <div className="relative w-48 h-48">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-green-500"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{
                duration: 2,
                ease: 'easeInOut',
                delay: i * 0.5,
                repeat: Infinity,
                repeatType: 'loop',
              }}
            />
          ))}
        </div>
        <p className="text-lg text-gray-600 mt-4 italic">
          "Every whisper is a drop of water for our courtyard."
        </p>
      </motion.div>
    </div>
  );
};

export default WaterTheCourtyard;

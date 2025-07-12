import React from 'react';
import { motion } from 'framer-motion';

const particleVariants = {
  initial: { x: '-100%', y: '50vh', opacity: 0 },
  animate: (i: number) => ({
    x: '100vw',
    opacity: [0, 0.3, 0.5, 0.3, 0],
    transition: {
      duration: 15 + i * 5,
      repeat: Infinity,
      repeatType: 'loop',
      delay: i * 3,
      ease: 'linear',
    },
  }),
};

const Particle = ({ i }: { i: number }) => (
  <motion.div
    className="absolute w-1 h-1 bg-amber-flicker rounded-full"
    style={{
      top: `${Math.random() * 100}vh`,
      left: `${Math.random() * 10}vw`, // Start off-screen
      scale: Math.random() * 0.5 + 0.5,
    }}
    variants={particleVariants}
    initial="initial"
    animate="animate"
    custom={i}
  />
);

export const ParticleFlow: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      {[...Array(10)].map((_, i) => (
        <Particle key={i} i={i} />
      ))}
    </div>
  );
};

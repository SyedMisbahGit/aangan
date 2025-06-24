import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
}

interface ParticleBackgroundProps {
  particleCount?: number;
  className?: string;
}

export const ParticleBackground = ({ className = "" }: { className?: string }) => (
  <div className={`fixed inset-0 pointer-events-none z-0 ${className}`} style={{ zIndex: 0 }}>
    <svg width="100%" height="100%" viewBox="0 0 1920 1080" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, width: '100vw', height: '100vh', opacity: 0.05 }}>
      {/* Constellation dots (increased density) */}
      <circle cx="200" cy="300" r="8" fill="#FFDCA6" />
      <circle cx="600" cy="800" r="6" fill="#FFDCA6" />
      <circle cx="1200" cy="200" r="5" fill="#FFDCA6" />
      <circle cx="1700" cy="900" r="7" fill="#FFDCA6" />
      <circle cx="900" cy="500" r="4" fill="#FFDCA6" />
      <circle cx="300" cy="600" r="5" fill="#FFDCA6" />
      <circle cx="1600" cy="300" r="6" fill="#FFDCA6" />
      <circle cx="400" cy="1000" r="7" fill="#FFDCA6" />
      <circle cx="800" cy="900" r="5" fill="#FFDCA6" />
      <circle cx="1400" cy="700" r="6" fill="#FFDCA6" />
      <circle cx="1800" cy="200" r="4" fill="#FFDCA6" />
      <circle cx="1100" cy="850" r="7" fill="#FFDCA6" />
      <circle cx="500" cy="400" r="6" fill="#FFDCA6" />
      <circle cx="100" cy="900" r="5" fill="#FFDCA6" />
      <circle cx="1700" cy="500" r="8" fill="#FFDCA6" />
      <circle cx="600" cy="200" r="4" fill="#FFDCA6" />
      <circle cx="1500" cy="1000" r="6" fill="#FFDCA6" />
      <circle cx="300" cy="200" r="5" fill="#FFDCA6" />
      <circle cx="1200" cy="1000" r="7" fill="#FFDCA6" />
      {/* Leaf outlines (increased, stylized, distributed) */}
      <path d="M400 700 Q420 680 440 700 Q460 720 480 700" stroke="#9ED8BE" stroke-width="3" fill="none" />
      <path d="M1500 400 Q1520 380 1540 400 Q1560 420 1580 400" stroke="#9ED8BE" stroke-width="2.5" fill="none" />
      <path d="M800 200 Q810 190 820 200 Q830 210 840 200" stroke="#9ED8BE" stroke-width="2" fill="none" />
      <path d="M300 1000 Q320 980 340 1000 Q360 1020 380 1000" stroke="#9ED8BE" stroke-width="2.5" fill="none" />
      <path d="M1700 100 Q1710 90 1720 100 Q1730 110 1740 100" stroke="#9ED8BE" stroke-width="2" fill="none" />
      <path d="M1000 600 Q1020 580 1040 600 Q1060 620 1080 600" stroke="#9ED8BE" stroke-width="2.5" fill="none" />
      <path d="M600 400 Q610 390 620 400 Q630 410 640 400" stroke="#9ED8BE" stroke-width="2" fill="none" />
      <path d="M1800 800 Q1820 780 1840 800 Q1860 820 1880 800" stroke="#9ED8BE" stroke-width="2.5" fill="none" />
      <path d="M200 200 Q210 190 220 200 Q230 210 240 200" stroke="#9ED8BE" stroke-width="2" fill="none" />
      <path d="M1300 900 Q1320 880 1340 900 Q1360 920 1380 900" stroke="#9ED8BE" stroke-width="2.5" fill="none" />
    </svg>
  </div>
);

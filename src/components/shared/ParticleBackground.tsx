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

export const ParticleBackground = ({
  particleCount = 20,
  className = "",
}: ParticleBackgroundProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate particles with mood-based colors
    const colors = [
      "hsl(var(--primary) / 0.3)",
      "hsl(var(--secondary) / 0.3)",
      "hsl(var(--accent) / 0.3)",
      "hsl(var(--muted) / 0.2)",
    ];

    const newParticles: Particle[] = Array.from(
      { length: particleCount },
      (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: 2 + Math.random() * 4,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: 0.3 + Math.random() * 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
      }),
    );

    setParticles(newParticles);

    // Animate particles
    const animate = () => {
      setParticles((prev) =>
        prev.map((particle) => {
          let newX = particle.x + particle.speedX;
          let newY = particle.y + particle.speedY;

          // Wrap around screen
          newX =
            newX > window.innerWidth ? 0 : newX < 0 ? window.innerWidth : newX;
          newY =
            newY > window.innerHeight
              ? 0
              : newY < 0
                ? window.innerHeight
                : newY;

          return {
            ...particle,
            x: newX,
            y: newY,
          };
        }),
      );
    };

    const interval = setInterval(animate, 50);
    return () => clearInterval(interval);
  }, [particleCount]);

  return (
    <div className={`fixed inset-0 pointer-events-none z-0 ${className}`}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full animate-float"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            animationDelay: `${particle.id * 0.1}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
};

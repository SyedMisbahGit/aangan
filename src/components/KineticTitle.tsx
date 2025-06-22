import { ReactNode } from 'react';

interface KineticTitleProps {
  children: ReactNode;
  className?: string;
  variant?: 'whisper' | 'kinetic' | 'mood';
}

export const KineticTitle = ({ children, className = '', variant = 'whisper' }: KineticTitleProps) => {
  const baseClasses = "font-bold tracking-tight";
  
  const variantClasses = {
    whisper: "whisper-title",
    kinetic: "kinetic-text text-3xl",
    mood: "text-2xl font-extrabold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-pulse-glow"
  };

  return (
    <h1 className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </h1>
  );
}; 
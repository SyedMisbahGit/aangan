import React from 'react';
import { Sparkles } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-3xl px-4">
      <div className="whisper-glass whisper-orb floating-orb-slow flex items-center gap-3 py-4 px-6 rounded-2xl shadow-whisper-glow-primary backdrop-blur-lg border border-white/10">
        <Sparkles className="w-7 h-7 text-purple-400 animate-kinetic-float" />
        <h1 className="kinetic-text text-2xl md:text-3xl font-bold whisper-gradient-text drop-shadow-lg">
          WhisperVerse: The 3D Diary World of Shhh
        </h1>
        <span className="ml-auto text-xs text-gray-300 italic kinetic-text-slow">safe, soft, anonymous, poetic</span>
      </div>
    </header>
  );
};

export default Header;

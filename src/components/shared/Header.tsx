import React from "react";
import { Sparkles } from "lucide-react";

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-3xl px-4">
      <div className="whisper-glass whisper-orb floating-orb-slow flex items-center gap-3 py-4 px-6 rounded-2xl shadow-whisper-glow-primary backdrop-blur-lg border border-white/10">
        <img src="/logo.svg" alt="Aangan logo" className="w-10 h-10 mr-3" />
        <h1 className="kinetic-text text-2xl md:text-3xl font-bold" style={{ letterSpacing: '0.08em' }}>
          Aangan
        </h1>
        <span className="ml-4 text-xs text-gray-500 italic kinetic-text-slow">
          अपना ख़ास खुला आँगन • Your quiet cosmic courtyard
        </span>
      </div>
    </header>
  );
};

export default Header;

import React from 'react';

interface AanganLoadingScreenProps {
  message: string;
  narratorLine: string;
  variant: 'orbs' | 'default';
}

export const AanganLoadingScreen: React.FC<AanganLoadingScreenProps> = ({ message, narratorLine }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-rose-50 via-white to-blue-50 text-center p-4">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mb-6"></div>
    <h1 className="text-2xl font-bold text-neutral-800 mb-2">{message}</h1>
    <p className="text-neutral-600 italic">"{narratorLine}"</p>
  </div>
);

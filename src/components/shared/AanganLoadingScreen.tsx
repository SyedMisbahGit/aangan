import React from 'react';

export const AanganLoadingScreen = ({ message, narratorLine, variant }: { message?: string, narratorLine?: string, variant?: 'default' | 'orbs' | 'shimmer' }) => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
    <div className="text-center">
      <div className="mb-4">
        {variant === 'orbs' ? (
          <div className="flex justify-center space-x-2">
            <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce"></div>
            <div className="w-4 h-4 bg-pink-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
          </div>
        ) : variant === 'shimmer' ? (
          <div className="w-32 h-32 border-t-2 border-b-2 border-purple-500 rounded-full animate-spin"></div>
        ) : (
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-500"></div>
        )}
      </div>
      {message && <p className="text-lg text-gray-700">{message}</p>}
      {narratorLine && <p className="text-sm text-gray-500 italic mt-2">"{narratorLine}"</p>}
    </div>
  </div>
);

export default AanganLoadingScreen;

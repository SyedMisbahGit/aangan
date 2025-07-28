import React, { useState } from "react";
import { WhisperCard } from '../components/whisper/WhisperCard';
import type { Whisper as APIWhisper } from "../services/api";

// Define the Whisper type
type Whisper = APIWhisper & {
  guest_id?: string;
  author?: string;
  isActive?: boolean;
  isAIGenerated?: boolean;
  is_ai_generated?: boolean;
  isGhost?: boolean;
  zone?: string;
  likes?: number;
  replies?: number;
  created_at: string;
  content: string;
  emotion: string;
  timestamp: string;
  id: string;
};

// ... (rest of the code remains the same)

// Define the props type for WhisperCardWithFallback
interface WhisperCardWithFallbackProps {
  whisper: Whisper;
  isAI?: boolean;
  onTap?: () => void;
  onError?: () => void;
  index?: number;
}

// Add a wrapper for WhisperCard to provide fallback for broken images/audio
const WhisperCardWithFallback = ({ onError, ...props }: WhisperCardWithFallbackProps) => {
  const [hasError, setHasError] = useState(false);
  
  const handleError = () => {
    setHasError(true);
    onError?.();
  };
  
  if (hasError) {
    return (
      <div className="p-4 rounded-lg bg-white/80 dark:bg-gray-800/80 shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">Couldn't load this whisper</p>
      </div>
    );
  }

  return (
    <WhisperCard 
      {...props} 
      onError={handleError}
    />
  );
};

// Skeleton fallback with reload button after 8s
function SkeletonWithReload() {
  const [showReload, setShowReload] = useState(false);
  // ... (rest of the code remains the same)
    const timer = setTimeout(() => setShowReload(true), 8000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="space-y-4 my-12 flex flex-col items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <WhisperSkeleton key={i} />
      ))}
      {showReload && (
        <button
          className="mt-6 px-6 py-2 rounded bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition"
          onClick={() => window.location.reload()}
        >
          Reload
        </button>
      )}
    </div>
  );
}

// Implement the WhisperCardWithFallback component
function HomeFeed() {
  const whispers: Whisper[] = [
    {
      id: '1',
      content: 'Hello, world!',
      emotion: 'happy',
      timestamp: '2023-02-20T14:30:00.000Z',
      created_at: '2023-02-20T14:30:00.000Z',
    },
    {
      id: '2',
      content: 'This is a test whisper.',
      emotion: 'neutral',
      timestamp: '2023-02-20T14:31:00.000Z',
      created_at: '2023-02-20T14:31:00.000Z',
    },
  ];

  return (
    <div>
      {whispers.map((whisper, index) => (
        <WhisperCardWithFallback
          key={whisper.id}
          whisper={whisper}
          index={index}
          onError={() => console.error(`Error loading whisper ${whisper.id}`)}
        />
      ))}
    </div>
  );
}

export default HomeFeed;

import { useState } from 'react';
import { logger } from '../utils/logger';
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
  emotion: 'joy' | 'nostalgia' | 'calm' | 'anxiety' | 'hope' | 'love';
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
const WhisperCardWithFallback = (props: WhisperCardWithFallbackProps) => {
  const [hasError, setHasError] = useState(false);
  
  const handleError = () => {
    setHasError(true);
    if (props.onError) {
      props.onError();
    }
  };

  if (hasError) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">Could not load whisper</p>
      </div>
    );
  }

  // Create a new props object without onError since it's not part of WhisperCardProps
  const { onError, ...whisperCardProps } = props;
  
  // Handle any errors in the component's error boundary
  try {
    return <WhisperCard {...whisperCardProps} />;
  } catch (error) {
    handleError();
    return (
      <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">Error loading whisper</p>
      </div>
    );
  }
};

// Skeleton fallback component moved to a separate file for better organization

// Implement the WhisperCardWithFallback component
function HomeFeed() {
  const whispers: Whisper[] = [
    {
      id: '1',
      content: 'Hello, world!',
      emotion: 'joy',
      timestamp: '2023-02-20T14:30:00.000Z',
      created_at: '2023-02-20T14:30:00.000Z',
      zone: 'general',
      likes: 0,
      replies: 0
    },
    {
      id: '2',
      content: 'This is a test whisper.',
      emotion: 'calm',
      timestamp: '2023-02-20T14:31:00.000Z',
      created_at: '2023-02-20T14:31:00.000Z',
      zone: 'general',
      likes: 0,
      replies: 0
    },
  ];

  return (
    <div>
      {whispers.map((whisper, index) => (
        <WhisperCardWithFallback
          key={whisper.id}
          whisper={whisper}
          index={index}
          onError={() => logger.error(`Error loading whisper ${whisper.id}`)}
        />
      ))}
    </div>
  );
}

export default HomeFeed;

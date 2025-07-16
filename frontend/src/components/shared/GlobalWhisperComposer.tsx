import React from 'react';
import { useWhispers } from '../../contexts/use-whispers';
import { EmbeddedBenchComposer } from '../whisper/PostCreator';

/**
 * A simplified global composer that wraps the EmbeddedBenchComposer.
 * This component is responsible for connecting the composer's output
 * to the global state management (WhispersContext).
 */
const GlobalWhisperComposer: React.FC = () => {
  const { addWhisper } = useWhispers();

  const handleWhisperCreate = (content: string, emotion: string) => {
    // Get guestId from localStorage
    const guestId = typeof window !== 'undefined' ? localStorage.getItem('guestId') || undefined : undefined;
    const newWhisper = {
      id: Date.now().toString(),
      content,
      emotion,
      timestamp: new Date().toISOString(),
      // Add other necessary fields with default values
      location: '',
      tags: [],
      likes: 0,
      comments: 0,
      isAnonymous: true,
      guestId,
    };
    addWhisper(newWhisper);
  };

  // The UI is now fully handled by the EmbeddedBenchComposer.
  // This container component just provides the logic.
  return <EmbeddedBenchComposer onWhisperCreate={handleWhisperCreate} />;
};

export default GlobalWhisperComposer; 
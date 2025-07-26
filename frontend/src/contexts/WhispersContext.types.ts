import { Dispatch, SetStateAction } from 'react';

export interface Whisper {
  id: string;
  content: string;
  emotion: string;
  timestamp: string;
  location: string;
  likes: number;
  comments: number;
  isAnonymous: boolean;
  author?: string;
  prompt?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface WhispersContextType {
  whispers: Whisper[];
  setWhispers: Dispatch<SetStateAction<Whisper[]>>;
  addWhisper: (whisper: Whisper) => void;
}

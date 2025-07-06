import React, { createContext, useState, ReactNode } from "react";

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

interface WhispersContextType {
  whispers: Whisper[];
  setWhispers: React.Dispatch<React.SetStateAction<Whisper[]>>;
  addWhisper: (whisper: Whisper) => void;
}

export const WhispersContext = React.createContext<WhispersContextType | undefined>(undefined);

export const WhispersProvider = ({ children }: { children: ReactNode }) => {
  const [whispers, setWhispers] = useState<Whisper[]>([]);
  const addWhisper = (whisper: Whisper) => setWhispers((prev) => [whisper, ...prev]);
  const value: WhispersContextType = { whispers, setWhispers, addWhisper };
  return (
    <WhispersContext.Provider value={value}>
      {children}
    </WhispersContext.Provider>
  );
};

export const useWhispers = () => {
  const ctx = React.useContext(WhispersContext);
  if (!ctx) throw new Error('useWhispers must be used within a WhispersProvider');
  return ctx;
}; 
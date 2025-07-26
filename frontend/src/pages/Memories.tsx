import React, { useMemo, useState } from 'react';
import { DreamLayout } from '../components/shared/DreamLayout';
import { DreamHeader, isUserFacingRoute } from '../components/shared/DreamHeader';
import { DreamWhisperCard } from '../components/whisper/DreamWhisperCard';
import { useWhispers } from '../contexts/use-whispers';
import ErrorBoundary from "../components/shared/ErrorBoundary";
import { getErrorMessage } from "../lib/errorUtils";
import { useRef } from "react";
import { useLocation } from 'react-router-dom';

const locationLabels: Record<string, string> = {
  'Home': 'Home 🏠',
  'Internship': 'Internship 🧑‍💼',
  'On Campus': 'On Campus 🏫',
  'Travelling': 'Travelling ✈️',
  'Somewhere else': 'Somewhere else 🌌',
  '': 'Unspecified',
};

const emotionLabels: Record<string, string> = {
  'joy': 'Joy ✨',
  'nostalgia': 'Nostalgia 🌸',
  'anxiety': 'Anxiety 💭',
  'calm': 'Calm 🌊',
  'excitement': 'Excitement ⚡',
  'melancholy': 'Melancholy 🌙',
  'gratitude': 'Gratitude 🙏',
  'curiosity': 'Curiosity 🔍',
  '': 'Unspecified',
};

const allowedEmotions = [
  'joy', 'calm', 'nostalgia', 'hope', 'anxiety', 'loneliness'
];

export default function Memories() {
  const { whispers } = useWhispers();
  const [location, setLocation] = useState('');
  const [emotion, setEmotion] = useState('');
  const mainRef = useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (mainRef.current) {
      mainRef.current.focus();
    }
  }, []);

  const summerSoulWhispers = useMemo(() =>
    whispers.filter((w: { tags?: string[] }) => w.tags?.includes('#summerSoul25')),
    [whispers]
  );

  const filtered = useMemo(() =>
    summerSoulWhispers.filter((w: { location: string; emotion: string }) =>
      (location ? w.location === location : true) &&
      (emotion ? w.emotion === emotion : true)
    ),
    [summerSoulWhispers, location, emotion]
  );

  const routerLocation = useLocation();

  return (
    <ErrorBoundary narratorLine="A gentle hush falls over the campus. Something went adrift in the memories feed.">
      <DreamLayout>
        <main
          role="main"
          aria-labelledby="page-title"
          tabIndex={-1}
          ref={mainRef}
          className="max-w-3xl mx-auto mt-8 mb-16"
        >
          <h1 id="page-title" className="sr-only">Memories</h1>
          {isUserFacingRoute(routerLocation.pathname) && (
            <DreamHeader title="SummerSoul Memories" subtitle="Whispers from the summer break, now part of our collective story." />
          )}
          <div className="mb-8 p-4 bg-yellow-100/80 border border-yellow-300 rounded-lg text-yellow-900 text-center text-lg italic shadow">
            "A hush from the hills. A whisper from a metro. Even far apart, we were still writing."
          </div>
          <div className="flex flex-wrap gap-4 mb-8 justify-center">
            <select value={location} onChange={e => setLocation(e.target.value)} className="px-3 py-2 rounded border border-yellow-300 bg-white text-yellow-900">
              <option value="">All Locations</option>
              {Object.entries(locationLabels).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <select value={emotion} onChange={e => setEmotion(e.target.value)} className="px-3 py-2 rounded border border-yellow-300 bg-white text-yellow-900">
              <option value="">All Emotions</option>
              {Object.entries(emotionLabels).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          {filtered.length === 0 ? (
            <div className="text-yellow-700 text-center italic">No memories found for this filter.</div>
          ) : (
            <div className="space-y-6">
              {filtered.map((whisper: { id: string; content: string; emotion: string; location: string; timestamp: string; tags?: string[] }, idx: number) => (
                <DreamWhisperCard
                  key={whisper.id}
                  whisper={{
                    ...whisper,
                    replies: 0, // Initialize with 0 replies if not provided
                    likes: whisper.likes || 0, // Initialize with 0 likes if not provided
                    emotion: (allowedEmotions.includes(whisper.emotion) ? whisper.emotion : 'joy') as 'joy' | 'calm' | 'nostalgia' | 'hope' | 'anxiety' | 'loneliness',
                    timestamp: new Date(whisper.timestamp),
                  }}
                  index={idx}
                />
              ))}
            </div>
          )}
        </main>
      </DreamLayout>
    </ErrorBoundary>
  );
} 
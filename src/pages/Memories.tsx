import React, { useMemo, useState } from 'react';
import { DreamLayout } from '../components/shared/DreamLayout';
import { DreamHeader } from '../components/shared/DreamHeader';
import { DreamWhisperCard } from '../components/whisper/DreamWhisperCard';
import { useWhispers } from '../contexts/WhispersContext';

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

  const summerSoulWhispers = useMemo(() =>
    whispers.filter(w => w.tags?.includes('#summerSoul25')),
    [whispers]
  );

  const filtered = useMemo(() =>
    summerSoulWhispers.filter(w =>
      (location ? w.location === location : true) &&
      (emotion ? w.emotion === emotion : true)
    ),
    [summerSoulWhispers, location, emotion]
  );

  return (
    <DreamLayout>
      <DreamHeader title="SummerSoul Memories" subtitle="Whispers from the summer break, now part of our collective story." />
      <div className="max-w-3xl mx-auto mt-8 mb-16">
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
            {filtered.map((whisper, idx) => (
              <DreamWhisperCard
                key={whisper.id}
                whisper={{
                  ...whisper,
                  replies: whisper.comments,
                  emotion: (allowedEmotions.includes(whisper.emotion) ? whisper.emotion : 'joy') as 'joy' | 'calm' | 'nostalgia' | 'hope' | 'anxiety' | 'loneliness',
                  timestamp: new Date(whisper.timestamp),
                }}
                index={idx}
              />
            ))}
          </div>
        )}
      </div>
    </DreamLayout>
  );
} 
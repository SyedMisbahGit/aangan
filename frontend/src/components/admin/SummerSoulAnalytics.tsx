import React, { useEffect, useState } from 'react';

interface SummerSoulAnalyticsEntry {
  location: string;
  emotion: string;
  activity: string;
  isCapsule: boolean;
  timestamp: string;
}

const locationLabels: Record<string, string> = {
  'Home': 'Home 🏠',
  'Internship': 'Internship 🧑‍💼',
  'On Campus': 'On Campus 🏫',
  'Travelling': 'Travelling ✈️',
  'Somewhere else': 'Somewhere else 🌌',
  '': 'Unspecified',
};

export default function SummerSoulAnalytics() {
  const [data, setData] = useState<SummerSoulAnalyticsEntry[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem('summerSoulAnalytics');
    if (raw) setData(JSON.parse(raw));
  }, []);

  if (!data.length) return <div className="text-inkwell/60">No SummerSoul analytics data yet.</div>;

  // Aggregations
  const locationCounts: Record<string, number> = {};
  const emotionCounts: Record<string, number> = {};
  let capsuleCount = 0;
  data.forEach(entry => {
    locationCounts[entry.location] = (locationCounts[entry.location] || 0) + 1;
    emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
    if (entry.isCapsule) capsuleCount++;
  });
  const total = data.length;
  const homePct = ((locationCounts['Home'] || 0) / total) * 100;
  const internshipPct = ((locationCounts['Internship'] || 0) / total) * 100;
  const campusPct = ((locationCounts['On Campus'] || 0) / total) * 100;

  // Top location and emotion
  const topLocation = Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
  const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

  return (
    <div className="space-y-4">
      <div className="text-lg font-semibold text-yellow-800 flex items-center gap-2">
        <span className="text-2xl">🌞</span> SummerSoul Analytics
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="font-medium text-yellow-900 mb-1">Most Common Location</div>
          <div className="text-xl">{locationLabels[topLocation] || '—'}</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="font-medium text-yellow-900 mb-1">Most Used Emotion</div>
          <div className="text-xl">{topEmotion || '—'}</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="font-medium text-yellow-900 mb-1">% Whispering from Home</div>
          <div className="text-xl">{homePct.toFixed(1)}%</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="font-medium text-yellow-900 mb-1">% Whispering from Internship</div>
          <div className="text-xl">{internshipPct.toFixed(1)}%</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="font-medium text-yellow-900 mb-1">% Whispering from Campus</div>
          <div className="text-xl">{campusPct.toFixed(1)}%</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="font-medium text-yellow-900 mb-1">Time Capsules Created</div>
          <div className="text-xl">{capsuleCount}</div>
        </div>
      </div>
      <div className="text-xs text-yellow-700 mt-2">Data updates in real time as students use SummerSoul features.</div>
    </div>
  );
} 
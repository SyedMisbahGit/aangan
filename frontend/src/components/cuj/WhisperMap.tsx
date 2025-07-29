import React, { useState, useEffect } from 'react';
import { useCUJHotspots } from '../../contexts/useCUJHotspots';
import { useWhispers, Whisper } from '../../services/api';
import { useRealtime } from '../../contexts/useRealtime';

const WhisperMap: React.FC = () => {
  const { hotspots, selectedHotspot, setSelectedHotspot } = useCUJHotspots();
  const { data: whispers, isLoading } = useWhispers(
    { zone: selectedHotspot?.id },
  );
  const { realtimeWhispers } = useRealtime();
  const [pulsingHotspots, setPulsingHotspots] = useState<string[]>([]);

  useEffect(() => {
    if (realtimeWhispers.length > 0) {
      const latestWhisper = realtimeWhispers[0];
      if (latestWhisper.zone) {
        setPulsingHotspots((prev) => [...prev, latestWhisper.zone]);
        setTimeout(() => {
          setPulsingHotspots((prev) => prev.filter((id) => id !== latestWhisper.zone));
        }, 2000); // Pulse for 2 seconds
      }
    }
  }, [realtimeWhispers]);

  return (
    <div className="w-full h-full bg-gray-800 text-white p-4 flex">
      <div className="w-3/4 h-full">
        <svg viewBox="0 0 800 600" className="w-full h-full">
          {hotspots.map((hotspot) => (
            <g
              key={hotspot.id}
              transform={`translate(${hotspot.location.lng * 10000 - 772000}, ${hotspot.location.lat * 10000 - 286000})`}
              onClick={() => setSelectedHotspot(hotspot)}
              className="cursor-pointer"
            >
              <circle
                r="10"
                fill="rgba(74, 222, 128, 0.5)"
                stroke="white"
                strokeWidth="1"
                className={
                  selectedHotspot?.id === hotspot.id || pulsingHotspots.includes(hotspot.id)
                    ? 'pulse-animation'
                    : ''
                }
              />
              <text
                x="15"
                y="5"
                fill="white"
                fontSize="12"
                className="pointer-events-none"
              >
                {hotspot.name}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className={`w-1/4 h-full p-4 overflow-y-auto ${selectedHotspot?.backgroundTexture || 'bg-gray-900'}`}>
        <h3 className="text-xl font-bold mb-4">Hotspot Details</h3>
        {selectedHotspot ? (
          <div>
            <h4 className="text-lg font-bold">{selectedHotspot.name}</h4>
            <p className="text-sm italic text-gray-600 mb-2">{selectedHotspot.oneLiner}</p>
            <p className="text-sm text-gray-400 mb-2">{selectedHotspot.description}</p>
            <p className="text-sm">
              <span className="font-bold">Mood:</span> {selectedHotspot.dominantMood}
            </p>
            <p className="text-sm">
              <span className="font-bold">Active Users:</span> {selectedHotspot.activeUsers}
            </p>
            <hr className="my-4 border-gray-700" />
            <h5 className="text-lg font-bold mb-2">Whispers</h5>
            {isLoading ? (
              <p>Loading whispers...</p>
            ) : (
              <ul>
                {whispers?.map((whisper: Whisper) => (
                  <li key={whisper.id} className="mb-2 p-2 bg-gray-800 rounded">
                    <p className="text-sm">{whisper.content}</p>
                    <p className="text-xs text-gray-500">{whisper.timestamp}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <p>Select a hotspot to see details and whispers.</p>
        )}
      </div>
    </div>
  );
};

export default WhisperMap;

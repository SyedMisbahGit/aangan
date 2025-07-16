import { useState } from 'react';

const CampusCompass = (props) => {
  const [showNudge, setShowNudge] = useState(true);

  return (
    <div>
      {showNudge && (
        <div className="mb-4 p-3 rounded-lg bg-[#f9f7f4] border border-neutral-200 flex items-center justify-between text-neutral-700 text-sm shadow-sm">
          <span>
            🧭 <b>Emotion Compass</b> helps you navigate your feelings. Explore zones, moods, and let your heart guide you.
          </span>
          <button onClick={() => setShowNudge(false)} className="ml-4 px-2 py-1 rounded text-xs bg-neutral-200 hover:bg-neutral-300">Dismiss</button>
        </div>
      )}
      {/* ...rest of Compass UI... */}
    </div>
  );
}

export default CampusCompass; 
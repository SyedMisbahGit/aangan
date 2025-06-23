import React, { useState } from "react";
import WhisperVerseNav from "../components/whisper/WhisperVerseNav";
import CampusPulse from "../components/CampusPulse";
import WhisperDiary from "../components/whisper/WhisperDiary";
import WhisperShrines from "../components/whisper/WhisperShrines";
import EmotionCompass from "../components/EmotionCompass";
import MidnightConfessional from "../components/MidnightConfessional";
import MetamorphosisTracker from "../components/MetamorphosisTracker";
import { ParticleBackground } from "../components/shared/ParticleBackground";
import CUJCampusPulse from "../components/cuj/CUJCampusPulse";
import CUJWhisperDiary from "../components/cuj/CUJWhisperDiary";
import CUJNarrativeTemplates from "../components/cuj/CUJNarrativeTemplates";
import CUJBadgeSystem from "../components/cuj/CUJBadgeSystem";
import FloatingDiaryOrbs from "../components/FloatingDiaryOrbs";
import WhisperConstellation from "../components/whisper/WhisperConstellation";
import AIWhisperClustering from "../components/AIWhisperClustering";
import SmartCampusLearning from "../components/cuj/SmartCampusLearning";
import DogriHinglishPrompts from "../components/DogriHinglishPrompts";
import PWAInstallPrompt from "../components/PWAInstallPrompt";
import WhisperTimeCapsules from "../components/whisper/WhisperTimeCapsules";
import WhisperMurmurs from "../components/whisper/WhisperMurmurs";

// Sample data for demonstration
const sampleDiaryEntries = [
  {
    id: "1",
    content: "Udaan ke baad ka scene? Sab log alag ho gaye...",
    mood: "nostalgia" as const,
    timestamp: new Date(),
    zone: "Udaan Lawn",
    isPublic: true,
  },
  {
    id: "2",
    content: "Library mein padhte padhte aankh lag gayi",
    mood: "anxiety" as const,
    timestamp: new Date(),
    zone: "Library Silence Zone",
    isPublic: false,
  },
  {
    id: "3",
    content: "Hostel G ke rooftop pe stargazing with friends",
    mood: "joy" as const,
    timestamp: new Date(),
    zone: "PG Hostel Rooftop",
    isPublic: true,
  },
];

const sampleWhispers = [
  {
    id: "1",
    content: "Udaan ke baad ka scene? Sab log alag ho gaye...",
    zone: "Udaan Lawn",
    mood: "nostalgia" as const,
    intensity: 8,
    timestamp: new Date(),
    isActive: true,
  },
  {
    id: "2",
    content: "Library mein padhte padhte aankh lag gayi",
    zone: "Library Silence Zone",
    mood: "anxiety" as const,
    intensity: 6,
    timestamp: new Date(),
    isActive: false,
  },
  {
    id: "3",
    content: "Hostel G ke rooftop pe stargazing with friends",
    zone: "PG Hostel Rooftop",
    mood: "joy" as const,
    intensity: 9,
    timestamp: new Date(),
    isActive: true,
  },
];

const tabComponents: Record<string, React.ReactNode> = {
  whisperverse: (
    <div className="whisper-orb emotion-aura-joy p-8 mt-8">
      <h1 className="kinetic-text text-4xl md:text-5xl font-bold whisper-gradient-text mb-4 text-center">
        Welcome to WhisperVerse
      </h1>
      <p className="kinetic-text-slow text-lg text-center max-w-2xl mx-auto mb-6">
        A living, poetic, anonymous galaxy for CUJ. Float through your emotions,
        discover new zones, and let your whispers become constellations.
      </p>

      {/* Floating Diary Orbs */}
      <div className="mb-12">
        <h2 className="kinetic-text text-2xl font-bold whisper-gradient-text mb-6 text-center">
          Your Emotional Galaxy
        </h2>
        <FloatingDiaryOrbs
          entries={sampleDiaryEntries}
          onOrbClick={(entry) => console.log("Clicked diary orb:", entry)}
        />
      </div>

      {/* Whisper Constellation */}
      <div className="mb-12">
        <h2 className="kinetic-text text-2xl font-bold whisper-gradient-text mb-6 text-center">
          Live Whisper Constellation
        </h2>
        <WhisperConstellation
          whispers={sampleWhispers}
          onWhisperClick={(whisper) => console.log("Clicked whisper:", whisper)}
        />
      </div>

      <MetamorphosisTracker />
      <div className="mt-8">
        <CUJBadgeSystem />
      </div>
    </div>
  ),
  "time-capsules": (
    <div className="whisper-orb emotion-aura-nostalgia p-8 mt-8">
      <WhisperTimeCapsules />
    </div>
  ),
  midnight: (
    <div className="whisper-orb emotion-aura-loneliness p-8 mt-8">
      <MidnightConfessional />
    </div>
  ),
  "campus-pulse": (
    <div className="whisper-orb emotion-aura-joy p-8 mt-8">
      <CUJCampusPulse />
    </div>
  ),
  "mirror-diary": (
    <div className="whisper-orb emotion-aura-nostalgia p-8 mt-8">
      <CUJWhisperDiary />
      <CUJNarrativeTemplates />
    </div>
  ),
  "whisper-shrines": (
    <div className="whisper-shrine p-8 mt-8">
      <WhisperShrines />
    </div>
  ),
  "emotion-compass": (
    <div className="whisper-orb emotion-aura-calm p-8 mt-8">
      <EmotionCompass />
    </div>
  ),
};

const IndexPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("whisperverse");

  return (
    <div className="whisperverse min-h-screen relative flex flex-col items-center justify-start overflow-x-hidden">
      <ParticleBackground />
      {/* Floating 3D Navigation */}
      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
        <WhisperVerseNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      {/* Main Content Area */}
      <main className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center pt-48 pb-16 px-4">
        {tabComponents[activeTab]}
      </main>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

      {/* WhisperMurmurs - Ambient Activity */}
      <WhisperMurmurs />
    </div>
  );
};

export default IndexPage;

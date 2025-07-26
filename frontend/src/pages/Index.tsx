import React, { useState, useEffect, useRef } from "react";
import type { HTMLProps } from "react";

type HTMLMainElement = HTMLElement;
import AanganNav from "../components/whisper/WhisperVerseNav";
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
import { UserProfile } from "../components/UserProfile";
import { HelpCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { WelcomeOnboarding } from '../components/onboarding/WelcomeOnboarding';
import ErrorBoundary from "../components/shared/ErrorBoundary";
import { getErrorMessage } from "../lib/errorUtils";
import { Button } from "../components/ui/button";

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

const poeticGhostWhispers = [
  {
    id: "g1",
    content: "Someone just whispered in the Garden 🌿",
    type: "ghost"
  },
  {
    id: "g2",
    content: "AI replied gently to a sad thought in the Library 📚",
    type: "ai"
  },
  {
    id: "g3",
    content: "A quiet heart found comfort in the Lounge tonight 🌙",
    type: "ghost"
  },
];

const IndexPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("aangan");
  const [showHelp, setShowHelp] = useState(false);
  const [showWhy, setShowWhy] = useState(false);
  const [showEcho, setShowEcho] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('aangan_onboarding_complete')) {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    // Show echo animation every 20s
    const interval = setInterval(() => {
      setShowEcho(true);
      setTimeout(() => setShowEcho(false), 4000);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem('aangan_onboarding_complete', 'true');
  };

  const mainRef = useRef<HTMLMainElement>(null);
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.focus();
    }
  }, []);

  const tabComponents: Record<string, React.ReactNode> = {
    aangan: (
      <div className="aangan-orb emotion-aura-joy p-8 mt-8">
        <h1 className="kinetic-text text-4xl md:text-5xl font-bold mb-4 text-center">
          Welcome to Aangan
        </h1>
        <p className="kinetic-text-slow text-lg text-center max-w-2xl mx-auto mb-6">
          Your quiet cosmic courtyard for honest expression, gentle reflection, and campus connection.
        </p>
        {/* Poetic Ghost Whispers */}
        <div className="mb-8">
          <AnimatePresence>
            {poeticGhostWhispers.map((whisper, i) => (
              <motion.div
                key={whisper.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: i * 0.5, duration: 1.2, type: "spring" }}
                className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-4 mb-3 text-center text-aangan-primary text-base font-medium animate-fade-in"
              >
                {whisper.content}
              </motion.div>
            ))}
          </AnimatePresence>
          {/* Real-time echo/AI reply animation */}
          <AnimatePresence>
            {showEcho && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 1 }}
                className="mt-2 text-indigo-600 text-base font-semibold flex items-center justify-center gap-2 animate-fade-in"
              >
                <span role="img" aria-label="sparkle">✨</span> Someone just echoed a whisper
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Floating Diary Orbs */}
        <div className="mb-12">
          <h2 className="kinetic-text text-2xl font-bold whisper-gradient-text mb-6 text-center">
            Your Emotional Galaxy
          </h2>
          <FloatingDiaryOrbs
            entries={sampleDiaryEntries}
            onOrbClick={() => {}}
          />
        </div>
        {/* Whisper Constellation */}
        <div className="mb-12">
          <h2 className="kinetic-text text-2xl font-bold whisper-gradient-text mb-6 text-center">
            Live Whisper Constellation
          </h2>
          <WhisperConstellation
            whispers={sampleWhispers}
            onWhisperClick={() => {}}
          />
        </div>
        <MetamorphosisTracker />
        <div className="mt-8">
          <CUJBadgeSystem />
        </div>
      </div>
    ),
    diary: (
      <div className="aangan-orb emotion-aura-nostalgia p-8 mt-8">
        <CUJWhisperDiary />
        <CUJNarrativeTemplates />
      </div>
    ),
    whispers: (
      <div className="aangan-orb emotion-aura-joy p-8 mt-8">
        <WhisperConstellation whispers={sampleWhispers} onWhisperClick={() => {}} />
      </div>
    ),
    compass: (
      <div className="aangan-orb emotion-aura-calm p-8 mt-8">
        <EmotionCompass />
      </div>
    ),
    capsules: (
      <div className="aangan-orb emotion-aura-nostalgia p-8 mt-8">
        <WhisperTimeCapsules />
      </div>
    ),
    profile: (
      <div className="aangan-orb emotion-aura-calm p-8 mt-8">
        <UserProfile />
      </div>
    ),
  };

  return (
    <ErrorBoundary narratorLine="A gentle hush falls over the campus. Something went adrift in the courtyard.">
      <div className="aangan min-h-screen relative flex flex-col items-center justify-start overflow-x-hidden">
        {/* Unified Onboarding Modal */}
        <WelcomeOnboarding
          isOpen={showOnboarding}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingComplete}
        />
        {/* Floating Help Icon - only show on home tab */}
        {activeTab === "aangan" && (
          <Button
            className="fixed bottom-24 right-6 z-50 bg-aangan-primary text-white rounded-full p-3 shadow-lg hover:bg-aangan-primary/90 transition"
            aria-label="Help"
            onClick={() => setShowHelp(true)}
          >
            <HelpCircle className="w-6 h-6" />
          </Button>
        )}
        {/* Help Modal */}
        {showHelp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowHelp(false)}>
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto text-center animate-fade-in" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold mb-4 text-aangan-primary">Need Help?</h2>
              <p className="text-base text-gray-700 mb-6">Tap a tab below to explore. Use the composer to share a whisper. Your journey is anonymous and safe. If you feel lost, just start with "I feel something" or "Wander".</p>
              <Button
                onClick={() => setShowOnboarding(true)}
                className="mb-4 px-6 py-2 rounded-lg bg-indigo-100 text-indigo-700 font-semibold shadow hover:bg-indigo-200 transition"
              >
                Show Onboarding Guide
              </Button>
              <Button
                onClick={() => setShowWhy(true)}
                className="mb-4 px-6 py-2 rounded-lg bg-orange-100 text-orange-700 font-semibold shadow hover:bg-orange-200 transition"
              >
                Why this exists
              </Button>
              <Button
                onClick={() => setShowHelp(false)}
                className="px-6 py-2 rounded-lg bg-aangan-primary text-white font-semibold shadow hover:bg-aangan-primary/90 transition"
              >
                Close
              </Button>
            </div>
          </div>
        )}
        {/* Why This Exists Modal */}
        {showWhy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowWhy(false)}>
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto text-center animate-fade-in" onClick={e => e.stopPropagation()}>
              <h2 className="text-2xl font-bold mb-4 text-orange-600">🧡 Why does Aangan exist?</h2>
              <p className="text-lg text-gray-700 mb-6">Aangan is your emotional space — post anonymously, whisper what’s on your mind, and feel less alone.<br/><br/>We believe everyone deserves a gentle place to be heard, without judgment or pressure. This is why Aangan exists.</p>
              <Button
                onClick={() => setShowWhy(false)}
                className="px-6 py-2 rounded-lg bg-orange-500 text-white font-semibold shadow hover:bg-orange-600 transition"
              >
                Close
              </Button>
            </div>
          </div>
        )}
        <ParticleBackground />
        {/* Navigation - only show on home tab */}
        {activeTab === "aangan" && (
          <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl">
            <AanganNav activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        )}
        {/* Main Content Area */}
        <main
          role="main"
          aria-labelledby="page-title"
          tabIndex={-1}
          ref={mainRef}
          className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center pt-48 pb-16 px-4"
        >
          <h1 id="page-title" className="sr-only">Aangan Home</h1>
          {tabComponents[activeTab]}
        </main>
        <PWAInstallPrompt />
        <WhisperMurmurs />
      </div>
    </ErrorBoundary>
  );
};

export default IndexPage;

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DreamLayout } from '../components/shared/DreamLayout';
import { DreamHeader } from '../components/shared/DreamHeader';
import { isUserFacingRoute } from '../utils/headerUtils';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { cujHotspots, type Hotspot } from '../constants/cujHotspots';
import WaterTheCourtyard from '../components/onboarding/WaterTheCourtyard';
import ErrorBoundary from "../components/shared/ErrorBoundary";

const steps = [
  {
    title: 'Welcome to Aangan',
    subtitle: 'Your anonymous safe space at CUJ.',
  },
  {
    title: 'Choose a whisper name',
    subtitle: 'This is how you\'ll be known. It can be anything you like.',
  },
  {
    title: 'Finding your location...',
    subtitle: 'We can try to detect your location to connect you with whispers nearby.',
  },
  {
    title: 'Where are you right now?',
    subtitle: 'This helps us connect you with whispers nearby.',
  },
  {
    title: 'All set!',
    subtitle: 'You\'re ready to enter the courtyard.',
  },
];

const NewOnboarding: React.FC = () => {
  const [step, setStep] = useState(0);
  const [location, setLocation] = useState('');
  const [whisperName, setWhisperName] = useState('');
  const [locationStatus, setLocationStatus] = useState<'idle' | 'detecting' | 'success' | 'error'>('idle');
  const [showAnimation, setShowAnimation] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const routerLocation = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (mainRef.current) {
      mainRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (showAnimation) {
      const timer = setTimeout(() => {
        localStorage.setItem('aangan_onboarding_complete', 'true');
        navigate('/whispers');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showAnimation, navigate]);

  const handleLocationDetect = () => {
    setLocationStatus('detecting');
    navigator.geolocation.getCurrentPosition(
      () => {
        // Here you would typically use the position to find the nearest hotspot.
        // For this example, we'll just simulate a successful detection.
        setLocationStatus('success');
        setTimeout(() => handleNext(), 1000);
      },
      () => {
        setLocationStatus('error');
        setTimeout(() => handleNext(), 1000);
      }
    );
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(s => s + 1);
    } else {
      setShowAnimation(true);
    }
  };

  if (showAnimation) {
    return <WaterTheCourtyard />;
  }
  return (
    <ErrorBoundary narratorLine="A gentle hush falls over the campus. Something went adrift in onboarding.">
      <DreamLayout>
        <main
          role="main"
          aria-labelledby="page-title"
          tabIndex={-1}
          ref={mainRef}
          className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 via-white to-blue-50 p-4"
        >
          <h1 id="page-title" className="sr-only">New Onboarding</h1>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md text-center"
            >
              {isUserFacingRoute(routerLocation.pathname) && (
                <DreamHeader title={steps[step].title} subtitle={steps[step].subtitle} />
              )}
              {step === 1 && (
                <Input
                  type="text"
                  placeholder="e.g. Midnight Dreamer"
                  aria-label="Enter your whisper name"
                  value={whisperName}
                  onChange={(e) => setWhisperName(e.target.value)}
                  className="mt-4 text-white placeholder:text-gray-200 bg-black/40 shadow-xl backdrop-blur-lg focus:ring-2 focus:ring-aangan-primary/80 focus:border-aangan-primary border-white/30 border-2"
                />
              )}
              {step === 2 && (
                <div className="mt-4">
                  <Button onClick={handleLocationDetect} disabled={locationStatus === 'detecting'}>
                    {locationStatus === 'detecting' ? 'Detecting...' : 'Detect my location'}
                  </Button>
                  {locationStatus === 'error' && (
                    <p className="text-sm text-red-500 mt-2">
                      Could not detect your location. Please select a zone manually.
                    </p>
                  )}
                  {locationStatus === 'success' && (
                    <p className="text-sm text-green-500 mt-2">
                      Location detected successfully!
                    </p>
                  )}
                  {locationStatus === 'idle' && (
                    <p className="text-sm text-gray-500 mt-2">
                      We'll ask for permission to use your location. We only use it to find whispers near you and never store it.
                    </p>
                  )}
                </div>
              )}
              {step === 3 && (
                <div className="mt-4 space-y-4">
                  {Object.entries(
                    cujHotspots.reduce<Record<string, Hotspot[]>>((groups, hotspot) => {
                      const group = hotspot.group;
                      if (!groups[group]) groups[group] = [];
                      groups[group].push(hotspot);
                      return groups;
                    }, {})
                  ).map(([group, groupHotspots]) => (
                    <div key={group}>
                      <h3 className="text-lg font-semibold mb-2">{group}</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {groupHotspots.map((hotspot) => (
                          <Button
                            key={hotspot.id}
                            variant={location === hotspot.id ? 'default' : 'outline'}
                            onClick={() => setLocation(hotspot.id)}
                          >
                            {hotspot.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button onClick={handleNext} className="mt-8">
                {step === steps.length - 1 ? 'Enter the Courtyard' : 'Continue'}
              </Button>
            </motion.div>
          </AnimatePresence>
        </main>
      </DreamLayout>
    </ErrorBoundary>
  );
};

export default NewOnboarding;

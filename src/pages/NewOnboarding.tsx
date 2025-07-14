import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DreamLayout } from '../components/shared/DreamLayout';
import { DreamHeader } from '../components/shared/DreamHeader';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { cujHotspots } from '../constants/cujHotspots';
import WaterTheCourtyard from '../components/onboarding/WaterTheCourtyard';

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
  const [whisperName, setWhisperName] = useState('');
  const [location, setLocation] = useState('');
  const [locationStatus, setLocationStatus] = useState<'idle' | 'detecting' | 'success' | 'error'>('idle');
  const [showAnimation, setShowAnimation] = useState(false);
  const navigate = useNavigate();

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
      (position) => {
        // Here you would typically use the position to find the nearest hotspot.
        // For this example, we'll just simulate a successful detection.
        setLocationStatus('success');
        setTimeout(() => handleNext(), 1000);
      },
      (error) => {
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
    <DreamLayout>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 via-white to-blue-50 p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md text-center"
          >
            <DreamHeader title={steps[step].title} subtitle={steps[step].subtitle} />

            {step === 1 && (
              <Input
                type="text"
                placeholder="e.g. Midnight Dreamer"
                value={whisperName}
                onChange={(e) => setWhisperName(e.target.value)}
                className="mt-4"
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
                {Object.entries(Object.groupBy(cujHotspots, ({ group }) => group)).map(([group, hotspots]) => (
                  <div key={group}>
                    <h3 className="text-lg font-semibold mb-2">{group}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {hotspots.map((hotspot) => (
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
      </div>
    </DreamLayout>
  );
};

export default NewOnboarding;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DreamLayout } from '../components/shared/DreamLayout';
import { DreamHeader } from '../components/shared/DreamHeader';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { cujHotspots } from '../constants/cujHotspots';

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
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(s => s + 1);
    } else {
      localStorage.setItem('aangan_onboarding_complete', 'true');
      navigate('/whispers');
    }
  };

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
              <div className="mt-4 grid grid-cols-2 gap-4">
                {cujHotspots.map((hotspot) => (
                  <Button
                    key={hotspot.id}
                    variant={location === hotspot.id ? 'default' : 'outline'}
                    onClick={() => setLocation(hotspot.id)}
                  >
                    {hotspot.name}
                  </Button>
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

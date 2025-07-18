import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DreamLayout } from '../components/shared/DreamLayout';
import { DreamHeader } from '../components/shared/DreamHeader';
import { Button } from '../components/ui/button';
import { ShhhLine } from '../components/ShhhLine';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorBoundary from "../components/shared/ErrorBoundary";
import { getErrorMessage } from "../lib/errorUtils";

const steps = [
  {
    title: 'Welcome to Aangan°',
    body: 'apna safe courtyard.'
  },
  {
    title: 'Diary is private.',
    body: 'Feed is anonymous.'
  },
  {
    title: 'Tap 🌱 to start whispering.',
    body: ''
  },
];

const Onboarding: React.FC = () => {
  const [step, setStep] = useState(0);
  const { setOnboardingComplete } = useAuth();
  const navigate = useNavigate();
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (step < steps.length - 1) {
      const timeout = setTimeout(() => setStep(s => s + 1), 2000);
      return () => clearTimeout(timeout);
    } else {
      // Last step: mark complete and redirect
      setOnboardingComplete();
      setTimeout(() => navigate('/'), 500);
    }
  }, [step, setOnboardingComplete, navigate]);

  return (
    <ErrorBoundary narratorLine="A gentle hush falls over the campus. Something went adrift in onboarding.">
      <DreamLayout>
        <main
          role="main"
          aria-labelledby="page-title"
          tabIndex={-1}
          ref={mainRef}
          className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-cloudmist/30 via-dawnlight/20 to-cloudmist/40"
        >
          <h1 id="page-title" className="sr-only">Onboarding</h1>
          <div className="w-full max-w-lg mt-8 mb-2">
            <div className="h-2 bg-inkwell/10 rounded-full overflow-hidden">
              <motion.div
                className="h-2 bg-aangan-accent rounded-full"
                initial={false}
                animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                aria-valuenow={step + 1}
                aria-valuemax={steps.length}
                aria-label="Onboarding progress"
                role="progressbar"
              />
            </div>
          </div>
          <DreamHeader title={steps[step].title} subtitle={steps[step].body} />
        </main>
      </DreamLayout>
    </ErrorBoundary>
  );
};

export default Onboarding; 
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { DreamLayout } from '../components/shared/DreamLayout';
import { DreamHeader } from '../components/shared/DreamHeader';
import { Button } from '../components/ui/button';
import { ShhhLine } from '../components/ShhhLine';

const steps = [
  {
    title: 'Welcome to the WhisperVerse',
    narrator: 'Every journey begins with a single whisper. Here, you are safe, anonymous, and free to feel.',
    body: 'This is your poetic sanctuary—a place for honest expression, gentle reflection, and campus connection.'
  },
  {
    title: 'The Diary Space',
    narrator: 'Some thoughts are for your eyes only. The Diary is your private garden.',
    body: 'Write what you cannot say aloud. Only you can see your diary entries, and they are never shared.'
  },
  {
    title: 'The Social Whisper Feed',
    narrator: 'Some whispers are meant to float across campus. Share, connect, and listen.',
    body: 'Your public whispers are anonymous, but they help others feel less alone. You can reply, react, and support.'
  },
  {
    title: 'Magic Link Login',
    narrator: 'No passwords, no friction. Only your @cujammu.ac.in email is your key.',
    body: 'Your identity is protected. Only CUJ students can enter, and no one can see who you are.'
  },
  {
    title: 'The Narrator',
    narrator: 'A gentle guide will accompany you—sometimes with poetry, sometimes with silence.',
    body: 'Let the narrator\'s lines comfort, inspire, or simply keep you company as you explore.'
  },
  {
    title: 'Begin Your Journey',
    narrator: 'You are ready. The campus awaits your first whisper.',
    body: 'Step into the WhisperVerse. You can always return to your diary, or simply listen. Welcome home.'
  }
];

const Onboarding: React.FC = () => {
  const [step, setStep] = useState(0);
  const { setOnboardingComplete } = useSupabaseAuth();
  const navigate = useNavigate();
  const isLast = step === steps.length - 1;
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (headingRef.current) {
      headingRef.current.focus();
    }
  }, [step]);

  const handleNext = async () => {
    if (isLast) {
      await setOnboardingComplete();
      navigate('/');
    } else {
      setStep(s => s + 1);
    }
  };

  const handleSkip = async () => {
    await setOnboardingComplete();
    navigate('/');
  };

  return (
    <DreamLayout>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-cloudmist/30 via-dawnlight/20 to-cloudmist/40">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="sr-only"
        >
          {steps[step].title}
        </h1>
        <DreamHeader title={steps[step].title} subtitle={`Step ${step + 1} of 6`}/>
        <div
          className="w-full max-w-lg bg-paper-light rounded-xl shadow-soft p-8 mt-6 flex flex-col items-center"
          aria-label={`Onboarding step ${step + 1} of 6`}
        >
          <span className="sr-only" id="onboarding-progress">
            Step {step + 1} of 6
          </span>
          <div className="text-lg text-inkwell/80 italic mb-4" aria-live="polite">
            {steps[step].narrator}
          </div>
          <div className="text-inkwell/90 text-center text-base mb-8">
            {steps[step].body}
          </div>
          <Button onClick={handleNext} className="w-full mt-4">
            {isLast ? 'Begin' : 'Next'}
          </Button>
          <button
            onClick={handleSkip}
            className="w-full mt-2 text-sm underline text-inkwell/60 hover:text-inkwell"
            aria-label="Skip onboarding and begin using WhisperVerse"
          >
            Skip
          </button>
        </div>
      </div>
    </DreamLayout>
  );
};

export default Onboarding; 
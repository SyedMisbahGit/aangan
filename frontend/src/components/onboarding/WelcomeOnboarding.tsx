import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Sparkles, 
  MessageCircle, 
  MapPin, 
  Heart, 
  BookOpen, 
  Shield, 
  X,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { ParticleBackground } from '@/components/shared/ParticleBackground';

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
}

interface WelcomeOnboardingProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'what-is-aangan',
    title: 'What is Aangan?',
    subtitle: 'A space to whisper what you carry, without judgment.',
    description: `Aangan is a space to whisper what you carry, without judgment. It's anonymous, emotional, and human. Here, you can share your feelings, connect with others, and find comfort in knowing you are not alone.`,
    icon: <Sparkles className="w-8 h-8" />,
    color: 'from-purple-500 to-pink-500',
    features: [
      'Anonymous & safe',
      'Emotional & human',
      'No judgment, just listening',
      'Your voice matters'
    ]
  },
  {
    id: 'how-it-works',
    title: 'How it works',
    subtitle: 'Whisper, Echo, Reply',
    description: 'Whisper your feelings, echo others to show support, and reply to connect. Every interaction is anonymous and heartfelt.',
    icon: <MessageCircle className="w-8 h-8" />,
    color: 'from-blue-500 to-cyan-500',
    features: [
      'Whisper: Share what’s on your mind',
      'Echo: Show support for others',
      'Reply: Connect through gentle responses',
      'All anonymous, always safe'
    ]
  },
  {
    id: 'ready',
    title: 'Ready to start?',
    subtitle: 'See how others whisper…',
    description: 'Here are some demo whispers from the Aangan courtyard. You can always revisit this guide from the Help (?) icon.',
    icon: <Heart className="w-8 h-8" />,
    color: 'from-rose-500 to-orange-400',
    features: [], // Will show carousel instead
  },
];

const logOnboardingEvent = (event: string) => {
  const events = JSON.parse(localStorage.getItem('aangan_onboarding_events') || '[]');
  events.push({ event, timestamp: new Date().toISOString() });
  localStorage.setItem('aangan_onboarding_events', JSON.stringify(events));
  // TODO: Send to analytics endpoint if needed
};

export const WelcomeOnboarding: React.FC<WelcomeOnboardingProps> = ({
  isOpen,
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('aangan_has_seen_onboarding');
    if (seen === 'true') {
      setHasSeenOnboarding(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('aangan_has_seen_onboarding', 'true');
    logOnboardingEvent('onboarding_complete');
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem('aangan_has_seen_onboarding', 'true');
    logOnboardingEvent('onboarding_skipped');
    onSkip();
  };

  if (!isOpen || hasSeenOnboarding) {
    return null;
  }

  const currentStepData = onboardingSteps[currentStep];

  // Add prefers-reduced-motion support
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
          animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleSkip}
          tabIndex={0}
          aria-modal="true"
          role="dialog"
        >
          {/* Animated background */}
          <ParticleBackground className="absolute inset-0 z-0" />
          <motion.div
            initial={prefersReducedMotion ? false : { scale: 0.96, opacity: 0 }}
            animate={prefersReducedMotion ? false : { scale: 1, opacity: 1 }}
            exit={prefersReducedMotion ? false : { scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-md relative z-10 shadow-2xl"
            onClick={e => e.stopPropagation()}
            tabIndex={0}
            aria-label="Onboarding card"
          >
            {/* Progress bar */}
            <motion.div
              className="h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 mb-2 overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep+1)/onboardingSteps.length)*100}%` }}
              transition={{ duration: 0.5 }}
              aria-valuenow={currentStep+1}
              aria-valuemax={onboardingSteps.length}
              aria-label="Onboarding progress"
            />
            <Card className="bg-white/95 backdrop-blur-lg border-0 shadow-2xl">
              <CardContent className="p-6">
                {/* Header with animated icon */}
                <div className="flex items-center justify-between mb-6">
                  <motion.div
                    key={currentStepData.id}
                    initial={{ rotate: -20, scale: 0.7, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`w-8 h-8 rounded-full bg-gradient-to-r ${currentStepData.color} flex items-center justify-center text-white`}
                    aria-hidden="true"
                  >
                    {currentStepData.icon}
                  </motion.div>
                  <span className="text-sm font-medium text-gray-600">
                    Step {currentStep + 1} of {onboardingSteps.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Skip onboarding"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                {/* Content */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {currentStepData.title}
                  </h2>
                  <p className="text-lg text-gray-600 mb-4">
                    {currentStepData.subtitle}
                  </p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {currentStepData.description}
                  </p>
                </div>
                {/* Features or Demo Carousel */}
                {currentStepData.id !== 'ready' ? (
                  <div className="space-y-3 mb-6">
                    {currentStepData.features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
                        animate={prefersReducedMotion ? false : { opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.08, duration: 0.3, ease: 'easeOut' }}
                        className="flex items-center gap-3 text-sm text-gray-700"
                      >
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${currentStepData.color}`} />
                        {feature}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    className="mb-6"
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                    animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  >
                    {/* Swipeable demo whispers carousel */}
                    <div className="rounded-lg bg-gray-50 p-4 shadow-inner overflow-x-auto flex gap-4 snap-x snap-mandatory" role="region" aria-label="Demo whispers carousel">
                      {/* Replace with actual carousel logic if available */}
                      {["I felt lost, but found comfort here.", "Someone echoed my secret.", "No one judges, only listens.", "I found hope in a stranger's reply.", "The courtyard is always open."]
                        .map((demo, idx) => (
                          <motion.div
                            key={idx}
                            className="min-w-[220px] snap-center bg-white rounded-xl shadow p-4 mx-1 text-gray-700 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-aangan-primary/60"
                            whileHover={prefersReducedMotion ? undefined : { scale: 1.05, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
                            whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                            tabIndex={0}
                            aria-label={`Demo whisper ${idx+1}`}
                          >
                            {demo}
                          </motion.div>
                        ))}
                    </div>
                  </motion.div>
                )}
                {/* Navigation buttons with micro-interactions */}
                <div className="flex justify-between mt-4">
                  <motion.button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    aria-label="Previous step"
                    whileHover={prefersReducedMotion ? undefined : { scale: 1.06, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
                    className="transition focus:outline-none focus-visible:ring-2 focus-visible:ring-aangan-primary/60"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Previous
                  </motion.button>
                  <motion.button
                    variant="primary"
                    onClick={handleNext}
                    aria-label={currentStep === onboardingSteps.length - 1 ? "Finish onboarding" : "Next step"}
                    whileHover={prefersReducedMotion ? undefined : { scale: 1.06, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
                    className="transition focus:outline-none focus-visible:ring-2 focus-visible:ring-aangan-primary/60"
                  >
                    {currentStep === onboardingSteps.length - 1 ? 'Finish' : 'Next'} <ArrowRight className="w-4 h-4 ml-1" />
                  </motion.button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeOnboarding; 
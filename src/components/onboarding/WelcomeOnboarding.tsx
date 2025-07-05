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
    id: 'welcome',
    title: 'Welcome to Aangan',
    subtitle: 'Your anonymous voice in the campus chorus',
    description: 'A safe space where thoughts flow freely, identities stay hidden, and connections happen through shared emotions.',
    icon: <Sparkles className="w-8 h-8" />,
    color: 'from-purple-500 to-pink-500',
    features: [
      'Share thoughts anonymously',
      'Connect through emotions',
      'Explore campus zones',
      'Feel heard without judgment'
    ]
  },
  {
    id: 'whisper',
    title: 'Whisper Your Truth',
    subtitle: 'Express what you feel, not who you are',
    description: 'Write your thoughts, choose your emotion, pick your zone. Your whisper joins thousands of others in the campus constellation.',
    icon: <MessageCircle className="w-8 h-8" />,
    color: 'from-blue-500 to-cyan-500',
    features: [
      'Write from your heart',
      'Choose emotion tags',
      'Pick campus zones',
      'React with hearts'
    ]
  },
  {
    id: 'explore',
    title: 'Explore & Connect',
    subtitle: 'Discover the hidden stories around you',
    description: 'Navigate through zones, read others\' whispers, find your tribe through shared emotions and experiences.',
    icon: <MapPin className="w-8 h-8" />,
    color: 'from-green-500 to-emerald-500',
    features: [
      'Browse by zones',
      'Filter by emotions',
      'Read others\' whispers',
      'Join conversations'
    ]
  }
];

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
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem('aangan_has_seen_onboarding', 'true');
    onSkip();
  };

  if (!isOpen || hasSeenOnboarding) {
    return null;
  }

  const currentStepData = onboardingSteps[currentStep];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md"
          >
            <Card className="bg-white/95 backdrop-blur-lg border-0 shadow-2xl">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${currentStepData.color} flex items-center justify-center text-white`}>
                      {currentStepData.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      Step {currentStep + 1} of {onboardingSteps.length}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    className="text-gray-400 hover:text-gray-600"
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

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {currentStepData.features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 text-sm text-gray-700"
                    >
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${currentStepData.color}`} />
                      {feature}
                    </motion.div>
                  ))}
                </div>

                {/* Progress */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex gap-1">
                    {onboardingSteps.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index <= currentStep 
                            ? `bg-gradient-to-r ${currentStepData.color}` 
                            : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>

                  <Button
                    onClick={handleNext}
                    className={`bg-gradient-to-r ${currentStepData.color} text-white hover:opacity-90`}
                  >
                    {currentStep === onboardingSteps.length - 1 ? (
                      <>
                        Get Started
                        <Sparkles className="w-4 h-4 ml-1" />
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </Button>
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
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sparkles, MapPin, Headphones } from 'lucide-react';

const GentleOnboarding: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { setOnboardingComplete } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onboardingComplete = localStorage.getItem('onboardingComplete');
    if (!onboardingComplete) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setOnboardingComplete();
  };

  const handleOpenComposer = () => {
    setIsOpen(false);
    setOnboardingComplete();
    // Dispatch a custom event to open the global composer
    window.dispatchEvent(new CustomEvent('open-global-composer'));
  };
  const handleWander = () => {
    setIsOpen(false);
    setOnboardingComplete();
    navigate('/lounge');
  };
  const handleListen = () => {
    setIsOpen(false);
    setOnboardingComplete();
    navigate('/listen');
  };

  if (!isOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center bg-black/30"
          onClick={handleClose}
        >
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm mx-auto mb-4 md:mb-0 text-center" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-2 text-aangan-primary">Welcome to Aangan</h3>
            <p className="text-gray-700 mb-6 text-base">
              Welcome to Aangan – a quiet place to share your thoughts anonymously.<br/>
              Tap anywhere to begin whispering…
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleOpenComposer}
                className="w-full flex items-center justify-center gap-2 bg-aangan-primary hover:bg-aangan-primary/90 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-base"
              >
                <Sparkles className="w-5 h-5" /> I feel something
              </button>
              <button
                onClick={handleWander}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-base"
              >
                <MapPin className="w-5 h-5" /> Wander
              </button>
              <button
                onClick={handleListen}
                className="w-full flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors text-base"
              >
                <Headphones className="w-5 h-5" /> Listen quietly
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GentleOnboarding;

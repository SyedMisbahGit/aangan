import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const GentleOnboarding: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { setOnboardingComplete } = useAuth();

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
          className="fixed bottom-4 right-4 z-50"
        >
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm">
            <h3 className="text-lg font-semibold mb-2">Welcome to Aangan</h3>
            <p className="text-gray-600 mb-4">
              You’ve entered Aangan. Sit a while, read a whisper, or share your own.
            </p>
            <button
              onClick={handleClose}
              className="w-full bg-aangan-primary hover:bg-aangan-primary/90 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Begin
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GentleOnboarding;

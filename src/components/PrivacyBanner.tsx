import React, { useState, useEffect } from 'react';

const PrivacyBanner: React.FC = () => {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the banner
    const dismissed = localStorage.getItem('privacy-banner-dismissed');
    if (dismissed) {
      setHide(true);
    }
  }, []);

  const handleDismiss = () => {
    setHide(true);
    localStorage.setItem('privacy-banner-dismissed', 'true');
  };

  if (hide) return null;

  return (
    <div className="fixed bottom-20 inset-x-0 px-4 z-50">
      <div className="bg-[#f9f7f4] text-[13px] p-3 rounded-lg shadow-lg border border-cream-200 max-w-md mx-auto">
        <div className="flex items-center justify-between">
          <span className="text-inkwell-80">
            Aangan stores <strong>no personal data</strong>. All whispers are anonymous.
          </span>
          <button 
            onClick={handleDismiss}
            className="ml-3 underline text-dream-blue hover:text-dream-purple transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyBanner; 
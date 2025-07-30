import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { usePWAUpdate, PWAUpdateStatus } from '../hooks/usePWAUpdate';
import { usePWAInstall, PWAInstallStatus } from '../hooks/usePWAInstall';

interface PWAUpdateContextType {
  // Update related
  updateStatus: PWAUpdateStatus;
  isUpdateAvailable: boolean;
  isDownloading: boolean;
  isUpdateInstalled: boolean;
  triggerUpdate: () => void;
  dismissUpdate: () => void;
  
  // Installation related
  isInstallable: boolean;
  isAppInstalled: boolean;
  promptInstall: () => Promise<boolean>;
  
  // Combined state
  pwaState: {
    update: PWAUpdateStatus;
    install: PWAInstallStatus;
  };
}

const PWAUpdateContext = createContext<PWAUpdateContextType | null>(null);

export const PWAUpdateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Use the PWA update hook
  const {
    updateStatus,
    isUpdateAvailable,
    isDownloading,
    isUpdateInstalled,
    triggerUpdate,
    dismissUpdate,
  } = usePWAUpdate();
  
  // Use the PWA install hook
  const {
    isInstallable,
    isInstalled: isAppInstalled,
    promptInstall,
  } = usePWAInstall();
  
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    // Update related
    updateStatus,
    isUpdateAvailable,
    isDownloading,
    isUpdateInstalled,
    triggerUpdate,
    dismissUpdate,
    
    // Installation related
    isInstallable,
    isAppInstalled,
    promptInstall,
    
    // Combined state
    pwaState: {
      update: updateStatus,
      install: {
        isInstallable,
        isInstalled: isAppInstalled,
      },
    },
  }), [
    updateStatus,
    isUpdateAvailable,
    isDownloading,
    isUpdateInstalled,
    isInstallable,
    isAppInstalled,
    triggerUpdate,
    dismissUpdate,
    promptInstall,
  ]);

  return (
    <PWAUpdateContext.Provider value={contextValue}>
      {children}
    </PWAUpdateContext.Provider>
  );
};

export const usePWAUpdateContext = (): PWAUpdateContextType => {
  const context = useContext(PWAUpdateContext);
  if (!context) {
    throw new Error('usePWAUpdateContext must be used within a PWAUpdateProvider');
  }
  return context;
};

export default PWAUpdateContext;

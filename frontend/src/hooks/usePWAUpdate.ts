import { useState, useEffect, useCallback } from 'react';
import { register } from '../utils/serviceWorkerRegistration';

export type PWAUpdateStatus = 'idle' | 'available' | 'downloading' | 'installed' | 'error';

type PWARegistration = {
  registration: ServiceWorkerRegistration | null;
  updateStatus: PWAUpdateStatus;
  isUpdateAvailable: boolean;
  isDownloading: boolean;
  isUpdateInstalled: boolean;
  triggerUpdate: () => void;
  dismissUpdate: () => void;
  installPWA: () => Promise<void>;
  canInstallPWA: boolean;
};

/**
 * Custom hook to handle PWA update flow
 * @returns Object containing update status, update function, and dismiss function
 */
export const usePWAUpdate = (): PWARegistration => {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateStatus, setUpdateStatus] = useState<PWAUpdateStatus>('idle');
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);

  // Derived state
  const isUpdateAvailable = updateStatus === 'available';
  const isDownloading = updateStatus === 'downloading';
  const isUpdateInstalled = updateStatus === 'installed';
  const canInstallPWA = !!deferredPrompt;

  // Handle the beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Register service worker for PWA updates
    const swConfig = {
      onSuccess: (reg: ServiceWorkerRegistration) => {
        console.log('ServiceWorker registration successful with scope: ', reg.scope);
        setRegistration(reg);
      },
      onUpdate: (reg: ServiceWorkerRegistration) => {
        console.log('New content is available; please refresh.');
        setRegistration(reg);
        setUpdateStatus('available');
      },
    };

    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      register(swConfig);
    }

    // Check for updates every hour
    const updateCheckInterval = setInterval(() => {
      if (registration) {
        registration.update().catch(err => {
          console.error('Error checking for updates:', err);
        });
      }
    }, 60 * 60 * 1000); // 1 hour

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearInterval(updateCheckInterval);
    };
  }, [registration]);

  // Handle update trigger
  const triggerUpdate = useCallback(() => {
    if (updateStatus === 'available' && registration?.waiting) {
      setUpdateStatus('downloading');
      
      // Notify the service worker to skip waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Listen for the new service worker to take over
      const handleControllerChange = () => {
        setUpdateStatus('installed');
        window.location.reload();
      };
      
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
      
      // Cleanup
      return () => {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      };
    }
  }, [registration, updateStatus]);
  
  // Handle update dismissal
  const dismissUpdate = useCallback(() => {
    setUpdateStatus('idle');
  }, []);
  
  // Handle PWA installation
  const installPWA = useCallback(async () => {
    if (!deferredPrompt) return;
    
    try {
      // Show the install prompt
      (deferredPrompt as any).prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await (deferredPrompt as any).userChoice;
      console.log(`User ${outcome} the install prompt`);
      
      // Clear the deferred prompt
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  }, [deferredPrompt]);
  
  return {
    registration,
    updateStatus,
    isUpdateAvailable,
    isDownloading,
    isUpdateInstalled,
    triggerUpdate,
    dismissUpdate,
    installPWA,
    canInstallPWA,
  };
};

export default usePWAUpdate;

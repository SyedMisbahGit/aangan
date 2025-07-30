import React from 'react';
import { usePWAUpdateContext } from '../contexts/PWAUpdateContext';
import { X, Download, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

const PWAUpdateNotification: React.FC = () => {
  const {
    isUpdateAvailable,
    isDownloading,
    isUpdateInstalled,
    triggerUpdate,
    dismissUpdate,
    isInstallable,
    promptInstall,
  } = usePWAUpdateContext();

  // Don't show anything if there's no update available and PWA can't be installed
  if (!isUpdateAvailable && !isInstallable) {
    return null;
  }

  const handleAction = async () => {
    if (isUpdateAvailable) {
      triggerUpdate();
    } else if (isInstallable) {
      await promptInstall();
    }
  };

  // Determine the notification type and content
  const notificationType = isUpdateAvailable 
    ? isDownloading 
      ? 'downloading' 
      : isUpdateInstalled 
        ? 'installed' 
        : 'update-available'
    : isInstallable 
      ? 'install-prompt' 
      : 'none';

  if (notificationType === 'none') {
    return null;
  }

  // Notification content based on type
  const notificationContent = {
    'update-available': {
      icon: <Download className="h-6 w-6 text-blue-500" />,
      title: 'Update Available',
      message: 'A new version of WhisperVerse is available. Update now for the latest features and improvements.',
      buttonText: 'Update Now',
      buttonIcon: <Download className="-ml-0.5 mr-2 h-4 w-4" />,
      buttonClass: 'bg-blue-600 hover:bg-blue-700',
    },
    'downloading': {
      icon: <RefreshCw className="h-6 w-6 text-yellow-500 animate-spin" />,
      title: 'Updating...',
      message: 'Downloading the latest version. Please wait...',
      buttonText: 'Updating...',
      buttonIcon: <RefreshCw className="animate-spin -ml-0.5 mr-2 h-4 w-4" />,
      buttonClass: 'bg-yellow-500 hover:bg-yellow-600',
    },
    'installed': {
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      title: 'Update Complete',
      message: 'The app has been updated. Refresh to see the changes.',
      buttonText: 'Reload Now',
      buttonIcon: <CheckCircle className="-ml-0.5 mr-2 h-4 w-4" />,
      buttonClass: 'bg-green-600 hover:bg-green-700',
    },
    'install-prompt': {
      icon: <AlertCircle className="h-6 w-6 text-purple-500" />,
      title: 'Install App',
      message: 'Install WhisperVerse on your device for a better experience.',
      buttonText: 'Install',
      buttonIcon: <Download className="-ml-0.5 mr-2 h-4 w-4" />,
      buttonClass: 'bg-purple-600 hover:bg-purple-700',
    },
  }[notificationType];

  const showDismissButton = !isUpdateInstalled && !isDownloading;
  const showCloseButton = !isDownloading;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md w-full sm:w-96">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              {notificationContent.icon}
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                {notificationContent.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                {notificationContent.message}
              </p>
              <div className="mt-4 flex">
                <button
                  type="button"
                  onClick={handleAction}
                  disabled={isDownloading}
                  className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white ${notificationContent.buttonClass} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {notificationContent.buttonIcon}
                  {notificationContent.buttonText}
                </button>
                {showDismissButton && (
                  <button
                    type="button"
                    onClick={dismissUpdate}
                    disabled={isDownloading}
                    className="ml-3 inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <X className="-ml-0.5 mr-2 h-4 w-4" />
                    Later
                  </button>
                )}
              </div>
            </div>
            {showCloseButton && (
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  type="button"
                  onClick={dismissUpdate}
                  className="bg-white dark:bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <span className="sr-only">Close</span>
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAUpdateNotification;

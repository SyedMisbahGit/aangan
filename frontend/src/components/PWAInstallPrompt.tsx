import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler as EventListener);
    return () => window.removeEventListener("beforeinstallprompt", handler as EventListener);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      setShow(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 p-4 bg-white/80 backdrop-blur-md rounded-xl shadow-xl flex justify-between items-center z-50">
      <span className="text-sm font-medium">Install Shhh for quicker access</span>
      <button onClick={handleInstall} className="bg-black text-white text-sm px-3 py-1 rounded-md hover:bg-gray-800 transition">
        Install
      </button>
    </div>
  );
}

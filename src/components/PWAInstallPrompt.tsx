import { useEffect, useState } from "react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      (deferredPrompt as any).prompt();
      const result = await (deferredPrompt as any).userChoice;
      console.log("Install result:", result);
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

import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./App.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfettiEffect } from "./components/shared/ConfettiEffect";
import { DreamNavigation } from "./components/shared/DreamNavigation";
import { DreamThemeProvider, useDreamTheme } from "./contexts/DreamThemeContext";
import { ShhhNarratorProvider, useShhhNarrator } from "./contexts/ShhhNarratorContext";
import { CUJHotspotProvider, useCUJHotspots } from "./contexts/CUJHotspotContext";
import { useState, useEffect } from "react";
import { messaging, getToken, onMessage } from "./firebase-messaging";
import Admin from "./pages/Admin";
import AdminInsights from "./pages/AdminInsights";
import NotFound from "./pages/NotFound";
import GlobalWhisperComposer from "./components/shared/GlobalWhisperComposer";
import Onboarding from "./pages/Onboarding";
import { SummerPulseProvider } from "./contexts/SummerPulseContext";
import { SupabaseAuthProvider, useSupabaseAuth } from './contexts/SupabaseAuthContext';
import { WhispersProvider, useWhispers } from "./contexts/WhispersContext";
import { useIsMobile } from './hooks/use-mobile';

const queryClient = new QueryClient();

const HomeFeed = lazy(() => import("./pages/HomeFeed"));
const CreateWhisper = lazy(() => import("./pages/CreateWhisper"));
const Diary = lazy(() => import("./pages/Diary"));
const Capsules = lazy(() => import("./pages/Capsules"));
const Shrines = lazy(() => import("./pages/Shrines"));
const Compass = lazy(() => import("./pages/Compass"));
const Constellation = lazy(() => import("./pages/Constellation"));
const Murmurs = lazy(() => import("./pages/Murmurs"));
const Profile = lazy(() => import("./pages/Profile"));
const Login = lazy(() => import('./pages/Login'));

const VAPID_KEY =
  "BI3DBu7k1VWLVM9S8UkeQl9gEhlLuHwa4dLOOr77R8kTbCza8TlpKJlc3URwGG-g2-u3Tcs16unk57rXiXPVSyA";

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-cream-100 dark:bg-dream-dark-bg text-inkwell dark:text-dream-dark-text font-poetic text-lg">
    Shhh is sensing the campus...
  </div>
);

const AppContent: React.FC = () => {
  const [showConfetti, setShowConfetti] = useState(false);
  const { theme, toggleTheme, isInitialized } = useDreamTheme();
  const { isReady: narratorReady } = useShhhNarrator();
  const { isReady: hotspotReady } = useCUJHotspots();
  const { addWhisper } = useWhispers();

  if (!isInitialized || !narratorReady || !hotspotReady) return <LoadingScreen />;

  // Trigger confetti on app load for celebration
  useEffect(() => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  }, []);

  // Request notification permission and get FCM token
  useEffect(() => {
    if ("Notification" in window && navigator.serviceWorker) {
      Notification.requestPermission().then(async (permission) => {
        if (permission === "granted") {
          try {
            const registration = await navigator.serviceWorker.ready;
            const currentToken = await getToken(messaging, {
              vapidKey: VAPID_KEY,
              serviceWorkerRegistration: registration,
            });
            if (currentToken) {
              console.log("FCM Token:", currentToken);
              // Send this token to your backend
              fetch("/api/fcm-token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: currentToken }),
              });
            } else {
              console.log(
                "No registration token available. Request permission to generate one.",
              );
            }
          } catch (err) {
            console.log("An error occurred while retrieving token. ", err);
          }
        } else {
          console.log("Notification permission not granted.");
        }
      });

      // Listen for foreground messages
      onMessage(messaging, (payload) => {
        console.log("Message received. ", payload);
        // Optionally show a notification or update UI
      });
    }
  }, []);

  const handleWhisperCreated = (whisper: any) => {
    addWhisper(whisper);
    // In a real app, this would trigger updates to feeds, notifications, etc.
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      theme === 'dark'
        ? 'bg-dream-dark-background text-dream-dark-text-primary' 
        : 'bg-dream-background text-dream-text-primary'
    }`}>
      <Suspense
        fallback={
          <div className="dream-loading">
            <div className="dream-loading-spinner"></div>
            <span className="ml-3 text-dream-text-secondary">Loading whispers...</span>
          </div>
        }
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/" element={<PrivateRoute><HomeFeed /></PrivateRoute>} />
          <Route path="/create" element={<PrivateRoute><CreateWhisper /></PrivateRoute>} />
          <Route path="/diary" element={<PrivateRoute><Diary /></PrivateRoute>} />
          <Route path="/capsules" element={<PrivateRoute><Capsules /></PrivateRoute>} />
          <Route path="/shrines" element={<PrivateRoute><Shrines /></PrivateRoute>} />
          <Route path="/compass" element={<PrivateRoute><Compass /></PrivateRoute>} />
          <Route path="/constellation" element={<PrivateRoute><Constellation /></PrivateRoute>} />
          <Route path="/murmurs" element={<PrivateRoute><Murmurs /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
          <Route path="/admin/insights" element={<PrivateRoute><AdminInsights /></PrivateRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <DreamNavigation onThemeToggle={toggleTheme} isDarkMode={theme === 'dark'} />
      </Suspense>
      <ConfettiEffect isActive={showConfetti} />
      <GlobalWhisperComposer 
        variant="floating"
        onWhisperCreated={handleWhisperCreated}
      />
    </div>
  );
};

// PrivateRoute wrapper
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isOnboardingComplete } = useSupabaseAuth();
  const location = useLocation();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  // If not onboarded, redirect to /onboarding (unless already there)
  if (!isOnboardingComplete && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}

function AppContentWithErrorBoundary() {
  const isMobile = useIsMobile();
  const [hasError, setHasError] = React.useState(false);
  React.useEffect(() => {
    const handler = (e: ErrorEvent) => setHasError(true);
    window.addEventListener('error', handler);
    return () => window.removeEventListener('error', handler);
  }, []);
  if (isMobile && hasError) {
    return <div className="min-h-screen flex items-center justify-center text-center p-8 bg-dream-bg dark:bg-[#0e0e10] text-dream-text-primary dark:text-dream-dark-text">We're fixing something – please retry in a moment.</div>;
  }
  return <AppContent />;
}

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseAuthProvider>
        <DreamThemeProvider>
          <CUJHotspotProvider>
            <ShhhNarratorProvider>
              <SummerPulseProvider>
                <WhispersProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                      <AppContentWithErrorBoundary />
                    </BrowserRouter>
                  </TooltipProvider>
                </WhispersProvider>
              </SummerPulseProvider>
            </ShhhNarratorProvider>
          </CUJHotspotProvider>
        </DreamThemeProvider>
      </SupabaseAuthProvider>
    </QueryClientProvider>
  );
};

export default App;

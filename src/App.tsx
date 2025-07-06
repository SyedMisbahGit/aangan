import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./App.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfettiEffect } from "./components/shared/ConfettiEffect";
import { DreamNavigation } from "./components/shared/DreamNavigation";
import { AanganThemeProvider, useAanganTheme } from "./contexts/DreamThemeContext";
import { ShhhNarratorProvider, useShhhNarrator } from "./contexts/ShhhNarratorContext";
import { CUJHotspotProvider, useCUJHotspots } from "./contexts/CUJHotspotContext";
import { useState, useEffect } from "react";
import messagingPromise from "./firebase-messaging";
import { getToken, onMessage } from "firebase/messaging";
import Admin from "./pages/Admin";
import AdminInsights from "./pages/AdminInsights";
import NotFound from "./pages/NotFound";
import GlobalWhisperComposer from "./components/shared/GlobalWhisperComposer";
import Onboarding from "./pages/Onboarding";
import { SummerPulseProvider } from "./contexts/SummerPulseContext";
import { WhispersProvider, useWhispers } from "./contexts/WhispersContext";
import { useIsMobile } from './hooks/use-mobile';
import ErrorBoundary from './components/shared/ErrorBoundary';
import { SummerSoulProvider } from './contexts/SummerSoulContext';
import { AuthProvider } from './contexts/AuthContext';
import { RealtimeProvider } from './contexts/RealtimeContext';
import axios from "axios";
import AdminLogin from './pages/AdminLogin';
import PrivacyBanner from './components/PrivacyBanner';

const queryClient = new QueryClient();

const Whispers = lazy(() => import("./pages/HomeFeed"));
const CreateWhisper = lazy(() => import("./pages/CreateWhisper"));
const Diary = lazy(() => import("./pages/Diary"));
const Wander = lazy(() => import("./pages/Explore"));
const Listen = lazy(() => import("./pages/Lounge"));
const MyCorner = lazy(() => import("./pages/Menu"));
const Capsules = lazy(() => import("./pages/Capsules"));
const Shrines = lazy(() => import("./pages/Shrines"));
const Compass = lazy(() => import("./pages/Compass"));
const Constellation = lazy(() => import("./pages/Constellation"));
const Murmurs = lazy(() => import("./pages/Murmurs"));
const Profile = lazy(() => import("./pages/Profile"));
const About = lazy(() => import("./pages/About"));
const Login = lazy(() => import('./pages/Login'));

const VAPID_KEY =
  "BI3DBu7k1VWLVM9S8UkeQl9gEhlLuHwa4dLOOr77R8kTbCza8TlpKJlc3URwGG-g2-u3Tcs16unk57rXiXPVSyA";

export const AanganLoadingScreen = ({ message, narratorLine, variant }: { message?: string, narratorLine?: string, variant?: 'default' | 'orbs' | 'shimmer' }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-aangan-background text-aangan-text-primary font-serif text-lg animate-aangan-fade-in relative overflow-hidden">
    {/* Floating Orbs Animation */}
    {(variant === 'orbs' || !variant) && (
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/3 w-24 h-24 bg-aangan-primary/30 rounded-full blur-2xl animate-aangan-float" />
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-aangan-secondary/20 rounded-full blur-2xl animate-aangan-float" />
        <div className="absolute top-2/3 right-1/3 w-16 h-16 bg-aangan-accent/20 rounded-full blur-2xl animate-aangan-float" />
      </div>
    )}
    {/* Shimmer Animation */}
    {(variant === 'shimmer') && (
      <div className="w-64 h-6 bg-gradient-to-r from-aangan-primary/10 via-aangan-primary/30 to-aangan-primary/10 rounded-full animate-aangan-shimmer mb-6" />
    )}
    <div className="z-10 text-center">
      <div className="mb-2 animate-aangan-pulse-soft">{message || 'Aangan is sensing the campus...'}</div>
      {narratorLine && <div className="italic text-aangan-primary mt-2 animate-aangan-fade-in">{narratorLine}</div>}
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const [showConfetti, setShowConfetti] = useState(false);
  const { theme, isInitialized } = useAanganTheme();
  const { isReady: narratorReady } = useShhhNarrator();
  const { isReady: hotspotReady } = useCUJHotspots();
  const { addWhisper } = useWhispers();
  const [showNotifOptIn, setShowNotifOptIn] = useState(false);

  // Trigger confetti on app load for celebration
  useEffect(() => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  }, []);

  // Request notification permission and get FCM token
  useEffect(() => {
    if ("Notification" in window && navigator.serviceWorker) {
      if (Notification.permission === "default") {
        setShowNotifOptIn(true);
      } else if (Notification.permission === "granted") {
        // Already granted, proceed as before
        getAndSendFcmToken();
      }
    }
  }, []);

  // Heartbeat ping every 10 min
  useEffect(() => {
    const ping = () => {
      axios.post("/api/health/heartbeat").catch(() => {});
    };
    ping();
    const interval = setInterval(ping, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Global error logger
  useEffect(() => {
    window.onerror = function (message, source, lineno, colno, error) {
      axios.post("/api/logs", {
        message: message?.toString(),
        stack: error?.stack || null,
        url: window.location.href,
        userAgent: navigator.userAgent,
        time: new Date().toISOString(),
      }).catch(() => {});
      return false;
    };
  }, []);

  // Analytics tracking for page views
  useEffect(() => {
    const trackPageView = () => {
      const path = window.location.pathname;
      if (['/', '/explore', '/lounge'].includes(path)) {
        console.log(`📊 Page view: ${path}`);
        // In a real app, this would send to analytics service
        axios.post("/api/analytics/page-view", {
          path,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        }).catch(() => {});
      }
    };

    trackPageView();
  }, []);

  // Aggregate all context readiness
  if (!isInitialized || !narratorReady || !hotspotReady) {
    return <AanganLoadingScreen message="Sensing the campus, warming the chai, and listening for whispers..." />;
  }

  const getAndSendFcmToken = async () => {
    try {
      const messaging = await messagingPromise;
      if (!messaging) {
        console.log("Firebase Messaging is not supported in this browser/environment.");
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const currentToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      });
      if (currentToken) {
        console.log("FCM Token:", currentToken);
        fetch("/api/fcm-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: currentToken }),
        });
      } else {
        console.log("No registration token available. Request permission to generate one.");
      }
    } catch (err) {
      console.log("An error occurred while retrieving token. ", err);
    }
  };

  const handleNotifOptIn = async (accept: boolean) => {
    setShowNotifOptIn(false);
    if (accept) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        getAndSendFcmToken();
      }
    }
  };

  const handleWhisperCreated = (whisper: { id: string; content: string; emotion: string; timestamp: string; location: string; tags: string[]; likes: number; comments: number; isAnonymous: boolean }) => {
    addWhisper(whisper);
    // In a real app, this would trigger updates to feeds, notifications, etc.
  };

  return (
    <div className="min-h-screen transition-colors duration-500 bg-aangan-background text-aangan-text-primary">
      {showNotifOptIn && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-aangan-card border border-aangan-primary rounded-xl shadow-aangan-xl px-6 py-4 flex items-center gap-4 animate-aangan-fade-in">
          <span className="font-medium text-aangan-primary">Allow notifications? <span className="text-aangan-text-primary">Sirf zaroori nudges, spam nahi.</span></span>
          <button onClick={() => handleNotifOptIn(true)} className="ml-4 bg-aangan-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-aangan-primary/90 transition">Allow</button>
          <button onClick={() => handleNotifOptIn(false)} className="ml-2 text-aangan-primary/70 hover:text-aangan-primary">No Thanks</button>
        </div>
      )}
      <Suspense
        fallback={
          <AanganLoadingScreen 
            message="Loading whispers..."
            narratorLine="The courtyard is preparing to receive your thoughts..."
          />
        }
      >
        <Routes>
          <Route path="/" element={<Whispers />} />
          <Route path="/create" element={<CreateWhisper />} />
          <Route path="/diary" element={<Diary />} />
          <Route path="/explore" element={<Wander />} />
          <Route path="/lounge" element={<Listen />} />
          <Route path="/menu" element={<MyCorner />} />
          <Route path="/capsules" element={<Capsules />} />
          <Route path="/shrines" element={<Shrines />} />
          <Route path="/compass" element={<Compass />} />
          <Route path="/constellation" element={<Constellation />} />
          <Route path="/murmurs" element={<Murmurs />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<PrivateRoute adminOnly><Admin /></PrivateRoute>} />
          <Route path="/admin/insights" element={<PrivateRoute adminOnly><AdminInsights /></PrivateRoute>} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      <GlobalWhisperComposer onWhisperCreated={handleWhisperCreated} />
      <DreamNavigation />
      <PrivacyBanner />
      <ConfettiEffect isActive={showConfetti} />
      <Toaster />
      <Sonner />
    </div>
  );
};

// Utility for safe random ID
function getRandomId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'guest-' + Math.random().toString(36).slice(2) + Date.now();
}

// PrivateRoute wrapper
function PrivateRoute({ children, adminOnly }: { children: React.ReactNode, adminOnly?: boolean }) {
  if (adminOnly) {
    const jwt = localStorage.getItem("admin_jwt");
    if (!jwt) return <Navigate to="/admin-login" replace />;
    // Optionally, verify token expiry client-side
    return <>{children}</>;
  } else {
    let guestId = localStorage.getItem("guestId");
    if (!guestId) {
      guestId = getRandomId();
      localStorage.setItem("guestId", guestId);
    }
    return <>{children}</>;
  }
}

function AppContentWithErrorBoundary() {
  const isMobile = useIsMobile();
  const [hasError, setHasError] = React.useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  React.useEffect(() => {
    const handler = (e: ErrorEvent) => setHasError(true);
    window.addEventListener('error', handler);
    return () => window.removeEventListener('error', handler);
  }, []);
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  if (isMobile && hasError) {
    return <div className="min-h-screen flex items-center justify-center text-center p-8 bg-aangan-background text-aangan-text-primary">We're fixing something – please retry in a moment.</div>;
  }
  if (isOffline) {
    return <div className="min-h-screen flex items-center justify-center text-center p-8 bg-aangan-background text-aangan-text-primary text-lg">We're floating in a quiet zone. Please reconnect.</div>;
  }
  return <AppContent />;
}

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AanganThemeProvider>
        <CUJHotspotProvider>
          <ShhhNarratorProvider>
            <SummerPulseProvider>
              <WhispersProvider>
                <AuthProvider>
                  <RealtimeProvider>
                    <TooltipProvider>
                      <Toaster />
                      <Sonner />
                      <SummerSoulProvider>
                        <BrowserRouter>
                          <ErrorBoundary narratorLine="A gentle hush falls over the campus. Something went adrift in the courtyard." >
                            <AppContentWithErrorBoundary />
                          </ErrorBoundary>
                        </BrowserRouter>
                      </SummerSoulProvider>
                    </TooltipProvider>
                  </RealtimeProvider>
                </AuthProvider>
              </WhispersProvider>
            </SummerPulseProvider>
          </ShhhNarratorProvider>
        </CUJHotspotProvider>
      </AanganThemeProvider>
    </QueryClientProvider>
  );
};

export default App;

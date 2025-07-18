import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./App.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ParticleFlow } from "./components/ambient/ParticleFlow";
import { DreamNavigation } from "./components/shared/DreamNavigation";
import { AanganThemeProvider } from "./contexts/DreamThemeContext";
import { ShhhNarratorProvider } from "./contexts/ShhhNarratorContext";
import { CUJHotspotProvider } from "./contexts/CUJHotspotContext";
import { useState, useEffect } from "react";
import messagingPromise from "./firebase-messaging";
import { getToken, onMessage } from "firebase/messaging";
import Admin from "./pages/Admin";
import AdminInsights from "./pages/AdminInsights";
import NotFound from "./pages/NotFound";
import NewOnboarding from "./pages/NewOnboarding";
import { SummerPulseProvider } from "./contexts/SummerPulseContext";
import { WhispersProvider } from "./contexts/WhispersContext";
import { useIsMobile } from './hooks/use-mobile';
import ErrorBoundary from './components/shared/ErrorBoundary';
import { SummerSoulProvider } from './contexts/SummerSoulContext';
import { AuthProvider } from './contexts/AuthContext';
import { RealtimeProvider } from './contexts/RealtimeContext';
import AdminLogin from './pages/AdminLogin';
import PrivacyBanner from './components/PrivacyBanner';
import RouteObserver from './components/shared/RouteObserver';
import GentleOnboarding from './components/onboarding/GentleOnboarding';
import { AnimatePresence } from "framer-motion";
import { ConfettiEffect } from './components/shared/ConfettiEffect';
import AanganLoadingScreen from './components/shared/AanganLoadingScreen';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Lazy load pages for better performance
const Whispers = lazy(() => import("./pages/HomeFeed"));
const CreateWhisper = lazy(() => import("./pages/CreateWhisper"));
const Explore = lazy(() => import("./pages/Explore"));
const Lounge = lazy(() => import("./pages/Lounge"));
const Profile = lazy(() => import("./pages/Profile"));
const About = lazy(() => import("./pages/About"));
const Compass = lazy(() => import("./pages/Compass"));
const Constellation = lazy(() => import("./pages/Constellation"));
const Capsules = lazy(() => import("./pages/Capsules"));
const Shrines = lazy(() => import("./pages/Shrines"));
const Memories = lazy(() => import("./pages/Memories"));
const Murmurs = lazy(() => import("./pages/Murmurs"));
const Diary = lazy(() => import("./pages/Diary"));
const Login = lazy(() => import("./pages/Login"));
const Index = lazy(() => import("./pages/Index"));
const Menu = lazy(() => import("./pages/Menu"));

// Utility function for generating random IDs
const getRandomId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// PrivateRoute wrapper
function PrivateRoute({ children, adminOnly }: { children: React.ReactNode, adminOnly?: boolean }) {
  if (adminOnly) {
    const jwt = localStorage.getItem("admin_jwt");
    if (!jwt) return <Navigate to="/admin-login" replace />;
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

// Route observer for breadcrumbs
function RouteObserver() {
  const location = useLocation();
  useEffect(() => {
    if (typeof window !== "undefined") {
      const crumbs = JSON.parse(localStorage.getItem('aangan_breadcrumbs') || '[]');
      crumbs.push({ path: location.pathname, timestamp: new Date().toISOString() });
      localStorage.setItem('aangan_breadcrumbs', JSON.stringify(crumbs.slice(-10)));
    }
  }, [location]);
  return null;
}

// Global offline banner
function OfflineBanner() {
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' && !navigator.onLine);
  useEffect(() => {
    function updateStatus() {
      setOffline(!navigator.onLine);
    }
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);
  if (!offline) return null;
  return (
    <div className="fixed top-0 left-0 w-full z-50 flex items-center justify-center bg-yellow-100 text-yellow-800 text-sm py-2 shadow animate-fade-in">
      <span role="img" aria-label="offline" className="mr-2">📴</span>
      You’re offline. Some features may be unavailable.
    </div>
  );
}

// Main app content
const AppContent: React.FC = () => {
  const isMobile = useIsMobile();
  const [showPrivacyBanner, setShowPrivacyBanner] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(localStorage.getItem('aangan_onboarding_complete') === 'true');
  const lastVisitedPath = localStorage.getItem('lastVisitedPath');
  const location = useLocation();

  useEffect(() => {
    // Firebase messaging setup
    messagingPromise.then((messaging) => {
      getToken(messaging, { vapidKey: "your-vapid-key" })
        .then((currentToken) => {
          if (currentToken) {
          }
        })
        .catch((err) => {
        });

      onMessage(messaging, (payload) => {
      });
    });
  }, []);

  if (!onboardingComplete) {
    return <NewOnboarding />;
  }

  return (
    <>
      <RouteObserver />
      <GentleOnboarding />
      {showPrivacyBanner && <PrivacyBanner onAccept={() => setShowPrivacyBanner(false)} />}
      <ConfettiEffect />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public routes */}
          <Route path="/" element={lastVisitedPath ? <Navigate to={lastVisitedPath} /> : <Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        
        {/* Protected routes */}
        <Route path="/whispers" element={
          <PrivateRoute>
            <Suspense fallback={<AanganLoadingScreen />}>
              <Whispers />
            </Suspense>
          </PrivateRoute>
        } />
        
        <Route path="/create" element={
          <PrivateRoute>
            <Suspense fallback={<AanganLoadingScreen />}>
              <CreateWhisper />
            </Suspense>
          </PrivateRoute>
        } />
        
        <Route path="/explore" element={
          <PrivateRoute>
            <Suspense fallback={<AanganLoadingScreen />}>
              <Explore />
            </Suspense>
          </PrivateRoute>
        } />
        
        <Route path="/lounge" element={
          <PrivateRoute>
            <Suspense fallback={<AanganLoadingScreen />}>
              <Lounge />
            </Suspense>
          </PrivateRoute>
        } />
        
        <Route path="/profile" element={
          <PrivateRoute>
            <Suspense fallback={<AanganLoadingScreen />}>
              <Profile />
            </Suspense>
          </PrivateRoute>
        } />
        
        <Route path="/compass" element={
          <PrivateRoute>
            <Suspense fallback={<AanganLoadingScreen />}>
              <Compass />
            </Suspense>
          </PrivateRoute>
        } />
        
        <Route path="/constellation" element={
          <PrivateRoute>
            <Suspense fallback={<AanganLoadingScreen />}>
              <Constellation />
            </Suspense>
          </PrivateRoute>
        } />
        
        <Route path="/capsules" element={
          <PrivateRoute>
            <Suspense fallback={<AanganLoadingScreen />}>
              <Capsules />
            </Suspense>
          </PrivateRoute>
        } />
        
        <Route path="/shrines" element={
          <PrivateRoute>
            <Suspense fallback={<AanganLoadingScreen />}>
              <Shrines />
            </Suspense>
          </PrivateRoute>
        } />
        
        <Route path="/memories" element={
          <PrivateRoute>
            <Suspense fallback={<AanganLoadingScreen />}>
              <Memories />
            </Suspense>
          </PrivateRoute>
        } />
        
        <Route path="/murmurs" element={
          <PrivateRoute>
            <Suspense fallback={<AanganLoadingScreen />}>
              <Murmurs />
            </Suspense>
          </PrivateRoute>
        } />
        
        <Route path="/diary" element={
          <PrivateRoute>
            <Suspense fallback={<AanganLoadingScreen />}>
              <Diary />
            </Suspense>
          </PrivateRoute>
        } />
        
        <Route path="/menu" element={
          <PrivateRoute>
            <Suspense fallback={<AanganLoadingScreen />}>
              <Menu />
            </Suspense>
          </PrivateRoute>
        } />
        
        {/* Admin routes */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <PrivateRoute adminOnly>
            <Admin />
          </PrivateRoute>
        } />
        <Route path="/admin-insights" element={
          <PrivateRoute adminOnly>
            <AdminInsights />
          </PrivateRoute>
        } />
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
      
      {!isMobile && <DreamNavigation />}
    </>
  );
};

// Main App component with optimized provider chain
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
                          <OfflineBanner />
                          <RouteObserver />
                          <ErrorBoundary narratorLine="A gentle hush falls over the campus. Something went adrift in the courtyard.">
                            <AppContent />
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

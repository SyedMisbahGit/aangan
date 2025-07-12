import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfettiEffect } from "./components/shared/ConfettiEffect";
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
import Onboarding from "./pages/Onboarding";
import { SummerPulseProvider } from "./contexts/SummerPulseContext";
import { WhispersProvider } from "./contexts/WhispersContext";
import { useIsMobile } from './hooks/use-mobile';
import ErrorBoundary from './components/shared/ErrorBoundary';
import { SummerSoulProvider } from './contexts/SummerSoulContext';
import { AuthProvider } from './contexts/AuthContext';
import { RealtimeProvider } from './contexts/RealtimeContext';
import AdminLogin from './pages/AdminLogin';
import PrivacyBanner from './components/PrivacyBanner';

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

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
  </div>
);

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

// Main app content
const AppContent: React.FC = () => {
  const isMobile = useIsMobile();
  const [showPrivacyBanner, setShowPrivacyBanner] = useState(true);

  useEffect(() => {
    // Firebase messaging setup
    messagingPromise.then((messaging) => {
      getToken(messaging, { vapidKey: "your-vapid-key" })
        .then((currentToken) => {
          if (currentToken) {
            console.log("FCM Token:", currentToken);
          }
        })
        .catch((err) => {
          console.log("FCM Token Error:", err);
        });

      onMessage(messaging, (payload) => {
        console.log("Message received:", payload);
      });
    });
  }, []);

  return (
    <>
      {showPrivacyBanner && <PrivacyBanner onAccept={() => setShowPrivacyBanner(false)} />}
      <ConfettiEffect />
      
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/about" element={<About />} />
        
        {/* Protected routes */}
        <Route path="/whispers" element={
          <PrivateRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <Whispers />
            </Suspense>
          </PrivateRoute>
        } />
        
        <Route path="/create" element={
          <PrivateRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <CreateWhisper />
            </Suspense>
          </PrivateRoute>
        } />
        
        <Route path="/explore" element={
          <PrivateRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <Explore />
            </Suspense>
          </PrivateRoute>
        } />
        
        <Route path="/lounge" element={
          <PrivateRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <Lounge />
            </Suspense>
          </PrivateRoute>
        } />
        
        <Route path="/profile" element={
          <PrivateRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <Profile />
            </Suspense>
          </PrivateRoute>
        } />
        
        <Route path="/compass" element={
          <PrivateRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <Compass />
            </Suspense>
          </PrivateRoute>
        } />
        
        <Route path="/constellation" element={
          <PrivateRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <Constellation />
            </Suspense>
          </PrivateRoute>
        } />
        
        <Route path="/capsules" element={
          <PrivateRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <Capsules />
            </Suspense>
          </PrivateRoute>
        } />
        
        <Route path="/shrines" element={
          <PrivateRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <Shrines />
            </Suspense>
          </PrivateRoute>
        } />
        
        <Route path="/memories" element={
          <PrivateRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <Memories />
            </Suspense>
          </PrivateRoute>
        } />
        
        <Route path="/murmurs" element={
          <PrivateRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <Murmurs />
            </Suspense>
          </PrivateRoute>
        } />
        
        <Route path="/diary" element={
          <PrivateRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <Diary />
            </Suspense>
          </PrivateRoute>
        } />
        
        <Route path="/menu" element={
          <PrivateRoute>
            <Suspense fallback={<LoadingSpinner />}>
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

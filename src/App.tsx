import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfettiEffect } from "./components/ConfettiEffect";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

const HomeFeed = lazy(() => import('./pages/HomeFeed'));
const CreateWhisper = lazy(() => import('./pages/CreateWhisper'));
const Diary = lazy(() => import('./pages/Diary'));
const Capsules = lazy(() => import('./pages/Capsules'));
const Shrines = lazy(() => import('./pages/Shrines'));
const Compass = lazy(() => import('./pages/Compass'));
const Constellation = lazy(() => import('./pages/Constellation'));
const Murmurs = lazy(() => import('./pages/Murmurs'));
const Profile = lazy(() => import('./pages/Profile'));
const FloatingNavOrbs = lazy(() => import('./components/FloatingNavOrbs'));

const App: React.FC = () => {
  const [showConfetti, setShowConfetti] = useState(false);

  // Trigger confetti on app load for celebration
  useEffect(() => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ConfettiEffect isActive={showConfetti} />
        <BrowserRouter>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 relative">
            <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
              <Routes>
                <Route path="/" element={<HomeFeed />} />
                <Route path="/create" element={<CreateWhisper />} />
                <Route path="/diary" element={<Diary />} />
                <Route path="/capsules" element={<Capsules />} />
                <Route path="/shrines" element={<Shrines />} />
                <Route path="/compass" element={<Compass />} />
                <Route path="/constellation" element={<Constellation />} />
                <Route path="/murmurs" element={<Murmurs />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <FloatingNavOrbs />
            </Suspense>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

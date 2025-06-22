import React from 'react';
import Header from './components/Header';
import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IndexPage from './pages/Index';
import NotFound from './pages/NotFound';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfettiEffect } from "./components/ConfettiEffect";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

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
        <Router>
          <div className="whisperverse min-h-screen bg-background text-foreground">
            <Header />
            <Routes>
              <Route path="/" element={<IndexPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

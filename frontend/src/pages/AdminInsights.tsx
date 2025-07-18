import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DreamHeader } from "../components/shared/DreamHeader";
import { DreamLayout } from "../components/shared/DreamLayout";
import EmotionTrendAIChart from "../components/admin/EmotionTrendAIChart";
import ZoneEmotionHeatmap from "../components/admin/ZoneEmotionHeatmap";
import AdminAISummaryCard from "../components/admin/AdminAISummaryCard";
import ImpactInsightGraph from "../components/admin/ImpactInsightGraph";
import PromptGeneratorPanel from "../components/admin/PromptGeneratorPanel";
import SummerSoulAnalytics from '../components/admin/SummerSoulAnalytics';
import { Brain, TrendingUp, MapPin, Users, Lightbulb, BarChart3, Sun } from "lucide-react";
import { useSummerPulse } from '../contexts/use-summer-pulse';
import { Navigate } from 'react-router-dom';
import { DreamLoadingScreen } from '../App';
import ErrorBoundary from "../components/shared/ErrorBoundary";
import { getErrorMessage } from "../lib/errorUtils";
import { useRef } from "react";

const AdminInsights: React.FC = () => {
  const [jwt, setJwt] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("admin_jwt");
    if (!token) window.location.replace("/admin-login");
    setJwt(token);
  }, []);

  const insightsSections = [
    {
      id: "emotion-trends",
      title: "Emotion Intelligence",
      description: "AI-powered emotional trajectory analysis",
      icon: <TrendingUp className="w-6 h-6" />,
      component: <EmotionTrendAIChart />
    },
    {
      id: "zone-heatmap",
      title: "Zone Flow Intelligence",
      description: "Spatial emotion clustering and zone analysis",
      icon: <MapPin className="w-6 h-6" />,
      component: <ZoneEmotionHeatmap />
    },
    {
      id: "ai-summary",
      title: "AI Community Intelligence",
      description: "Real-time insights and strategic recommendations",
      icon: <Brain className="w-6 h-6" />,
      component: <AdminAISummaryCard />
    },
    {
      id: "impact-graph",
      title: "Whisper Impact Intelligence",
      description: "AI-powered reach and engagement analytics",
      icon: <BarChart3 className="w-6 h-6" />,
      component: <ImpactInsightGraph />
    },
    {
      id: "prompt-generator",
      title: "AI Prompt Generator",
      description: "Context-aware, emotionally intelligent prompts",
      icon: <Lightbulb className="w-6 h-6" />,
      component: <PromptGeneratorPanel />
    },
    {
      id: "summer-soul-analytics",
      title: "SummerSoul Analytics",
      description: "Seasonal engagement and emotional trends during summer break",
      icon: <Sun className="w-6 h-6 text-yellow-500" />,
      component: <SummerSoulAnalytics />
    },
  ];

  const { isSummerPulseActive, label: summerLabel } = useSummerPulse();

  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const mainRef = useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (mainRef.current) {
      mainRef.current.focus();
    }
  }, []);

  return (
    <ErrorBoundary narratorLine="A gentle hush falls over the campus. Something went adrift in the admin insights.">
      <DreamLayout>
        <main
          role="main"
          aria-labelledby="page-title"
          tabIndex={-1}
          ref={mainRef}
          className="min-h-screen bg-gradient-to-br from-paper-light to-paper-dark"
        >
          <h1 id="page-title" className="sr-only">Admin Insights</h1>
          <DreamHeader 
            title="AI Intelligence Dashboard"
            subtitle="Aangan Emotion + Zone Intelligence"
          />
          
          <div className="container mx-auto px-4 py-8 space-y-8">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-4"
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                  <Brain className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-inkwell">
                    Aangan AI Intelligence
                  </h1>
                  <p className="text-inkwell/70">
                    Emotion + Zone Intelligence (AI-Augmented Analytics Layer)
                  </p>
                </div>
              </div>
              
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-4 bg-white/50 rounded-lg border border-inkwell/10">
                    <div className="font-medium text-inkwell mb-1">�� AI Components</div>
                    <div className="text-inkwell/70">Emotion Intelligence, ZoneFlow AI, Contextual Narrator</div>
                  </div>
                  <div className="p-4 bg-white/50 rounded-lg border border-inkwell/10">
                    <div className="font-medium text-inkwell mb-1">📊 Visual Analytics</div>
                    <div className="text-inkwell/70">Timeline charts, heatmaps, impact graphs</div>
                  </div>
                  <div className="p-4 bg-white/50 rounded-lg border border-inkwell/10">
                    <div className="font-medium text-inkwell mb-1">💡 Smart Features</div>
                    <div className="text-inkwell/70">Prompt generation, recommendations, insights</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* AI Intelligence Sections */}
            <div className="space-y-12">
              {insightsSections.map((section, index) => (
                <motion.div
                  key={section.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
                  animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeInOut' }}
                  className="space-y-6"
                  aria-label={section.title}
                  tabIndex={0}
                >
                  {/* Section Header */}
                  <motion.div
                    className="p-2 bg-gradient-to-br from-inkwell/10 to-inkwell/5 rounded-lg"
                    initial={prefersReducedMotion ? false : { scale: 0.8, opacity: 0 }}
                    animate={prefersReducedMotion ? false : { scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    aria-hidden="true"
                  >
                    {section.icon}
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-inkwell">
                      {section.title}
                    </h2>
                    <p className="text-inkwell/70">
                      {section.description}
                    </p>
                  </div>
                  {/* Section Content */}
                  <motion.div
                    className="bg-white/30 backdrop-blur-sm rounded-xl border border-inkwell/10 shadow-soft p-6"
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                    animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: 'easeInOut' }}
                    aria-label={`${section.title} content`}
                    tabIndex={0}
                  >
                    {section.component}
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* Footer Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mt-16 p-6 bg-gradient-to-r from-inkwell/5 to-inkwell/10 rounded-xl border border-inkwell/20"
            >
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold text-inkwell">
                  AI Intelligence System Status
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <motion.div
                      className="text-2xl font-bold text-green-600"
                      initial={prefersReducedMotion ? false : { scale: 0.9, opacity: 0 }}
                      animate={prefersReducedMotion ? false : { scale: 1.1, opacity: 1 }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                      aria-label="Status icon"
                    >
                      ✓
                    </motion.div>
                    <div className="text-inkwell/70">Emotion AI Active</div>
                  </div>
                  <div className="text-center">
                    <motion.div
                      className="text-2xl font-bold text-blue-600"
                      initial={{ rotate: 10, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >✓</motion.div>
                    <div className="text-inkwell/70">ZoneFlow AI Active</div>
                  </div>
                  <div className="text-center">
                    <motion.div className="text-2xl font-bold text-purple-600"
                      initial={{ rotate: -5, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >✓</motion.div>
                    <div className="text-inkwell/70">Narrator Memory Active</div>
                  </div>
                  <div className="text-center">
                    <motion.div className="text-2xl font-bold text-emerald-600"
                      initial={{ rotate: 5, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >✓</motion.div>
                    <div className="text-inkwell/70">Analytics Live</div>
                  </div>
                </div>
                <p className="text-xs text-inkwell/60">
                  All AI components are running and providing real-time insights for the Aangan community.
                </p>
              </div>
            </motion.div>

            {/* Summer Pulse Engagement */}
            {isSummerPulseActive && (
              <div className="mb-4 text-center text-green-700 font-medium animate-fade-in">
                Summer Pulse Engagement: {summerLabel}
              </div>
            )}
          </div>
        </main>
      </DreamLayout>
    </ErrorBoundary>
  );
};

export default AdminInsights; 
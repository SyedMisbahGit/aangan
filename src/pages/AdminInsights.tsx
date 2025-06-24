import React from "react";
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
import { useSummerPulse } from '../contexts/SummerPulseContext';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { Navigate } from 'react-router-dom';
import { DreamLoadingScreen } from '../App';

const ALLOWED_ADMINS = ['founder@email.com'];

const AdminInsights: React.FC = () => {
  const { user, loading } = useSupabaseAuth();
  if (loading) return <DreamLoadingScreen message="Authenticating your presence in the WhisperVerse..." />;
  if (!user || !ALLOWED_ADMINS.includes(user.email)) {
    return <Navigate to="/" replace />;
  }

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

  return (
    <DreamLayout>
      <div className="min-h-screen bg-gradient-to-br from-paper-light to-paper-dark">
        <DreamHeader 
          title="AI Intelligence Dashboard"
          subtitle="WhisperVerse Emotion + Zone Intelligence"
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
                  WhisperVerse AI Intelligence
                </h1>
                <p className="text-inkwell/70">
                  Emotion + Zone Intelligence (AI-Augmented Analytics Layer)
                </p>
              </div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-4 bg-white/50 rounded-lg border border-inkwell/10">
                  <div className="font-medium text-inkwell mb-1">🧠 AI Components</div>
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
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="space-y-6"
              >
                {/* Section Header */}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-inkwell/10 to-inkwell/5 rounded-lg">
                    {section.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-inkwell">
                      {section.title}
                    </h2>
                    <p className="text-inkwell/70">
                      {section.description}
                    </p>
                  </div>
                </div>

                {/* Section Content */}
                <div className="bg-white/30 backdrop-blur-sm rounded-xl border border-inkwell/10 shadow-soft p-6">
                  {section.component}
                </div>
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
                  <div className="text-2xl font-bold text-green-600">✓</div>
                  <div className="text-inkwell/70">Emotion AI Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">✓</div>
                  <div className="text-inkwell/70">ZoneFlow AI Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">✓</div>
                  <div className="text-inkwell/70">Narrator Memory Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">✓</div>
                  <div className="text-inkwell/70">Analytics Live</div>
                </div>
              </div>
              <p className="text-xs text-inkwell/60">
                All AI components are running and providing real-time insights for the WhisperVerse community.
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
      </div>
    </DreamLayout>
  );
};

export default AdminInsights; 
import React, { useEffect, useState, Suspense, lazy } from "react";
import { DreamHeader } from "../components/shared/DreamHeader";
import { DreamLayout } from "../components/shared/DreamLayout";
import { Brain, TrendingUp, MapPin, BarChart3, Lightbulb, Sun } from "lucide-react";
import ErrorBoundary from "../components/shared/ErrorBoundary";

// Mock SummerSoulAnalytics component - replace with actual import if available
const SummerSoulAnalytics = () => (
  <div className="p-6 bg-white rounded-lg shadow">
    <h3 className="text-lg font-medium mb-4">Summer Analytics</h3>
    <p className="text-gray-600">Summer analytics data will be displayed here.</p>
  </div>
);

// Types for AdminAISummaryCard props
interface AdminAISummaryCardProps {
  title: string;
  value: string | number;
  description: string;
  icon?: React.ReactNode;
  trend?: {
    value: string | number;
    isPositive: boolean;
    label: string;
  };
}

// Mock AdminAISummaryCard component - replace with actual component if it exists
const AdminAISummaryCard: React.FC<AdminAISummaryCardProps> = ({
  title,
  value,
  description,
  icon,
  trend
}) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      {icon && <div className="p-2 rounded-full bg-purple-100">{icon}</div>}
    </div>
    <p className="text-sm text-gray-600 mt-2">{description}</p>
    {trend && (
      <div className="mt-3 flex items-center text-sm">
        <span className={`flex items-center ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {trend.isPositive ? (
            <TrendingUp className="h-4 w-4 mr-1" />
          ) : (
            <span className="transform rotate-180">
              <TrendingUp className="h-4 w-4 mr-1" />
            </span>
          )}
          {trend.value} {trend.label}
        </span>
      </div>
    )}
  </div>
);

// Lazy load heavy components
const EmotionTrendAIChart = lazy(() => import("../components/admin/EmotionTrendAIChart").catch(() => ({
  default: () => <div>Could not load Emotion Trends</div>
})));

const ZoneEmotionHeatmap = lazy(() => import("../components/admin/ZoneEmotionHeatmap").catch(() => ({
  default: () => <div>Could not load Zone Heatmap</div>
})));

const ImpactInsightGraph = lazy(() => import("../components/admin/ImpactInsightGraph").catch(() => ({
  default: () => <div>Could not load Impact Graph</div>
})));

const PromptGeneratorPanel = lazy(() => import("../components/admin/PromptGeneratorPanel").catch(() => ({
  default: () => <div>Could not load Prompt Generator</div>
})));

// Fallback component for loading states
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
  </div>
);

// Error fallback is now handled by the ErrorBoundary component

const AdminInsights: React.FC = () => {
  const [jwt, setJwt] = useState("");
  const [activeTab, setActiveTab] = useState("emotion-trends");
  // Error state is now handled by ErrorBoundary

  useEffect(() => {
    const token = localStorage.getItem("admin_jwt");
    if (!token) {
      window.location.replace("/admin-login");
      return;
    }
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
      component: (
        <AdminAISummaryCard 
          title="Community Sentiment"
          value="84% Positive"
          description="Overall community sentiment across all zones"
          icon={<Brain className="h-6 w-6 text-purple-600" />}
          trend={{
            value: "12%",
            isPositive: true,
            label: "vs last week"
          }}
        />
      )
    },
    {
      id: "impact-graph",
      title: "Impact Analysis",
      description: "Measure the impact of community initiatives",
      icon: <BarChart3 className="w-6 h-6" />,
      component: <ImpactInsightGraph />
    },
    {
      id: "prompt-generator",
      title: "Prompt Generator",
      description: "Generate prompts for community engagement",
      icon: <Lightbulb className="w-6 h-6" />,
      component: <PromptGeneratorPanel />
    },
    {
      id: "summer-soul",
      title: "Summer Soul Analytics",
      description: "Seasonal engagement and activity metrics",
      icon: <Sun className="w-6 h-6" />,
      component: <SummerSoulAnalytics />
    }
  ];

  const activeSection = insightsSections.find(section => section.id === activeTab);

  if (!jwt) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <DreamLayout>
      <DreamHeader 
        title="AI-Powered Insights"
        subtitle="Advanced analytics and intelligence for community engagement"
      />
      
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {insightsSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveTab(section.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === section.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <span className="mr-2">{section.icon}</span>
                  {section.title}
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Active Section Content */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              {activeSection && (
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">
                    {activeSection.title}
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">
                    {activeSection.description}
                  </p>
                  {activeSection.component}
                </div>
              )}
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </DreamLayout>
  );
};

export default AdminInsights;


import { useState } from "react";
import { Header } from "@/components/Header";
import { PostCreator } from "@/components/PostCreator";
import { PostFeed } from "@/components/PostFeed";
import { TrendingTopics } from "@/components/TrendingTopics";
import { CommunityStats } from "@/components/CommunityStats";
import { InviteSystem } from "@/components/InviteSystem";
import { SafetyDashboard } from "@/components/SafetyDashboard";
import { EngagementAnalytics } from "@/components/EngagementAnalytics";
import { ContentSeeder } from "@/components/ContentSeeder";
import { WeeklyDigest } from "@/components/WeeklyDigest";
import { ModerationSandbox } from "@/components/ModerationSandbox";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users, Shield, BarChart3, Sparkles, FileText, TestTube } from "lucide-react";

const Index = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState("whispers");

  const handleNewPost = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const tabs = [
    { id: "whispers", label: "Latest Whispers", icon: MessageCircle },
    { id: "invite", label: "Campus Circle", icon: Users },
    { id: "safety", label: "Safety Watch", icon: Shield },
    { id: "analytics", label: "Campus Pulse", icon: BarChart3 },
    { id: "seeder", label: "Community Voices", icon: Sparkles },
    { id: "digest", label: "Weekly Digest", icon: FileText },
    { id: "sandbox", label: "Moderation Lab", icon: TestTube },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "whispers":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            {/* Left Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <TrendingTopics />
              <CommunityStats />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <PostCreator onNewPost={handleNewPost} />
              <PostFeed refreshTrigger={refreshTrigger} />
            </div>
          </div>
        );
      case "invite":
        return <InviteSystem />;
      case "safety":
        return <SafetyDashboard />;
      case "analytics":
        return <EngagementAnalytics />;
      case "seeder":
        return <ContentSeeder />;
      case "digest":
        return <WeeklyDigest />;
      case "sandbox":
        return <ModerationSandbox />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 relative overflow-hidden">
      {/* Subtle floating whisper effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-indigo-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-3/4 w-20 h-20 bg-pink-400 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <Header />
      
      {/* Tab Navigation */}
      <div className="container mx-auto px-4 py-4 max-w-6xl relative z-10">
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 whitespace-nowrap transition-all duration-300 hover:scale-105 ${
                  activeTab === tab.id
                    ? "bg-purple-600/80 text-white shadow-lg backdrop-blur-md border border-purple-400/30"
                    : "text-gray-300 hover:text-white hover:bg-white/10 backdrop-blur-sm"
                } animate-fade-in`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{tab.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Tab Content */}
        <main className="max-w-6xl">
          <div className="animate-scale-in">
            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;

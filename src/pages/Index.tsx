
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
import { Button } from "@/components/ui/button";
import { Home, Users, Shield, BarChart3, Sparkles } from "lucide-react";

const Index = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState("home");

  const handleNewPost = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "invite", label: "Invite System", icon: Users },
    { id: "safety", label: "Safety", icon: Shield },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "seeder", label: "Community", icon: Sparkles },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      {/* Tab Navigation */}
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-purple-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Tab Content */}
        <main className="max-w-6xl">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;

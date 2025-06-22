
import { useState } from "react";
import { Header } from "@/components/Header";
import { PostCreator } from "@/components/PostCreator";
import { LiveWhispersFeed } from "@/components/LiveWhispersFeed";
import { TrendingTopics } from "@/components/TrendingTopics";
import { CommunityStats } from "@/components/CommunityStats";
import { MidnightDrop } from "@/components/MidnightDrop";
import { MoodMapping } from "@/components/MoodMapping";
import { WeeklyDigest } from "@/components/WeeklyDigest";
import { WhisperNotifications } from "@/components/WhisperNotifications";
import { UserProfile } from "@/components/UserProfile";
import { EmotionThemes } from "@/components/EmotionThemes";
import { CampusConstellation } from "@/components/CampusConstellation";
import { WhisperDiary } from "@/components/WhisperDiary";
import { TimeCapsules } from "@/components/TimeCapsules";
import { WhisperLounge } from "@/components/WhisperLounge";
import { GroupFeels } from "@/components/GroupFeels";
import { Button } from "@/components/ui/button";
import { MessageCircle, TrendingUp, Heart, Map, User, FileText, BookOpen, Clock, Coffee } from "lucide-react";

const Index = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState("whispers");

  const handleNewPost = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const tabs = [
    { id: "whispers", label: "Live Whispers", icon: MessageCircle },
    { id: "lounge", label: "Quiet Lounge", icon: Coffee },
    { id: "diary", label: "Private Diary", icon: BookOpen },
    { id: "capsules", label: "Time Capsules", icon: Clock },
    { id: "trending", label: "Campus Pulse", icon: TrendingUp },
    { id: "mood", label: "Collective Hearts", icon: Heart },
    { id: "constellation", label: "Campus Map", icon: Map },
    { id: "profile", label: "My Aura", icon: User },
    { id: "digest", label: "Weekly Stories", icon: FileText },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "whispers":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-fade-in">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <MidnightDrop />
              <TrendingTopics />
              <GroupFeels />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              <WhisperNotifications />
              <PostCreator onNewPost={handleNewPost} />
              <LiveWhispersFeed key={refreshTrigger} />
            </div>
          </div>
        );
      case "lounge":
        return (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <WhisperLounge />
          </div>
        );
      case "diary":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            <div className="lg:col-span-2">
              <WhisperDiary />
            </div>
            <div className="space-y-6">
              <GroupFeels />
              <CommunityStats />
            </div>
          </div>
        );
      case "capsules":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            <div className="lg:col-span-2">
              <TimeCapsules />
            </div>
            <div className="space-y-6">
              <WhisperNotifications />
              <GroupFeels />
            </div>
          </div>
        );
      case "trending":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            <div className="lg:col-span-1 space-y-6">
              <WhisperNotifications />
              <MidnightDrop />
              <GroupFeels />
            </div>
            <div className="lg:col-span-2 space-y-6">
              <TrendingTopics />
              <LiveWhispersFeed key={refreshTrigger} />
            </div>
          </div>
        );
      case "mood":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            <div className="space-y-6">
              <GroupFeels />
              <MoodMapping />
            </div>
            <div className="space-y-6">
              <WhisperNotifications />
              <CommunityStats />
              <TrendingTopics />
            </div>
          </div>
        );
      case "constellation":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            <div className="lg:col-span-2">
              <CampusConstellation />
            </div>
            <div className="space-y-6">
              <WhisperNotifications />
              <GroupFeels />
              <CommunityStats />
            </div>
          </div>
        );
      case "profile":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            <div className="space-y-6">
              <UserProfile />
              <EmotionThemes />
            </div>
            <div className="space-y-6">
              <WhisperNotifications />
              <GroupFeels />
              <CommunityStats />
            </div>
          </div>
        );
      case "digest":
        return <WeeklyDigest />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 relative overflow-hidden">
      {/* Floating whisper effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-purple-400 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-32 h-32 bg-indigo-400 rounded-full blur-3xl animate-float delay-1000"></div>
        <div className="absolute top-1/2 left-3/4 w-24 h-24 bg-pink-400 rounded-full blur-3xl animate-float delay-2000"></div>
      </div>

      <Header />
      
      {/* Main Container */}
      <div className="container mx-auto px-6 py-8 max-w-7xl relative z-10">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex flex-wrap justify-center space-x-1 bg-white/5 backdrop-blur-lg rounded-2xl p-2 border border-white/10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant="ghost"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-white/15 text-white shadow-lg backdrop-blur-md border border-white/20"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium text-sm hidden sm:inline">{tab.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <main>
          <div className="animate-scale-in">
            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;

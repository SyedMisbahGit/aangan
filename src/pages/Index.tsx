
import { useState } from "react";
import { Header } from "@/components/Header";
import { PostCreator } from "@/components/PostCreator";
import { PostFeed } from "@/components/PostFeed";
import { TrendingTopics } from "@/components/TrendingTopics";
import { CommunityStats } from "@/components/CommunityStats";

const Index = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleNewPost = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
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
      </main>
    </div>
  );
};

export default Index;

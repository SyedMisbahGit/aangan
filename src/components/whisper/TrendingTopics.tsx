import { Card } from "@/components/ui/card";
import { TrendingUp, Hash } from "lucide-react";

export const TrendingTopics = () => {
  const trending = [
    { topic: "New Cafeteria Menu", posts: 24, sentiment: "positive" },
    { topic: "Midterm Stress", posts: 18, sentiment: "negative" },
    { topic: "Library WiFi Issues", posts: 12, sentiment: "neutral" },
    { topic: "Campus Event Ideas", posts: 9, sentiment: "positive" },
    { topic: "Parking Situation", posts: 7, sentiment: "negative" },
  ];

  const getSentimentColor = (sentiment: string) => {
    const colors: { [key: string]: string } = {
      positive: "text-green-400",
      neutral: "text-yellow-400",
      negative: "text-red-400",
    };
    return colors[sentiment] || "text-gray-400";
  };

  return (
    <Card className="bg-white/5 backdrop-blur-md border-white/10 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <TrendingUp className="h-5 w-5 text-purple-400" />
        <h3 className="font-bold text-white">Trending Topics</h3>
      </div>

      <div className="space-y-3">
        {trending.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between group hover:bg-white/5 p-2 rounded-lg transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <Hash className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-white text-sm font-medium group-hover:text-purple-300">
                  {item.topic}
                </p>
                <p className="text-xs text-gray-400">{item.posts} posts</p>
              </div>
            </div>
            <div
              className={`w-2 h-2 rounded-full ${getSentimentColor(item.sentiment)}`}
            />
          </div>
        ))}
      </div>
    </Card>
  );
};

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Users,
  MessageCircle,
  Heart,
  BarChart3,
  Clock,
} from "lucide-react";

export const EngagementAnalytics = () => {
  const [analytics] = useState({
    dailyPosts: 47,
    activeUsers: 156,
    engagementRate: 73,
    averageResponseTime: "4.2 min",
    topCategories: [
      { name: "Academic Concerns", posts: 18, trend: "+12%" },
      { name: "Campus Alerts", posts: 12, trend: "+5%" },
      { name: "Confessions", posts: 10, trend: "-2%" },
      { name: "Mental Health", posts: 7, trend: "+8%" },
    ],
    sentimentBreakdown: {
      positive: 45,
      neutral: 38,
      negative: 17,
    },
    peakHours: [
      { hour: "12-1 PM", activity: 85 },
      { hour: "6-7 PM", activity: 92 },
      { hour: "9-10 PM", activity: 78 },
    ],
  });

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-500";
      case "neutral":
        return "bg-yellow-500";
      case "negative":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <BarChart3 className="h-6 w-6 text-blue-400" />
        <h2 className="text-xl font-bold text-white">Engagement Analytics</h2>
        <Badge variant="secondary" className="bg-blue-500/20 text-blue-200">
          Anonymous Data Only
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/5 backdrop-blur-md border-white/10 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {analytics.dailyPosts}
            </div>
            <div className="text-sm text-gray-400">Posts Today</div>
          </div>
        </Card>

        <Card className="bg-white/5 backdrop-blur-md border-white/10 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {analytics.activeUsers}
            </div>
            <div className="text-sm text-gray-400">Active Users</div>
          </div>
        </Card>

        <Card className="bg-white/5 backdrop-blur-md border-white/10 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {analytics.engagementRate}%
            </div>
            <div className="text-sm text-gray-400">Engagement Rate</div>
          </div>
        </Card>

        <Card className="bg-white/5 backdrop-blur-md border-white/10 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {analytics.averageResponseTime}
            </div>
            <div className="text-sm text-gray-400">Avg Response</div>
          </div>
        </Card>
      </div>

      {/* Category Trends */}
      <Card className="bg-white/5 backdrop-blur-md border-white/10 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="h-5 w-5 text-green-400" />
          <h3 className="font-bold text-white">Category Trends</h3>
        </div>

        <div className="space-y-3">
          {analytics.topCategories.map((category, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-200 text-sm font-bold">
                  {index + 1}
                </div>
                <div>
                  <p className="text-white font-medium">{category.name}</p>
                  <p className="text-gray-400 text-sm">
                    {category.posts} posts
                  </p>
                </div>
              </div>

              <Badge
                className={
                  category.trend.startsWith("+")
                    ? "bg-green-500/20 text-green-200"
                    : "bg-red-500/20 text-red-200"
                }
              >
                {category.trend}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Sentiment Analysis */}
      <Card className="bg-white/5 backdrop-blur-md border-white/10 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Heart className="h-5 w-5 text-pink-400" />
          <h3 className="font-bold text-white">Community Sentiment</h3>
        </div>

        <div className="space-y-4">
          <div className="flex h-4 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="bg-green-500 h-full"
              style={{ width: `${analytics.sentimentBreakdown.positive}%` }}
            />
            <div
              className="bg-yellow-500 h-full"
              style={{ width: `${analytics.sentimentBreakdown.neutral}%` }}
            />
            <div
              className="bg-red-500 h-full"
              style={{ width: `${analytics.sentimentBreakdown.negative}%` }}
            />
          </div>

          <div className="flex justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-green-200">
                Positive ({analytics.sentimentBreakdown.positive}%)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <span className="text-yellow-200">
                Neutral ({analytics.sentimentBreakdown.neutral}%)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-red-200">
                Negative ({analytics.sentimentBreakdown.negative}%)
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Peak Activity Hours */}
      <Card className="bg-white/5 backdrop-blur-md border-white/10 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="h-5 w-5 text-orange-400" />
          <h3 className="font-bold text-white">Peak Activity Hours</h3>
        </div>

        <div className="space-y-3">
          {analytics.peakHours.map((hour, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-20 text-sm text-gray-300">{hour.hour}</div>
              <div className="flex-1 bg-gray-700 rounded-full h-6 relative">
                <div
                  className="bg-gradient-to-r from-orange-600 to-orange-400 h-full rounded-full"
                  style={{ width: `${hour.activity}%` }}
                />
                <span className="absolute right-2 top-0 text-xs text-white leading-6">
                  {hour.activity}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
